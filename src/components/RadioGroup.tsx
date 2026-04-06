import React from 'react';

interface Props {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

const RadioGroup: React.FC<Props> = ({ label, options, value, onChange, error }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '2px 0' }}>
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              padding: '9px 20px',
              borderRadius: 50,
              border: `2px solid ${selected ? 'var(--ion-color-primary)' : '#CBD5E1'}`,
              background: selected
                ? 'linear-gradient(135deg, var(--ion-color-primary-tint), var(--ion-color-primary))'
                : '#fff',
              color: selected ? '#fff' : '#374151',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: selected ? 'scale(1.05)' : 'scale(1)',
              boxShadow: selected ? '0 4px 12px rgba(21,101,192,0.3)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              letterSpacing: 0.2,
              fontFamily: 'inherit'
            }}
          >
            {selected && <span style={{ fontSize: 12, lineHeight: 1 }}>✓</span>}
            {opt}
          </button>
        );
      })}
    </div>
    {error && <div className="error-text">{error}</div>}
  </div>
);

export default RadioGroup;
