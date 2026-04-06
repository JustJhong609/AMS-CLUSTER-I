import React from 'react';
import { IonSelect, IonSelectOption } from '@ionic/react';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
  required?: boolean;
  error?: string;
}

const FormSelect: React.FC<Props> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  error
}) => (
  <div className="form-group">
    <IonSelect
      label={label}
      labelPlacement="floating"
      fill="outline"
      value={value || undefined}
      placeholder={placeholder || `Select ${label}`}
      onIonChange={(e) => onChange(e.detail.value)}
      interface="action-sheet"
      style={{ '--border-radius': '12px', width: '100%' } as React.CSSProperties}
    >
      {options.map((opt) => (
        <IonSelectOption key={opt} value={opt}>
          {opt}
        </IonSelectOption>
      ))}
    </IonSelect>
    {error && <div className="error-text">{error}</div>}
  </div>
);

export default FormSelect;
