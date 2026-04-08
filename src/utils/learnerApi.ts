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
const LEARNERS_CACHE_KEY = 'als.learners.cache.v1';
const LEARNERS_QUEUE_KEY = 'als.learners.queue.v1';
const QUEUE_CHANGED_EVENT = 'learner-queue-changed';

type PendingLearnerOperation = {
  id: string;
  type: 'create' | 'update' | 'delete';
  learnerId: string;
  learner?: Learner;
  queuedAt: string;
};

let activeSyncPromise: Promise<{ synced: number; failed: number }> | null = null;

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

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

const readLearnerCache = (): Learner[] => {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(LEARNERS_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Learner[]) : [];
  } catch {
    return [];
  }
};

const writeLearnerCache = (learners: Learner[]): void => {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(LEARNERS_CACHE_KEY, JSON.stringify(learners));
  } catch {
    // Ignore storage quota/serialization issues.
  }
};

const readPendingQueue = (): PendingLearnerOperation[] => {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(LEARNERS_QUEUE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PendingLearnerOperation[]) : [];
  } catch {
    return [];
  }
};

const writePendingQueue = (queue: PendingLearnerOperation[]): void => {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(LEARNERS_QUEUE_KEY, JSON.stringify(queue));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(QUEUE_CHANGED_EVENT));
    }
  } catch {
    // Ignore storage quota/serialization issues.
  }
};

export const getCachedLearners = (): Learner[] => readLearnerCache();

export const getPendingLearnerSyncCount = (): number => readPendingQueue().length;

export const getPendingLearnerSyncEventName = (): string => QUEUE_CHANGED_EVENT;

const enqueuePendingOperation = (operation: Omit<PendingLearnerOperation, 'id' | 'queuedAt'>): void => {
  const queue = readPendingQueue();
  const existingCreateIndex = queue.findIndex((item) => item.learnerId === operation.learnerId && item.type === 'create');
  const existingUpdateIndex = queue.findIndex((item) => item.learnerId === operation.learnerId && item.type === 'update');
  const existingDeleteIndex = queue.findIndex((item) => item.learnerId === operation.learnerId && item.type === 'delete');

  if (operation.type === 'create') {
    if (existingCreateIndex >= 0) {
      queue[existingCreateIndex] = {
        ...queue[existingCreateIndex],
        learner: operation.learner,
        queuedAt: new Date().toISOString(),
      };
      writePendingQueue(queue);
      return;
    }
  }

  if (operation.type === 'update') {
    if (existingCreateIndex >= 0) {
      queue[existingCreateIndex] = {
        ...queue[existingCreateIndex],
        learner: operation.learner,
        queuedAt: new Date().toISOString(),
      };
      writePendingQueue(queue);
      return;
    }

    if (existingUpdateIndex >= 0) {
      queue[existingUpdateIndex] = {
        ...queue[existingUpdateIndex],
        learner: operation.learner,
        queuedAt: new Date().toISOString(),
      };
      writePendingQueue(queue);
      return;
    }
  }

  if (operation.type === 'delete') {
    if (existingCreateIndex >= 0) {
      const trimmed = queue.filter((item) => item.learnerId !== operation.learnerId);
      writePendingQueue(trimmed);
      return;
    }

    const withoutUpdates = queue.filter((item) => !(item.learnerId === operation.learnerId && item.type === 'update'));
    if (existingDeleteIndex >= 0) {
      writePendingQueue(withoutUpdates);
      return;
    }

    withoutUpdates.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      queuedAt: new Date().toISOString(),
      ...operation,
    });
    writePendingQueue(withoutUpdates);
    return;
  }

  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    queuedAt: new Date().toISOString(),
    ...operation,
  });
  writePendingQueue(queue);
};

const isOnline = (): boolean => {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
};

const isOfflineLikeError = (error: unknown): boolean => {
  if (!isOnline()) return true;

  const message = error instanceof Error ? error.message : `${error ?? ''}`;
  return /Failed to fetch|NetworkError|Load failed|timed out|network request failed/i.test(message);
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

const createLearnerOnServer = async (learner: Learner): Promise<Learner> => {
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

const updateLearnerOnServer = async (learner: Learner): Promise<Learner> => {
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

const deleteLearnerOnServer = async (id: string): Promise<void> => {
  const client = requireSupabase();
  const { error } = await withTimeout<QueryResponse<null>>(
    Promise.resolve(client.from(LEARNERS_TABLE).delete().eq('id', id)) as Promise<QueryResponse<null>>,
    'Deleting learner',
  );

  if (error) {
    throw error;
  }
};

const runPendingLearnerSync = async (): Promise<{ synced: number; failed: number }> => {
  if (!supabase || !isOnline()) {
    return { synced: 0, failed: 0 };
  }

  const queue = readPendingQueue();
  if (!queue.length) {
    return { synced: 0, failed: 0 };
  }

  let cache = readLearnerCache();
  let synced = 0;
  let failed = 0;
  const remaining: PendingLearnerOperation[] = [];
  const idAlias = new Map<string, string>();

  for (let index = 0; index < queue.length; index += 1) {
    const operation = queue[index];
    const resolvedLearnerId = idAlias.get(operation.learnerId) ?? operation.learnerId;

    try {
      if (operation.type === 'create' && operation.learner) {
        const created = await createLearnerOnServer({ ...operation.learner, id: resolvedLearnerId });
        idAlias.set(operation.learnerId, created.id);

        cache = cache.map((item) => (item.id === operation.learnerId ? created : item));
        synced += 1;
        continue;
      }

      if (operation.type === 'update' && operation.learner) {
        const updated = await updateLearnerOnServer({ ...operation.learner, id: resolvedLearnerId });
        cache = cache.map((item) => {
          if (item.id === operation.learnerId || item.id === resolvedLearnerId) {
            return { ...item, ...updated, id: updated.id };
          }
          return item;
        });
        synced += 1;
        continue;
      }

      if (operation.type === 'delete') {
        await deleteLearnerOnServer(resolvedLearnerId);
        cache = cache.filter((item) => item.id !== operation.learnerId && item.id !== resolvedLearnerId);
        synced += 1;
      }
    } catch (error) {
      if (isOfflineLikeError(error)) {
        remaining.push(operation, ...queue.slice(index + 1));
        break;
      }

      remaining.push(operation);
      failed += 1;
    }
  }

  writeLearnerCache(cache);
  writePendingQueue(remaining);

  return { synced, failed };
};

export const syncPendingLearnerOperations = async (): Promise<{ synced: number; failed: number }> => {
  if (activeSyncPromise) {
    return activeSyncPromise;
  }

  const currentRun = runPendingLearnerSync();
  activeSyncPromise = currentRun;

  try {
    return await currentRun;
  } finally {
    if (activeSyncPromise === currentRun) {
      activeSyncPromise = null;
    }
  }
};

export const fetchLearners = async (): Promise<Learner[]> => {
  const cached = readLearnerCache();
  if (!supabase) return cached;

  if (!isOnline()) {
    return cached;
  }

  const client = requireSupabase();
  try {
    const { data, error } = await withTimeout<QueryResponse<LearnerRow[]>>(
      Promise.resolve(client.from(LEARNERS_TABLE).select('*')) as Promise<QueryResponse<LearnerRow[]>>,
      'Loading learners',
    );

    if (error) {
      throw error;
    }

    const learners = (data ?? []).map((row: LearnerRow) => rowToLearner(row));
    writeLearnerCache(learners);
    return learners;
  } catch (error) {
    if (isOfflineLikeError(error)) {
      return cached;
    }
    throw error;
  }
};

export const createLearner = async (learner: Learner): Promise<Learner> => {
  const cached = readLearnerCache();
  const nextCached = [learner, ...cached.filter((item) => item.id !== learner.id)];
  writeLearnerCache(nextCached);

  if (!supabase || !isOnline()) {
    enqueuePendingOperation({ type: 'create', learnerId: learner.id, learner });
    return learner;
  }

  try {
    const saved = await createLearnerOnServer(learner);
    const syncedCache = [saved, ...cached.filter((item) => item.id !== learner.id)];
    writeLearnerCache(syncedCache);
    return saved;
  } catch (error) {
    if (!isOfflineLikeError(error)) {
      throw error;
    }

    enqueuePendingOperation({ type: 'create', learnerId: learner.id, learner });
    return learner;
  }
};

export const updateLearner = async (learner: Learner): Promise<Learner> => {
  const cached = readLearnerCache();
  const nextCached = cached.map((item) => (item.id === learner.id ? learner : item));
  writeLearnerCache(nextCached);

  if (!supabase || !isOnline()) {
    enqueuePendingOperation({ type: 'update', learnerId: learner.id, learner });
    return learner;
  }

  try {
    const updated = await updateLearnerOnServer(learner);
    const syncedCache = cached.map((item) => (item.id === learner.id ? updated : item));
    writeLearnerCache(syncedCache);
    return updated;
  } catch (error) {
    if (!isOfflineLikeError(error)) {
      throw error;
    }

    enqueuePendingOperation({ type: 'update', learnerId: learner.id, learner });
    return learner;
  }
};

export const deleteLearner = async (id: string): Promise<void> => {
  const cached = readLearnerCache();
  writeLearnerCache(cached.filter((item) => item.id !== id));

  if (!supabase || !isOnline()) {
    enqueuePendingOperation({ type: 'delete', learnerId: id });
    return;
  }

  try {
    await deleteLearnerOnServer(id);
  } catch (error) {
    if (!isOfflineLikeError(error)) {
      throw error;
    }

    enqueuePendingOperation({ type: 'delete', learnerId: id });
  }
};
