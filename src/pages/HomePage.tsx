import React, { useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import {
  barChartOutline,
  chevronForwardOutline,
  logOutOutline,
  informationCircleOutline,
  listOutline,
  personAddOutline,
  peopleOutline,
  personOutline,
  closeOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { DISTRICT, DIVISION, REGION } from '../utils/constants';
import LogoImage from '../components/LogoImage';
import { supabase } from '../utils/supabase';

const HomePage: React.FC = () => {
  const { learners, pendingSyncCount, refreshLearners } = useAppContext();
  const history = useHistory();
  const [showAbout, setShowAbout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const total = learners.length;
  const elementary = learners.filter((l) => l.lastGradeCompleted === 'G1 – G6 (Elementary)').length;
  const jhs = learners.filter((l) =>
    l.lastGradeCompleted?.includes('1st Year HS') ||
    l.lastGradeCompleted?.includes('2nd Year HS') ||
    l.lastGradeCompleted?.includes('3rd Year HS') ||
    l.lastGradeCompleted?.includes('4th Year HS')
  ).length;
  const blp = learners.filter((l) => l.isBlp).length;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } finally {
      setIsLoggingOut(false);
      history.replace('/sign-in');
    }
  };

  const menuItems = [
    {
      icon: personAddOutline,
      label: 'Add New Learner',
      desc: 'Map a new ALS learner using Form 1',
      grad: 'linear-gradient(135deg,#43A047,#2E7D32)',
      path: '/learners/new'
    },
    {
      icon: listOutline,
      label: 'View All Learners',
      desc: `Browse & search ${total} mapped learner${total !== 1 ? 's' : ''}`,
      grad: 'linear-gradient(135deg,#1976D2,#1565C0)',
      path: '/learners'
    },
    {
      icon: barChartOutline,
      label: 'Analytics',
      desc: 'View charts, breakdowns & insights',
      grad: 'linear-gradient(135deg,#9C27B0,#7B1FA2)',
      path: '/analytics'
    },
    {
      icon: informationCircleOutline,
      label: 'About This App',
      desc: 'App details, district info & coverage',
      grad: 'linear-gradient(135deg,#039BE5,#0277BD)',
      path: null
    }
  ];

  return (
    <IonPage>
      <style>{`
        @keyframes cardLoadSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardTapPulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.98);
          }
          100% {
            transform: scale(1);
          }
        }

        .menu-card-hover {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .menu-card-hover:active {
          animation: cardTapPulse 200ms ease-out;
        }

        .menu-card-hover:hover,
        .menu-card-hover:active {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
      <IonHeader style={{ boxShadow: 'none' }}>
        <div style={s.headerWrap}>
          <div style={s.headerTop}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <LogoImage src="/logo.png" alt="ALS Logo" size={40} />
              <div>
                <div style={s.headerTitle}>ALS Mapping System</div>
                <div style={s.headerSub}>Community Mapping Tool</div>
              </div>
            </div>
            <IonButton
              fill="clear"
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={s.logoutBtn}
              aria-label="Logout"
            >
              <IonIcon icon={logOutOutline} style={{ fontSize: 20 }} />
            </IonButton>
          </div>
          <div style={s.districtPill}>
            <span style={s.districtPillText}>{DISTRICT}</span>
            <span style={s.districtPillDot}>·</span>
            <span style={s.districtPillText}>{DIVISION}</span>
          </div>
        </div>
      </IonHeader>

      <IonContent style={{ '--background': '#F1F5F9' } as React.CSSProperties}>
        <IonRefresher
          slot="fixed"
          onIonRefresh={async (event) => {
            try {
              await refreshLearners();
            } finally {
              event.detail.complete();
            }
          }}
        >
          <IonRefresherContent pullingText="Pull to refresh" refreshingText="Refreshing learners..." />
        </IonRefresher>

        {pendingSyncCount > 0 && (
          <div style={s.pendingSyncBanner}>
            {pendingSyncCount} pending learner{pendingSyncCount > 1 ? 's' : ''} to sync when online
          </div>
        )}

        <div style={s.statsRow}>
          {[
            { icon: peopleOutline, val: total, label: 'Total', color: '#1565C0' },
            { icon: personOutline, val: elementary, label: 'Elementary', color: '#1976D2' },
            { icon: personOutline, val: jhs, label: 'JHS', color: '#7B1FA2' },
            { icon: personOutline, val: blp, label: 'BLP', color: '#F57C00' }
          ].map((st) => (
            <div key={st.label} style={s.statCard}>
              <div style={{ ...s.statIcon, background: `${st.color}18` }}>
                <IonIcon icon={st.icon} style={{ color: st.color, fontSize: 18 }} />
              </div>
              <div style={{ ...s.statNum, color: st.color }}>{st.val}</div>
              <div style={s.statCap}>{st.label}</div>
            </div>
          ))}
        </div>

        <div className="section-title">Quick Actions</div>
        {menuItems.map((item, idx) => (
          <IonCard
            key={item.label}
            button
            className="menu-card-hover"
            style={{
              ...s.menuCard,
              animation: `cardLoadSlideUp 400ms cubic-bezier(0.22, 1, 0.36, 1) ${idx * 80}ms both`,
            }}
            onClick={() => (item.path ? history.push(item.path) : setShowAbout(true))}
          >
            <IonCardContent style={{ padding: '14px 16px' }}>
              <div style={s.menuRow}>
                <div style={{ ...s.iconBox, background: item.grad }}>
                  <IonIcon icon={item.icon} style={{ color: '#fff', fontSize: 22 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={s.menuLabel}>{item.label}</div>
                  <div style={s.menuDesc}>{item.desc}</div>
                </div>
                <div style={s.chevronWrap}>
                  <IonIcon icon={chevronForwardOutline} style={{ color: '#64748B', fontSize: 14 }} />
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        ))}
      </IonContent>

      <IonModal isOpen={showAbout} onDidDismiss={() => setShowAbout(false)} breakpoints={[0, 0.8]} initialBreakpoint={0.8} handle>
        <IonHeader>
          <IonToolbar>
            <IonTitle>About This App</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowAbout(false)} fill="clear">
                <IonIcon slot="icon-only" icon={closeOutline} style={{ fontSize: 22 }} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonText>
            <p>
              The <strong>ALS Mapping System</strong> is a community-based learner registration and mapping platform designed to identify and support out-of-school youth and adult learners across Bukidnon Cluster I. Facilitators use this tool to register learners, document their educational background, gather logistics information, and track enrollment in Alternative Learning System (ALS) programs.
            </p>
          </IonText>
          <IonList lines="none">
            <IonItem>
              <IonLabel>
                <p style={s.aboutLabel}>Municipalities</p>
                <h3 style={s.aboutValue}>Libona, Manolo Fortich, Baungon, Malitbog</h3>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <p style={s.aboutLabel}>Division</p>
                <h3 style={s.aboutValue}>{DIVISION}</h3>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <p style={s.aboutLabel}>Region</p>
                <h3 style={s.aboutValue}>{REGION}</h3>
              </IonLabel>
            </IonItem>
          </IonList>

          <IonText>
            <h2 style={s.aboutHeading}>Credits & Acknowledgments</h2>
            <p style={s.aboutParagraph}>
              This project was made possible through the collaboration, commitment, and support of ALS implementers and partners working to advance inclusive education in Bukidnon Cluster I.
            </p>
            <p style={s.aboutParagraph}>
              <strong>Alfredo G. De los Santos Jr., EPS II, Division of Bukidnon</strong>- for providing framework references, and implementation guidance that helped shape the structure and direction of this platform.
            </p>
          </IonText>
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

const s: Record<string, React.CSSProperties> = {
  headerWrap: {
    background: 'linear-gradient(145deg, #1976d2 0%, #1565C0 50%, #0d47a1 100%)',
    padding: '52px 20px 16px',
    boxShadow: '0 4px 24px rgba(13,71,161,0.4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  headerTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#fff', fontWeight: 800, fontSize: 16, lineHeight: 1.2, letterSpacing: 0.1 },
  headerSub: { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: 500, marginTop: 1, letterSpacing: 0.3 },
  logoutBtn: {
    '--color': '#ffffff',
    '--background': 'rgba(255,255,255,0.14)',
    '--border-radius': '999px',
    '--padding-start': '10px',
    '--padding-end': '10px',
    minHeight: 36,
    minWidth: 36,
    backdropFilter: 'blur(6px)',
    border: '1px solid rgba(255,255,255,0.24)'
  } as React.CSSProperties,
  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    background: 'rgba(255,255,255,0.18)',
    border: '1.5px solid rgba(255,255,255,0.28)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 900,
    fontSize: 13
  },
  districtPill: {
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(255,255,255,0.13)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 50,
    padding: '5px 14px'
  },
  districtPillText: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: 700, letterSpacing: 0.3 },
  districtPillDot: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 400 },
  statsRow: { display: 'flex', gap: 10, padding: '12px 16px' },
  statCard: {
    flex: 1,
    background: '#fff',
    borderRadius: 16,
    padding: '14px 8px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    border: '1px solid rgba(0,0,0,0.04)',
    animation: 'fadeSlideUp 0.3s ease both'
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2
  },
  statNum: { fontSize: 26, fontWeight: 900, lineHeight: 1, letterSpacing: -1 },
  statCap: { fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.6 },
  menuCard: {
    margin: '0 16px 10px',
    borderRadius: 18,
    border: '1px solid rgba(0,0,0,0.05)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    cursor: 'pointer'
  },
  menuRow: { display: 'flex', alignItems: 'center', gap: 14 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  },
  menuLabel: { fontSize: 15, fontWeight: 800, color: '#1e293b', letterSpacing: 0.1 },
  menuDesc: { fontSize: 12, color: '#6B7280', marginTop: 2, fontWeight: 500 },
  chevronWrap: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: '#E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  aboutLabel: { fontSize: 11, fontWeight: 600, color: '#757575', textTransform: 'uppercase' },
  aboutValue: { fontWeight: 700 },
  aboutHeading: {
    marginTop: 14,
    marginBottom: 10,
    fontSize: 20,
    fontWeight: 800,
    color: '#0F172A',
  },
  aboutParagraph: {
    marginTop: 0,
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 1.7,
    color: '#334155'
  },
  pendingSyncBanner: {
    margin: '12px 12px 0',
    background: '#fff7ed',
    color: '#9a3412',
    border: '1px solid #fed7aa',
    borderRadius: 12,
    padding: '10px 12px',
    fontSize: 12,
    fontWeight: 700,
    textAlign: 'center',
  },
};

export default HomePage;
