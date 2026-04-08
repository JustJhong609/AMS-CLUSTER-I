export type MunicipalityKey = 'Libona' | 'Manolo Fortich' | 'Baungon' | 'Malitbog';
export type UserRole = 'mapper' | 'admin' | 'superadmin';

export interface ClusterCoverage {
  municipality: MunicipalityKey;
  barangays: string[];
}

export interface DistrictCoverage {
  municipality: MunicipalityKey;
  district: string;
  barangays: string[];
}

export interface Learner {
  id: string;
  createdBy?: string;
  updatedAt?: string;

  region: string;
  division: string;
  district: string;
  calendarYear: number;
  mappedBy: string;

  lastName: string;
  firstName: string;
  middleName: string;
  nameExtension?: string;
  sex: 'Male' | 'Female';
  civilStatus: string;
  birthdate: string;
  age: number;
  motherTongue: string;
  isIP: boolean;
  ipTribe?: string;
  religion?: string;
  is4PsMember: boolean;
  fourPsOrIp?: string;
  isPwd: boolean;
  pwdType?: string;
  pwdTypeOther?: string;

  municipality: MunicipalityKey;
  learnerDistrict: string;
  barangay: string;
  completeAddress: string;

  roleInFamily: string;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  guardianOccupation?: string;

  schoolName?: string;
  currentlyStudying: string;
  lastGradeCompleted: string;
  reasonForNotAttending: string;
  reasonForNotAttendingOther?: string;

  isBlp: boolean;
  occupationType?: string;
  employmentStatus?: string;
  monthlyIncome?: string;
  interestedInALS: string;
  contactNumber?: string;

  distanceKm: number;
  travelTime: string;
  transportMode: string;
  preferredSessionTime: string;
  dateMapped: string;
}

export interface LearnerFormData {
  region: string;
  division: string;
  district: string;
  calendarYear: number;
  mappedBy: string;

  lastName: string;
  firstName: string;
  middleName: string;
  nameExtension: string;
  sex: 'Male' | 'Female' | '';
  civilStatus: string;
  birthdate: string;
  age: string;
  motherTongue: string;
  motherTongueOther: string;
  isIP: string;
  ipTribe: string;
  religion: string;
  is4PsMember: string;
  fourPsOrIp: string;
  isPwd: string;
  pwdType: string;
  pwdTypeOther: string;

  municipality: MunicipalityKey | '';
  learnerDistrict: string;
  barangay: string;
  barangayOther: string;
  completeAddress: string;

  roleInFamily: string;
  fatherName: string;
  motherName: string;
  guardianName: string;
  guardianOccupation: string;

  schoolName: string;
  currentlyStudying: string;
  lastGradeCompleted: string;
  reasonForNotAttending: string;
  reasonForNotAttendingOther: string;
  isBlp: string;
  occupationType: string;
  employmentStatus: string;
  monthlyIncome: string;
  interestedInALS: string;
  contactNumber: string;

  distanceKm: string;
  travelTime: string;
  transportMode: string;
  preferredSessionTime: string;
  dateMapped: string;
}

export type ValidationErrors = Record<string, string>;

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}
