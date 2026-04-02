import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function Cancel() {
  return (
    <div className="min-h-screen bg-surface-deep flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface-dark border border-surface-mid rounded-3xl p-8 text-center shadow-card">
        <div className="w-20 h-20 bg-brand-pink/20 rounded-full flex items-center justify-center mb-6 mx-auto">
          <XCircle className="w-10 h-10 text-brand-pink" />
        </div>
        
        <h2 className="font-display text-3xl font-bold text-white mb-4">Payment Cancelled</h2>
        <p className="text-gray-400 font-body mb-8">
          Your payment was cancelled and you have not been charged. You can try again whenever you're ready.
        </p>

        <Link to="/" className="w-full flex items-center justify-center gap-2 bg-surface-mid border border-surface-slate text-white px-6 py-3 rounded-xl font-heading font-bold hover:bg-surface-slate transition-colors">
          <ArrowLeft className="w-4 h-4" /> Return Home
        </Link>
      </div>
    </div>
  );
}
