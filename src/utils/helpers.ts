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

  municipality: '',
  learnerDistrict: '',
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
  travelTimeUnit: 'Minutes',
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

export const parseTravelTime = (travelTime: string): { value: string; unit: 'Hour' | 'Minutes' } => {
  const trimmed = travelTime.trim();
  if (!trimmed) {
    return { value: '', unit: 'Minutes' };
  }

  const match = trimmed.match(/^([0-9]+(?:\.[0-9]+)?)\s*(hour|hours|hr|hrs|minute|minutes|min|mins)?$/i);
  if (!match) {
    return { value: trimmed, unit: 'Minutes' };
  }

  const suffix = (match[2] ?? '').toLowerCase();
  const unit = suffix.startsWith('h') ? 'Hour' : 'Minutes';
  return { value: match[1], unit };
};

export const formatTravelTime = (value: string, unit: 'Hour' | 'Minutes'): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return `${trimmed} ${unit === 'Hour' ? 'hour' : 'minutes'}`;
};

export const formatStructuredText = (value: string): string => {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) return '';

  return trimmed
    .split(' ')
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === 'als' || lower === 'blp' || lower === 'pwd' || lower === 'ip' || lower === 'jhs' || lower === 'hs') {
        return lower.toUpperCase();
      }

      if (lower === '4ps') {
        return '4Ps';
      }

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};
