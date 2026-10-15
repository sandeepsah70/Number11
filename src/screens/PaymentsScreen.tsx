import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';
import { getUserPayments } from '../lib/dataService';
import type { Payment } from '../lib/types';

export default function PaymentsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserPayments(user.id).then(data => {
      setPayments(data);
      setLoading(false);
    });
  }, [user]);

  const statusColor = (s: string) => s === 'success' ? '#15803D' : s === 'failed' ? '#B91C1C' : '#B45309';
  const statusBg = (s: string) => s === 'success' ? 'var(--green-light)' : s === 'failed' ? 'var(--red-light)' : '#FEF3C7';
  const methodIcon = (m: string | null) => ({ upi: '📲', card: '💳', netbanking: '🏦', wallet: '👛' }[m || ''] || '💰');

  return (
    <div className="screen pb-nav" style={{ background: 'var(--bg)' }}>
      <div className="page-header" style={{ position: 'sticky', top: 0 }}>
        <div className="page-header-title" style={{ marginLeft: 0 }}>💳 Payment History</div>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : payments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💸</div>
          <p>No payments yet</p>
          <button className="btn btn-primary" style={{ maxWidth: 220, marginTop: 16 }} onClick={() => navigate('/home')}>
            Get a Number
          </button>
        </div>
      ) : (
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {payments.map(p => (
            <div key={p.id} style={{ background: 'white', borderRadius: 'var(--radius-sm)', padding: '14px 16px', boxShadow: '0 2px 10px rgba(31,95,224,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{methodIcon(p.method)}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', textTransform: 'capitalize' }}>{p.method}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(p.created_at).toLocaleDateString('en-IN')}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>
                    {p.currency === 'INR' ? '₹' : '$'}{p.amount}
                  </div>
                  <span style={{ background: statusBg(p.status), color: statusColor(p.status), padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                    {p.status === 'success' ? '✅ Success' : p.status === 'failed' ? '❌ Failed' : '⏳ Pending'}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', borderTop: '1px solid var(--border)', paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span>TXN: {p.transaction_id?.substring(0, 16)}…</span>
                <span style={{ color: 'var(--blue)', fontWeight: 600, cursor: 'pointer' }}>📄 Invoice</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav active="payments" />
    </div>
  );
}
