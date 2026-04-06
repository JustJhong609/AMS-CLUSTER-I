import React, { useMemo } from 'react';
import { IonBackButton, IonButtons, IonCard, IonCardContent, IonContent, IonHeader, IonItem, IonPage, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/react';
import { useAppContext } from '../context/AppContext';

const AnalyticsPage: React.FC = () => {
  const { learners } = useAppContext();

  const overview = useMemo(() => {
    const elementary = learners.filter((l) => l.lastGradeCompleted === 'G1 – G6 (Elementary)').length;
    const jhs = learners.filter((l) =>
      l.lastGradeCompleted?.includes('1st Year HS') ||
      l.lastGradeCompleted?.includes('2nd Year HS') ||
      l.lastGradeCompleted?.includes('3rd Year HS')
    ).length;
    const blp = learners.filter((l) => l.isBlp).length;
    return { elementary, jhs, blp };
  }, [learners]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Analytics</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent style={{ '--background': '#f1f5f9' } as React.CSSProperties} className="ion-padding">
        <h3 style={{ marginTop: 6, marginBottom: 10, color: '#1e293b' }}>Download PDF Reports</h3>
        <IonCard>
          <IonCardContent>
            <IonItem lines="none" style={{ marginBottom: 12 }}>
              <IonSelect value="summary" interface="popover" label="Report Type" labelPlacement="stacked">
                <IonSelectOption value="summary">Summary</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonCardContent>
        </IonCard>

        <h3 style={{ marginTop: 14, marginBottom: 10, color: '#1e293b' }}>Overview: Education Level Focus</h3>
        <IonCard>
          <IonCardContent>
            <div style={s.analyticsWrap}>
              <div style={s.pieWrap}>
                <div style={{ ...s.pieSlice, clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)', background: '#e11d48' }} />
                <div style={{ ...s.pieSlice, clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 20% 100%, 20% 72%)', background: '#f43f5e' }} />
                <div style={{ ...s.pieSlice, clipPath: 'polygon(50% 50%, 20% 72%, 0 40%, 0 0, 50% 0)', background: '#fb7185' }} />
              </div>
              <div style={s.legendCol}>
                <div style={s.legendRow}><span style={{ ...s.dot, background: '#e11d48' }} /> Elementary <strong>{overview.elementary}</strong></div>
                <div style={s.legendRow}><span style={{ ...s.dot, background: '#f43f5e' }} /> JHS <strong>{overview.jhs}</strong></div>
                <div style={s.legendRow}><span style={{ ...s.dot, background: '#fb7185' }} /> BLP <strong>{overview.blp}</strong></div>
              </div>
            </div>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

const s: Record<string, React.CSSProperties> = {
  analyticsWrap: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: 12,
    alignItems: 'center'
  },
  pieWrap: {
    width: 310,
    height: 310,
    margin: '0 auto',
    borderRadius: '50%',
    position: 'relative',
    overflow: 'hidden'
  },
  pieSlice: { position: 'absolute', inset: 0 },
  legendCol: { display: 'grid', gap: 8 },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: '#334155',
    justifyContent: 'space-between'
  },
  dot: { width: 10, height: 10, borderRadius: 6, display: 'inline-block' }
};

export default AnalyticsPage;
