import React, { useEffect, useState } from 'react';
import { IonLoading, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route, Switch } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import LearnerListPage from './pages/LearnerListPage';
import LearnerFormPage from './pages/LearnerFormPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { Learner } from './types';
import {
  fetchLearners,
  getCachedLearners,
  getPendingLearnerSyncCount,
  getPendingLearnerSyncEventName,
  syncPendingLearnerOperations,
} from './utils/learnerApi';
import { supabase } from './utils/supabase.ts';

setupIonicReact({ mode: 'md' });

const App: React.FC = () => {
  const [learners, setLearners] = useState<Learner[]>(() => getCachedLearners());
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => getPendingLearnerSyncCount());

  const refreshPendingSyncCount = () => {
    setPendingSyncCount(getPendingLearnerSyncCount());
  };

  const refreshLearners = async (): Promise<void> => {
    try {
      await syncPendingLearnerOperations().catch(() => {
        // Ignore background sync errors during learner refresh.
      });

      const data = await fetchLearners();
      setLearners(data);
    } catch {
      // Keep existing cached learners visible during transient fetch issues.
      setLearners(getCachedLearners());
    } finally {
      refreshPendingSyncCount();
    }
  };

  const resolveUserName = (session: unknown): string => {
    const candidate = session as {
      user?: {
        user_metadata?: Record<string, unknown>;
        email?: string;
      };
    } | null;

    const fullName = candidate?.user?.user_metadata?.full_name;
    if (typeof fullName === 'string' && fullName.trim()) {
      return fullName.trim();
    }

    const email = candidate?.user?.email;
    if (typeof email === 'string' && email.trim()) {
      return email.split('@')[0];
    }

    return '';
  };

  const resolveUserId = (session: unknown): string => {
    const candidate = session as {
      user?: {
        id?: string;
      };
    } | null;

    return candidate?.user?.id ?? '';
  };

  useEffect(() => {
    let mounted = true;
    let bootstrapSettled = false;
    let activeAuthSubscription: { unsubscribe: () => void } | undefined;
    let loadingWatchdog: ReturnType<typeof setTimeout> | undefined;
    const queueChangedEventName = getPendingLearnerSyncEventName();

    const finishBootstrap = () => {
      if (!mounted || bootstrapSettled) return;
      bootstrapSettled = true;
      if (loadingWatchdog) {
        clearTimeout(loadingWatchdog);
      }
      setLoading(false);
    };

    // Fail-safe: never keep the global loading overlay open indefinitely.
    loadingWatchdog = setTimeout(() => {
      finishBootstrap();
    }, 2500);

    const init = async () => {
      try {
        setLearners(getCachedLearners());
        refreshPendingSyncCount();

        if (!supabase) {
          return;
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const hasSession = Boolean(sessionData.session);
        const userId = resolveUserId(sessionData.session);
        if (mounted) {
          setIsLoggedIn(hasSession);
          setCurrentUserName(resolveUserName(sessionData.session));
          setCurrentUserId(userId);
        }

        if (hasSession) {
          void refreshLearners().catch(() => {
            // Allow app usage even if local learner cache init fails.
          });
        }

        const { data: listener } = supabase.auth.onAuthStateChange((_event: unknown, session: unknown) => {
          if (!mounted) return;

          const loggedIn = Boolean(session);
          const userId = resolveUserId(session);
          setIsLoggedIn(loggedIn);
          setCurrentUserName(resolveUserName(session));
          setCurrentUserId(userId);

          if (!loggedIn) {
            setLearners([]);
            refreshPendingSyncCount();
            return;
          }

          void refreshLearners().catch(() => {
            // Ignore local cache errors from background refresh.
          });
        });
        activeAuthSubscription = listener.subscription;

        const handleOnline = () => {
          void refreshLearners().catch(() => {
            // Ignore local cache refresh errors from online event.
          });
        };

        const handleQueueChanged = () => {
          refreshPendingSyncCount();
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener(queueChangedEventName, handleQueueChanged);
        activeAuthSubscription = {
          unsubscribe: () => {
            listener.subscription.unsubscribe();
            window.removeEventListener('online', handleOnline);
            window.removeEventListener(queueChangedEventName, handleQueueChanged);
          },
        };
      } catch {
        // Ignore storage/bootstrap errors and show the app.
      } finally {
        finishBootstrap();
      }
    };
    void init();
    return () => {
      mounted = false;
      if (loadingWatchdog) {
        clearTimeout(loadingWatchdog);
      }
      activeAuthSubscription?.unsubscribe();
    };
  }, []);

  return (
    <AppProvider value={{ learners, setLearners, refreshLearners, pendingSyncCount, currentUserName, currentUserId }}>
      <IonLoading isOpen={loading} message="Please wait..." spinner="crescent" />
      {!loading && (
        <IonReactRouter>
          <Switch>
            <Route exact path="/">
              {isLoggedIn ? <Redirect to="/home" /> : <LandingPage />}
            </Route>

            {/* Auth routes */}
            <Route exact path="/landing" render={() => (isLoggedIn ? <Redirect to="/home" /> : <LandingPage />)} />
            <Route exact path="/sign-in" render={() => (isLoggedIn ? <Redirect to="/home" /> : <SignInPage />)} />
            <Route exact path="/sign-up" render={() => (isLoggedIn ? <Redirect to="/home" /> : <SignUpPage />)} />

            {/* App routes */}
            <Route exact path="/home" render={() => (isLoggedIn ? <HomePage /> : <Redirect to="/sign-in" />)} />
            <Route exact path="/learners" render={() => (isLoggedIn ? <LearnerListPage /> : <Redirect to="/sign-in" />)} />
            <Route exact path="/learners/new" render={() => (isLoggedIn ? <LearnerFormPage /> : <Redirect to="/sign-in" />)} />
            <Route exact path="/learners/:id/edit" render={() => (isLoggedIn ? <LearnerFormPage /> : <Redirect to="/sign-in" />)} />
            <Route exact path="/analytics" render={() => (isLoggedIn ? <AnalyticsPage /> : <Redirect to="/sign-in" />)} />

            {/* Default redirect */}
            <Redirect to={isLoggedIn ? '/home' : '/landing'} />
          </Switch>
        </IonReactRouter>
      )}
    </AppProvider>
  );
};

export default App;
