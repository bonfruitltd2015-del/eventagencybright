import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Ticket, Crown, Loader2 } from 'lucide-react';

export default function Success() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [id, setId] = useState<string | null>(null);
  const [customerEmailState, setCustomerEmailState] = useState<string>('');

  const type = searchParams.get('type');
  const itemId = searchParams.get('itemId');
  const itemName = searchParams.get('itemName');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const fulfillOrder = async () => {
      try {
        let customerEmail = searchParams.get('email');

        if (!customerEmail && sessionId) {
          const sessionRes = await fetch(`/api/checkout-session?session_id=${sessionId}`);
          const sessionData = await sessionRes.json();
          customerEmail = sessionData.customer_details?.email;
        }

        if (!customerEmail) {
          setStatus('error');
          return;
        }

        setCustomerEmailState(customerEmail);

        const response = await fetch('/api/fulfill-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type,
            itemId,
            itemName,
            customerEmail,
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          setId(data.id);
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Fulfillment error:', error);
        setStatus('error');
      }
    };

    if (type && itemId && itemName) {
      fulfillOrder();
    } else {
      setStatus('error');
    }
  }, [type, itemId, itemName, sessionId]);

  return (
    <div className="min-h-screen bg-surface-deep flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface-dark border border-surface-mid rounded-3xl p-8 text-center shadow-glow-pink">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-brand-yellow animate-spin mb-4" />
            <h2 className="font-display text-2xl font-bold text-white mb-2">Processing your order...</h2>
            <p className="text-gray-400 font-body">Please wait while we generate your {type}.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            
            <h2 className="font-display text-3xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-gray-400 font-body mb-8">
              Thank you for your purchase. A confirmation and your ticket have been sent to <span className="text-white font-semibold">{customerEmailState}</span>.
            </p>

            <div className="w-full bg-surface-mid border-2 border-dashed border-brand-yellow/50 rounded-xl p-6 mb-8 text-left relative overflow-hidden">
              <div className="absolute top-0 left-0 w-4 h-4 bg-surface-deep rounded-br-full border-r border-b border-brand-yellow/50"></div>
              <div className="absolute top-0 right-0 w-4 h-4 bg-surface-deep rounded-bl-full border-l border-b border-brand-yellow/50"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 bg-surface-deep rounded-tr-full border-r border-t border-brand-yellow/50"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-surface-deep rounded-tl-full border-l border-t border-brand-yellow/50"></div>
              
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dashed border-surface-slate">
                {type === 'ticket' ? <Ticket className="w-8 h-8 text-brand-pink" /> : <Crown className="w-8 h-8 text-brand-yellow" />}
                <div>
                  <h3 className="font-heading font-bold text-2xl text-white">{itemName}</h3>
                  <p className="text-brand-yellow text-sm font-semibold uppercase tracking-wider">{type}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm uppercase tracking-wider">Attendee</span>
                  <span className="text-gray-200 font-medium">{customerEmailState}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm uppercase tracking-wider">Ticket ID</span>
                  <span className="text-brand-pink font-mono font-bold text-sm tracking-widest">{id?.substring(0, 8).toUpperCase()}-{id?.substring(8, 12).toUpperCase()}</span>
                </div>
                {type === 'ticket' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm uppercase tracking-wider">Date</span>
                      <span className="text-gray-200 font-medium">April 4, 17:00 – 23:00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm uppercase tracking-wider">Location</span>
                      <span className="text-gray-200 font-medium text-right max-w-[200px]">Laan van Ypenburg 108<br/>2497 GC, The Hague</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-dashed border-surface-slate flex justify-center">
                {/* Simulated Barcode */}
                <div className="h-12 w-full flex justify-between items-center opacity-80">
                  {[...Array(40)].map((_, i) => (
                    <div key={i} className={`bg-white h-full ${Math.random() > 0.5 ? 'w-1' : 'w-2'} ${Math.random() > 0.8 ? 'hidden' : ''}`}></div>
                  ))}
                </div>
              </div>
            </div>

            <Link to="/" className="w-full flex items-center justify-center gap-2 bg-gradient-brand text-black px-6 py-3 rounded-xl font-heading font-bold hover:scale-105 transition-transform">
              Return Home <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-gray-400 font-body mb-8">We couldn't process your order fulfillment. Please contact support.</p>
            <Link to="/" className="w-full flex items-center justify-center gap-2 bg-surface-mid text-white px-6 py-3 rounded-xl font-heading font-bold hover:bg-surface-slate transition-colors">
              Return Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
