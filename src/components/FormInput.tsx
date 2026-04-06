import React from 'react';
import { IonInput } from '@ionic/react';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: 'text' | 'number' | 'email' | 'tel' | 'date';
  placeholder?: string;
  required?: boolean;
  error?: string;
  readonly?: boolean;
  inputmode?: 'text' | 'numeric' | 'decimal' | 'tel';
}

const FormInput: React.FC<Props> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  error,
  readonly,
  inputmode
}) => (
  <div className="form-group">
    <IonInput
      label={label}
      labelPlacement="floating"
      fill="outline"
      value={value}
      type={type}
      placeholder={placeholder}
      onIonInput={(e) => onChange(e.detail.value ?? '')}
      readonly={readonly}
      inputmode={inputmode}
      className={required ? 'ion-touched' : ''}
      style={{ '--border-radius': '10px' } as React.CSSProperties}
    />
    {error && <div className="error-text">{error}</div>}
  </div>
);

export default FormInput;
