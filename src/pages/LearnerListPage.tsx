import React, { useEffect, useState } from 'react';
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
  IonFabButton,
  IonModal,
  IonTitle,
} from '@ionic/react';
import { add, filterOutline, personOutline, folderOpenOutline, personCircleOutline, schoolOutline, homeOutline, peopleOutline, busOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { clusterCoverage } from '../data/clusterCoverage';
import { DISTRICT } from '../utils/constants';
import { seedMockLearnersIfEmpty } from '../utils/learnerApi';
import { Learner } from '../types';
import { formatDate } from '../utils/helpers';
import { getDistrictByBarangay, getDistrictOptions, getMunicipalityByBarangay } from '../utils/locationMapping';

const LearnerListPage: React.FC = () => {
  const { learners, setLearners } = useAppContext();
  const history = useHistory();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterMunicipality, setFilterMunicipality] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterBarangay, setFilterBarangay] = useState('');
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);

  useEffect(() => {
    if (learners.length > 0) return;

    let mounted = true;
    const ensureSeedData = async () => {
      const seeded = await seedMockLearnersIfEmpty();
      if (mounted) setLearners(seeded);
    };

    void ensureSeedData();
    return () => {
      mounted = false;
    };
  }, [learners.length, setLearners]);

  const municipalityOptions = clusterCoverage.map((item) => item.municipality);
  const districtOptions = getDistrictOptions(filterMunicipality as any);
  const allBarangays = clusterCoverage.flatMap((item) => item.barangays);
  const municipalityBarangays = filterMunicipality
    ? (clusterCoverage.find((item) => item.municipality === filterMunicipality)?.barangays ?? [])
    : allBarangays;
  const barangayOptions = filterDistrict
    ? municipalityBarangays.filter((barangay) => getDistrictByBarangay(barangay, filterMunicipality as any) === filterDistrict)
    : municipalityBarangays;

  const barangayToMunicipality = clusterCoverage.reduce<Record<string, string>>((acc, item) => {
    item.barangays.forEach((barangay) => {
      acc[barangay] = item.municipality;
    });
    return acc;
  }, {});

  const activeFilterCount = Number(Boolean(filterMunicipality)) + Number(Boolean(filterDistrict)) + Number(Boolean(filterBarangay));

  const filtered = learners.filter((l) => {
    const q = query.toLowerCase();
    const textMatch = l.firstName.toLowerCase().includes(q) || l.lastName.toLowerCase().includes(q) || l.middleName.toLowerCase().includes(q);
    if (!textMatch) return false;
    const learnerMunicipality = l.municipality || barangayToMunicipality[l.barangay] || getMunicipalityByBarangay(l.barangay) || '';
    const learnerDistrict = l.learnerDistrict || getDistrictByBarangay(l.barangay, learnerMunicipality as any) || '';
    if (filterMunicipality && learnerMunicipality !== filterMunicipality) return false;
    if (filterDistrict && learnerDistrict !== filterDistrict) return false;
    if (filterBarangay && l.barangay !== filterBarangay) return false;
    return true;
  });

  const initials = (first: string, last: string) => `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

  const detailCategories = selectedLearner
    ? [
      {
        title: 'Administrative',
        icon: folderOpenOutline,
        rows: [
          ['Region', selectedLearner.region],
          ['Division', selectedLearner.division],
          ['District', selectedLearner.district],
          ['Calendar Year', String(selectedLearner.calendarYear)],
          ['Mapped By', selectedLearner.mappedBy],
        ],
      },
      {
        title: 'Personal Information',
        icon: personCircleOutline,
        rows: [
          ['Last Name', selectedLearner.lastName],
          ['First Name', selectedLearner.firstName],
          ['Middle Name', selectedLearner.middleName],
          ['Name Extension', selectedLearner.nameExtension || 'N/A'],
          ['Sex', selectedLearner.sex],
          ['Civil Status', selectedLearner.civilStatus],
          ['Birthdate', formatDate(selectedLearner.birthdate)],
          ['Age', String(selectedLearner.age)],
          ['Mother Tongue', selectedLearner.motherTongue],
          ['IP', selectedLearner.isIP ? 'Yes' : 'No'],
          ['IP Tribe', selectedLearner.ipTribe || 'N/A'],
          ['Religion', selectedLearner.religion || 'N/A'],
          ['4Ps Member', selectedLearner.is4PsMember ? 'Yes' : 'No'],
          ['PWD', selectedLearner.isPwd ? 'Yes' : 'No'],
          ['PWD Type', selectedLearner.pwdType || 'N/A'],
        ],
      },
      {
        title: 'Education',
        icon: schoolOutline,
        rows: [
          ['School Name', selectedLearner.schoolName || 'N/A'],
          ['Currently Studying', selectedLearner.currentlyStudying || 'N/A'],
          ['Last Grade Completed', selectedLearner.lastGradeCompleted || 'N/A'],
          ['Reason Not Attending', selectedLearner.reasonForNotAttending || 'N/A'],
          ['BLP', selectedLearner.isBlp ? 'Yes' : 'No'],
          ['Interested in ALS', selectedLearner.interestedInALS || 'N/A'],
        ],
      },
      {
        title: 'Address',
        icon: homeOutline,
        rows: [
          ['Municipality', selectedLearner.municipality || barangayToMunicipality[selectedLearner.barangay] || 'N/A'],
          ['District', selectedLearner.learnerDistrict || getDistrictByBarangay(selectedLearner.barangay, selectedLearner.municipality) || 'N/A'],
          ['Barangay', selectedLearner.barangay],
          ['Complete Address', selectedLearner.completeAddress],
        ],
      },
      {
        title: 'Family',
        icon: peopleOutline,
        rows: [
          ['Role in Family', selectedLearner.roleInFamily],
          ['Father Name', selectedLearner.fatherName || 'N/A'],
          ['Mother Name', selectedLearner.motherName || 'N/A'],
          ['Guardian Name', selectedLearner.guardianName || 'N/A'],
          ['Guardian Occupation', selectedLearner.guardianOccupation || 'N/A'],
        ],
      },
      {
        title: 'Logistics',
        icon: busOutline,
        rows: [
          ['Occupation Type', selectedLearner.occupationType || 'N/A'],
          ['Employment Status', selectedLearner.employmentStatus || 'N/A'],
          ['Monthly Income', selectedLearner.monthlyIncome || 'N/A'],
          ['Contact Number', selectedLearner.contactNumber || 'N/A'],
          ['Distance (km)', String(selectedLearner.distanceKm)],
          ['Travel Time', selectedLearner.travelTime],
          ['Transport Mode', selectedLearner.transportMode],
          ['Preferred Session', selectedLearner.preferredSessionTime],
          ['Date Mapped', formatDate(selectedLearner.dateMapped)],
        ],
      },
    ]
    : [];

  return (
    <IonPage>
      <style>{`
        .learner-detail-modal::part(content) {
          animation: detailModalPop 240ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes detailModalPop {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes detailFadeSlide {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
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
          <IonSearchbar
            value={query}
            onIonInput={(e) => setQuery(e.detail.value ?? '')}
            placeholder="Search learners by name..."
            debounce={150}
            showCancelButton="focus"
            style={{
              '--border-radius': '22px',
              '--box-shadow': '0 8px 20px rgba(15, 23, 42, 0.08)',
              '--background': '#ffffff',
              paddingLeft: 8,
              paddingRight: 8,
            } as React.CSSProperties}
          />
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
                setFilterDistrict('');
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
            <IonCard key={learner.id} button onClick={() => setSelectedLearner(learner)} style={{ margin: '6px 16px', borderRadius: 14 }}>
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

        <IonModal className="learner-detail-modal" isOpen={!!selectedLearner} onDidDismiss={() => setSelectedLearner(null)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Learner Details</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setSelectedLearner(null)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent style={{ '--background': '#eef2f7' } as React.CSSProperties}>
            {selectedLearner && (
              <div
                key={`${selectedLearner.id}-hero`}
                style={{
                  ...styles.detailTopHero,
                  animation: 'detailFadeSlide 260ms ease both',
                  animationDelay: '70ms',
                }}
              >
                <h2 style={styles.detailTopName}>
                  {selectedLearner.firstName} {selectedLearner.middleName} {selectedLearner.lastName}
                </h2>
                <p style={styles.detailTopMeta}>{selectedLearner.age} yrs old | {selectedLearner.sex}</p>
                <p style={styles.detailTopMapped}>Mapped: {formatDate(selectedLearner.dateMapped)}</p>
              </div>
            )}

            <div style={styles.detailContentWrap}>
              {detailCategories.map((category, index) => (
                <div
                  key={`${selectedLearner?.id || 'learner'}-${category.title}`}
                  style={{
                    ...styles.detailSectionCard,
                    animation: 'detailFadeSlide 300ms ease both',
                    animationDelay: `${120 + index * 80}ms`,
                  }}
                >
                  <div style={styles.detailSectionTitle}>
                    <IonIcon icon={category.icon} style={{ marginRight: 6 }} />
                    {category.title}
                  </div>
                  <div style={styles.detailGrid}>
                    {category.rows.map(([label, value]) => (
                      <div key={`${category.title}-${label}`} style={styles.detailRow}>
                        <div style={styles.detailLabel}>{label}</div>
                        <div style={styles.detailValue}>{value || 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </IonContent>
        </IonModal>
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
  },
  detailTopHero: {
    background: 'linear-gradient(145deg, #1f66bc 0%, #0d47a1 100%)',
    padding: '16px 16px 14px',
    color: '#fff',
    boxShadow: '0 2px 10px rgba(15, 23, 42, 0.2)',
  },
  detailTopName: {
    margin: 0,
    fontSize: 30,
    fontWeight: 900,
    lineHeight: 1.15,
    letterSpacing: 0.2,
    textTransform: 'lowercase',
  },
  detailTopMeta: {
    margin: '8px 0 0',
    fontSize: 14,
    opacity: 0.92,
    fontWeight: 600,
  },
  detailTopMapped: {
    margin: '3px 0 0',
    fontSize: 13,
    opacity: 0.9,
    fontWeight: 500,
  },
  detailContentWrap: {
    padding: 12,
  },
  detailSectionCard: {
    background: '#fff',
    border: '1px solid #dbe2ea',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)',
  },
  detailSectionTitle: {
    display: 'flex',
    alignItems: 'center',
    color: '#0b63c4',
    fontWeight: 800,
    fontSize: 20,
    marginBottom: 10,
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    columnGap: 14,
    rowGap: 10,
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  detailLabel: {
    textTransform: 'uppercase',
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 800,
    letterSpacing: 0.25,
  },
  detailValue: {
    marginTop: 4,
    color: '#1f2937',
    fontSize: 16,
    fontWeight: 700,
    wordBreak: 'break-word',
  },
};

export default LearnerListPage;
