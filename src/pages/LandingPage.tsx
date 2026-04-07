import React, { useRef, useState, useEffect } from 'react';
import { IonButton, IonContent, IonIcon, IonPage } from '@ionic/react';
import { logInOutline, personAddOutline, barChartOutline, documentOutline, filterOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import LogoImage from '../components/LogoImage';

const LandingPage: React.FC = () => {
  const history = useHistory();
  const [activeFeature, setActiveFeature] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: documentOutline,
      title: 'Quick Registration',
      desc: 'Guided multi-step forms to register learners easily',
      color: '#10B981'
    },
    {
      icon: filterOutline,
      title: 'Smart Filters',
      desc: 'Search by municipality and barangay coverage',
      color: '#F59E0B'
    },
    {
      icon: barChartOutline,
      title: 'Analytics',
      desc: 'Learner insights and community breakdowns',
      color: '#8B5CF6'
    }
  ];

  const projectCards = [
    {
      title: 'What It Does',
      desc: 'Registers and maps ALS learners across Cluster I communities.',
    },
    {
      title: 'Who Uses It',
      desc: 'Facilitators, mappers, and education teams in the field.',
    },
    {
      title: 'Why It Matters',
      desc: 'Improves targeting, planning, and learning support delivery.',
    },
  ];

  return (
    <IonPage>
      <IonContent style={{ '--background': '#F9FAFB' } as React.CSSProperties}>
        <style>{`
          @keyframes heroFadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes buttonTap {
            0% { transform: scale(1); }
            50% { transform: scale(0.97); }
            100% { transform: scale(1); }
          }

          @keyframes featureSlideIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
          }

          @keyframes floatGently {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }

          .landing-hero {
            animation: heroFadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1);
          }

          .feature-card {
            scroll-snap-align: center;
            scroll-behavior: smooth;
          }

          .feature-card:active {
            animation: buttonTap 200ms ease-out;
          }

          ::-webkit-scrollbar {
            height: 4px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: #CBD5E1;
            border-radius: 4px;
          }
        `}</style>

        {/* Hero Section */}
        <div style={s.heroSection} className="landing-hero">
          <div style={s.heroBackground} />
          <div style={s.heroContent}>
            <div style={s.logoWrapper}>
              <LogoImage src="/logo.png" alt="ALS Logo" size={72} />
            </div>
            <h1 style={s.heroTitle}>ALS Cluster I<br />Mapping System</h1>
            <p style={s.heroSubtitle}>Learner Registration & Community Mapping Platform</p>
            <p style={s.heroTagline}>EMPOWERING COMMUNITY LEARNING</p>
          </div>
        </div>

        {/* Stats Section */}
        <div style={s.statsSection}>
          <div style={s.statCard}>
            <div style={s.statValue}>1.2K+</div>
            <div style={s.statLabel}>Learners</div>
          </div>
          <div style={s.statDivider} />
          <div style={s.statCard}>
            <div style={s.statValue}>4</div>
            <div style={s.statLabel}>Municipalities</div>
          </div>
          <div style={s.statDivider} />
          <div style={s.statCard}>
            <div style={s.statValue}>100%</div>
            <div style={s.statLabel}>Coverage</div>
          </div>
        </div>

        {/* Primary Actions */}
        <div style={s.actionsSection}>
          <IonButton
            expand="block"
            style={s.primaryButton}
            onClick={() => history.push('/sign-in')}
          >
            <IonIcon slot="start" icon={logInOutline} />
            Sign In
          </IonButton>
          <IonButton
            expand="block"
            fill="outline"
            style={s.secondaryButton}
            onClick={() => history.push('/sign-up')}
          >
            <IonIcon slot="start" icon={personAddOutline} />
            Create Account
          </IonButton>
        </div>

        {/* Feature Section */}
        <div style={s.featureSection}>
          <div style={s.projectCardsWrap}>
            {projectCards.map((card, idx) => (
              <div
                key={card.title}
                style={{
                  ...s.projectCard,
                  animation: `featureSlideIn 450ms cubic-bezier(0.22, 1, 0.36, 1) ${idx * 90}ms both`,
                }}
              >
                <h3 style={s.projectCardTitle}>{card.title}</h3>
                <p style={s.projectCardDesc}>{card.desc}</p>
              </div>
            ))}
          </div>

          <div style={s.featureScroller} ref={scrollContainerRef}>
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="feature-card"
                style={{
                  ...s.featureCard,
                  animation: `featureSlideIn 500ms cubic-bezier(0.22, 1, 0.36, 1) ${idx * 100}ms both`,
                  borderLeft: `4px solid ${feature.color}`,
                  opacity: activeFeature === idx ? 1 : 0.5,
                  transform: activeFeature === idx ? 'scale(1)' : 'scale(0.95)',
                }}
                onClick={() => setActiveFeature(idx)}
              >
                <div style={{ ...s.featureIconBox, background: `${feature.color}18` }}>
                  <IonIcon icon={feature.icon} style={{ ...s.featureIcon, color: feature.color }} />
                </div>
                <h3 style={s.featureTitle}>{feature.title}</h3>
                <p style={s.featureDesc}>{feature.desc}</p>
              </div>
            ))}
          </div>
          <div style={s.featureIndicators}>
            {features.map((_, idx) => (
              <div
                key={idx}
                style={{
                  ...s.indicator,
                  background: activeFeature === idx ? '#1F66BC' : '#E2E8F0',
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom Spacer */}
        <div style={{ height: 32 }} />
      </IonContent>
    </IonPage>
  );
};

const s: Record<string, React.CSSProperties> = {
  heroSection: {
    background: 'linear-gradient(135deg, #1F66BC 0%, #0D47A1 50%, #4C1D95 100%)',
    padding: '48px 16px 32px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroBackground: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255,255,255,0.06) 0%, transparent 50%)
    `,
    zIndex: 0,
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  logoWrapper: {
    marginBottom: 20,
    animation: 'floatGently 4s ease-in-out infinite',
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 'clamp(28px, 6vw, 40px)',
    fontWeight: 900,
    margin: '0 0 6px',
    lineHeight: 1.1,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: 700,
    margin: '0 0 10px',
    letterSpacing: 0.5,
  },
  heroTagline: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    fontWeight: 600,
    margin: 0,
    letterSpacing: 0.3,
  },

  statsSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '24px 0',
    background: '#FFF',
    borderBottom: '1px solid #E2E8F0',
  },
  statCard: {
    textAlign: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 900,
    color: '#1F66BC',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: 700,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    background: '#E2E8F0',
  },

  actionsSection: {
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  primaryButton: {
    '--background': 'linear-gradient(135deg, #1F66BC 0%, #0D47A1 100%)',
    '--box-shadow': '0 8px 20px rgba(31, 102, 188, 0.3)',
    '--border-radius': '14px',
    '--color': '#FFF',
    fontWeight: 800,
    fontSize: 16,
    height: 50,
    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  } as React.CSSProperties,
  secondaryButton: {
    '--background': '#FFF',
    '--border-color': '#CBD5E1',
    '--border-width': '1.5px',
    '--border-radius': '14px',
    '--color': '#1F66BC',
    fontWeight: 800,
    fontSize: 16,
    height: 50,
    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  } as React.CSSProperties,
  featureSection: {
    padding: '32px 16px 24px',
  },
  projectCardsWrap: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 10,
    marginBottom: 16,
  },
  projectCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #E2E8F0',
    boxShadow: '0 3px 10px rgba(15, 23, 42, 0.06)',
    padding: '12px 10px',
    minHeight: 96,
  },
  projectCardTitle: {
    margin: 0,
    fontSize: 13,
    fontWeight: 800,
    color: '#0F172A',
    lineHeight: 1.2,
  },
  projectCardDesc: {
    margin: '8px 0 0',
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1.35,
    color: '#64748B',
  },
  featureScroller: {
    display: 'flex',
    gap: 14,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    paddingBottom: 8,
    marginBottom: 16,
  },
  featureCard: {
    flex: '0 0 calc(100% - 32px)',
    maxWidth: 320,
    background: '#FFF',
    borderRadius: '16px',
    padding: '20px 16px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
    border: '1px solid #E2E8F0',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: '#0F172A',
    margin: '0 0 8px',
  },
  featureDesc: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: 500,
    margin: 0,
    lineHeight: 1.5,
  },

  featureIndicators: {
    display: 'flex',
    gap: 6,
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    transition: 'all 0.3s ease',
  },
};

export default LandingPage;
