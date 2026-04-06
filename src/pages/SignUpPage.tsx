import React, { useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonContent, IonIcon, IonPage } from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const SignUpPage: React.FC = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    facilitatorId: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password.trim()) {
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

    setIsLoading(true);
    // Simulate async signup - in real app, call backend
    setTimeout(() => {
      localStorage.setItem(
        'als-user',
        JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          facilitatorId: formData.facilitatorId,
          role: 'mapper'
        })
      );
      history.replace('/home');
      setIsLoading(false);
    }, 500);
  };

  return (
    <IonPage>
      <IonContent style={s.container}>
        <div style={s.bgPattern} />

        <div style={s.topBar}>
          <button style={s.backBtn} onClick={() => history.goBack()}>
            <IonIcon icon={arrowBackOutline} style={{ color: '#fff', fontSize: 24 }} />
          </button>
        </div>

        <div style={s.content}>
          <div style={s.header}>
            <h1 style={s.title}>Create Account</h1>
            <p style={s.subtitle}>Register as an ALS facilitator</p>
          </div>

          <IonCard style={s.formCard}>
            <IonCardContent style={s.formContent}>
              <form onSubmit={handleSignUp} style={s.form}>
                <div style={s.formRow}>
                  <div style={{ ...s.formGroup, flex: 1 }}>
                    <label style={s.label}>First Name</label>
                    <input
                      style={s.input}
                      type="text"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div style={{ ...s.formGroup, flex: 1 }}>
                    <label style={s.label}>Last Name</label>
                    <input
                      style={s.input}
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div style={s.formGroup}>
                  <label style={s.label}>Email Address</label>
                  <input
                    style={s.input}
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div style={s.formGroup}>
                  <label style={s.label}>Facilitator ID (optional)</label>
                  <input
                    style={s.input}
                    type="text"
                    name="facilitatorId"
                    placeholder="FAC-2024-001"
                    value={formData.facilitatorId}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div style={s.formRow}>
                  <div style={{ ...s.formGroup, flex: 1 }}>
                    <label style={s.label}>Password</label>
                    <input
                      style={s.input}
                      type="password"
                      name="password"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div style={{ ...s.formGroup, flex: 1 }}>
                    <label style={s.label}>Confirm Password</label>
                    <input
                      style={s.input}
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && <div style={s.errorMsg}>{error}</div>}

                <IonButton
                  expand="block"
                  style={{ ...s.submitBtn, opacity: isLoading ? 0.7 : 1 } as React.CSSProperties}
                  onClick={handleSignUp}
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </IonButton>
              </form>

              <div style={s.divider}>
                <span style={s.dividerText}>Already have an account?</span>
              </div>

              <IonButton
                expand="block"
                fill="outline"
                style={s.loginBtn}
                onClick={() => history.push('/sign-in')}
              >
                Sign In
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

const s: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    background: 'linear-gradient(145deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
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
    maxWidth: '480px',
    width: '100%',
    margin: '0 auto'
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
    animation: 'fadeSlideUp 0.4s ease both'
  },
  title: {
    color: '#fff',
    fontSize: 32,
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
    borderRadius: 24,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
    background: '#fff',
    animation: 'fadeSlideUp 0.5s ease both'
  },
  formContent: {
    padding: '32px 24px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: '#374151',
    letterSpacing: 0.2
  },
  input: {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1.5px solid #e2e8f0',
    fontSize: 13,
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
    marginTop: 12
  } as React.CSSProperties,
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    margin: '16px 0 12px',
    position: 'relative'
  },
  dividerText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#94a3b8',
    textAlign: 'center',
    flex: 1
  },
  loginBtn: {
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
    marginTop: 4
  }
};

export default SignUpPage;
