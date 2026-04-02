import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Crown, CheckCircle, XCircle, Clock, ArrowLeft, Loader2, Download, QrCode, Mail } from 'lucide-react';

interface TicketData {
  id: string;
  eventId: string;
  eventName: string;
  customerEmail: string;
  status: string;
  createdAt: string;
}

interface MembershipData {
  id: string;
  customerEmail: string;
  status: string;
  createdAt: string;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'memberships'>('tickets');
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [memberships, setMemberships] = useState<MembershipData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminders, setSendingReminders] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('adminToken');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const ticketsRes = await fetch('/api/admin/tickets', { headers });
      const membershipsRes = await fetch('/api/admin/memberships', { headers });
      
      const ticketsData = await ticketsRes.json();
      const membershipsData = await membershipsRes.json();

      setTickets(ticketsData);
      setMemberships(membershipsData);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (type: 'tickets' | 'memberships', id: string, newStatus: string) => {
    try {
      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/${type}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchData();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      alert('An error occurred while updating status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'issued':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'used':
      case 'expired':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'cancelled':
      case 'revoked':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const exportToCSV = () => {
    const data = activeTab === 'tickets' ? tickets : memberships;
    if (data.length === 0) {
      alert('No data to export');
      return;
    }
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${activeTab}_export_${new Date().toISOString().split('T')[0]}.csv`);
    a.style.visibility = 'hidden';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const triggerReminders = async () => {
    if (!window.confirm('Are you sure you want to send event reminders to all active ticket holders?')) return;
    
    setSendingReminders(true);
    try {
      const token = sessionStorage.getItem('adminToken');
      const res = await fetch('/api/admin/trigger-reminders', { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send reminders');
    } finally {
      setSendingReminders(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-deep text-gray-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-display text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400 font-body">Manage tickets and memberships</p>
          </div>
          <Link to="/" className="flex items-center gap-2 bg-surface-mid border border-surface-slate text-white px-4 py-2 rounded-lg font-heading text-sm hover:bg-surface-slate transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Site
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8 border-b border-surface-mid pb-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-bold transition-all ${
                activeTab === 'tickets' ? 'bg-brand-pink/20 text-brand-pink border border-brand-pink/30 shadow-glow-pink' : 'bg-surface-dark text-gray-400 border border-surface-mid hover:bg-surface-mid'
              }`}
            >
              <Ticket className="w-5 h-5" /> Tickets
            </button>
            <button
              onClick={() => setActiveTab('memberships')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-bold transition-all ${
                activeTab === 'memberships' ? 'bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30 shadow-glow-gold' : 'bg-surface-dark text-gray-400 border border-surface-mid hover:bg-surface-mid'
              }`}
            >
              <Crown className="w-5 h-5" /> Memberships
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={triggerReminders}
              disabled={sendingReminders}
              className="flex items-center gap-2 bg-brand-violet text-white px-4 py-2 rounded-lg font-heading text-sm font-bold hover:bg-brand-violet/90 transition-colors shadow-glow-violet disabled:opacity-50"
            >
              {sendingReminders ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Send Reminders
            </button>
            <Link
              to="/catlava/scan"
              className="flex items-center gap-2 bg-brand-pink text-black px-4 py-2 rounded-lg font-heading text-sm font-bold hover:bg-brand-pink/90 transition-colors shadow-glow-pink"
            >
              <QrCode className="w-4 h-4" /> Scan Tickets
            </Link>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-surface-mid border border-surface-slate text-white px-4 py-2 rounded-lg font-heading text-sm hover:bg-surface-slate transition-colors"
            >
              <Download className="w-4 h-4" /> Export Data
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 text-brand-yellow animate-spin" />
          </div>
        ) : (
          <div className="bg-surface-dark border border-surface-mid rounded-2xl overflow-hidden shadow-card">
            {activeTab === 'tickets' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-mid border-b border-surface-slate">
                      <th className="p-4 font-heading text-sm font-semibold text-gray-300">ID</th>
                      <th className="p-4 font-heading text-sm font-semibold text-gray-300">Event</th>
                      <th className="p-4 font-heading text-sm font-semibold text-gray-300">Customer</th>
                      <th className="p-4 font-heading text-sm font-semibold text-gray-300">Date</th>
                      <th className="p-4 font-heading text-sm font-semibold text-gray-300">Status</th>
                      <th className="p-4 font-heading text-sm font-semibold text-gray-300 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500 font-body">No tickets found.</td>
                      </tr>
                    ) : (
                      tickets.map((ticket) => (
                        <tr key={ticket.id} className="border-b border-surface-slate/50 hover:bg-surface-mid/50 transition-colors">
                          <td className="p-4 font-mono text-xs text-gray-400">{ticket.id.substring(0, 8)}...</td>
                          <td className="p-4 font-heading font-medium text-white">{ticket.eventName}</td>
                          <td className="p-4 font-body text-sm text-gray-300">{ticket.customerEmail}</td>
                          <td className="p-4 font-body text-sm text-gray-400">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                              ticket.status === 'issued' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              ticket.status === 'used' ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20' :
                              'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {getStatusIcon(ticket.status)} {ticket.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <select 
                              value={ticket.status}
                              onChange={(e) => handleStatusChange('tickets', ticket.id, e.target.value)}
                              className="bg-surface-deep border border-surface-slate rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-yellow"
                            >
                              <option value="issued">Issued</option>
                              <option value="used">Used</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'memberships' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-mid border-b border-surface-slate">
                      <th className="p-4 font-heading text-sm font-semibold text-gray-300">ID</th>
                      <th className="p-4 font-heading text-sm font-semibold text-gray-300">Customer</th>
                      <th className="p-4 font-heading text-sm font-semibold text-gray-300">Joined Date</th>
                      <th className="p-4 font-heading text-sm font-semibold text-gray-300">Status</th>
                      <th className="p-4 font-heading text-sm font-semibold text-gray-300 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberships.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500 font-body">No memberships found.</td>
                      </tr>
                    ) : (
                      memberships.map((membership) => (
                        <tr key={membership.id} className="border-b border-surface-slate/50 hover:bg-surface-mid/50 transition-colors">
                          <td className="p-4 font-mono text-xs text-gray-400">{membership.id.substring(0, 8)}...</td>
                          <td className="p-4 font-body text-sm text-gray-300">{membership.customerEmail}</td>
                          <td className="p-4 font-body text-sm text-gray-400">{new Date(membership.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                              membership.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              membership.status === 'expired' ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20' :
                              'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {getStatusIcon(membership.status)} {membership.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <select 
                              value={membership.status}
                              onChange={(e) => handleStatusChange('memberships', membership.id, e.target.value)}
                              className="bg-surface-deep border border-surface-slate rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-yellow"
                            >
                              <option value="active">Active</option>
                              <option value="expired">Expired</option>
                              <option value="revoked">Revoked</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
