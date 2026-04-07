import React, { useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonContent, IonIcon, IonPage } from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { seedMockLearnersIfEmpty } from '../utils/learnerApi';

const SignInPage: React.FC = () => {
  const history = useHistory();
  const { setLearners } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);
    try {
      localStorage.setItem('als-user', JSON.stringify({ email, role: 'mapper' }));
      const seededLearners = await seedMockLearnersIfEmpty();
      setLearners(seededLearners);
      history.replace('/home');
    } catch {
      setError('Unable to sign in right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="auth-page" style={{ '--background': "linear-gradient(145deg, rgba(13,71,161,0.84) 0%, rgba(21,101,192,0.8) 50%, rgba(25,118,210,0.8) 100%), url('/background.png') center / cover no-repeat" } as React.CSSProperties}>
        <style>{`
          .auth-page {
            --padding-top: 18px;
            --padding-bottom: 20px;
          }
          .auth-shell {
            min-height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 0 14px;
          }
          .auth-topbar {
            margin-bottom: 16px;
          }
          .auth-content {
            width: 100%;
            max-width: 100%;
          }
          .auth-card {
            border-radius: 22px;
          }
          .auth-form-content {
            padding: 24px 18px;
          }
          .auth-row {
            grid-template-columns: 1fr;
          }
          @media (min-width: 768px) {
            .auth-page {
              --padding-top: 28px;
              --padding-bottom: 28px;
            }
            .auth-shell {
              padding: 0 20px;
            }
            .auth-topbar {
              margin-bottom: 24px;
            }
            .auth-content {
              max-width: 460px;
            }
            .auth-card {
              border-radius: 24px;
            }
            .auth-form-content {
              padding: 32px 24px;
            }
          }
        `}</style>
        <div className="auth-shell">
        <div style={s.bgPattern} />

        <div className="auth-topbar" style={s.topBar}>
          <button style={s.backBtn} onClick={() => history.goBack()}>
            <IonIcon icon={arrowBackOutline} style={{ color: '#fff', fontSize: 24 }} />
          </button>
        </div>

        <div className="auth-content" style={s.content}>
          <div style={s.header}>
            <h1 style={s.title}>Welcome Back</h1>
            <p style={s.subtitle}>Sign in to your ALS Mapper account</p>
          </div>

          <IonCard className="auth-card" style={s.formCard}>
            <IonCardContent className="auth-form-content" style={s.formContent}>
              <form onSubmit={handleSignIn} style={s.form}>
                <div style={s.formGroup}>
                  <label style={s.label}>Email Address</label>
                  <input
                    style={s.input}
                    type="email"
                    placeholder="facilitator@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div style={s.formGroup}>
                  <label style={s.label}>Password</label>
                  <input
                    style={s.input}
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {error && <div style={s.errorMsg}>{error}</div>}

                <IonButton
                  expand="block"
                  style={{ ...s.submitBtn, opacity: isLoading ? 0.7 : 1 } as React.CSSProperties}
                  onClick={handleSignIn}
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </IonButton>
              </form>

              <div style={s.divider}>
                <span style={s.dividerText}>Don't have an account?</span>
              </div>

              <IonButton
                expand="block"
                fill="outline"
                style={s.createBtn}
                onClick={() => history.push('/sign-up')}
              >
                Create Account
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const s: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
    padding: '20px'
  },
  bgPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%),
      linear-gradient(-45deg, rgba(255,255,255,0.02) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.02) 75%),
      linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.02) 75%)
    `,
    backgroundSize: '40px 40px',
    opacity: 0.1,
    zIndex: 0
  },
  topBar: {
    position: 'relative',
    zIndex: 1,
    marginBottom: 24
  },
  backBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '50%',
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.22s ease',
    backdropFilter: 'blur(10px)'
  },
  content: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    maxWidth: '100%',
    width: '100%',
    margin: '0 auto'
  },
  header: {
    textAlign: 'center',
    marginBottom: 24,
    animation: 'fadeSlideUp 0.4s ease both'
  },
  title: {
    color: '#fff',
    fontSize: 'clamp(26px, 7vw, 32px)',
    fontWeight: 900,
    margin: '0 0 8px',
    lineHeight: 1.2,
    letterSpacing: -0.5
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: 500,
    margin: 0,
    letterSpacing: 0.2
  },
  formCard: {
    width: '100%',
    borderRadius: 22,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.16)',
    background: '#fff',
    animation: 'fadeSlideUp 0.5s ease both'
  },
  formContent: {
    padding: '24px 18px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: '#374151',
    letterSpacing: 0.2
  },
  input: {
    padding: '12px 14px',
    borderRadius: 12,
    border: '1.5px solid #e2e8f0',
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    transition: 'all 0.22s ease',
    background: '#f8fafc',
    outline: 'none'
  },
  submitBtn: {
    '--background': 'linear-gradient(135deg, #1976d2 0%, #1565C0 60%, #0d47a1 100%)',
    '--box-shadow': '0 6px 20px rgba(21,101,192,0.38)',
    '--border-radius': '50px',
    '--color': '#fff',
    fontWeight: 700,
    fontSize: 15,
    height: 48,
    marginTop: 8
  } as React.CSSProperties,
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    margin: '10px 0',
    position: 'relative'
  },
  dividerText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#94a3b8',
    textAlign: 'center',
    flex: 1
  },
  createBtn: {
    '--border-radius': '50px',
    '--border-color': '#e2e8f0',
    '--border-width': '1.5px',
    '--color': '#1565c0',
    '--background': '#f8fafc',
    fontWeight: 700,
    fontSize: 14,
    height: 46
  } as React.CSSProperties,
  errorMsg: {
    color: '#c62828',
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 12px',
    background: '#ffebee',
    borderRadius: 8,
    marginTop: 8
  }
};

export default SignInPage;
