import { useState } from 'react';
import { Scanner as QRScanner } from '@yudiel/react-qr-scanner';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Loader2, QrCode } from 'lucide-react';

export default function Scanner() {
  const [scanResult, setScanResult] = useState<{ id: string; eventName: string } | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'processing' | 'success' | 'error'>('scanning');
  const [errorMessage, setErrorMessage] = useState('');

  const handleScan = async (text: string) => {
    if (status !== 'scanning') return;
    
    try {
      setStatus('processing');
      const data = JSON.parse(text);
      
      if (!data.id || !data.eventId) {
        throw new Error('Invalid QR code format');
      }

      setScanResult(data);

      const token = sessionStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/tickets/${data.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'used' }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update ticket status');
      }

      setStatus('success');
    } catch (error) {
      console.error('Scan error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Invalid QR code');
      setStatus('error');
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setErrorMessage('');
    setStatus('scanning');
  };

  return (
    <div className="min-h-screen bg-surface-deep text-gray-100 p-6 md:p-12 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
            <QrCode className="w-8 h-8 text-brand-pink" />
            Scanner
          </h1>
          <Link to="/catlava" className="flex items-center gap-2 bg-surface-mid border border-surface-slate text-white px-4 py-2 rounded-lg font-heading text-sm hover:bg-surface-slate transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>

        <div className="bg-surface-dark border border-surface-mid rounded-3xl overflow-hidden shadow-2xl relative">
          {status === 'scanning' && (
            <div className="aspect-square relative">
              <QRScanner
                onScan={(result) => {
                  if (result && result.length > 0) {
                    handleScan(result[0].rawValue);
                  }
                }}
                onError={(error) => console.error(error)}
                components={{
                  onOff: true,
                  torch: true,
                  zoom: true,
                  finder: true,
                }}
              />
              <div className="absolute inset-0 pointer-events-none border-[12px] border-black/40 z-10" />
            </div>
          )}

          {status === 'processing' && (
            <div className="aspect-square flex flex-col items-center justify-center p-8 text-center bg-surface-mid/30">
              <Loader2 className="w-16 h-16 text-brand-pink animate-spin mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Processing Ticket...</h2>
              <p className="text-gray-400">Verifying and updating status</p>
            </div>
          )}

          {status === 'success' && scanResult && (
            <div className="aspect-square flex flex-col items-center justify-center p-8 text-center bg-green-500/10">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Ticket Validated!</h2>
              <p className="text-gray-300 mb-6">
                <span className="font-bold text-white">{scanResult.eventName}</span><br/>
                ID: <span className="font-mono text-sm">{scanResult.id.substring(0, 8)}...</span>
              </p>
              <button 
                onClick={resetScanner}
                className="bg-green-500 text-black font-bold py-3 px-8 rounded-xl hover:bg-green-400 transition-colors"
              >
                Scan Next Ticket
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="aspect-square flex flex-col items-center justify-center p-8 text-center bg-red-500/10">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Scan Failed</h2>
              <p className="text-red-400 mb-6">{errorMessage}</p>
              <button 
                onClick={resetScanner}
                className="bg-surface-mid border border-surface-slate text-white font-bold py-3 px-8 rounded-xl hover:bg-surface-slate transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          Point your camera at a ticket QR code to scan and mark it as used.
        </div>
      </div>
    </div>
  );
}
