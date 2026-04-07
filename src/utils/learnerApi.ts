import { Learner } from '../types';
import { buildMockLearners } from '../data/mockLearners';

const STORAGE_KEY = 'als-cluster-i-learners';

export const fetchLearners = async (): Promise<Learner[]> => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Learner[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveLearners = (learners: Learner[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(learners));
};

export const createLearner = async (learner: Learner): Promise<void> => {
  const list = await fetchLearners();
  saveLearners([learner, ...list]);
};

export const updateLearner = async (learner: Learner): Promise<void> => {
  const list = await fetchLearners();
  const updated = list.map((item) => (item.id === learner.id ? learner : item));
  saveLearners(updated);
};

export const deleteLearner = async (id: string): Promise<void> => {
  const list = await fetchLearners();
  saveLearners(list.filter((item) => item.id !== id));
};

export const seedMockLearnersIfEmpty = async (): Promise<Learner[]> => {
  const existing = await fetchLearners();
  if (existing.length > 0) return existing;

  const mockLearners = buildMockLearners();
  saveLearners(mockLearners);
  return mockLearners;
};
