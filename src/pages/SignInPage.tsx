import React, { useState } from 'react';
import { IonAlert, IonButton, IonCard, IonCardContent, IonContent, IonIcon, IonPage } from '@ionic/react';
import { arrowBackOutline, eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { supabase } from '../utils/supabase.ts';

const RESET_PASSWORD_REDIRECT_URL = 'https://ams-cluster-i.vercel.app/password-reset';

const SignInPage: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordAlert, setShowForgotPasswordAlert] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetSending, setIsResetSending] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);
    try {
      if (!supabase) {
        throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY or SUPABASE_URL/SUPABASE_ANON_KEY to your environment.');
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        const rawMessage = signInError.message.toLowerCase();
        if (rawMessage.includes('email not confirmed') || rawMessage.includes('not confirmed')) {
          throw new Error('Please confirm your email before signing in. Check your inbox for the confirmation link.');
        }
        throw signInError;
      }

      const isEmailConfirmed = Boolean(signInData.user?.email_confirmed_at);
      if (!isEmailConfirmed) {
        await supabase.auth.signOut();
        throw new Error('Please confirm your email before signing in. Check your inbox for the confirmation link.');
      }

      history.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetLink = async (emailInput: string) => {
    const normalizedEmail = emailInput.trim();
    setError('');
    setInfo('');

    if (!normalizedEmail) {
      setError('Please enter your email address to receive a reset link.');
      return;
    }

    setIsResetSending(true);
    try {
      if (!supabase) {
        throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY or SUPABASE_URL/SUPABASE_ANON_KEY to your environment.');
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: RESET_PASSWORD_REDIRECT_URL,
      });

      if (resetError) {
        throw resetError;
      }

      setInfo('Password reset link sent. Please check your email inbox.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset link right now. Please try again.');
    } finally {
      setIsResetSending(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="auth-page" style={{ '--background': 'linear-gradient(145deg, #081a3a 0%, #0f3b7a 34%, #1458a8 66%, #0a214f 100%)' } as React.CSSProperties}>
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
          <button style={s.backBtn} onClick={() => history.replace('/landing')}>
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
                  <div style={s.passwordFieldWrap}>
                    <input
                      style={{ ...s.input, ...s.passwordInput }}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((prev) => !prev)}
                      style={s.passwordToggleBtn}
                      disabled={isLoading}
                    >
                      <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} style={{ fontSize: 20 }} />
                    </button>
                  </div>
                </div>

                {error && <div style={s.errorMsg}>{error}</div>}
                {info && <div style={s.infoMsg}>{info}</div>}

                <IonButton
                  expand="block"
                  style={{ ...s.submitBtn, opacity: isLoading ? 0.7 : 1 } as React.CSSProperties}
                  onClick={handleSignIn}
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </IonButton>

                <button
                  type="button"
                  style={s.forgotPasswordBtn}
                  onClick={() => setShowForgotPasswordAlert(true)}
                  disabled={isLoading || isResetSending}
                >
                  Forgot Password?
                </button>
              </form>

              <p style={s.createInlineText}>
                Don't have an account?{' '}
                <button
                  type="button"
                  style={s.createInlineBtn}
                  onClick={() => history.push('/sign-up')}
                  disabled={isLoading || isResetSending}
                >
                  Create Account
                </button>
              </p>
            </IonCardContent>
          </IonCard>
        </div>

        <IonAlert
          isOpen={showForgotPasswordAlert}
          onDidDismiss={() => setShowForgotPasswordAlert(false)}
          header="Forgot Password"
          message="Enter your account email and we will send a password reset link."
          inputs={[
            {
              name: 'email',
              type: 'email',
              placeholder: 'you@example.com',
              value: email,
            },
          ]}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Send Link',
              handler: (data) => {
                const emailInput = typeof data?.email === 'string' ? data.email : '';
                void handleSendResetLink(emailInput);
              },
            },
          ]}
        />
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
      radial-gradient(circle at 18% 18%, rgba(255,255,255,0.12) 0%, transparent 30%),
      radial-gradient(circle at 80% 16%, rgba(96,165,250,0.16) 0%, transparent 24%),
      radial-gradient(circle at 72% 82%, rgba(37,99,235,0.14) 0%, transparent 28%),
      radial-gradient(circle at 20% 80%, rgba(14,165,233,0.10) 0%, transparent 26%)
    `,
    backgroundSize: 'auto',
    opacity: 1,
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
  passwordFieldWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  passwordInput: {
    paddingRight: 44,
    width: '100%',
  },
  passwordToggleBtn: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    background: 'transparent',
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    cursor: 'pointer',
  },
  forgotPasswordBtn: {
    alignSelf: 'center',
    marginTop: 10,
    border: 'none',
    background: 'transparent',
    color: '#dc2626',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    padding: 0,
    letterSpacing: 0.2,
  },
  submitBtn: {
    '--background': 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 52%, #1d4ed8 100%)',
    '--box-shadow': '0 10px 22px rgba(37,99,235,0.34)',
    '--border-radius': '50px',
    '--color': '#fff',
    fontWeight: 700,
    fontSize: 15,
    height: 48,
    marginTop: 8
  } as React.CSSProperties,
  createInlineText: {
    margin: '8px 0 0',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.1,
  },
  createInlineBtn: {
    border: 'none',
    background: 'transparent',
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
    padding: 0,
    letterSpacing: 0.15,
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
  },
  errorMsg: {
    color: '#c62828',
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 12px',
    background: '#ffebee',
    borderRadius: 8,
    marginTop: 8
  },
  infoMsg: {
    color: '#166534',
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 12px',
    background: '#dcfce7',
    borderRadius: 8,
    marginTop: 8,
  }
};

export default SignInPage;
