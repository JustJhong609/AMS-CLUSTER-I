import React from 'react';
import { IonText } from '@ionic/react';
import { LearnerFormData, ValidationErrors } from '../../types';
import { FAMILY_ROLE_OPTIONS, YES_NO_OPTIONS } from '../../utils/constants';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';
import RadioGroup from '../RadioGroup';

interface Props {
  data: LearnerFormData;
  errors: ValidationErrors;
  onChange: (field: keyof LearnerFormData, value: string) => void;
}

const FamilySection: React.FC<Props> = ({ data, errors, onChange }) => (
  <div>
    <IonText>
      <h3 style={sectionStyle}>Family Information</h3>
    </IonText>

    <FormSelect
      label="Role in the Family"
      value={data.roleInFamily}
      onChange={(v) => onChange('roleInFamily', v)}
      options={FAMILY_ROLE_OPTIONS}
      required
      error={errors.roleInFamily}
    />

    <FormInput label="Father's Name (optional)" value={data.fatherName} onChange={(v) => onChange('fatherName', v)} />
    <FormInput label="Mother's Name (optional)" value={data.motherName} onChange={(v) => onChange('motherName', v)} />
    <FormInput label="Guardian's Name (optional)" value={data.guardianName} onChange={(v) => onChange('guardianName', v)} />
    <FormInput label="Guardian's Occupation (optional)" value={data.guardianOccupation} onChange={(v) => onChange('guardianOccupation', v)} />

    <RadioGroup label="Indigenous Peoples (IP) Member? *" options={['Yes', 'No']} value={data.isIP} onChange={(v) => onChange('isIP', v)} error={errors.isIP} />

    {data.isIP === 'Yes' && (
      <FormInput
        label="Tribe / Ethnic Group"
        value={data.ipTribe}
        onChange={(v) => onChange('ipTribe', v)}
        required
        error={errors.ipTribe}
        placeholder="e.g. Higaonon"
      />
    )}

    <RadioGroup label="4Ps Member? *" options={YES_NO_OPTIONS as unknown as string[]} value={data.is4PsMember} onChange={(v) => onChange('is4PsMember', v)} error={errors.is4PsMember} />
  </div>
);

const sectionStyle: React.CSSProperties = { fontWeight: 800, color: 'var(--ion-color-primary)', marginBottom: 12 };

export default FamilySection;
