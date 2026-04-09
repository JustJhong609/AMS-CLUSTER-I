import React, { useMemo, useState } from 'react';
import { IonAlert, IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonIcon, IonModal, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import {
  arrowBackOutline,
  eyeOffOutline,
  eyeOutline,
  lockClosedOutline,
  mailOutline,
  personOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { supabase } from '../utils/supabase.ts';

const SignUpPage: React.FC = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!acceptedTerms) {
      setError('Please agree to the Terms and Conditions to continue');
      return;
    }

    setIsLoading(true);
    try {
      if (!supabase) {
        throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY or SUPABASE_URL/SUPABASE_ANON_KEY to your environment.');
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        history.replace('/home');
        return;
      }

      setSuccess('Account created. Check your email to confirm your account, then sign in.');
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = useMemo(() => {
    const p = formData.password;
    if (!p) return { label: 'None', color: '#CBD5E1', width: '0%' };
    let score = 0;
    if (p.length >= 8) score += 1;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score += 1;
    if (/\d/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;

    if (score <= 1) return { label: 'Weak', color: '#ef4444', width: '33%' };
    if (score <= 3) return { label: 'Medium', color: '#f59e0b', width: '66%' };
    return { label: 'Strong', color: '#22c55e', width: '100%' };
  }, [formData.password]);

  return (
    <IonPage>
      <IonContent className="auth-page" style={{ '--background': 'linear-gradient(160deg, #081a3a 0%, #0f3b7a 36%, #1e40af 68%, #0b244f 100%)' } as React.CSSProperties}>
        <style>{`
          .auth-page {
            --padding-top: 14px;
            --padding-bottom: 20px;
          }
          .auth-shell {
            min-height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 0 14px 10px;
          }
          .auth-topbar {
            margin-bottom: 12px;
          }
          .auth-content {
            width: 100%;
            max-width: 100%;
          }
          .auth-card {
            border-radius: 20px;
          }
          .auth-form-content {
            padding: 20px 16px;
          }

          .field-wrap {
            position: relative;
          }

          .field-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #64748b;
            font-size: 18px;
          }

          .field-input,
          .field-select {
            width: 100%;
            padding: 12px 14px 12px 38px;
            border-radius: 12px;
            border: 1.4px solid #dbe3ed;
            background: #F1F5F9;
            font-size: 14px;
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #1E293B;
            outline: none;
            transition: all 0.22s ease;
          }

          .field-input:focus,
          .field-select:focus {
            border-color: #4F46E5;
            box-shadow: 0 0 0 4px rgba(79,70,229,0.15);
            background: #fff;
          }

          .password-toggle {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            border: none;
            background: transparent;
            color: #64748b;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .privacy-note {
            font-size: 12px;
            color: #64748b;
            margin: 4px 0 0;
            text-align: center;
          }

          .safe-indicator {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 4px 10px;
            border-radius: 999px;
            background: rgba(17, 94, 47, 0.22);
            border: 1px solid rgba(134, 239, 172, 0.45);
          }

          .safe-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #22c55e;
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
            animation: safeDotPulse 1.8s ease-out infinite;
          }

          .safe-label {
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.35px;
            color: #dcfce7;
            text-transform: uppercase;
          }

          .auth-footer-link {
            text-align: center;
            margin-top: 12px;
            font-size: 13px;
            color: #64748b;
          }

          .auth-footer-link button {
            border: none;
            background: none;
            color: #4F46E5;
            font-weight: 800;
            cursor: pointer;
            padding: 0;
            margin-left: 4px;
            letter-spacing: 0.2px;
          }

          .terms-row {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-top: 4px;
            color: #1E293B;
          }

          .terms-checkbox {
            margin-top: 2px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 1.6px solid #1f66bc;
            appearance: none;
            background: #fff;
            cursor: pointer;
            position: relative;
            flex-shrink: 0;
          }

          .terms-checkbox:checked {
            background: #1f66bc;
          }

          .terms-checkbox:checked::after {
            content: '';
            position: absolute;
            top: 4px;
            left: 7px;
            width: 4px;
            height: 8px;
            border: solid #fff;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
          }

          .terms-text {
            font-size: 13px;
            line-height: 1.45;
            margin: 0;
          }

          .terms-link {
            color: #1f66bc;
            font-weight: 700;
            text-decoration: underline;
            cursor: pointer;
          }

          .terms-body {
            color: #334155;
            font-size: 14px;
            line-height: 1.65;
          }

          .terms-body h3 {
            margin: 0 0 4px;
            color: #0f172a;
            font-size: 18px;
            font-weight: 800;
          }

          .terms-body h4 {
            margin: 0 0 10px;
            color: #1e293b;
            font-size: 14px;
            font-weight: 700;
          }

          .terms-body p {
            margin: 0 0 10px;
          }

          .terms-body ul {
            margin: 0 0 10px 18px;
            padding: 0;
          }

          .signup-success-alert {
            --backdrop-opacity: 0.24;
            --background: rgba(255, 255, 255, 0.98);
            --box-shadow: 0 18px 50px rgba(15, 23, 42, 0.22);
            --max-width: 360px;
            --width: min(88vw, 360px);
          }

          .signup-success-alert::part(backdrop) {
            backdrop-filter: blur(12px);
            animation: signupAlertBackdropIn 280ms ease 90ms both;
          }

          .signup-success-alert::part(wrapper) {
            border-radius: 28px;
            overflow: hidden;
            transform-origin: center;
            animation: signupAlertIn 420ms cubic-bezier(0.16, 1, 0.3, 1) 120ms both;
          }

          .signup-success-alert::part(header),
          .signup-success-alert::part(message),
          .signup-success-alert::part(button) {
            letter-spacing: 0.1px;
          }

          .signup-success-alert::part(header) {
            padding-bottom: 6px;
          }

          .signup-success-alert::part(message) {
            line-height: 1.55;
          }

          .signup-success-alert::part(button) {
            font-weight: 700;
          }

          @keyframes signupAlertIn {
            0% {
              opacity: 0;
              transform: translateY(10px) scale(0.96);
              filter: blur(4px);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0);
            }
          }

          @keyframes signupAlertBackdropIn {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }

          @keyframes safeDotPulse {
            0% {
              box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6);
            }
            70% {
              box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
            }
          }

          @media (min-width: 768px) {
            .auth-page {
              --padding-top: 24px;
              --padding-bottom: 24px;
            }
            .auth-shell {
              padding: 0 20px 16px;
            }
            .auth-topbar {
              margin-bottom: 24px;
            }
            .auth-content {
              max-width: 480px;
            }
            .auth-card {
              border-radius: 20px;
            }
            .auth-form-content {
              padding: 24px 20px;
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
            <h1 style={s.title}>Create Account</h1>
            <p style={s.subtitle}>Register to access ALS Mapper system</p>
          </div>

          <IonCard className="auth-card" style={s.formCard}>
            <IonCardContent className="auth-form-content" style={s.formContent}>
              <form onSubmit={handleSignUp} style={s.form}>
                <div style={s.formGroup}>
                  <div style={s.labelRow}>
                    <label style={s.label}>Full Name</label>
                    <div className="safe-indicator" aria-label="Safe secure form indicator">
                      <span className="safe-dot" />
                      <span className="safe-label">Safe</span>
                    </div>
                  </div>
                  <div className="field-wrap">
                    <IonIcon className="field-icon" icon={personOutline} />
                    <input
                      className="field-input"
                      type="text"
                      name="fullName"
                      placeholder="Juan Dela Cruz"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div style={s.formGroup}>
                  <label style={s.label}>Email Address</label>
                  <div className="field-wrap">
                    <IonIcon className="field-icon" icon={mailOutline} />
                    <input
                      className="field-input"
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div style={s.formGroup}>
                  <label style={s.label}>Password</label>
                  <div className="field-wrap">
                    <IonIcon className="field-icon" icon={lockClosedOutline} />
                    <input
                      className="field-input"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <button className="password-toggle" type="button" onClick={() => setShowPassword((v) => !v)}>
                      <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
                    </button>
                  </div>
                  <div style={s.strengthTrack}>
                    <div style={{ ...s.strengthFill, background: passwordStrength.color, width: passwordStrength.width }} />
                  </div>
                  <div style={{ ...s.strengthLabel, color: passwordStrength.color }}>Password strength: {passwordStrength.label}</div>
                </div>

                <div style={s.formGroup}>
                  <label style={s.label}>Confirm Password</label>
                  <div className="field-wrap">
                    <IonIcon className="field-icon" icon={lockClosedOutline} />
                    <input
                      className="field-input"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <button className="password-toggle" type="button" onClick={() => setShowConfirmPassword((v) => !v)}>
                      <IonIcon icon={showConfirmPassword ? eyeOffOutline : eyeOutline} />
                    </button>
                  </div>
                </div>

                {error && <div style={s.errorMsg}>{error}</div>}

                <div className="terms-row">
                  <input
                    id="terms-checkbox"
                    className="terms-checkbox"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      setError('');
                    }}
                  />
                  <p className="terms-text">
                    I agree to the{' '}
                    <span className="terms-link" role="button" tabIndex={0} onClick={() => setShowTermsModal(true)} onKeyDown={(e) => e.key === 'Enter' && setShowTermsModal(true)}>
                      Terms and Conditions
                    </span>{' '}
                    and understand how my personal information will be collected and used.
                  </p>
                </div>

                <IonButton
                  expand="block"
                  style={{ ...s.submitBtn, opacity: isLoading ? 0.7 : 1 } as React.CSSProperties}
                  disabled={isLoading || !acceptedTerms}
                  type="submit"
                >
                  <IonIcon slot="start" icon={personOutline} />
                  {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                </IonButton>
              </form>

              <div className="auth-footer-link">
                Already have an account?
                <button type="button" onClick={() => history.push('/sign-in')}>SIGN IN</button>
              </div>
            </IonCardContent>
          </IonCard>

          <IonModal isOpen={showTermsModal} onDidDismiss={() => setShowTermsModal(false)}>
            <IonHeader>
              <IonToolbar color="primary">
                <IonTitle>Terms and Conditions</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={() => setShowTermsModal(false)}>Close</IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <div className="terms-body">
                <h3>Terms and Conditions</h3>
                <h4>ALS Mapping System</h4>
                <p>
                  By creating an account and using the ALS Mapping System, you agree to these Terms and Conditions.
                </p>
                <p><strong>Data Collection and Usage:</strong></p>
                <p>The platform collects and processes only the following personal information:</p>
                <ul>
                  <li>Full Name</li>
                  <li>Email Address</li>
                </ul>
                <p>
                  Purpose: Account management, system access, communication, and mapping-related updates.
                </p>
                <p>
                  All data is stored securely with industry-standard encryption, accessible only to authorized personnel,
                  and retained as long as your account is active or as required by legal obligations. You agree to provide
                  accurate information, maintain account confidentiality, and use the platform for legitimate academic or
                  administrative purposes related to ALS mapping.
                </p>
                <p>
                  This platform complies with applicable data privacy laws (e.g., Data Privacy Act of 2012 - RA 10173),
                  protecting your rights to access, correct, and delete your personal data. The system reserves the right
                  to update these terms with user notification.
                </p>
              </div>
            </IonContent>
          </IonModal>

          <IonAlert
            isOpen={!!success}
            backdropDismiss={false}
            cssClass="signup-success-alert"
            header="Account Created"
            message={success}
            buttons={[
              {
                text: 'OK',
                handler: () => {
                  setSuccess('');
                  history.replace('/sign-in');
                },
              },
            ]}
          />
        </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const s: Record<string, React.CSSProperties> = {
  bgPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(circle at 20% 10%, rgba(255,255,255,0.16), transparent 30%), radial-gradient(circle at 80% 90%, rgba(255,255,255,0.12), transparent 34%)',
    opacity: 0.35,
    zIndex: 0
  },
  topBar: {
    position: 'relative',
    zIndex: 1,
    marginBottom: 24
  },
  backBtn: {
    background: 'rgba(255,255,255,0.15)',
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
    marginBottom: 16,
    animation: 'fadeSlideUp 0.4s ease both'
  },
  title: {
    color: '#fff',
    fontSize: 'clamp(26px, 7vw, 32px)',
    fontWeight: 900,
    margin: '0 0 6px',
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
    borderRadius: 20,
    boxShadow: '0 22px 56px rgba(15,23,42,0.3)',
    border: '1px solid rgba(255,255,255,0.16)',
    background: '#fff',
    animation: 'fadeSlideUp 0.5s ease both'
  },
  formContent: {
    padding: '20px 16px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1E293B',
    letterSpacing: 0.2
  },
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  submitBtn: {
    '--background': 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 55%, #1d4ed8 100%)',
    '--box-shadow': '0 12px 24px rgba(37,99,235,0.32)',
    '--border-radius': '12px',
    '--color': '#fff',
    fontWeight: 800,
    fontSize: 14,
    letterSpacing: 0.4,
    height: 50,
    marginTop: 8
  } as React.CSSProperties,
  strengthTrack: {
    height: 6,
    borderRadius: 999,
    marginTop: 8,
    background: '#E2E8F0',
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 999,
    transition: 'all 0.25s ease',
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 6,
  },
  errorMsg: {
    color: '#c62828',
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 12px',
    background: '#ffebee',
    borderRadius: 8,
    marginTop: 4
  },
  successMsg: {
    color: '#166534',
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 12px',
    background: '#dcfce7',
    borderRadius: 8,
    marginTop: 4
  }
};

export default SignUpPage;
