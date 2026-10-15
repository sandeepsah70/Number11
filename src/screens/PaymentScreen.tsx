import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { VirtualNumber } from '../lib/types';
import { processPaymentAndSubscription } from '../lib/dataService';

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

const METHODS: { id: PaymentMethod; name: string; sub: string; icon: string }[] = [
  { id: 'upi', name: 'UPI', sub: 'Google Pay / PhonePe / Paytm', icon: '📲' },
  { id: 'card', name: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay', icon: '💳' },
  { id: 'netbanking', name: 'Net Banking', sub: 'All major banks supported', icon: '🏦' },
  { id: 'wallet', name: 'Wallet', sub: 'Paytm / Mobikwik', icon: '👛' },
];

export default function PaymentScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { number, price, currency } = location.state as { number: VirtualNumber; price: string; currency: string };
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const isIN = number?.country === 'IN';
  const flag = isIN ? '🇮🇳' : '🇺🇸';

  const handlePay = async () => {
    if (!user || !number) return;
    setLoading(true);
    try {
      await processPaymentAndSubscription({
        userId: user.id,
        number,
        method,
        currency,
      });

      navigate('/payment-success', { state: { number } });
    } catch (err: any) {
      showToast('❌ Payment failed: ' + (err.message || 'Try again'));
    } finally {
      setLoading(false);
    }
  };

  if (!number) { navigate('/home'); return null; }

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      {toast && (
        <div className="toast-container">
          <div className="toast toast-error">{toast}</div>
        </div>
      )}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="page-header-title">Payment</div>
      </div>

      <div className="payment-body" style={{ paddingBottom: 100 }}>
        <div className="payment-summary">
          <div style={{ fontSize: 36 }}>{flag}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>{number.number}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{isIN ? 'Indian Number' : 'US Number'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Valid for 30 days</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--blue)' }}>{price}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Total</div>
          </div>
        </div>

        <div className="pay-method-title">Choose Payment Method</div>
        <div className="method-list">
          {METHODS.map(m => (
            <div key={m.id} className={`method-row ${method === m.id ? 'selected' : ''}`} onClick={() => setMethod(m.id)}>
              <div className={`method-radio ${method === m.id ? 'checked' : ''}`} />
              <div className="method-icon">{m.icon}</div>
              <div className="method-info">
                <div className="method-name">{m.name}</div>
                <div className="method-sub">{m.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {method === 'upi' && (
          <div style={{ background: 'white', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: 16, boxShadow: '0 2px 8px rgba(31,95,224,0.07)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10 }}>Popular UPI apps</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[{ name: 'GPay', emoji: '🟢' }, { name: 'PhonePe', emoji: '🟣' }, { name: 'Paytm', emoji: '🔵' }].map(u => (
                <div key={u.name} style={{ flex: 1, textAlign: 'center', padding: '10px 8px', border: '1.5px solid var(--border)', borderRadius: 10, cursor: 'pointer', fontSize: 24 }}>
                  {u.emoji}
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginTop: 4 }}>{u.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn btn-primary" onClick={handlePay} disabled={loading}>
          {loading ? '⏳ Processing payment...' : `🔒 Pay Now — ${price}`}
        </button>
        <div className="secure-note" style={{ marginTop: 12 }}>🔒 Your payment is secure and encrypted</div>
      </div>
    </div>
  );
}
