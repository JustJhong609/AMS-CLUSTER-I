import React from 'react';
import { IonButton, IonContent, IonIcon, IonPage } from '@ionic/react';
import { logInOutline, personAddOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent className="landing-page" style={{ '--background': 'linear-gradient(145deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%)' } as React.CSSProperties}>
        <style>{`
          .landing-page {
            --padding-top: 22px;
            --padding-bottom: 28px;
          }
          .landing-shell {
            min-height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px 14px 0;
          }
          .landing-content {
            width: 100%;
          }
          .landing-buttons {
            flex-direction: column;
            max-width: 100%;
          }
          .landing-buttons ion-button {
            width: 100%;
          }
          .landing-features {
            grid-template-columns: 1fr;
            margin-top: 28px;
          }
          @media (min-width: 768px) {
            .landing-page {
              --padding-top: 32px;
              --padding-bottom: 32px;
            }
            .landing-shell {
              padding: 0 20px;
            }
            .landing-buttons {
              flex-direction: row;
              max-width: 520px;
            }
            .landing-buttons ion-button {
              width: auto;
            }
            .landing-features {
              grid-template-columns: repeat(3, minmax(140px, 1fr));
              margin-top: 40px;
            }
          }
        `}</style>
        <div style={s.bgPattern} />

        <div className="landing-shell">
          <div className="landing-content" style={s.content}>
            {/* Logo placeholder */}
            <div style={s.logoPlaceholder}>
              <div style={s.logoCircle}>ALS</div>
            </div>

            {/* Main heading */}
            <h1 style={s.title}>ALS CLUSTER I<br />Mapping System</h1>

            {/* Subtitle */}
            <p style={s.subtitle}>Learner Registration & Community Mapping Platform</p>

            {/* Description */}
            <p style={s.description}>
              A community-based registration platform for identifying and supporting out-of-school youth and adult learners across Bukidnon Cluster I municipalities.
            </p>

            {/* Buttons */}
            <div className="landing-buttons" style={s.buttonGroup}>
              <IonButton
                style={s.signInButton}
                onClick={() => history.push('/sign-in')}
              >
                <IonIcon slot="start" icon={logInOutline} />
                Sign In
              </IonButton>
              <IonButton
                style={s.signUpButton}
                onClick={() => history.push('/sign-up')}
              >
                <IonIcon slot="start" icon={personAddOutline} />
                Create Account
              </IonButton>
            </div>

            {/* Feature cards */}
            <div className="landing-features" style={s.featureGrid}>
              {[
                {
                  title: 'Quick Registration',
                  desc: 'Register learners with guided multi-step forms',
                  icon: '📋'
                },
                {
                  title: 'Smart Filters',
                  desc: 'Search and filter by municipality and barangay',
                  icon: '🔍'
                },
                {
                  title: 'Analytics',
                  desc: 'View insights and breakdowns of learner data',
                  icon: '📊'
                }
              ].map((feature, idx) => (
                <div key={idx} style={s.featureCard}>
                  <div style={s.featureIcon}>{feature.icon}</div>
                  <div style={s.featureTitle}>{feature.title}</div>
                  <div style={s.featureDesc}>{feature.desc}</div>
                </div>
              ))}
            </div>
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
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
    padding: '20px',
    overflow: 'hidden'
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
    backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
    zIndex: 0,
    opacity: 0.1
  },
  content: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    maxWidth: '560px',
    animation: 'fadeSlideUp 0.6s ease both',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  logoPlaceholder: {
    marginBottom: '32px',
    animation: 'float 3s ease-in-out infinite'
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 20,
    background: 'rgba(255,255,255,0.15)',
    border: '2px solid rgba(255,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 900,
    fontSize: 24,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
  },
  title: {
    color: '#fff',
    fontSize: 'clamp(28px, 5vw, 42px)',
    fontWeight: 900,
    margin: '0 0 16px',
    lineHeight: 1.15,
    letterSpacing: -0.5
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: 700,
    margin: '0 0 24px',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontWeight: 500,
    margin: '0 0 40px',
    lineHeight: 1.6,
    maxWidth: '480px'
  },
  buttonGroup: {
    display: 'flex',
    gap: 16,
    width: '100%',
    maxWidth: 520,
    marginBottom: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  signInButton: {
    '--background': '#1976d2',
    '--background-hover': '#1565c0',
    '--background-activated': '#0d47a1',
    '--border-radius': '50px',
    '--border-width': '0',
    '--color': '#fff',
    '--box-shadow': '0 8px 24px rgba(13,71,161,0.28)',
    fontWeight: 700,
    fontSize: 15,
    height: 48,
    minWidth: 170,
    flex: '1 1 190px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)'
  } as React.CSSProperties,
  signUpButton: {
    '--background': '#fff',
    '--background-hover': '#f8fafc',
    '--background-activated': '#f1f5f9',
    '--border-radius': '50px',
    '--color': '#1565c0',
    '--border-color': 'rgba(255,255,255,0.7)',
    '--border-width': '1px',
    '--box-shadow': '0 8px 24px rgba(0,0,0,0.12)',
    fontWeight: 700,
    fontSize: 15,
    height: 48,
    minWidth: 170,
    flex: '1 1 190px',
    transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)'
  } as React.CSSProperties,
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 16,
    width: '100%',
    marginTop: 40
  },
  featureCard: {
    background: '#fff',
    borderRadius: 18,
    padding: '20px 16px',
    textAlign: 'center',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.5)',
    animation: 'fadeSlideUp 0.6s ease both',
    transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
    cursor: 'pointer'
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  featureTitle: {
    color: '#1e293b',
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 4,
    letterSpacing: 0.3
  },
  featureDesc: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1.4
  }
};

export default LandingPage;
