import React, { useEffect, useMemo, useState } from 'react';
import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
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
import { add, createOutline, filterOutline, personOutline, folderOpenOutline, personCircleOutline, schoolOutline, homeOutline, peopleOutline, busOutline, trashOutline, closeCircle } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { clusterCoverage } from '../data/clusterCoverage';
import { DISTRICT } from '../utils/constants';
import { deleteLearner, fetchLearners } from '../utils/learnerApi';
import { Learner } from '../types';
import { formatDate, formatStructuredText } from '../utils/helpers';
import { formatDistrictLabel, getDistrictByBarangay, getDistrictOptions, getMunicipalityByBarangay, getMunicipalityByDistrict } from '../utils/locationMapping';

const LearnerListPage: React.FC = () => {
  const { learners, setLearners, currentUserId, pendingSyncCount, refreshLearners } = useAppContext();
  const history = useHistory();
  const [query, setQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterMunicipality, setFilterMunicipality] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterBarangay, setFilterBarangay] = useState('');
  const [filterMappedBy, setFilterMappedBy] = useState('');
  const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Learner | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (learners.length > 0) return;

    let mounted = true;
    const loadLearners = async () => {
      const existing = await fetchLearners();
      if (mounted) setLearners(existing);
    };

    void loadLearners();
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

  const mappedByOptions = useMemo(
    () =>
      Array.from(
        new Set(
          learners
            .map((learner) => learner.mappedBy.trim())
            .filter((name) => name.length > 0),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [learners],
  );

  const activeFilterCount = Number(Boolean(filterMunicipality)) + Number(Boolean(filterDistrict)) + Number(Boolean(filterBarangay)) + Number(Boolean(filterMappedBy));

  const activeFilters = useMemo(() => {
    const filters: Array<{ id: string; label: string; value: string }> = [];
    if (filterMunicipality) filters.push({ id: 'municipality', label: 'Municipality', value: filterMunicipality });
    if (filterBarangay) filters.push({ id: 'barangay', label: 'Barangay', value: filterBarangay });
    if (filterMappedBy) filters.push({ id: 'mappedby', label: 'Mapped By', value: filterMappedBy });
    return filters;
  }, [filterMunicipality, filterBarangay, filterMappedBy]);

  const getLearnerMunicipality = (learner: { barangay: string; municipality?: string; learnerDistrict?: string }) =>
    learner.municipality ||
    (learner.learnerDistrict ? getMunicipalityByDistrict(learner.learnerDistrict) : undefined) ||
    getMunicipalityByBarangay(learner.barangay) ||
    '';

  const getLearnerDistrict = (learner: { barangay: string; municipality?: string; learnerDistrict?: string }) =>
    learner.learnerDistrict || getDistrictByBarangay(learner.barangay, getLearnerMunicipality(learner) as any) || '';

  const filtered = useMemo(() => {
    const q = query.toLowerCase();

    return learners
      .filter((l) => {
        const textMatch =
          l.firstName.toLowerCase().includes(q) ||
          l.lastName.toLowerCase().includes(q) ||
          l.middleName.toLowerCase().includes(q);
        if (!textMatch) return false;
        const learnerMunicipality = getLearnerMunicipality(l);
        const learnerDistrict = getLearnerDistrict(l);
        if (filterMunicipality && learnerMunicipality !== filterMunicipality) return false;
        if (filterDistrict && learnerDistrict !== filterDistrict) return false;
        if (filterBarangay && l.barangay !== filterBarangay) return false;
        if (filterMappedBy && l.mappedBy !== filterMappedBy) return false;
        return true;
      })
      .sort((left, right) => {
        const byLast = left.lastName.trim().localeCompare(right.lastName.trim(), undefined, { sensitivity: 'base' });
        if (byLast !== 0) return byLast;

        const byFirst = left.firstName.trim().localeCompare(right.firstName.trim(), undefined, { sensitivity: 'base' });
        if (byFirst !== 0) return byFirst;

        return left.middleName.trim().localeCompare(right.middleName.trim(), undefined, { sensitivity: 'base' });
      });
  }, [learners, query, filterMunicipality, filterDistrict, filterBarangay, filterMappedBy]);

  const initials = (first: string, last: string) => `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  const displayText = (value?: string | null): string => formatStructuredText(value ?? '') || 'N/A';

  const handleDelete = async (target: Learner) => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteLearner(target.id);
      setLearners((prev) => prev.filter((item) => item.id !== target.id));
      setDeleteSuccessMessage(`${target.firstName} ${target.lastName} was deleted successfully.`);
      setShowDeleteSuccess(true);
      setSelectedLearner(null);
      setDeleteTarget(null);
    } catch (error: any) {
      setDeleteError(error?.message || 'Unable to delete learner right now.');
    } finally {
      setIsDeleting(false);
    }
  };

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
          ['Mapped By', displayText(selectedLearner.mappedBy)],
          ['ALS Implementer', displayText(selectedLearner.alsImplementer)],
        ],
      },
      {
        title: 'Personal Information',
        icon: personCircleOutline,
        rows: [
          ['Last Name', displayText(selectedLearner.lastName)],
          ['First Name', displayText(selectedLearner.firstName)],
          ['Middle Name', displayText(selectedLearner.middleName)],
          ['Name Extension', displayText(selectedLearner.nameExtension)],
          ['Sex', selectedLearner.sex],
          ['Civil Status', displayText(selectedLearner.civilStatus)],
          ['Birthdate', formatDate(selectedLearner.birthdate)],
          ['Age', String(selectedLearner.age)],
          ['Mother Tongue', displayText(selectedLearner.motherTongue)],
          ['IP', selectedLearner.isIP ? 'Yes' : 'No'],
          ['IP Tribe', displayText(selectedLearner.ipTribe)],
          ['Religion', displayText(selectedLearner.religion)],
          ['4Ps Member', selectedLearner.is4PsMember ? 'Yes' : 'No'],
          ['PWD', selectedLearner.isPwd ? 'Yes' : 'No'],
          ['PWD Type', displayText(selectedLearner.pwdType)],
        ],
      },
      {
        title: 'Education',
        icon: schoolOutline,
        rows: [
          ['School Name', displayText(selectedLearner.schoolName)],
          ['Currently Studying', displayText(selectedLearner.currentlyStudying)],
          ['Last Grade Completed', displayText(selectedLearner.lastGradeCompleted)],
          ['Reason Not Attending', displayText(selectedLearner.reasonForNotAttending)],
          ['BLP', selectedLearner.isBlp ? 'Yes' : 'No'],
          ['Interested in ALS', displayText(selectedLearner.interestedInALS)],
        ],
      },
      {
        title: 'Address',
        icon: homeOutline,
        rows: [
          ['Municipality', displayText(getLearnerMunicipality(selectedLearner))],
          ['District', formatDistrictLabel(getLearnerDistrict(selectedLearner) || 'N/A')],
          ['Barangay', displayText(selectedLearner.barangay)],
          ['Complete Address', displayText(selectedLearner.completeAddress)],
        ],
      },
      {
        title: 'Family',
        icon: peopleOutline,
        rows: [
          ['Role in Family', displayText(selectedLearner.roleInFamily)],
          ['Father Name', displayText(selectedLearner.fatherName)],
          ['Father Occupation', displayText(selectedLearner.fatherOccupation)],
          ['Mother Name', displayText(selectedLearner.motherName)],
          ['Mother Occupation', displayText(selectedLearner.motherOccupation)],
          ['Guardian Name', displayText(selectedLearner.guardianName)],
          ['Guardian Occupation', displayText(selectedLearner.guardianOccupation)],
        ],
      },
      {
        title: 'Logistics',
        icon: busOutline,
        rows: [
          ['Occupation Type', displayText(selectedLearner.occupationType)],
          ['Employment Status', displayText(selectedLearner.employmentStatus)],
          ['Monthly Income', displayText(selectedLearner.monthlyIncome)],
          ['Contact Number', displayText(selectedLearner.contactNumber)],
          ['Distance (km)', String(selectedLearner.distanceKm)],
          ['Travel Time', displayText(selectedLearner.travelTime)],
          ['Transport Mode', displayText(selectedLearner.transportMode)],
          ['Preferred Session', displayText(selectedLearner.preferredSessionTime)],
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
          <IonButton fill="clear" size="small" onClick={() => setIsFilterModalOpen(true)}>
            <IonIcon icon={filterOutline} slot="start" />
            Filters {activeFilterCount ? `(${activeFilterCount})` : ''}
          </IonButton>
        </div>

        {activeFilters.length > 0 && (
          <div style={styles.chipsContainer}>
            {activeFilters.map((filter) => (
              <div key={filter.id} style={styles.chip}>
                <span style={styles.chipLabel}>{filter.value}</span>
                <IonIcon
                  icon={closeCircle}
                  style={styles.chipCloseIcon}
                  onClick={() => {
                    if (filter.id === 'municipality') {
                      setFilterMunicipality('');
                      setFilterDistrict('');
                      setFilterBarangay('');
                    } else if (filter.id === 'barangay') {
                      setFilterBarangay('');
                    } else if (filter.id === 'mappedby') {
                      setFilterMappedBy('');
                    }
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </IonHeader>

      {/* Filter Bottom Sheet Modal */}
      <IonModal
        isOpen={isFilterModalOpen}
        onDidDismiss={() => setIsFilterModalOpen(false)}
        initialBreakpoint={0.75}
        breakpoints={[0, 0.5, 0.75, 1]}
        handle
        handleBehavior="cycle"
      >
        <div style={styles.bottomSheetContent}>
          <div style={styles.bottomSheetHeader}>
            <h2 style={styles.bottomSheetTitle}>Filters</h2>
          </div>

          <div style={styles.bottomSheetBody}>
            <IonItem lines="none" style={styles.filterItem}>
              <IonLabel position="stacked">Municipality</IonLabel>
              <IonSelect
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

            <IonItem lines="none" style={styles.filterItem}>
              <IonLabel position="stacked">Barangay</IonLabel>
              <IonSelect
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

            <IonItem lines="none" style={styles.filterItem}>
              <IonLabel position="stacked">Mapped By</IonLabel>
              <IonSelect
                interface="popover"
                value={filterMappedBy || undefined}
                placeholder="All facilitators"
                onIonChange={(e) => setFilterMappedBy(e.detail.value ?? '')}
              >
                {mappedByOptions.map((name) => (
                  <IonSelectOption key={name} value={name}>
                    {name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          </div>

          <div style={{ height: '1px', background: '#e2e8f0', margin: '16px 0' }} />

          <div style={styles.bottomSheetActions}>
            <IonButton
              fill="outline"
              expand="block"
              onClick={() => {
                setFilterMunicipality('');
                setFilterDistrict('');
                setFilterBarangay('');
                setFilterMappedBy('');
              }}
            >
              Reset
            </IonButton>
            <IonButton
              fill="solid"
              expand="block"
              onClick={() => setIsFilterModalOpen(false)}
              style={{ '--background': '#1d4ed8' } as React.CSSProperties}
            >
              Apply Filters
            </IonButton>
          </div>
        </div>
      </IonModal>

      <IonContent>
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
          <IonRefresherContent
            pullingIcon="lines"
            pullingText="Pull to refresh"
            refreshingText="Refreshing learners..."
          />
        </IonRefresher>

        {pendingSyncCount > 0 && (
          <div style={styles.pendingSyncBanner}>
            {pendingSyncCount} learner{pendingSyncCount > 1 ? 's' : ''} pending sync when back online
          </div>
        )}

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
                <div style={styles.cardRow}>
                  <div style={styles.avatar}>{initials(learner.firstName, learner.lastName)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.name}>{displayText(learner.lastName)}, {displayText(learner.firstName)} {displayText(learner.middleName)}</div>
                    <div style={styles.meta}>Age: {learner.age} | {learner.sex}</div>
                    <div style={styles.meta}>Mapped by: {displayText(learner.mappedBy)}</div>
                  </div>
                  {currentUserId && learner.createdBy === currentUserId && (
                    <div style={styles.cardActions}>
                      <IonButton
                        size="small"
                        fill="clear"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          history.push(`/learners/${learner.id}/edit`);
                        }}
                      >
                        <IonIcon slot="icon-only" icon={createOutline} />
                      </IonButton>
                      <IonButton
                        size="small"
                        fill="clear"
                        color="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(learner);
                        }}
                      >
                        <IonIcon slot="icon-only" icon={trashOutline} />
                      </IonButton>
                    </div>
                  )}
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
                  {displayText(selectedLearner.firstName)} {displayText(selectedLearner.middleName)} {displayText(selectedLearner.lastName)}
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

        <IonAlert
          isOpen={!!deleteTarget}
          onDidDismiss={() => setDeleteTarget(null)}
          header="Delete Learner"
          message={deleteTarget ? `Delete ${deleteTarget.firstName} ${deleteTarget.lastName}'s record? This cannot be undone.` : ''}
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            {
              text: 'Delete',
              role: 'destructive',
              handler: () => {
                if (deleteTarget) {
                  void handleDelete(deleteTarget);
                }
              },
            },
          ]}
        />

        <IonAlert isOpen={!!deleteError} onDidDismiss={() => setDeleteError('')} header="Delete Failed" message={deleteError} buttons={['OK']} />

        <IonAlert
          isOpen={showDeleteSuccess}
          onDidDismiss={() => setShowDeleteSuccess(false)}
          header="Learner Deleted"
          message={deleteSuccessMessage}
          buttons={['OK']}
        />
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
  cardRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
  },
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
    justifyContent: 'flex-start',
    borderTop: '1px solid #e2e8f0',
    borderBottom: '1px solid #e2e8f0',
    padding: '4px 8px'
  },
  chipsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    padding: '8px 12px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    overflowX: 'auto' as const,
  },
  chip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 12,
    paddingRight: 4,
    paddingTop: 6,
    paddingBottom: 6,
    background: '#dbeafe',
    border: '1px solid #93c5fd',
    borderRadius: 20,
    whiteSpace: 'nowrap' as const,
    fontSize: 13,
    fontWeight: 600,
    color: '#1e40af',
  },
  chipLabel: {
    maxWidth: '280px',
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
  chipCloseIcon: {
    width: 18,
    height: 18,
    cursor: 'pointer',
    color: '#3b82f6',
    flexShrink: 0,
  },
  bottomSheetContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
  },
  bottomSheetHeader: {
    padding: '16px 16px 12px',
    borderBottom: '1px solid #e2e8f0',
  },
  bottomSheetTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 800,
    color: '#1e293b',
  },
  bottomSheetBody: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '12px 6px',
  },
  filterItem: {
    marginBottom: 12,
    '--background': '#f8fafc',
    '--border-color': '#e2e8f0',
    borderRadius: '10px',
  } as React.CSSProperties,
  bottomSheetActions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
    padding: 16,
    borderTop: '1px solid #e2e8f0',
    background: '#fff',
  },
  filterPanel: { padding: '8px 10px', background: '#fff', borderBottom: '1px solid #e2e8f0' },
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
    textTransform: 'capitalize',
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
  pendingSyncBanner: {
    margin: '10px 16px 4px',
    background: '#fff7ed',
    color: '#9a3412',
    border: '1px solid #fed7aa',
    borderRadius: 10,
    padding: '8px 10px',
    fontSize: 12,
    fontWeight: 700,
    textAlign: 'center',
  },
};

export default LearnerListPage;
