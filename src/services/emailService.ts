import { Resend } from 'resend';
import QRCode from 'qrcode';

let resendClient: Resend | null = null;

export function getResend(): Resend {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    resendClient = new Resend(key);
  }
  return resendClient;
}

export async function sendTicketConfirmation(email: string, eventName: string, ticketId: string, eventId: string) {
  try {
    const resend = getResend();
    
    // Generate QR code
    const qrData = JSON.stringify({ id: ticketId, eventId, eventName });
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Extract base64 part
    const base64Image = qrCodeDataUrl.split(',')[1];

    await resend.emails.send({
      from: 'bright Event <onboarding@resend.dev>',
      to: email,
      subject: `Your Ticket for ${eventName}`,
      html: `
        <h1>Thank you for your purchase!</h1>
        <p>You have successfully purchased a ticket for <strong>${eventName}</strong>.</p>
        <p>Your Ticket ID is: <strong>${ticketId}</strong></p>
        <p>Please present this ticket ID or the attached QR code at the event entrance.</p>
        <div style="margin: 20px 0; padding: 20px; background-color: #f3f4f6; border-radius: 12px; display: inline-block;">
          <img src="data:image/png;base64,${base64Image}" alt="Ticket QR Code" style="width: 200px; height: 200px; display: block;" />
        </div>
        <br/>
        <p>Enjoy the event!</p>
        <p>- bright Event Team</p>
      `,
      attachments: [
        {
          filename: 'ticket-qr.png',
          content: Buffer.from(base64Image, 'base64')
        }
      ]
    });
    console.log(`Ticket confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send ticket confirmation email:', error);
  }
}

export async function sendMembershipConfirmation(email: string, membershipId: string) {
  try {
    const resend = getResend();
    await resend.emails.send({
      from: 'bright Event <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to bright Event Membership!',
      html: `
        <h1>Welcome to the club!</h1>
        <p>Your membership has been successfully activated.</p>
        <p>Membership ID: <strong>${membershipId}</strong></p>
        <p>You now have access to exclusive events and perks.</p>
        <br/>
        <p>- bright Event Team</p>
      `
    });
    console.log(`Membership confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send membership confirmation email:', error);
  }
}

export async function sendMembershipStatusUpdate(email: string, status: string) {
  try {
    const resend = getResend();
    await resend.emails.send({
      from: 'bright Event <onboarding@resend.dev>',
      to: email,
      subject: 'Update on your Membership Status',
      html: `
        <h1>Membership Status Update</h1>
        <p>Your membership status has been updated to: <strong>${status}</strong>.</p>
        <p>If you have any questions, please contact support.</p>
        <br/>
        <p>- bright Event Team</p>
      `
    });
    console.log(`Membership status update email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send membership status update email:', error);
  }
}

export async function sendEventReminder(email: string, eventName: string) {
  try {
    const resend = getResend();
    await resend.emails.send({
      from: 'bright Event <onboarding@resend.dev>',
      to: email,
      subject: `Reminder: ${eventName} is coming up!`,
      html: `
        <h1>Event Reminder</h1>
        <p>This is a friendly reminder that <strong>${eventName}</strong> is happening soon!</p>
        <p>Don't forget to have your ticket ready (accessible from your profile).</p>
        <br/>
        <p>See you there!</p>
        <p>- bright Event Team</p>
      `
    });
    console.log(`Event reminder email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send event reminder email:', error);
  }
}
