import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Message, Subscription, VirtualNumber } from '../lib/types';
import { getNumberMessages, simulateIncomingMessage } from '../lib/dataService';

type SubWithNumber = Subscription & { virtual_numbers: VirtualNumber };

export default function InboxScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { subscription } = location.state as { subscription: SubWithNumber };
  const vn = subscription?.virtual_numbers;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sms' | 'otp' | 'call'>('all');
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (!vn) { navigate('/my-numbers'); return; }
    fetchMessages();
  }, [vn]);

  const fetchMessages = async () => {
    if (!vn) return;
    setLoading(true);
    const data = await getNumberMessages(vn.id);
    setMessages(data);
    setLoading(false);
  };

  const handleSimulate = async (type: 'otp' | 'sms') => {
    if (!vn) return;
    setSimulating(true);
    const newMsg = await simulateIncomingMessage(vn.id, subscription?.id || null, type);
    setMessages(prev => [newMsg, ...prev]);
    setSimulating(false);
  };

  const filtered = filter === 'all' ? messages : messages.filter(m => m.type === filter);
  const isIN = vn?.country === 'IN';
  const daysLeft = Math.max(0, Math.ceil((new Date(subscription.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div className="page-header-title">Inbox</div>
        <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 10px', borderRadius: 999, fontWeight: 700 }}>
          {daysLeft}d left
        </span>
      </div>

      {/* Number info strip */}
      <div style={{ background: 'white', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 28 }}>{isIN ? '🇮🇳' : '🇺🇸'}</span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text)' }}>{vn?.number}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{isIN ? 'Indian Number' : 'US Number'} • Active</div>
        </div>
        <span className="badge badge-green" style={{ marginLeft: 'auto' }}>● Active</span>
      </div>

      {/* Filter tabs */}
      <div style={{ padding: '10px 16px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {(['all', 'sms', 'otp', 'call'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap',
              background: filter === f ? 'var(--blue)' : 'white',
              color: filter === f ? 'white' : 'var(--text-2)',
              boxShadow: '0 2px 8px rgba(31,95,224,0.08)',
            }}>
            {f === 'all' ? 'All' : f === 'sms' ? '💬 SMS' : f === 'otp' ? '🔑 OTP' : '📞 Calls'}
          </button>
        ))}
      </div>

      {/* Simulation test bar */}
      <div style={{ padding: '0 16px 8px', display: 'flex', gap: 8 }}>
        <button
          className="btn btn-outline"
          disabled={simulating}
          style={{ flex: 1, minHeight: 36, fontSize: 12, padding: '4px 10px', borderColor: 'var(--blue)', color: 'var(--blue)' }}
          onClick={() => handleSimulate('otp')}
        >
          {simulating ? '⏳ Waiting...' : '⚡ Test Incoming OTP'}
        </button>
        <button
          className="btn btn-outline"
          disabled={simulating}
          style={{ flex: 1, minHeight: 36, fontSize: 12, padding: '4px 10px' }}
          onClick={() => handleSimulate('sms')}
        >
          {simulating ? '⏳ Waiting...' : '💬 Test SMS'}
        </button>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No messages yet</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Messages will appear here when received</p>
        </div>
      ) : (
        <div className="inbox-body" style={{ paddingBottom: 24 }}>
          {filtered.map(msg => (
            <div key={msg.id} className="msg-card">
              <span className="msg-type">
                {msg.type === 'sms' ? '💬 SMS' : msg.type === 'otp' ? '🔑 OTP' : '📞 Call'}
              </span>
              {msg.body && <div className="msg-body">{msg.body}</div>}
              {msg.sender && <div className="msg-sender">From: {msg.sender}</div>}
              <div className="msg-time">{new Date(msg.received_at).toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
