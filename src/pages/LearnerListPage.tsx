import React, { useState } from 'react';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonSearchbar,
  IonToolbar,
  IonText,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonFab,
  IonFabButton
} from '@ionic/react';
import { add, filterOutline, personOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { clusterCoverage } from '../data/clusterCoverage';
import { DISTRICT } from '../utils/constants';

const LearnerListPage: React.FC = () => {
  const { learners } = useAppContext();
  const history = useHistory();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterMunicipality, setFilterMunicipality] = useState('');
  const [filterBarangay, setFilterBarangay] = useState('');

  const municipalityOptions = clusterCoverage.map((item) => item.municipality);
  const allBarangays = clusterCoverage.flatMap((item) => item.barangays);
  const barangayOptions = filterMunicipality
    ? (clusterCoverage.find((item) => item.municipality === filterMunicipality)?.barangays ?? [])
    : allBarangays;

  const barangayToMunicipality = clusterCoverage.reduce<Record<string, string>>((acc, item) => {
    item.barangays.forEach((barangay) => {
      acc[barangay] = item.municipality;
    });
    return acc;
  }, {});

  const activeFilterCount = Number(Boolean(filterMunicipality)) + Number(Boolean(filterBarangay));

  const filtered = learners.filter((l) => {
    const q = query.toLowerCase();
    const textMatch = l.firstName.toLowerCase().includes(q) || l.lastName.toLowerCase().includes(q) || l.middleName.toLowerCase().includes(q);
    if (!textMatch) return false;
    const learnerMunicipality = barangayToMunicipality[l.barangay] ?? '';
    if (filterMunicipality && learnerMunicipality !== filterMunicipality) return false;
    if (filterBarangay && l.barangay !== filterBarangay) return false;
    return true;
  });

  const initials = (first: string, last: string) => `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: 4 }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>ALS Mapper</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>{DISTRICT}</div>
          </div>
          <IonButtons slot="end">
            <div style={styles.countBadge}>
              <div style={styles.countNum}>{learners.length}</div>
              <div style={styles.countLbl}>{learners.length === 1 ? 'Learner' : 'Learners'}</div>
            </div>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar value={query} onIonInput={(e) => setQuery(e.detail.value ?? '')} placeholder="Search learners by name..." debounce={150} showCancelButton="focus" />
        </IonToolbar>

        <div style={styles.filterToggleBar}>
          <IonButton fill="clear" size="small" onClick={() => setShowFilters(!showFilters)}>
            <IonIcon icon={filterOutline} slot="start" />
            Filters {activeFilterCount ? `(${activeFilterCount})` : ''}
          </IonButton>
          {activeFilterCount > 0 && (
            <IonButton
              fill="clear"
              size="small"
              color="medium"
              onClick={() => {
                setFilterMunicipality('');
                setFilterBarangay('');
              }}
            >
              Clear
            </IonButton>
          )}
        </div>

        {showFilters && (
          <div style={styles.filterPanel}>
            <div style={styles.filterGrid}>
              <IonItem lines="none" style={styles.filterField}>
                <IonSelect
                  label="Municipality"
                  labelPlacement="stacked"
                  interface="popover"
                  value={filterMunicipality || undefined}
                  placeholder="All municipalities"
                  onIonChange={(e) => {
                    const municipality = e.detail.value ?? '';
                    setFilterMunicipality(municipality);
                    if (filterBarangay) {
                      const allowedBarangays = municipality
                        ? (clusterCoverage.find((item) => item.municipality === municipality)?.barangays ?? [])
                        : allBarangays;
                      if (!allowedBarangays.includes(filterBarangay)) {
                        setFilterBarangay('');
                      }
                    }
                  }}
                >
                  {municipalityOptions.map((municipality) => (
                    <IonSelectOption key={municipality} value={municipality}>
                      {municipality}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem lines="none" style={styles.filterField}>
                <IonSelect
                  label="Barangay"
                  labelPlacement="stacked"
                  interface="popover"
                  value={filterBarangay || undefined}
                  placeholder={filterMunicipality ? 'Select barangay' : 'All barangays'}
                  onIonChange={(e) => setFilterBarangay(e.detail.value ?? '')}
                >
                  {barangayOptions.map((barangay) => (
                    <IonSelectOption key={barangay} value={barangay}>
                      {barangay}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </div>
          </div>
        )}
      </IonHeader>

      <IonContent>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 32px' }}>
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <IonIcon icon={personOutline} style={{ fontSize: 44, color: 'var(--ion-color-primary)' }} />
            </div>
            <IonText>
              <h2 style={{ fontWeight: 800, margin: '0 0 8px' }}>{learners.length ? 'No Results Found' : 'No Learners Yet'}</h2>
              <p style={{ color: '#757575', lineHeight: '1.6' }}>{learners.length ? 'Try searching with a different name.' : 'Add a learner to start registration.'}</p>
            </IonText>
            {!learners.length && (
              <IonButton style={{ marginTop: 20 }} onClick={() => history.push('/learners/new')}>
                <IonIcon slot="start" icon={add} />
                Add First Learner
              </IonButton>
            )}
          </div>
        ) : (
          filtered.map((learner) => (
            <IonCard key={learner.id} style={{ margin: '6px 16px', borderRadius: 14 }}>
              <IonCardContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.avatar}>{initials(learner.firstName, learner.lastName)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.name}>{learner.lastName}, {learner.firstName} {learner.middleName}</div>
                    <div style={styles.meta}>Age: {learner.age} | {learner.sex}</div>
                    <div style={styles.meta}>Mapped by: {learner.mappedBy}</div>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          ))
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/learners/new')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

const styles: Record<string, React.CSSProperties> = {
  countBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    padding: '4px 12px',
    marginRight: 8
  },
  countNum: { color: '#fff', fontWeight: 900, fontSize: 18, lineHeight: 1 },
  countLbl: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'var(--ion-color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0
  },
  name: { fontWeight: 800, fontSize: 20, color: '#1e293b' },
  meta: { color: '#64748b', fontSize: 16, marginTop: 2, fontWeight: 600 },
  filterToggleBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid #e2e8f0',
    borderBottom: '1px solid #e2e8f0',
    padding: '2px 6px'
  },
  filterPanel: { padding: '8px 10px', background: '#fff', borderBottom: '1px solid #e2e8f0' }
  ,
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10
  },
  filterField: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 10
  }
};

export default LearnerListPage;
