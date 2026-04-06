import React from 'react';
import { IonIcon } from '@ionic/react';
import { busOutline, checkmarkOutline, homeOutline, peopleOutline, personOutline, schoolOutline } from 'ionicons/icons';
import { FORM_SECTIONS } from '../utils/constants';

interface Props {
  currentStep: number;
}

const ICONS = [personOutline, schoolOutline, homeOutline, peopleOutline, busOutline];

const StepIndicator: React.FC<Props> = ({ currentStep }) => (
  <div className="step-bar">
    {FORM_SECTIONS.map((label, i) => {
      const done = i < currentStep;
      const active = i === currentStep;
      const cls = done ? 'step-item done' : active ? 'step-item active' : 'step-item';
      return (
        <div key={label} className={cls}>
          <div className="step-circle">
            <IonIcon icon={done ? checkmarkOutline : ICONS[i]} />
          </div>
          <div className="step-label">{label}</div>
        </div>
      );
    })}
  </div>
);

export default StepIndicator;
