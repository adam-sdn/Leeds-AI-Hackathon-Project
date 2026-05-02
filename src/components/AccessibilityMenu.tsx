import React, { useState } from 'react';

type AccessibilityMenuProps = {
  settings: {
    highContrast: boolean;
    largeText: boolean;
    colourBlindSafe: boolean;
  };
  onToggle: (key: 'highContrast' | 'largeText' | 'colourBlindSafe') => void;
};

export default function AccessibilityMenu({ settings, onToggle }: AccessibilityMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: 'white',
          padding: '8px 14px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
      >
        <span style={{ fontSize: '16px' }}>♿</span>
        <span>Accessibility</span>
      </button>

      {isOpen && (
        <>
          <div 
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
          />
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 12px)',
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
            padding: '20px',
            width: '260px',
            zIndex: 1000,
            animation: 'slideUp 0.2s ease-out'
          }}>
            <h3 style={{ fontSize: '15px', color: '#0F172A', marginBottom: '16px', fontWeight: 700 }}>Accessibility Options</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <AccessibilityToggle 
                label="High Contrast" 
                active={settings.highContrast} 
                onClick={() => onToggle('highContrast')} 
                description="Enhanced text visibility"
              />
              <AccessibilityToggle 
                label="Larger Text" 
                active={settings.largeText} 
                onClick={() => onToggle('largeText')} 
                description="Easier reading size"
              />
              <AccessibilityToggle 
                label="Colour-blind Safe" 
                active={settings.colourBlindSafe} 
                onClick={() => onToggle('colourBlindSafe')} 
                description="Accessible palette"
              />
            </div>
            
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
              <p style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>
                Settings apply instantly across all Kashf screens.
              </p>
            </div>
          </div>
        </>
      )}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function AccessibilityToggle({ label, active, onClick, description }: { label: string; active: boolean; onClick: () => void; description: string }) {
  return (
    <div 
      onClick={onClick}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        padding: '10px',
        borderRadius: '10px',
        backgroundColor: active ? '#F8FAFC' : 'transparent',
        transition: 'all 0.2s',
        border: active ? '1px solid #E2E8F0' : '1px solid transparent'
      }}
    >
      <div>
        <div style={{ fontSize: '14px', color: '#0F172A', fontWeight: active ? 700 : 500 }}>{label}</div>
        <div style={{ fontSize: '11px', color: '#64748B' }}>{description}</div>
      </div>
      <div style={{
        width: '40px',
        height: '22px',
        borderRadius: '11px',
        backgroundColor: active ? '#2F6FED' : '#E2E8F0',
        position: 'relative',
        transition: 'background-color 0.2s',
        flexShrink: 0
      }}>
        <div style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          backgroundColor: 'white',
          position: 'absolute',
          top: '2px',
          left: active ? '20px' : '2px',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }} />
      </div>
    </div>
  );
}
