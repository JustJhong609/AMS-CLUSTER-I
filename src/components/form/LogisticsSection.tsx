import React from 'react';
import { IonSelect, IonSelectOption, IonText } from '@ionic/react';
import { LearnerFormData, ValidationErrors } from '../../types';
import { WEEKDAY_OPTIONS, TRANSPORT_OPTIONS } from '../../utils/constants';
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

    <div className="form-group">
      <FormInput
        label="Travel Time"
        value={data.travelTime}
        onChange={(v) => onChange('travelTime', v)}
        type="number"
        inputmode="numeric"
        placeholder="Enter number"
        required
        error={errors.travelTime}
      />
      <FormSelect
        label="Travel Time Unit"
        value={data.travelTimeUnit}
        onChange={(v) => onChange('travelTimeUnit', v)}
        options={['Hour', 'Minutes']}
        required
        error={errors.travelTimeUnit}
      />
    </div>

    <FormSelect
      label="Mode of Transport"
      value={data.transportMode}
      onChange={(v) => onChange('transportMode', v)}
      options={TRANSPORT_OPTIONS}
      required
      error={errors.transportMode}
    />

    <div className="form-group">
      <IonSelect
        label="Preferred Schedule (Days)"
        labelPlacement="floating"
        fill="outline"
        value={WEEKDAY_OPTIONS.filter((day) => data.preferredSessionTime.split(',').map((item) => item.trim()).includes(day))}
        placeholder="Select one or more days"
        multiple
        onIonChange={(e) => {
          const selected = Array.isArray(e.detail.value) ? (e.detail.value as string[]) : [];
          const normalized = WEEKDAY_OPTIONS.filter((day) => selected.includes(day));
          onChange('preferredSessionTime', normalized.join(', '));
        }}
        interface="action-sheet"
        style={{ '--border-radius': '12px', width: '100%' } as React.CSSProperties}
      >
        {WEEKDAY_OPTIONS.map((day) => (
          <IonSelectOption key={day} value={day}>
            {day}
          </IonSelectOption>
        ))}
      </IonSelect>
      {errors.preferredSessionTime && <div className="error-text">{errors.preferredSessionTime}</div>}
    </div>

    <FormInput label="Mapped By (Facilitator)" value={data.mappedBy} onChange={(v) => onChange('mappedBy', v)} required error={errors.mappedBy} />

    <FormInput
      label="Name of ALS Implementer"
      value={data.alsImplementer}
      onChange={(v) => onChange('alsImplementer', v)}
      required
      error={errors.alsImplementer}
    />

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
