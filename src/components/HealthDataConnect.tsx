import { useState } from 'react';
import type { ConnectedHealthData } from '../types/health';

type HealthBrand = {
  id: string;
  name: string;
  icon?: string;
  monogram?: string;
  color: string;
};

const brands: HealthBrand[] = [
  { id: 'apple', name: 'Apple Health', icon: 'fa-brands fa-apple', color: '#FF2D55' },
  { id: 'google', name: 'Google Fit', icon: 'fa-brands fa-google', color: '#4285F4' },
  { id: 'samsung', name: 'Samsung Health', icon: 'fa-brands fa-samsung', color: '#1428A0' },
  { id: 'whoop', name: 'WHOOP', monogram: 'W', color: '#000000' },
  { id: 'fitbit', name: 'Fitbit', monogram: 'F', color: '#00B0B9' },
  { id: 'garmin', name: 'Garmin', monogram: 'G', color: '#007CC3' },
];

type HealthDataConnectProps = {
  onComplete: (data?: ConnectedHealthData) => void;
};

export default function HealthDataConnect({ onComplete }: HealthDataConnectProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelected(id);
  };

  return (
    <div className="health-connect-view animate-fade" style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          Connect Health Data
        </h2>
        <p style={{ color: '#64748B', fontSize: '16px' }}>Select your health app or wearable to personalize your assessment.</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        {brands.map((brand) => (
          <div 
            key={brand.id}
            onClick={() => handleSelect(brand.id)}
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '28px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              border: `2.5px solid ${selected === brand.id ? brand.color : '#E2E8F0'}`,
              boxShadow: selected === brand.id 
                ? `0 10px 25px ${brand.color}20` 
                : '0 4px 12px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative'
            }}
          >
            {selected === brand.id && (
              <div style={{ 
                position: 'absolute', 
                top: '12px', 
                right: '12px',
                backgroundColor: '#22C55E',
                color: 'white',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                ✓
              </div>
            )}

            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: brand.monogram ? brand.color : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: brand.monogram ? 'white' : brand.color,
              fontSize: '32px',
              border: brand.icon ? `1px solid #F1F5F9` : 'none'
            }}>
              {brand.icon ? (
                <i className={brand.icon}></i>
              ) : (
                <span style={{ fontWeight: 800 }}>{brand.monogram}</span>
              )}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>{brand.name}</div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="animate-slide-up">
          <div style={{ 
            backgroundColor: '#F0FDF4', 
            border: '1.5px solid #BBF7D0', 
            padding: '16px', 
            borderRadius: '16px', 
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#166534', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
              <strong>Live integration coming soon.</strong><br/>
              Using demo health profile for this session.
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #E2E8F0', 
            padding: '32px', 
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
              <MetricItem icon="❤️" label="Resting Heart Rate" value="68 bpm" />
              <MetricItem icon="😴" label="Sleep Duration" value="6h 20min" />
              <MetricItem icon="🏃" label="Activity Level" value="Moderate" />
              <MetricItem icon="⚡" label="Recovery / Readiness" value="61%" />
              <MetricItem icon="📊" label="HRV" value="42ms" />
              <MetricItem icon="👟" label="Steps" value="7,840" />
            </div>
            
            <button 
              onClick={() => onComplete({ 
                brand: selected, 
                demo: true,
                metrics: {
                  heartRate: "68 bpm",
                  sleep: "6h 20min",
                  activity: "Moderate",
                  recovery: "61%",
                  hrv: "42ms",
                  steps: "7,840"
                }
              })}
              style={{ 
                width: '100%', 
                marginTop: '32px',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#0F172A',
                color: 'white',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1E293B'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0F172A'}
            >
              Connect My Data
            </button>
          </div>
        </div>
      )}

      {!selected && (
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={() => onComplete()}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: '12px'
            }}
          >
            Continue without health data →
          </button>
        </div>
      )}

      <div style={{ 
        marginTop: '64px', 
        padding: '24px', 
        borderTop: '1px solid #F1F5F9',
        textAlign: 'center',
        color: '#94A3B8',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <span>🔒</span> Your health data is processed locally and never leaves your browser.
      </div>
    </div>
  );
}

function MetricItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <div style={{ 
        fontSize: '24px', 
        width: '48px', 
        height: '48px', 
        backgroundColor: '#F8FAFC', 
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
        <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{value}</div>
      </div>
    </div>
  );
}
