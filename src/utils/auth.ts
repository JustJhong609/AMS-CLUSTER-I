import { seedMockLearnersIfEmpty } from './learnerApi';

export const BYPASS_USER_KEY = 'als-user';

export const bypassLogin = async (): Promise<void> => {
  localStorage.setItem(
    BYPASS_USER_KEY,
    JSON.stringify({
      fullName: 'Demo User',
      email: 'demo@als-mapper.local',
      role: 'mapper',
      authMode: 'bypass',
    }),
  );

  await seedMockLearnersIfEmpty();
};
