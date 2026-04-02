import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, MapPin, Star, Ticket, ArrowRight, Sparkles, Music, GlassWater, Crown, Loader2, User as UserIcon, LogOut, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';

export default function Home() {
  const { user, login, logout } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch('/api/events/inventory');
        const data = await res.json();
        setInventory(data);
      } catch (err) {
        console.error('Failed to fetch inventory', err);
      }
    };
    fetchInventory();
    
    // Refresh inventory every 30 seconds
    const interval = setInterval(fetchInventory, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckout = async (type: 'ticket' | 'membership', itemId: string, itemName: string, price: number) => {
    let checkoutEmail = user?.email || email;
    if (!checkoutEmail) {
      const promptedEmail = window.prompt('Please enter your email address to receive your ticket:');
      if (!promptedEmail) {
        return; // User cancelled or didn't enter email
      }
      checkoutEmail = promptedEmail;
      setEmail(checkoutEmail); // Update the state as well
    }

    setLoading(itemId);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          itemId,
          itemName,
          price,
          customerEmail: checkoutEmail,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
        setLoading(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface-deep text-gray-100 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto bg-surface-dark/80 backdrop-blur-xl border border-surface-mid rounded-2xl px-6 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-yellow" />
            <span className="font-display font-black text-2xl text-gradient-brand tracking-tight">
              Bright
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#events" className="font-heading text-sm font-medium text-gray-300 hover:text-brand-yellow transition-colors">Events</a>
            <a href="#membership" className="font-heading text-sm font-medium text-gray-300 hover:text-brand-yellow transition-colors">Membership</a>
          </div>

          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-surface-mid border border-surface-slate rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-yellow"
                />
                <button onClick={login} className="flex items-center gap-2 bg-surface-mid border border-brand-yellow/30 text-white px-5 py-2.5 rounded-xl font-heading text-sm font-semibold hover:bg-surface-slate transition-all">
                  <UserIcon className="w-4 h-4 text-brand-yellow" />
                  Sign In
                </button>
              </>
            ) : (
              <>
                <Link to="/profile" className="flex items-center gap-2 bg-surface-mid border border-brand-pink/30 text-white px-5 py-2.5 rounded-xl font-heading text-sm font-semibold hover:bg-surface-slate transition-all">
                  <UserIcon className="w-4 h-4 text-brand-pink" />
                  Profile
                </Link>
                <button onClick={logout} className="flex items-center gap-2 bg-surface-mid border border-surface-slate text-gray-400 px-4 py-2.5 rounded-xl font-heading text-sm font-semibold hover:bg-surface-slate hover:text-white transition-all">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-brand-pink/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-brand-yellow/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-mid border border-surface-slate mb-8"
          >
            <Star className="w-4 h-4 text-brand-yellow" />
            <span className="font-heading text-xs font-bold tracking-widest uppercase text-gray-300">
              Bright Event Agency Presents
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] mb-4"
          >
            Where Every Night
          </motion.h1>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="font-accent text-6xl md:text-8xl lg:text-9xl font-bold text-gradient-brand leading-[1.2] mb-8 drop-shadow-2xl"
          >
            Shines Bright
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-12 leading-relaxed"
          >
            Premium event experiences crafted for unforgettable moments. From intimate VIP gatherings to spectacular nightlife galas.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <a href="#events" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-brand text-black px-8 py-4 rounded-xl font-heading font-bold text-lg shadow-glow-pink hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5" />
              Get Tickets
            </a>
            <a href="#membership" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-surface-mid border border-brand-yellow/30 text-white px-8 py-4 rounded-xl font-heading font-bold text-lg hover:bg-surface-slate transition-colors">
              <Crown className="w-5 h-5 text-brand-yellow" />
              Apply for Membership
            </a>
          </motion.div>
        </div>

        {/* Floating Decorative Elements */}
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-40 left-[15%] hidden lg:block">
          <Music className="w-12 h-12 text-brand-violet/60" />
        </motion.div>
        <motion.div animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-40 right-[15%] hidden lg:block">
          <GlassWater className="w-16 h-16 text-brand-pink/60" />
        </motion.div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">Upcoming <span className="text-gradient-brand">Events</span></h2>
              <div className="w-24 h-1.5 bg-gradient-brand rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { id: "evt_odessa_early", title: "Odessa Carnival", date: "April 4, 17:00 – 23:00", location: "Laan van Ypenburg 108, 2497 GC, The Hague", tag: "Early Bird", price: 60, icon: "🎫", gradient: "from-brand-yellow/20 to-brand-pink/30", totalLimit: 20 },
              { id: "evt_odessa_standard", title: "Odessa Carnival", date: "April 4, 17:00 – 23:00", location: "Laan van Ypenburg 108, 2497 GC, The Hague", tag: "Standard", price: 80, icon: "🎟️", gradient: "from-brand-amber/20 to-brand-violet/30", totalLimit: 50 },
              { id: "evt_odessa_vip", title: "Odessa Carnival", date: "April 4, 17:00 – 23:00", location: "Laan van Ypenburg 108, 2497 GC, The Hague", tag: "VIP", price: 120, icon: "👑", gradient: "from-brand-pink/20 to-brand-magenta/30", totalLimit: 10 },
            ].map((event, i) => {
              const sold = inventory[event.id] || 0;
              const remaining = Math.max(0, event.totalLimit - sold);
              const isSoldOut = remaining === 0;
              
              const shareUrl = encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '');
              const shareText = encodeURIComponent(`Get your tickets for ${event.title} - ${event.tag} at Bright!`);

              return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -12, scale: 1.03 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4, type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => !isSoldOut && setSelectedEvent(event)}
                className={`group bg-surface-dark border border-surface-mid rounded-3xl overflow-hidden transition-all shadow-card flex flex-col cursor-pointer ${isSoldOut ? 'opacity-75 grayscale-[0.5]' : 'hover:border-brand-yellow/50 hover:shadow-glow-pink'}`}
              >
                <div className={`h-48 bg-gradient-to-br ${event.gradient} flex items-center justify-center relative overflow-hidden`}>
                  <motion.span 
                    className="text-7xl drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]"
                    whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {event.icon}
                  </motion.span>
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />
                  {isSoldOut && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                      <span className="font-display font-black text-3xl text-red-500 uppercase tracking-widest rotate-[-15deg] border-4 border-red-500 px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.5)]">Sold Out</span>
                    </div>
                  )}
                  {/* Price Badge overlaying the image */}
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl shadow-xl">
                    <span className="font-heading font-black text-2xl text-gradient-brand">€{event.price}</span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1 relative">
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-block px-4 py-1.5 bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30 rounded-full font-heading text-xs font-bold uppercase tracking-widest shadow-glow-yellow">
                      {event.tag}
                    </span>
                  </div>
                  <h3 className="font-heading text-3xl font-black text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-brand transition-all duration-300">{event.title}</h3>
                  <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-center gap-3 text-gray-300 bg-surface-mid/30 p-3 rounded-xl border border-surface-slate/50">
                      <div className="bg-surface-mid p-2 rounded-lg">
                        <Calendar className="w-5 h-5 text-brand-pink" /> 
                      </div>
                      <span className="font-medium text-sm">{event.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300 bg-surface-mid/30 p-3 rounded-xl border border-surface-slate/50">
                      <div className="bg-surface-mid p-2 rounded-lg">
                        <MapPin className="w-5 h-5 text-brand-yellow" /> 
                      </div>
                      <span className="font-medium text-sm leading-tight">{event.location}</span>
                    </div>
                    
                    <div className="pt-6 mt-4 border-t border-surface-slate/50">
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-gray-400 font-bold flex items-center gap-2 uppercase tracking-wider text-xs">
                          <Ticket className="w-4 h-4 text-gray-500" /> Availability
                        </span>
                        <span className={`font-black text-sm ${isSoldOut ? 'text-red-500' : remaining <= 10 ? 'text-brand-yellow animate-pulse' : 'text-brand-pink'}`}>
                          {isSoldOut ? 'Sold Out' : `${remaining} / ${event.totalLimit} left`}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-slate rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${isSoldOut ? 'bg-red-500' : remaining <= 10 ? 'bg-brand-yellow shadow-glow-yellow' : 'bg-gradient-brand shadow-glow-pink'}`}
                          style={{ width: `${isSoldOut ? 100 : (remaining / event.totalLimit) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: isSoldOut ? 1 : 1.05 }}
                    whileTap={{ scale: isSoldOut ? 1 : 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCheckout('ticket', event.id, `${event.title} - ${event.tag}`, event.price);
                    }}
                    disabled={loading === event.id || isSoldOut}
                    className={`w-full font-heading font-black py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 text-lg shadow-lg ${
                      isSoldOut 
                        ? 'bg-surface-mid text-gray-500 cursor-not-allowed border border-surface-slate' 
                        : 'bg-surface-mid text-white border border-surface-slate group-hover:bg-gradient-brand group-hover:text-black group-hover:border-transparent group-hover:shadow-glow-pink group-hover:scale-[1.02]'
                    }`}
                  >
                    {loading === event.id ? <Loader2 className="w-6 h-6 animate-spin" /> : isSoldOut ? 'Sold Out' : 'Get Tickets Now'}
                  </motion.button>

                  <div className="mt-6 pt-4 border-t border-surface-slate flex items-center justify-center gap-4">
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-bold mr-2">Share</span>
                    <a 
                      href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-400 hover:text-brand-yellow transition-colors transform hover:scale-110"
                      aria-label="Share on Twitter"
                    >
                      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                    </a>
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-400 hover:text-brand-pink transition-colors transform hover:scale-110"
                      aria-label="Share on Facebook"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </a>
                    <a 
                      href={`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-400 hover:text-brand-violet transition-colors"
                      aria-label="Share on WhatsApp"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            )})}
          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section id="membership" className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-surface-dark border border-brand-yellow/20 rounded-3xl p-8 md:p-16 relative overflow-hidden shadow-glow-gold">
            {/* Inner Glow */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-yellow/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 mb-6">
                  <Crown className="w-4 h-4 text-brand-yellow" />
                  <span className="font-heading text-xs font-bold tracking-widest uppercase text-brand-yellow">
                    The Inner Circle
                  </span>
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                  Elevate Your <br/>
                  <span className="text-gradient-gold">Nightlife Experience</span>
                </h2>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Join our exclusive private club for priority access, VIP table reservations, secret event invitations, and a community of like-minded individuals who appreciate the finer things in the night.
                </p>
                
                <ul className="space-y-4 mb-10">
                  {['Priority ticket access to all events', 'Complimentary VIP upgrades', 'Access to members-only secret parties', 'Dedicated concierge service'].map((perk, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300 font-heading">
                      <div className="w-6 h-6 rounded-full bg-brand-yellow/20 flex items-center justify-center shrink-0">
                        <Star className="w-3 h-3 text-brand-yellow" />
                      </div>
                      {perk}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleCheckout('membership', 'mem_annual', 'Annual VIP Membership', 100)}
                  disabled={loading === 'mem_annual'}
                  className="bg-gradient-gold text-black px-8 py-4 rounded-xl font-heading font-bold text-lg shadow-glow-gold hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === 'mem_annual' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply for Membership (€100/yr)'}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
              
              <div className="relative">
                <div className="aspect-[4/5] rounded-2xl bg-surface-mid border border-surface-slate overflow-hidden relative">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent" />
                  
                  {/* Mock Membership Card */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-40 rounded-xl bg-gradient-to-br from-[#2A2A3A] to-[#111118] border border-brand-yellow/30 shadow-2xl p-6 flex flex-col justify-between transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                    <div className="flex justify-between items-start">
                      <span className="font-display font-bold text-xl text-gradient-gold">Bright</span>
                      <Crown className="w-5 h-5 text-brand-yellow" />
                    </div>
                    <div>
                      <div className="font-mono text-xs text-gray-500 mb-1">MEMBER SINCE 2026</div>
                      <div className="font-heading font-bold text-white tracking-widest">VIP ACCESS</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-void border-t border-surface-mid pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-brand-yellow" />
              <span className="font-display font-black text-2xl text-gradient-brand tracking-tight">
                Bright
              </span>
            </div>
            <p className="text-gray-400 max-w-sm mb-8">
              Curating the city's most vibrant and exclusive nightlife experiences. Where the music is loud, the drinks are cold, and the memories are forever.
            </p>
          </div>
          
          <div>
            <h4 className="font-heading font-bold text-white mb-6 uppercase tracking-wider text-sm">Agency</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-brand-yellow transition-colors">Upcoming Events</a></li>
              <li><a href="#" className="text-gray-400 hover:text-brand-yellow transition-colors">Private Club</a></li>
              <li><a href="#" className="text-gray-400 hover:text-brand-yellow transition-colors">Our Story</a></li>
              <li><a href="#" className="text-gray-400 hover:text-brand-yellow transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-6 uppercase tracking-wider text-sm">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-brand-yellow transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-brand-yellow transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-brand-yellow transition-colors">Club Rules</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-surface-mid flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2026 Bright Event Agency. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {/* Social placeholders */}
            <div className="w-10 h-10 rounded-full bg-surface-mid flex items-center justify-center hover:bg-brand-pink/20 hover:text-brand-pink transition-colors cursor-pointer text-gray-400">
              <span className="font-bold">IG</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-mid flex items-center justify-center hover:bg-brand-yellow/20 hover:text-brand-yellow transition-colors cursor-pointer text-gray-400">
              <span className="font-bold">X</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => setSelectedEvent(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-surface-dark border border-surface-mid rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className={`h-48 sm:h-64 bg-gradient-to-br ${selectedEvent.gradient} flex items-center justify-center relative shrink-0`}>
                <span className="text-8xl drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]">
                  {selectedEvent.icon}
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-surface-dark to-transparent" />
              </div>
              
              <div className="p-6 sm:p-10 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-block px-4 py-1.5 bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30 rounded-full font-heading text-xs font-bold uppercase tracking-widest shadow-glow-yellow">
                    {selectedEvent.tag}
                  </span>
                  <span className="font-heading font-black text-2xl text-gradient-brand">€{selectedEvent.price}</span>
                </div>
                
                <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-6">{selectedEvent.title}</h2>
                
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 text-gray-300 bg-surface-mid/30 p-4 rounded-xl border border-surface-slate/50">
                    <div className="bg-surface-mid p-3 rounded-lg">
                      <Calendar className="w-6 h-6 text-brand-pink" /> 
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Date & Time</div>
                      <div className="font-medium">{selectedEvent.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 bg-surface-mid/30 p-4 rounded-xl border border-surface-slate/50">
                    <div className="bg-surface-mid p-3 rounded-lg">
                      <MapPin className="w-6 h-6 text-brand-yellow" /> 
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Location</div>
                      <div className="font-medium leading-tight">{selectedEvent.location}</div>
                    </div>
                  </div>
                </div>
                
                <div className="prose prose-invert max-w-none mb-10">
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Join us for an unforgettable night at the {selectedEvent.title}. Experience world-class entertainment, premium drinks, and an electric atmosphere. This {selectedEvent.tag} ticket grants you access to exclusive areas and special perks throughout the event.
                  </p>
                  <p className="text-gray-400 mt-4">
                    Please note: This event is strictly 18+. Valid ID required for entry. Dress code is smart casual.
                  </p>
                </div>
                
                <div className="pt-6 border-t border-surface-slate/50">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleCheckout('ticket', selectedEvent.id, `${selectedEvent.title} - ${selectedEvent.tag}`, selectedEvent.price);
                    }}
                    disabled={loading === selectedEvent.id || (inventory[selectedEvent.id] !== undefined && selectedEvent.totalLimit - inventory[selectedEvent.id] <= 0)}
                    className={`w-full font-heading font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-2 text-xl shadow-lg ${
                      (inventory[selectedEvent.id] !== undefined && selectedEvent.totalLimit - inventory[selectedEvent.id] <= 0)
                        ? 'bg-surface-mid text-gray-500 cursor-not-allowed border border-surface-slate' 
                        : 'bg-gradient-brand text-black hover:shadow-glow-pink border-none'
                    }`}
                  >
                    {loading === selectedEvent.id ? <Loader2 className="w-6 h-6 animate-spin" /> : 
                     (inventory[selectedEvent.id] !== undefined && selectedEvent.totalLimit - inventory[selectedEvent.id] <= 0) ? 'Sold Out' : 'Get Tickets Now'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
