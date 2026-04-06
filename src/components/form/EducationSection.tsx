import React from 'react';
import { IonText } from '@ionic/react';
import { LearnerFormData, ValidationErrors } from '../../types';
import { CURRENTLY_STUDYING_OPTIONS, GRADE_LEVELS, REASON_OPTIONS, YES_NO_OPTIONS } from '../../utils/constants';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';
import RadioGroup from '../RadioGroup';

interface Props {
  data: LearnerFormData;
  errors: ValidationErrors;
  onChange: (field: keyof LearnerFormData, value: string) => void;
}

const EducationSection: React.FC<Props> = ({ data, errors, onChange }) => (
  <div>
    <IonText>
      <h3 style={sectionStyle}>Educational Background</h3>
    </IonText>

    <RadioGroup label="Basic Literacy Program (BLP)? *" options={['Yes', 'No']} value={data.isBlp} onChange={(v) => onChange('isBlp', v)} error={errors.isBlp} />

    {data.isBlp === 'No' && (
      <>
        <FormInput label="Name of School / Course / Degree" value={data.schoolName} onChange={(v) => onChange('schoolName', v)} />

        <RadioGroup
          label="Currently Studying? *"
          options={CURRENTLY_STUDYING_OPTIONS as unknown as string[]}
          value={data.currentlyStudying}
          onChange={(v) => onChange('currentlyStudying', v)}
          error={errors.currentlyStudying}
        />

        <FormSelect
          label="Last Grade / Level Completed"
          value={data.lastGradeCompleted}
          onChange={(v) => onChange('lastGradeCompleted', v)}
          options={GRADE_LEVELS}
          required
          error={errors.lastGradeCompleted}
        />

        {data.currentlyStudying === 'No' && (
          <>
            <FormSelect
              label="Reason for Not Attending"
              value={data.reasonForNotAttending}
              onChange={(v) => onChange('reasonForNotAttending', v)}
              options={REASON_OPTIONS}
              required
              error={errors.reasonForNotAttending}
            />
            {data.reasonForNotAttending === 'Others (Specify)' && (
              <FormInput
                label="Please Specify"
                value={data.reasonForNotAttendingOther}
                onChange={(v) => onChange('reasonForNotAttendingOther', v)}
                required
                error={errors.reasonForNotAttendingOther}
              />
            )}
          </>
        )}

        <RadioGroup
          label="Interested in ALS A&E? *"
          options={YES_NO_OPTIONS as unknown as string[]}
          value={data.interestedInALS}
          onChange={(v) => onChange('interestedInALS', v)}
          error={errors.interestedInALS}
        />
      </>
    )}

    <FormInput label="Contact Number" value={data.contactNumber} onChange={(v) => onChange('contactNumber', v)} type="tel" inputmode="tel" />
  </div>
);

const sectionStyle: React.CSSProperties = { fontWeight: 800, color: 'var(--ion-color-primary)', marginBottom: 12 };

export default EducationSection;
