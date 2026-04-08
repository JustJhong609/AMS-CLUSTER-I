import { Learner, MunicipalityKey } from '../types';
import { supabase } from './supabase';

type LearnerRow = {
  id?: string;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  region: string;
  division: string;
  district: string;
  calendar_year: number;
  mapped_by: string;
  last_name: string;
  first_name: string;
  middle_name: string;
  name_extension?: string | null;
  sex: 'Male' | 'Female';
  civil_status: string;
  birthdate: string;
  age: number;
  mother_tongue: string;
  is_ip: boolean;
  ip_tribe?: string | null;
  religion?: string | null;
  is_4ps_member: boolean;
  four_ps_or_ip?: string | null;
  is_pwd: boolean;
  pwd_type?: string | null;
  pwd_type_other?: string | null;
  municipality: MunicipalityKey;
  learner_district: string;
  barangay: string;
  complete_address: string;
  role_in_family: string;
  father_name?: string | null;
  mother_name?: string | null;
  guardian_name?: string | null;
  guardian_occupation?: string | null;
  school_name?: string | null;
  currently_studying: string;
  last_grade_completed: string;
  reason_for_not_attending: string;
  reason_for_not_attending_other?: string | null;
  is_blp: boolean;
  occupation_type?: string | null;
  employment_status?: string | null;
  monthly_income?: string | null;
  interested_in_als: string;
  contact_number?: string | null;
  distance_km: number;
  travel_time: string;
  transport_mode: string;
  preferred_session_time: string;
  date_mapped: string;
};

const LEARNERS_TABLE = 'learners';
const REQUEST_TIMEOUT_MS = 12000;

type QueryResponse<T> = {
  data: T;
  error: { message?: string } | null;
};

type LearnerPayload = Record<string, unknown>;

const missingColumnPattern = /Could not find the '([^']+)' column of 'learners' in the schema cache/i;

const withTimeout = async <T>(promise: Promise<T>, label: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`${label} timed out. Please try again.`));
        }, REQUEST_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

const requireSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY or SUPABASE_URL/SUPABASE_ANON_KEY to your environment.');
  }

  return supabase;
};

const stringValue = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback);
const boolValue = (value: unknown): boolean => (typeof value === 'boolean' ? value : false);
const numberValue = (value: unknown, fallback = 0): number => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);
const nullableText = (value?: string | null): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const rowToLearner = (row: LearnerRow): Learner => ({
  id: stringValue(row.id, `${Date.now()}`),
  createdBy: row.created_by ?? undefined,
  updatedAt: row.updated_at ?? row.created_at ?? undefined,
  region: stringValue(row.region),
  division: stringValue(row.division),
  district: stringValue(row.district),
  calendarYear: numberValue(row.calendar_year, new Date().getFullYear()),
  mappedBy: stringValue(row.mapped_by),
  lastName: stringValue(row.last_name),
  firstName: stringValue(row.first_name),
  middleName: stringValue(row.middle_name),
  nameExtension: row.name_extension ?? undefined,
  sex: (row.sex === 'Female' ? 'Female' : 'Male'),
  civilStatus: stringValue(row.civil_status),
  birthdate: stringValue(row.birthdate),
  age: numberValue(row.age),
  motherTongue: stringValue(row.mother_tongue),
  isIP: boolValue(row.is_ip),
  ipTribe: row.ip_tribe ?? undefined,
  religion: row.religion ?? undefined,
  is4PsMember: boolValue(row.is_4ps_member),
  fourPsOrIp: row.four_ps_or_ip ?? undefined,
  isPwd: boolValue(row.is_pwd),
  pwdType: row.pwd_type ?? undefined,
  pwdTypeOther: row.pwd_type_other ?? undefined,
  municipality: (row.municipality as MunicipalityKey) || 'Libona',
  learnerDistrict: stringValue(row.learner_district),
  barangay: stringValue(row.barangay),
  completeAddress: stringValue(row.complete_address),
  roleInFamily: stringValue(row.role_in_family),
  fatherName: row.father_name ?? undefined,
  motherName: row.mother_name ?? undefined,
  guardianName: row.guardian_name ?? undefined,
  guardianOccupation: row.guardian_occupation ?? undefined,
  schoolName: row.school_name ?? undefined,
  currentlyStudying: stringValue(row.currently_studying, 'No'),
  lastGradeCompleted: stringValue(row.last_grade_completed),
  reasonForNotAttending: stringValue(row.reason_for_not_attending),
  reasonForNotAttendingOther: row.reason_for_not_attending_other ?? undefined,
  isBlp: boolValue(row.is_blp),
  occupationType: row.occupation_type ?? undefined,
  employmentStatus: row.employment_status ?? undefined,
  monthlyIncome: row.monthly_income ?? undefined,
  interestedInALS: stringValue(row.interested_in_als, 'No'),
  contactNumber: row.contact_number ?? undefined,
  distanceKm: numberValue(row.distance_km),
  travelTime: stringValue(row.travel_time),
  transportMode: stringValue(row.transport_mode),
  preferredSessionTime: stringValue(row.preferred_session_time),
  dateMapped: stringValue(row.date_mapped),
});

const learnerToRow = (learner: Learner, createdBy: string | null): LearnerPayload => ({
  created_by: createdBy,
  region: learner.region,
  division: learner.division,
  district: learner.district,
  calendar_year: learner.calendarYear,
  mapped_by: learner.mappedBy,
  last_name: learner.lastName,
  first_name: learner.firstName,
  middle_name: learner.middleName,
  name_extension: learner.nameExtension ?? null,
  sex: learner.sex,
  civil_status: learner.civilStatus,
  birthdate: learner.birthdate,
  age: learner.age,
  mother_tongue: learner.motherTongue,
  is_ip: learner.isIP,
  ip_tribe: learner.ipTribe ?? null,
  religion: learner.religion ?? null,
  is_4ps_member: learner.is4PsMember,
  four_ps_or_ip: nullableText(learner.fourPsOrIp),
  is_pwd: learner.isPwd,
  pwd_type: nullableText(learner.pwdType),
  pwd_type_other: nullableText(learner.pwdTypeOther),
  municipality: learner.municipality,
  learner_district: learner.learnerDistrict,
  barangay: learner.barangay,
  complete_address: learner.completeAddress,
  role_in_family: learner.roleInFamily,
  father_name: learner.fatherName ?? null,
  mother_name: learner.motherName ?? null,
  guardian_name: learner.guardianName ?? null,
  guardian_occupation: learner.guardianOccupation ?? null,
  school_name: nullableText(learner.schoolName),
  currently_studying: learner.currentlyStudying,
  last_grade_completed: nullableText(learner.lastGradeCompleted),
  reason_for_not_attending: nullableText(learner.reasonForNotAttending),
  reason_for_not_attending_other: nullableText(learner.reasonForNotAttendingOther),
  is_blp: learner.isBlp,
  occupation_type: nullableText(learner.occupationType),
  employment_status: nullableText(learner.employmentStatus),
  monthly_income: nullableText(learner.monthlyIncome),
  interested_in_als: learner.interestedInALS,
  contact_number: nullableText(learner.contactNumber),
  distance_km: learner.distanceKm,
  travel_time: learner.travelTime,
  transport_mode: learner.transportMode,
  preferred_session_time: learner.preferredSessionTime,
  date_mapped: learner.dateMapped,
});

const stripMissingColumn = (payload: LearnerPayload, message?: string): LearnerPayload | null => {
  const match = message?.match(missingColumnPattern);
  if (!match) return null;

  const column = match[1];
  if (!(column in payload)) return null;

  const next = { ...payload };
  delete next[column];
  return next;
};

const insertLearnerRow = async (client: ReturnType<typeof requireSupabase>, payload: LearnerPayload): Promise<LearnerRow> => {
  let currentPayload = { ...payload };

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const { data, error } = await client.from(LEARNERS_TABLE).insert(currentPayload).select('*').single();

    if (!error && data) {
      return data as LearnerRow;
    }

    const stripped = stripMissingColumn(currentPayload, error?.message);
    if (!stripped) {
      throw error ?? new Error('Unable to save learner.');
    }

    currentPayload = stripped;
  }

  throw new Error('Unable to save learner after removing unsupported fields.');
};

export const fetchLearners = async (): Promise<Learner[]> => {
  if (!supabase) return [];

  const client = requireSupabase();
  const { data, error } = await withTimeout<QueryResponse<LearnerRow[]>>(
    Promise.resolve(client.from(LEARNERS_TABLE).select('*')) as Promise<QueryResponse<LearnerRow[]>>,
    'Loading learners',
  );

  if (error) {
    throw error;
  }

  return (data ?? []).map((row: LearnerRow) => rowToLearner(row));
};

export const createLearner = async (learner: Learner): Promise<Learner> => {
  const client = requireSupabase();
  const { data: authData, error: authError } = await client.auth.getUser();

  if (authError) {
    throw authError;
  }

  const createdBy = authData.user?.id ?? null;
  const payload = learnerToRow(learner, createdBy);
  const savedRow = await withTimeout(insertLearnerRow(client, payload), 'Saving learner');

  return {
    ...learner,
    id: savedRow.id ?? learner.id,
    createdBy: savedRow.created_by ?? createdBy ?? undefined,
    updatedAt: savedRow.updated_at ?? savedRow.created_at ?? undefined,
  };
};

export const updateLearner = async (learner: Learner): Promise<Learner> => {
  const client = requireSupabase();
  const { data: authData, error: authError } = await client.auth.getUser();

  if (authError) {
    throw authError;
  }

  const payload = learnerToRow(learner, authData.user?.id ?? learner.createdBy ?? null);
  let currentPayload = { ...payload };

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const { data, error } = await client.from(LEARNERS_TABLE).update(currentPayload).eq('id', learner.id).select('*').single();

    if (!error && data) {
      return {
        ...learner,
        updatedAt: (data as LearnerRow).updated_at ?? (data as LearnerRow).created_at ?? undefined,
      };
    }

    const stripped = stripMissingColumn(currentPayload, error?.message);
    if (!stripped) {
      throw error ?? new Error('Unable to update learner.');
    }

    currentPayload = stripped;
  }

  throw new Error('Unable to update learner after removing unsupported fields.');
};

export const deleteLearner = async (id: string): Promise<void> => {
  const client = requireSupabase();
  const { error } = await withTimeout<QueryResponse<null>>(
    Promise.resolve(client.from(LEARNERS_TABLE).delete().eq('id', id)) as Promise<QueryResponse<null>>,
    'Deleting learner',
  );

  if (error) {
    throw error;
  }
};
