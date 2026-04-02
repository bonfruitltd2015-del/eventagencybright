import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Stripe from "stripe";
import crypto from "crypto";
import cron from "node-cron";
import { sendTicketConfirmation, sendMembershipConfirmation, sendMembershipStatusUpdate, sendEventReminder } from "./src/services/emailService.ts";
import * as admin from 'firebase-admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';

// Initialize Firebase Admin
const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
admin.initializeApp({
  projectId: firebaseConfig.projectId,
});
const db = getFirestore(firebaseConfig.firestoreDatabaseId);

function formatDoc(doc: any) {
  const data = doc.data();
  if (data.createdAt && data.createdAt.toDate) {
    data.createdAt = data.createdAt.toDate().toISOString();
  }
  return data;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Firebase Admin initialized above

// API Routes
app.post("/api/create-checkout-session", async (req, res) => {
  const { type, itemId, itemName, price, customerEmail } = req.body;

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Stripe is not configured. Please add STRIPE_SECRET_KEY in the Secrets panel." });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

  try {
    const sessionConfig: any = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: itemName,
            },
            unit_amount: Math.round(price * 100), // in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}&type=${type}&itemId=${itemId}&itemName=${encodeURIComponent(itemName)}`,
      cancel_url: `${appUrl}/cancel`,
    };

    if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/checkout-session", async (req, res) => {
  const { session_id } = req.query;
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Stripe is not configured." });
  }
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id as string);
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/fulfill-order", async (req, res) => {
  const { type, itemId, itemName, customerEmail } = req.body;
  const id = crypto.randomUUID();

  try {
    if (type === "ticket") {
      await db.collection("tickets").doc(id).set({
        id,
        eventId: itemId,
        eventName: itemName,
        customerEmail,
        status: 'issued',
        createdAt: FieldValue.serverTimestamp()
      });
      
      if (process.env.RESEND_API_KEY) {
        sendTicketConfirmation(customerEmail, itemName, id, itemId);
      }
      
      res.json({ success: true, id, type: "ticket" });
    } else if (type === "membership") {
      await db.collection("memberships").doc(id).set({
        id,
        customerEmail,
        status: 'active',
        createdAt: FieldValue.serverTimestamp()
      });
      
      if (process.env.RESEND_API_KEY) {
        sendMembershipConfirmation(customerEmail, id);
      }
      
      res.json({ success: true, id, type: "membership" });
    } else {
      res.status(400).json({ error: "Invalid type" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/events/inventory", async (req, res) => {
  try {
    const snapshot = await db.collection("tickets").where("status", "==", "issued").get();
    const inventory: Record<string, number> = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.eventId) {
        inventory[data.eventId] = (inventory[data.eventId] || 0) + 1;
      }
    });
    res.json(inventory);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/user/tickets", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email is required" });
  try {
    const snapshot = await db.collection("tickets").where("customerEmail", "==", email).orderBy("createdAt", "desc").get();
    const tickets = snapshot.docs.map(formatDoc);
    res.json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/user/memberships", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email is required" });
  try {
    const snapshot = await db.collection("memberships").where("customerEmail", "==", email).orderBy("createdAt", "desc").get();
    const memberships = snapshot.docs.map(formatDoc);
    res.json(memberships);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Auth Endpoint
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    return res.status(500).json({ error: "Admin password not configured on server" });
  }
  
  if (password === adminPassword) {
    res.json({ success: true, token: "admin-token-valid" });
  } else {
    res.status(401).json({ error: "Invalid password" });
  }
});

// Admin Middleware
const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader === "Bearer admin-token-valid") {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

app.get("/api/admin/tickets", adminAuth, async (req, res) => {
  try {
    const snapshot = await db.collection("tickets").orderBy("createdAt", "desc").get();
    const tickets = snapshot.docs.map(formatDoc);
    res.json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/admin/tickets/:id/status", adminAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const docRef = db.collection("tickets").doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    
    const ticket = docSnap.data() as any;
    if (status === 'used' && ticket.status === 'used') {
      return res.status(400).json({ error: "Ticket has already been used" });
    }

    await docRef.update({ status });
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/admin/memberships", adminAuth, async (req, res) => {
  try {
    const snapshot = await db.collection("memberships").orderBy("createdAt", "desc").get();
    const memberships = snapshot.docs.map(formatDoc);
    res.json(memberships);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/admin/memberships/:id/status", adminAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const docRef = db.collection("memberships").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Membership not found" });
    }

    const membership = docSnap.data() as any;
    await docRef.update({ status });
    
    if (process.env.RESEND_API_KEY) {
      sendMembershipStatusUpdate(membership.customerEmail, status);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating membership status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/admin/trigger-reminders", adminAuth, async (req, res) => {
  try {
    const snapshot = await db.collection("tickets").where("status", "==", "issued").get();
    const ticketsMap = new Map();
    snapshot.forEach(doc => {
      const data = doc.data();
      const key = `${data.customerEmail}-${data.eventName}`;
      if (!ticketsMap.has(key)) {
        ticketsMap.set(key, data);
      }
    });
    const tickets = Array.from(ticketsMap.values());
    
    if (process.env.RESEND_API_KEY) {
      tickets.forEach(ticket => {
        sendEventReminder(ticket.customerEmail, ticket.eventName);
      });
      res.json({ success: true, message: `Sent ${tickets.length} reminders.` });
    } else {
      res.status(500).json({ error: "RESEND_API_KEY is not configured." });
    }
  } catch (error: any) {
    console.error('Error triggering event reminders:', error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  // Cron job for event reminders (runs every day at 10:00 AM)
  cron.schedule('0 10 * * *', async () => {
    console.log('Running daily event reminder check...');
    const today = new Date();
    // Check if tomorrow is April 4th (Month is 0-indexed, so 3 is April)
    if (today.getMonth() === 3 && today.getDate() === 3) {
      console.log('Sending reminders for Odessa Carnival...');
      try {
        const snapshot = await db.collection("tickets").where("status", "==", "issued").get();
        const ticketsMap = new Map();
        snapshot.forEach(doc => {
          const data = doc.data();
          const key = `${data.customerEmail}-${data.eventName}`;
          if (!ticketsMap.has(key)) {
            ticketsMap.set(key, data);
          }
        });
        const tickets = Array.from(ticketsMap.values());
        
        if (process.env.RESEND_API_KEY) {
          tickets.forEach(ticket => {
            sendEventReminder(ticket.customerEmail, ticket.eventName);
          });
        }
      } catch (error) {
        console.error('Error sending event reminders:', error);
      }
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
