import { LearnerFormData, ValidationResult } from '../types';

const result = (errors: Record<string, string>): ValidationResult => ({
  isValid: Object.keys(errors).length === 0,
  errors
});

export const validatePersonalInfo = (d: LearnerFormData): ValidationResult => {
  const e: Record<string, string> = {};
  if (!d.lastName.trim()) e.lastName = 'Last name is required';
  if (!d.firstName.trim()) e.firstName = 'First name is required';
  if (!d.sex) e.sex = 'Sex is required';
  if (!d.civilStatus) e.civilStatus = 'Civil status is required';
  if (!d.birthdate) e.birthdate = 'Birthdate is required';
  if (!d.motherTongue) e.motherTongue = 'Mother tongue is required';
  if (!d.occupationType) e.occupationType = 'Occupation type is required';
  if (d.occupationType && d.occupationType !== 'None' && !d.employmentStatus) {
    e.employmentStatus = 'Employment status is required';
  }
  if (!d.monthlyIncome.trim()) e.monthlyIncome = 'Monthly income is required';
  return result(e);
};

export const validateEducation = (d: LearnerFormData): ValidationResult => {
  const e: Record<string, string> = {};
  if (!d.isBlp) {
    e.isBlp = 'Please indicate BLP status';
    return result(e);
  }
  if (d.isBlp === 'No') {
    if (!d.currentlyStudying) e.currentlyStudying = 'Please indicate if currently studying';
    if (!d.lastGradeCompleted) e.lastGradeCompleted = 'Last grade completed is required';
    if (d.currentlyStudying === 'No' && !d.reasonForNotAttending) {
      e.reasonForNotAttending = 'Reason for not attending is required';
    }
    if (d.reasonForNotAttending === 'Others (Specify)' && !d.reasonForNotAttendingOther.trim()) {
      e.reasonForNotAttendingOther = 'Please specify the reason';
    }
    if (!d.interestedInALS) e.interestedInALS = 'Interest in ALS is required';
  }
  return result(e);
};

export const validateAddress = (d: LearnerFormData): ValidationResult => {
  const e: Record<string, string> = {};
  if (!d.municipality) e.municipality = 'Municipality is required';
  if (!d.learnerDistrict) e.learnerDistrict = 'District is required';
  if (!d.barangay) e.barangay = 'Barangay is required';
  if (!d.completeAddress.trim()) e.completeAddress = 'Complete address is required';
  return result(e);
};

export const validateFamily = (d: LearnerFormData): ValidationResult => {
  const e: Record<string, string> = {};
  if (!d.roleInFamily) e.roleInFamily = 'Role in the family is required';
  if (!d.isIP) e.isIP = 'Please indicate IP status';
  if (d.isIP === 'Yes' && !d.ipTribe.trim()) e.ipTribe = 'Tribe / ethnic group is required';
  if (!d.is4PsMember) e.is4PsMember = 'Please indicate 4Ps membership';
  return result(e);
};

export const validateLogistics = (d: LearnerFormData): ValidationResult => {
  const e: Record<string, string> = {};
  if (!d.distanceKm.trim() || Number.isNaN(Number(d.distanceKm))) e.distanceKm = 'Valid distance (km) is required';
  if (!d.travelTime.trim() || Number.isNaN(Number(d.travelTime))) e.travelTime = 'Valid travel time number is required';
  if (!d.travelTimeUnit) e.travelTimeUnit = 'Travel time unit is required';
  if (!d.transportMode) e.transportMode = 'Transport mode is required';
  if (!d.preferredSessionTime) e.preferredSessionTime = 'Preferred session time is required';
  if (!d.mappedBy.trim()) e.mappedBy = 'Mapped-by name is required';
  if (!d.dateMapped) e.dateMapped = 'Date mapped is required';
  return result(e);
};

export const validateSection = (step: number, d: LearnerFormData): ValidationResult => {
  switch (step) {
    case 0:
      return validatePersonalInfo(d);
    case 1:
      return validateEducation(d);
    case 2:
      return validateAddress(d);
    case 3:
      return validateFamily(d);
    case 4:
      return validateLogistics(d);
    default:
      return result({});
  }
};
