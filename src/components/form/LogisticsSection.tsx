import React from 'react';
import { IonText } from '@ionic/react';
import { LearnerFormData, ValidationErrors } from '../../types';
import { SESSION_TIME_OPTIONS, TRANSPORT_OPTIONS } from '../../utils/constants';
import DatePickerInput from '../DatePickerInput';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';

interface Props {
  data: LearnerFormData;
  errors: ValidationErrors;
  onChange: (field: keyof LearnerFormData, value: string) => void;
}

const LogisticsSection: React.FC<Props> = ({ data, errors, onChange }) => (
  <div>
    <IonText>
      <h3 style={sectionStyle}>Logistics & Schedule</h3>
    </IonText>

    <FormInput
      label="Distance from School (km)"
      value={data.distanceKm}
      onChange={(v) => onChange('distanceKm', v)}
      type="number"
      inputmode="decimal"
      required
      error={errors.distanceKm}
    />

    <FormInput label="Travel Time" value={data.travelTime} onChange={(v) => onChange('travelTime', v)} required error={errors.travelTime} />

    <FormSelect
      label="Mode of Transport"
      value={data.transportMode}
      onChange={(v) => onChange('transportMode', v)}
      options={TRANSPORT_OPTIONS}
      required
      error={errors.transportMode}
    />

    <FormSelect
      label="Preferred Session Time"
      value={data.preferredSessionTime}
      onChange={(v) => onChange('preferredSessionTime', v)}
      options={SESSION_TIME_OPTIONS}
      required
      error={errors.preferredSessionTime}
    />

    <FormInput label="Mapped By (Facilitator)" value={data.mappedBy} onChange={(v) => onChange('mappedBy', v)} required error={errors.mappedBy} />

    <DatePickerInput
      label="Date Mapped"
      value={data.dateMapped}
      onChange={(v) => onChange('dateMapped', v)}
      required
      error={errors.dateMapped}
      max={new Date().toISOString().split('T')[0]}
    />
  </div>
);

const sectionStyle: React.CSSProperties = { fontWeight: 800, color: 'var(--ion-color-primary)', marginBottom: 12 };

export default LogisticsSection;
