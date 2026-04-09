import React, { useEffect, useMemo, useState } from 'react';
import { IonAlert, IonButton, IonCard, IonCardContent, IonContent, IonIcon, IonPage, IonSpinner } from '@ionic/react';
import { arrowBackOutline, closeCircle, keyOutline } from 'ionicons/icons';
import type { EmailOtpType } from '@supabase/supabase-js';
import { useHistory } from 'react-router-dom';
import { supabase } from '../utils/supabase.ts';

type ResetStatus = 'verifying' | 'ready' | 'success' | 'error';

const VALID_OTP_TYPES: EmailOtpType[] = ['recovery', 'magiclink', 'invite', 'email', 'email_change', 'signup'];

const PasswordResetPage: React.FC = () => {
  const history = useHistory();
  const [status, setStatus] = useState<ResetStatus>('verifying');
  const [message, setMessage] = useState('Validating your reset link...');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const canSubmit = useMemo(() => {
    return status === 'ready' && !isSaving;
  }, [status, isSaving]);

  useEffect(() => {
    let active = true;

    const verifyRecoveryLink = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const tokenHash = searchParams.get('token_hash');
      const rawType = searchParams.get('type') || hashParams.get('type');
      const authCode = searchParams.get('code');
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const otpType = rawType && VALID_OTP_TYPES.includes(rawType as EmailOtpType) ? (rawType as EmailOtpType) : 'recovery';

      if (!supabase) {
        if (!active) return;
        setStatus('error');
        setMessage('App configuration is incomplete. Please contact support.');
        return;
      }

      let verificationError: Error | null = null;

      // Supports custom template links that pass token_hash in query params.
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: otpType,
        });
        verificationError = error;
      } else if (accessToken && refreshToken) {
        // Supports default Supabase recovery URLs with hash tokens.
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        verificationError = error;
      } else if (authCode) {
        // Supports PKCE/email links that include an auth code.
        const { error } = await supabase.auth.exchangeCodeForSession(authCode);
        verificationError = error;
      } else {
        verificationError = new Error('Invalid or expired reset link. Please request a new password reset email.');
      }

      if (!active) return;

      if (verificationError) {
        setStatus('error');
        setMessage(verificationError.message || 'Reset link is no longer valid. Request a new link.');
        return;
      }

      // Remove sensitive token data from the address bar after successful validation.
      if (window.location.hash) {
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      }

      setStatus('ready');
      setMessage('Set your new password below.');
    };

    void verifyRecoveryLink();

    return () => {
      active = false;
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!supabase) {
      setError('Supabase is not configured. Please contact support.');
      return;
    }

    setIsSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      await supabase.auth.signOut();
      setStatus('ready');
      setMessage('Set your new password below.');
      setNewPassword('');
      setConfirmPassword('');
      setShowSuccessAlert(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password right now. Please try again.');
    } finally {
      setIsSaving(false);
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
            align-items: center;
            padding: 0 14px;
            position: relative;
          }

          .auth-content {
            width: 100%;
            max-width: 460px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
          }

          .auth-topbar {
            margin-bottom: 0;
            z-index: 1;
            position: absolute;
            top: 18px;
            left: 14px;
          }

          .auth-card {
            border-radius: 24px;
          }

          .auth-form-content {
            padding: 28px 20px;
          }

          @media (min-width: 768px) {
            .auth-shell {
              padding: 0 20px;
            }

            .auth-topbar {
              left: 20px;
              top: 22px;
            }

            .auth-form-content {
              padding: 32px 24px;
            }
          }
        `}</style>

        <div className="auth-shell">
          <div style={s.bgPattern} />

          <div className="auth-topbar" style={s.topBar}>
            <button type="button" style={s.backBtn} onClick={() => history.replace('/sign-in')}>
              <IonIcon icon={arrowBackOutline} style={{ color: '#fff', fontSize: 24 }} />
            </button>
          </div>

          <div className="auth-content">
            <div style={s.header}>
              <h1 style={s.title}>Reset Password</h1>
              <p style={s.subtitle}>{message}</p>
            </div>

            <IonCard className="auth-card" style={s.formCard}>
              <IonCardContent className="auth-form-content" style={s.formContent}>
                {status === 'verifying' && (
                  <div style={s.statusBlock}>
                    <IonSpinner name="crescent" color="primary" />
                  </div>
                )}

                {status === 'error' && (
                  <div style={s.statusBlock}>
                    <IonIcon icon={closeCircle} style={{ color: '#dc2626', fontSize: 40 }} />
                    <IonButton expand="block" style={s.submitBtn} onClick={() => history.replace('/sign-in')}>
                      Back to Sign In
                    </IonButton>
                  </div>
                )}

                {status === 'ready' && (
                  <form onSubmit={handleResetPassword} style={s.form}>
                    <div style={s.formGroup}>
                      <label style={s.label}>New Password</label>
                      <div style={s.inputWrap}>
                        <IonIcon icon={keyOutline} style={s.inputIcon} />
                        <input
                          style={s.input}
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={isSaving}
                        />
                      </div>
                    </div>

                    <div style={s.formGroup}>
                      <label style={s.label}>Confirm Password</label>
                      <div style={s.inputWrap}>
                        <IonIcon icon={keyOutline} style={s.inputIcon} />
                        <input
                          style={s.input}
                          type="password"
                          placeholder="Re-enter new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={isSaving}
                        />
                      </div>
                    </div>

                    {error && <div style={s.errorMsg}>{error}</div>}

                    <IonButton expand="block" type="submit" style={s.submitBtn} disabled={!canSubmit}>
                      {isSaving ? 'Updating Password...' : 'Update Password'}
                    </IonButton>
                  </form>
                )}

              </IonCardContent>
            </IonCard>
          </div>
        </div>

        <IonAlert
          isOpen={showSuccessAlert}
          onDidDismiss={() => setShowSuccessAlert(false)}
          backdropDismiss={false}
          header="Password Updated"
          message="Your password has been reset successfully."
          buttons={[
            {
              text: 'Back to Sign In',
              handler: () => {
                history.replace('/sign-in');
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

const s: Record<string, React.CSSProperties> = {
  bgPattern: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      radial-gradient(circle at 18% 18%, rgba(255,255,255,0.12) 0%, transparent 30%),
      radial-gradient(circle at 80% 16%, rgba(96,165,250,0.16) 0%, transparent 24%),
      radial-gradient(circle at 72% 82%, rgba(37,99,235,0.14) 0%, transparent 28%),
      radial-gradient(circle at 20% 80%, rgba(14,165,233,0.10) 0%, transparent 26%)
    `,
    zIndex: 0,
  },
  topBar: {
    marginBottom: 24,
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
    backdropFilter: 'blur(10px)',
  },
  header: {
    textAlign: 'center',
    marginBottom: 22,
    animation: 'fadeSlideUp 0.4s ease both',
  },
  title: {
    color: '#fff',
    fontSize: 'clamp(26px, 7vw, 32px)',
    fontWeight: 900,
    margin: '0 0 8px',
    lineHeight: 1.2,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: 500,
    margin: 0,
    letterSpacing: 0.2,
  },
  formCard: {
    width: '100%',
    borderRadius: 22,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.16)',
    background: '#fff',
    animation: 'fadeSlideUp 0.5s ease both',
  },
  formContent: {
    padding: '24px 18px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: '#374151',
    letterSpacing: 0.2,
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    color: '#64748b',
    fontSize: 18,
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 38px',
    borderRadius: 12,
    border: '1.5px solid #e2e8f0',
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    transition: 'all 0.22s ease',
    background: '#f8fafc',
    outline: 'none',
  },
  submitBtn: {
    '--background': 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 52%, #1d4ed8 100%)',
    '--box-shadow': '0 10px 22px rgba(37,99,235,0.34)',
    '--border-radius': '50px',
    '--color': '#fff',
    fontWeight: 700,
    fontSize: 15,
    height: 48,
    marginTop: 8,
  } as React.CSSProperties,
  statusBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    minHeight: 120,
  },
  errorMsg: {
    color: '#c62828',
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 12px',
    background: '#ffebee',
    borderRadius: 8,
    marginTop: 8,
  },
};

export default PasswordResetPage;
