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
import { fetchLearners } from './utils/learnerApi';

setupIonicReact({ mode: 'md' });

const App: React.FC = () => {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      // Check if user is already logged in
      const user = localStorage.getItem('als-user');
      if (user) {
        setIsLoggedIn(true);
        const data = await fetchLearners();
        if (mounted) {
          setLearners(data);
        }
      }
      if (mounted) {
        setLoading(false);
      }
    };
    void init();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AppProvider value={{ learners, setLearners }}>
      <IonLoading isOpen={loading} message="Please wait..." spinner="crescent" />
      {!loading && (
        <IonReactRouter>
          <Switch>
            {/* Auth routes */}
            <Route exact path="/landing" component={LandingPage} />
            <Route exact path="/sign-in" component={SignInPage} />
            <Route exact path="/sign-up" component={SignUpPage} />

            {/* App routes */}
            <Route exact path="/home" component={HomePage} />
            <Route exact path="/learners" component={LearnerListPage} />
            <Route exact path="/learners/new" component={LearnerFormPage} />
            <Route exact path="/analytics" component={AnalyticsPage} />

            {/* Default redirect */}
            <Redirect to={isLoggedIn ? '/home' : '/landing'} />
          </Switch>
        </IonReactRouter>
      )}
    </AppProvider>
  );
};

export default App;
