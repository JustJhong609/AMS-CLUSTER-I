import React from 'react';
import { IonText, IonTextarea } from '@ionic/react';
import { LearnerFormData, ValidationErrors } from '../../types';
import { clusterCoverage } from '../../data/clusterCoverage';
import { getBarangaysByMunicipalityDistrict, getDistrictOptions } from '../../utils/locationMapping';
import FormInput from '../FormInput';
import FormSelect from '../FormSelect';

interface Props {
  data: LearnerFormData;
  errors: ValidationErrors;
  onChange: (field: keyof LearnerFormData, value: string) => void;
}

const AddressSection: React.FC<Props> = ({ data, errors, onChange }) => {
  const OTHER_OPTION = 'Others (Please Specify)';
  const municipalityOptions = clusterCoverage.map((item) => item.municipality);
  const districtOptions = getDistrictOptions(data.municipality);
  const selectedBarangays = getBarangaysByMunicipalityDistrict(data.municipality, data.learnerDistrict);
  const barangayOptions = data.municipality && data.learnerDistrict ? [...selectedBarangays, OTHER_OPTION] : [];

  React.useEffect(() => {
    if (data.learnerDistrict && !districtOptions.includes(data.learnerDistrict)) {
      onChange('learnerDistrict', '');
      onChange('barangay', '');
      onChange('barangayOther', '');
    }
  }, [data.learnerDistrict, districtOptions, onChange]);

  React.useEffect(() => {
    if (data.barangay && !barangayOptions.includes(data.barangay)) {
      onChange('barangay', '');
      onChange('barangayOther', '');
    }
  }, [barangayOptions, data.barangay, onChange]);

  return (
    <div>
      <IonText>
        <h3 style={sectionStyle}>Address</h3>
      </IonText>

      <FormSelect
        label="Municipality"
        value={data.municipality}
        onChange={(v) => {
          onChange('municipality', v);
          onChange('learnerDistrict', '');
          onChange('barangay', '');
          onChange('barangayOther', '');
        }}
        options={municipalityOptions}
        required
        error={errors.municipality}
      />

      <FormSelect
        label="District"
        value={data.learnerDistrict}
        onChange={(v) => {
          onChange('learnerDistrict', v);
          onChange('barangay', '');
          onChange('barangayOther', '');
        }}
        options={districtOptions}
        placeholder={data.municipality ? 'Select District' : 'Select Municipality First'}
        required
        error={errors.learnerDistrict}
      />

      <FormSelect
        label="Barangay"
        value={data.barangay}
        onChange={(v) => {
          onChange('barangay', v);
          if (v !== OTHER_OPTION) onChange('barangayOther', '');
        }}
        options={barangayOptions}
        placeholder={data.learnerDistrict ? 'Select Barangay' : 'Select District First'}
        required
        error={errors.barangay}
      />

      {data.barangay === OTHER_OPTION && (
        <FormInput label="Barangay - Others (optional)" value={data.barangayOther} onChange={(v) => onChange('barangayOther', v)} />
      )}

      <div className="form-group">
        <IonTextarea
          label="Complete Address *"
          labelPlacement="floating"
          fill="outline"
          value={data.completeAddress}
          placeholder="House No., Street, Barangay, Municipality"
          rows={4}
          onIonInput={(e) => onChange('completeAddress', e.detail.value ?? '')}
          autoGrow
          style={{ '--border-radius': '10px' } as React.CSSProperties}
        />
        {errors.completeAddress && <div className="error-text">{errors.completeAddress}</div>}
      </div>
    </div>
  );
};

const sectionStyle: React.CSSProperties = { fontWeight: 800, color: 'var(--ion-color-primary)', marginBottom: 12 };

export default AddressSection;
