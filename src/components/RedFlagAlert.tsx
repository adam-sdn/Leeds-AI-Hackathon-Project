type RedFlagAlertProps = {
  onStartAgain: () => void;
};

export default function RedFlagAlert({ onStartAgain }: RedFlagAlertProps) {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFF5F5',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        overflowY: 'auto'
      }}
      className="animate-fade"
    >
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <div style={{ 
          fontSize: '80px', 
          marginBottom: '24px',
          color: '#E53E3E',
          animation: 'pulse 2s infinite'
        }}>
          ⚠️
        </div>
        
        <h1 style={{ 
          color: '#9B2C2C', 
          fontSize: 'clamp(28px, 5vw, 40px)', 
          fontWeight: '900',
          marginBottom: '20px',
          lineHeight: '1.1',
          letterSpacing: '-0.02em'
        }}>
          Urgent Action Required
        </h1>

        <p style={{ 
          fontSize: 'clamp(18px, 3vw, 22px)', 
          color: '#742A2A', 
          fontWeight: '500', 
          lineHeight: '1.5',
          marginBottom: '40px'
        }}>
          Based on your symptoms, you should seek immediate medical attention.
        </p>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px 32px', 
          borderRadius: '24px', 
          boxShadow: '0 20px 40px rgba(155, 44, 44, 0.1)',
          marginBottom: '40px',
          border: '1px solid #FED7D7',
          textAlign: 'left'
        }}>
          <h2 style={{ fontSize: '20px', color: '#9B2C2C', marginBottom: '28px', fontWeight: '700' }}>
            Next steps (United Kingdom):
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: '#E53E3E', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '900', fontSize: '18px' }}>1</div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#1A202C' }}>Call 999 now</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#4A5568' }}>Tell the operator your symptoms clearly.</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: '#E53E3E', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '900', fontSize: '18px' }}>2</div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#1A202C' }}>Go to A&E</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#4A5568' }}>Visit your nearest Accident & Emergency department immediately.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ background: '#E53E3E', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '900', fontSize: '18px' }}>3</div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: '#1A202C' }}>Do not wait</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#4A5568' }}>Do not wait for a routine GP appointment or for symptoms to "pass".</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '13px', color: '#9B2C2C', opacity: 0.7, fontStyle: 'italic' }}>
            This is an automated guidance tool and NOT a medical diagnosis. If you are worried or your condition changes, seek help immediately.
          </p>
        </div>

        <button 
          onClick={onStartAgain}
          style={{
            backgroundColor: 'transparent',
            color: '#9B2C2C',
            border: '2px solid #FEB2B2',
            padding: '14px 28px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FED7D7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Start another check
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
