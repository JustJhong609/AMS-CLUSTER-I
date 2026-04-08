import React, { useEffect, useState } from 'react';
import { IonLoading, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route, Switch } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import SuperAdminPage from './pages/SuperAdminPage';
import LearnerListPage from './pages/LearnerListPage';
import LearnerFormPage from './pages/LearnerFormPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { Learner } from './types';
import { fetchLearners } from './utils/learnerApi';
import { supabase } from './utils/supabase.ts';

setupIonicReact({ mode: 'md' });

const App: React.FC = () => {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('mapper');

  const getPostAuthPath = (role: string): string => (role === 'superadmin' ? '/superadmin' : '/home');

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

  const fetchCurrentUserRole = async (userId: string): Promise<string> => {
    if (!supabase || !userId) return 'mapper';

    const { data, error } = await supabase
      .from('app_profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data?.role || typeof data.role !== 'string') {
      return 'mapper';
    }

    const normalized = data.role.trim().toLowerCase();
    return normalized === 'superadmin' ? 'superadmin' : normalized === 'admin' ? 'admin' : 'mapper';
  };

  useEffect(() => {
    let mounted = true;
    let bootstrapSettled = false;
    let activeAuthSubscription: { unsubscribe: () => void } | undefined;
    let loadingWatchdog: ReturnType<typeof setTimeout> | undefined;

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
        if (!supabase) {
          return;
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const hasSession = Boolean(sessionData.session);
        const userId = resolveUserId(sessionData.session);
        const role = hasSession ? await fetchCurrentUserRole(userId) : 'mapper';
        if (mounted) {
          setIsLoggedIn(hasSession);
          setCurrentUserName(resolveUserName(sessionData.session));
          setCurrentUserId(userId);
          setCurrentUserRole(role);
        }

        if (hasSession) {
          void fetchLearners()
            .then((data) => {
              if (mounted) setLearners(data);
            })
            .catch(() => {
              // Allow app usage even if local learner cache init fails.
            });
        }

        const { data: listener } = supabase.auth.onAuthStateChange(async (_event: unknown, session: unknown) => {
          if (!mounted) return;

          setLoading(true);
          const loggedIn = Boolean(session);
          const userId = resolveUserId(session);
          setCurrentUserName(resolveUserName(session));
          setCurrentUserId(userId);

          if (!loggedIn) {
            setIsLoggedIn(false);
            setLearners([]);
            setCurrentUserRole('mapper');
            setLoading(false);
            return;
          }

          try {
            const role = await fetchCurrentUserRole(userId);
            if (!mounted) return;
            setCurrentUserRole(role);
            setIsLoggedIn(true);

            const data = await fetchLearners().catch(() => [] as Learner[]);
            if (mounted) setLearners(data);
          } finally {
            if (mounted) setLoading(false);
          }
        });
        activeAuthSubscription = listener.subscription;
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
    <AppProvider value={{ learners, setLearners, currentUserName, currentUserId, currentUserRole }}>
      <IonLoading isOpen={loading} message="Please wait..." spinner="crescent" />
      {!loading && (
        <IonReactRouter>
          <Switch>
            <Route exact path="/">
              {isLoggedIn ? <Redirect to={getPostAuthPath(currentUserRole)} /> : <LandingPage />}
            </Route>

            {/* Auth routes */}
            <Route exact path="/landing" render={() => (isLoggedIn ? <Redirect to={getPostAuthPath(currentUserRole)} /> : <LandingPage />)} />
            <Route exact path="/sign-in" render={() => (isLoggedIn ? <Redirect to={getPostAuthPath(currentUserRole)} /> : <SignInPage />)} />
            <Route exact path="/sign-up" render={() => (isLoggedIn ? <Redirect to={getPostAuthPath(currentUserRole)} /> : <SignUpPage />)} />

            {/* App routes */}
            <Route exact path="/home" render={() => (isLoggedIn ? (currentUserRole === 'superadmin' ? <Redirect to="/superadmin" /> : <HomePage />) : <Redirect to="/sign-in" />)} />
            <Route exact path="/superadmin" render={() => (isLoggedIn ? (currentUserRole === 'superadmin' ? <SuperAdminPage /> : <Redirect to="/home" />) : <Redirect to="/sign-in" />)} />
            <Route exact path="/learners" render={() => (isLoggedIn ? (currentUserRole === 'superadmin' ? <Redirect to="/superadmin" /> : <LearnerListPage />) : <Redirect to="/sign-in" />)} />
            <Route exact path="/learners/new" render={() => (isLoggedIn ? (currentUserRole === 'superadmin' ? <Redirect to="/superadmin" /> : <LearnerFormPage />) : <Redirect to="/sign-in" />)} />
            <Route exact path="/learners/:id/edit" render={() => (isLoggedIn ? (currentUserRole === 'superadmin' ? <Redirect to="/superadmin" /> : <LearnerFormPage />) : <Redirect to="/sign-in" />)} />
            <Route exact path="/analytics" render={() => (isLoggedIn ? (currentUserRole === 'superadmin' ? <Redirect to="/superadmin" /> : <AnalyticsPage />) : <Redirect to="/sign-in" />)} />

            {/* Default redirect */}
            <Redirect to={isLoggedIn ? getPostAuthPath(currentUserRole) : '/landing'} />
          </Switch>
        </IonReactRouter>
      )}
    </AppProvider>
  );
};

export default App;
