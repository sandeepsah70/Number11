import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Subscription, VirtualNumber } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from '../components/BottomNav';
import { getUserSubscriptions } from '../lib/dataService';

type SubWithNumber = Subscription & { virtual_numbers: VirtualNumber };

export default function MyNumbersScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<'active' | 'expired'>('active');
  const [subs, setSubs] = useState<SubWithNumber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSubs(); }, [tab, user]);

  const fetchSubs = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getUserSubscriptions(user.id, tab);
    setSubs(data as SubWithNumber[]);
    setLoading(false);
  };

  const daysLeft = (expiry: string) => {
    const diff = new Date(expiry).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="screen pb-nav" style={{ background: 'var(--bg)' }}>
      <div className="page-header" style={{ position: 'sticky', top: 0 }}>
        <div className="page-header-title" style={{ marginLeft: 0 }}>📱 My Numbers</div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '12px 16px 4px' }}>
        <div className="tab-bar" style={{ margin: 0 }}>
          <button className={`tab-btn ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>Active</button>
          <button className={`tab-btn ${tab === 'expired' ? 'active' : ''}`} onClick={() => setTab('expired')}>Expired</button>
        </div>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : subs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{tab === 'active' ? '📵' : '📂'}</div>
          <p>{tab === 'active' ? 'No active numbers yet' : 'No expired numbers'}</p>
          {tab === 'active' && (
            <button className="btn btn-primary" style={{ maxWidth: 220, marginTop: 16 }} onClick={() => navigate('/home')}>
              ➕ Get a Number
            </button>
          )}
        </div>
      ) : (
        <div className="my-numbers-body">
          {subs.map(sub => {
            const vn = sub.virtual_numbers;
            const isIN = vn?.country === 'IN';
            const days = daysLeft(sub.expiry_date);
            return (
              <div
                key={sub.id}
                className="active-number-card"
                onClick={() => navigate('/inbox', { state: { subscription: sub } })}
              >
                <div style={{ fontSize: 36 }}>{isIN ? '🇮🇳' : '🇺🇸'}</div>
                <div className="number-card-info">
                  <div className="number-card-num">{vn?.number}</div>
                  <div className="number-card-type">{isIN ? 'Indian Number' : 'US Number'}</div>
                  <div className="number-card-expire">
                    {tab === 'active'
                      ? days > 3 ? `📅 Expires in ${days} days` : `⚠️ Expires in ${days} days`
                      : `❌ Expired on ${new Date(sub.expiry_date).toLocaleDateString('en-IN')}`
                    }
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  <span className={`badge ${tab === 'active' ? 'badge-green' : 'badge-red'}`}>
                    {tab === 'active' ? '● Active' : '● Expired'}
                  </span>
                  {tab === 'active' && (
                    <button className="btn-select" style={{ fontSize: 12, padding: '6px 14px' }}
                      onClick={e => { e.stopPropagation(); navigate('/home'); }}>
                      Renew
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BottomNav active="my-numbers" />
    </div>
  );
}
