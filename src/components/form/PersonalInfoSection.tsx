import React from 'react';
import { IonText } from '@ionic/react';
import { LearnerFormData, ValidationErrors } from '../../types';
import {
  CIVIL_STATUS_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  MOTHER_TONGUE_OPTIONS,
  OCCUPATION_TYPE_OPTIONS,
  PWD_TYPE_OPTIONS,
  SEX_OPTIONS
} from '../../utils/constants';
import { calculateAge } from '../../utils/helpers';
import DatePickerInput from '../DatePickerInput';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';
import RadioGroup from '../RadioGroup';

interface Props {
  data: LearnerFormData;
  errors: ValidationErrors;
  onChange: (field: keyof LearnerFormData, value: string) => void;
}

const PersonalInfoSection: React.FC<Props> = ({ data, errors, onChange }) => {
  const OTHER_OPTION = 'Others (Please Specify)';
  const motherTongueOptions = [...MOTHER_TONGUE_OPTIONS, OTHER_OPTION];

  const handleBirthdate = (v: string) => {
    onChange('birthdate', v);
    if (v) {
      onChange('age', String(calculateAge(v)));
    }
  };

  return (
    <div>
      <IonText>
        <h3 style={sectionStyle}>Personal Information</h3>
      </IonText>

      <FormInput label="Last Name" value={data.lastName} onChange={(v) => onChange('lastName', v)} required error={errors.lastName} />
      <FormInput label="First Name" value={data.firstName} onChange={(v) => onChange('firstName', v)} required error={errors.firstName} />
      <FormInput label="Middle Name (optional)" value={data.middleName} onChange={(v) => onChange('middleName', v)} error={errors.middleName} />
      <FormInput label="Name Extension" value={data.nameExtension} onChange={(v) => onChange('nameExtension', v)} placeholder="Jr., Sr., III" />

      <RadioGroup label="Sex *" options={SEX_OPTIONS as unknown as string[]} value={data.sex} onChange={(v) => onChange('sex', v)} error={errors.sex} />

      <FormSelect
        label="Civil Status"
        value={data.civilStatus}
        onChange={(v) => onChange('civilStatus', v)}
        options={CIVIL_STATUS_OPTIONS}
        required
        error={errors.civilStatus}
      />

      <DatePickerInput label="Birthdate" value={data.birthdate} onChange={handleBirthdate} required error={errors.birthdate} />

      {data.age && <FormInput label="Age (auto-calculated)" value={data.age} onChange={() => {}} readonly />}

      <FormSelect
        label="Mother Tongue"
        value={data.motherTongue}
        onChange={(v) => {
          onChange('motherTongue', v);
          if (v !== OTHER_OPTION) onChange('motherTongueOther', '');
        }}
        options={motherTongueOptions}
        required
        error={errors.motherTongue}
      />

      {data.motherTongue === OTHER_OPTION && (
        <FormInput label="Mother Tongue - Others (optional)" value={data.motherTongueOther} onChange={(v) => onChange('motherTongueOther', v)} />
      )}

      <FormSelect
        label="Occupation Type"
        value={data.occupationType}
        onChange={(v) => onChange('occupationType', v)}
        options={OCCUPATION_TYPE_OPTIONS}
        required
        error={errors.occupationType}
      />

      {data.occupationType && data.occupationType !== 'None' && (
        <FormSelect
          label="Employment Status"
          value={data.employmentStatus}
          onChange={(v) => onChange('employmentStatus', v)}
          options={EMPLOYMENT_STATUS_OPTIONS}
          required
          error={errors.employmentStatus}
        />
      )}

      <FormInput
        label="Monthly Income"
        value={data.monthlyIncome}
        onChange={(v) => onChange('monthlyIncome', v)}
        type="number"
        inputmode="numeric"
        placeholder="e.g. 5000"
        required
        error={errors.monthlyIncome}
      />

      <FormInput label="Religion (optional)" value={data.religion} onChange={(v) => onChange('religion', v)} />

      <RadioGroup
        label="Person w/ Disability? *"
        options={['Yes', 'No']}
        value={data.isPwd}
        onChange={(v) => {
          onChange('isPwd', v);
          if (v === 'No') {
            onChange('pwdType', '');
            onChange('pwdTypeOther', '');
          }
        }}
        error={errors.isPwd}
      />

      {data.isPwd === 'Yes' && (
        <>
          <FormSelect
            label="Type of Disability *"
            value={data.pwdType}
            onChange={(v) => {
              onChange('pwdType', v);
              if (v !== 'Others (Please Specify)') onChange('pwdTypeOther', '');
            }}
            options={PWD_TYPE_OPTIONS as unknown as string[]}
            required
            error={errors.pwdType}
          />
          {data.pwdType === 'Others (Please Specify)' && (
            <FormInput
              label="Please Specify"
              value={data.pwdTypeOther}
              onChange={(v) => onChange('pwdTypeOther', v)}
              required
              error={errors.pwdTypeOther}
            />
          )}
        </>
      )}
    </div>
  );
};

const sectionStyle: React.CSSProperties = {
  fontWeight: 800,
  color: 'var(--ion-color-primary)',
  marginBottom: 12
};

export default PersonalInfoSection;
