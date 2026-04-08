import React, { createContext, useContext } from 'react';
import { Learner } from '../types';

interface AppContextValue {
  learners: Learner[];
  setLearners: React.Dispatch<React.SetStateAction<Learner[]>>;
  currentUserName: string;
  currentUserId: string;
  currentUserRole: string;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider = AppContext.Provider;

export const useAppContext = (): AppContextValue => {
  const value = useContext(AppContext);
  if (!value) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return value;
};
