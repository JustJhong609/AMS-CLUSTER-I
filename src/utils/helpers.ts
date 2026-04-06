import { LearnerFormData } from '../types';
import { DISTRICT, DIVISION, REGION } from './constants.ts';

export const createEmptyFormData = (): LearnerFormData => ({
  region: REGION,
  division: DIVISION,
  district: DISTRICT,
  calendarYear: new Date().getFullYear(),
  mappedBy: '',

  lastName: '',
  firstName: '',
  middleName: '',
  nameExtension: '',
  sex: '',
  civilStatus: '',
  birthdate: '',
  age: '',
  motherTongue: '',
  motherTongueOther: '',
  isIP: '',
  ipTribe: '',
  religion: '',
  is4PsMember: '',
  fourPsOrIp: '',
  isPwd: '',
  pwdType: '',
  pwdTypeOther: '',

  barangay: '',
  barangayOther: '',
  completeAddress: '',

  roleInFamily: '',
  fatherName: '',
  motherName: '',
  guardianName: '',
  guardianOccupation: '',

  schoolName: '',
  currentlyStudying: '',
  lastGradeCompleted: '',
  reasonForNotAttending: '',
  reasonForNotAttendingOther: '',
  isBlp: '',
  occupationType: '',
  employmentStatus: '',
  monthlyIncome: '',
  interestedInALS: '',
  contactNumber: '',

  distanceKm: '',
  travelTime: '',
  transportMode: '',
  preferredSessionTime: '',
  dateMapped: ''
});

export const generateId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export const calculateAge = (dateString: string): number => {
  const birth = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '—';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};
