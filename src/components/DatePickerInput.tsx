import React, { useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonHeader,
  IonIcon,
  IonModal,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { calendarOutline, checkmarkOutline, closeOutline } from 'ionicons/icons';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
  max?: string;
  min?: string;
}

const fmt = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
};

const DatePickerInput: React.FC<Props> = ({ label, value, onChange, required, error, max, min }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  const handleOpen = () => {
    setDraft(value || new Date().toISOString().split('T')[0]);
    setOpen(true);
  };

  const handleConfirm = () => {
    onChange(draft.split('T')[0]);
    setOpen(false);
  };

  const handleChange = (v: string | string[] | null | undefined) => {
    if (typeof v === 'string') {
      setDraft(v);
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span style={{ color: 'var(--ion-color-danger)' }}> *</span>}
      </label>

      <button
        type="button"
        onClick={handleOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          borderRadius: 12,
          border: `1.5px solid ${error ? 'var(--ion-color-danger)' : value ? 'var(--ion-color-primary)' : '#CBD5E1'}`,
          background: value ? 'rgba(21,101,192,0.04)' : '#fff',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontFamily: 'inherit',
          textAlign: 'left'
        }}
      >
        <IonIcon
          icon={calendarOutline}
          style={{ color: value ? 'var(--ion-color-primary)' : '#94A3B8', fontSize: 20, flexShrink: 0 }}
        />
        <span
          style={{
            flex: 1,
            fontSize: 15,
            fontWeight: value ? 600 : 400,
            color: value ? '#1e293b' : '#94A3B8'
          }}
        >
          {value ? fmt(value) : `Select ${label}`}
        </span>
        {value && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--ion-color-primary)',
              background: 'rgba(21,101,192,0.1)',
              borderRadius: 20,
              padding: '2px 8px'
            }}
          >
            SET
          </span>
        )}
      </button>

      {error && <div className="error-text">{error}</div>}

      {isOffline && (
        <input
          type="date"
          value={value || ''}
          max={max ?? `${new Date().getFullYear()}-12-31`}
          min={min ?? '1900-01-01'}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            marginTop: 8,
            padding: '12px 14px',
            borderRadius: 10,
            border: `1.5px solid ${error ? 'var(--ion-color-danger)' : '#CBD5E1'}`,
            background: '#fff',
            color: '#1e293b',
            fontSize: 15,
            fontFamily: 'inherit'
          }}
        />
      )}

      <IonModal
        isOpen={open}
        onDidDismiss={() => setOpen(false)}
        breakpoints={[0, 0.75]}
        initialBreakpoint={0.75}
        handle
        handleBehavior="cycle"
        keepContentsMounted
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton
                onClick={() => setOpen(false)}
                style={{
                  '--border-radius': '50px',
                  '--background': '#F1F5F9',
                  '--color': '#374151',
                  '--box-shadow': 'none',
                  width: 36,
                  height: 36
                } as any}
              >
                <IonIcon slot="icon-only" icon={closeOutline} style={{ fontSize: 18 }} />
              </IonButton>
            </IonButtons>
            <IonTitle style={{ fontWeight: 800 }}>{label}</IonTitle>
            <IonButtons slot="end">
              <IonButton
                onClick={handleConfirm}
                style={{
                  '--border-radius': '50px',
                  '--background': 'linear-gradient(135deg, #1976d2, #1565C0)',
                  '--color': '#fff',
                  '--box-shadow': '0 4px 12px rgba(21,101,192,0.35)',
                  width: 36,
                  height: 36
                } as any}
              >
                <IonIcon slot="icon-only" icon={checkmarkOutline} style={{ fontSize: 18 }} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          <IonDatetime
            presentation="date"
            preferWheel
            value={draft}
            onIonChange={(e) => handleChange(e.detail.value)}
            max={max ?? `${new Date().getFullYear()}-12-31`}
            min={min ?? '1900-01-01'}
            showDefaultButtons={false}
            style={{ '--background': '#fff', margin: '0 auto' }}
          />
        </IonContent>
      </IonModal>
    </div>
  );
};

export default DatePickerInput;
