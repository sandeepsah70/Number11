import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { VirtualNumber } from '../lib/types';
import { SEED_NUMBERS } from '../lib/numbersData';

export default function NumberListScreen() {
  const { country } = useParams<{ country: string }>();
  const navigate = useNavigate();
  const [numbers, setNumbers] = useState<VirtualNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const isIN = country === 'IN';

  useEffect(() => {
    fetchNumbers();
  }, [country]);

  const fetchNumbers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('virtual_numbers')
        .select('*')
        .eq('country', country)
        .eq('status', 'available')
        .order('created_at');
      if (!error && data && data.length > 0) {
        setNumbers(data as VirtualNumber[]);
      } else {
        const fallback = SEED_NUMBERS.filter(n => n.country === country);
        setNumbers(fallback);
      }
    } catch {
      const fallback = SEED_NUMBERS.filter(n => n.country === country);
      setNumbers(fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back">←</button>
        <div className="page-header-title">
          {isIN ? '🇮🇳' : '🇺🇸'} {isIN ? 'Indian Numbers' : 'US Numbers'}
        </div>
        <div className="price-chip">{isIN ? '₹150' : '$250'} / Number</div>
      </div>

      <div style={{ padding: '12px 16px 4px' }}>
        <div style={{ background: 'white', borderRadius: 'var(--radius-sm)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(31,95,224,0.07)' }}>
          <span style={{ fontSize: 16, color: 'var(--text-3)' }}>🔍</span>
          <span style={{ fontSize: 14, color: 'var(--text-3)' }}>Available numbers — tap Select to choose</span>
        </div>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : numbers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📵</div>
          <p>No numbers available right now</p>
          <button className="btn btn-outline" style={{ maxWidth: 200, marginTop: 16 }} onClick={fetchNumbers}>
            🔄 Refresh
          </button>
        </div>
      ) : (
        <>
          <div style={{ padding: '8px 16px 4px' }}>
            <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>{numbers.length} numbers available</span>
          </div>
          <div className="number-list">
            {numbers.map(num => (
              <div key={num.id} className="number-row">
                <div className="flag">{isIN ? '🇮🇳' : '🇺🇸'}</div>
                <div className="number-text">{num.number}</div>
                <button
                  className="btn-select"
                  onClick={() => navigate('/number-details', { state: { number: num } })}
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
