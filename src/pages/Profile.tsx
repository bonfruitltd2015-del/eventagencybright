import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Ticket, Crown, Calendar, Loader2, X } from 'lucide-react';
import QRCode from 'react-qr-code';

interface TicketItem {
  id: string;
  eventId: string;
  eventName: string;
  status: string;
  createdAt: string;
}

interface MembershipItem {
  id: string;
  status: string;
  createdAt: string;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [memberships, setMemberships] = useState<MembershipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user?.email) return;

    const fetchData = async () => {
      try {
        const [ticketsRes, membershipsRes] = await Promise.all([
          fetch(`/api/user/tickets?email=${encodeURIComponent(user.email!)}`),
          fetch(`/api/user/memberships?email=${encodeURIComponent(user.email!)}`)
        ]);

        if (ticketsRes.ok) {
          setTickets(await ticketsRes.json());
        }
        if (membershipsRes.ok) {
          setMemberships(await membershipsRes.json());
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-surface-deep flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-yellow animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface-deep text-gray-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-heading font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-yellow" />
            <span className="font-display font-black text-2xl text-gradient-brand tracking-tight">
              Bright
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-dark border border-surface-mid rounded-3xl p-8 mb-8 flex items-center gap-6"
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-20 h-20 rounded-full border-2 border-brand-pink" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-surface-mid border-2 border-brand-pink flex items-center justify-center text-2xl font-bold">
              {user.email?.[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-heading text-3xl font-bold text-white mb-1">{user.displayName || 'Welcome'}</h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Memberships */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="font-heading text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Crown className="w-6 h-6 text-brand-yellow" />
              Memberships
            </h2>
            <div className="space-y-4">
              {memberships.length === 0 ? (
                <div className="bg-surface-dark border border-surface-mid rounded-2xl p-6 text-center text-gray-400">
                  No active memberships found.
                </div>
              ) : (
                memberships.map((membership) => (
                  <div key={membership.id} className="bg-surface-dark border border-brand-yellow/30 rounded-2xl p-6 shadow-glow-yellow">
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-block px-3 py-1 bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20 rounded-lg font-heading text-xs font-bold uppercase tracking-wider">
                        VIP Member
                      </span>
                      <span className={`text-sm font-bold uppercase ${membership.status === 'active' ? 'text-green-400' : 'text-gray-500'}`}>
                        {membership.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Joined: {new Date(membership.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 font-mono">
                      ID: {membership.id}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Tickets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-heading text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Ticket className="w-6 h-6 text-brand-pink" />
              My Tickets
            </h2>
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <div className="bg-surface-dark border border-surface-mid rounded-2xl p-6 text-center text-gray-400">
                  No tickets purchased yet.
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    onClick={() => setSelectedTicket(ticket)}
                    className="bg-surface-dark border border-surface-mid rounded-2xl p-6 hover:border-brand-pink/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-heading text-lg font-bold text-white group-hover:text-brand-pink transition-colors">{ticket.eventName}</h3>
                      <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md ${ticket.status === 'issued' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                      <Calendar className="w-4 h-4" />
                      Purchased: {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                    <div className="pt-4 border-t border-surface-slate flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="text-xs text-gray-500 font-mono text-center md:text-left">
                        Ticket ID: {ticket.id}
                      </div>
                      <div className="bg-white p-2 rounded-xl group-hover:scale-105 transition-transform">
                        <QRCode 
                          value={JSON.stringify({ id: ticket.id, eventId: ticket.eventId, eventName: ticket.eventName })} 
                          size={80} 
                          level="H"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedTicket(null)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-surface-dark border border-surface-mid rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            {/* Decorative background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-brand-pink/20 blur-[60px] pointer-events-none" />
            
            <button 
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-surface-mid/50 hover:bg-surface-mid rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8 relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-pink/10 text-brand-pink mb-4">
                <Ticket className="w-6 h-6" />
              </div>
              <h2 className="font-heading text-3xl font-bold text-white mb-2">{selectedTicket.eventName}</h2>
              <span className={`inline-block text-xs font-bold uppercase px-3 py-1 rounded-md ${selectedTicket.status === 'issued' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {selectedTicket.status}
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl flex justify-center items-center mb-8 shadow-inner relative z-10">
              <QRCode 
                value={JSON.stringify({ id: selectedTicket.id, eventId: selectedTicket.eventId, eventName: selectedTicket.eventName })} 
                size={240} 
                level="H"
              />
            </div>

            <div className="space-y-4 border-t border-surface-slate pt-6 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Purchase Date</span>
                <span className="text-sm font-medium text-white">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Ticket ID</span>
                <span className="text-xs font-mono text-gray-300 bg-surface-mid px-2 py-1 rounded">{selectedTicket.id}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
