import React, { useMemo, useState } from 'react';
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
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { downloadOutline } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { useAppContext } from '../context/AppContext';
import { clusterCoverage } from '../data/clusterCoverage';
import { BARANGAY_OPTIONS } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import { getDistrictByBarangay, getDistrictOptions, getMunicipalityByBarangay, getMunicipalityByDistrict } from '../utils/locationMapping';

ChartJS.register(ArcElement, Tooltip, Legend);

type ChartDatum = { label: string; value: number; color: string };
type SectionKey = 'municipality' | 'district' | 'barangay' | 'overallElementary' | 'overallJhs' | 'overallBlp';

type DownloadScope = 'municipality' | 'district' | 'barangay';
type DownloadTarget = 'overall' | string;
type ExportTargetOption = { label: string; value: string };

const isJhsGradeCompleted = (grade?: string): boolean => Boolean(
  grade?.includes('1st Year HS') ||
  grade?.includes('2nd Year HS') ||
  grade?.includes('3rd Year HS') ||
  grade?.includes('4th Year HS')
);

type ExportScope = DownloadScope;
type ExportRow = Record<string, string | number | boolean>;

const HEADING_STYLE: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: '#1e293b',
  padding: '16px 16px 4px',
  letterSpacing: 0.2,
};

const PIE_OPTIONS: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.label}: ${ctx.parsed}`,
      },
    },
  },
};

const PiePane: React.FC<{ title: string; data: ChartDatum[] }> = ({ title, data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        data: data.map((d) => d.value),
        backgroundColor: data.map((d) => d.color),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  return (
    <>
      <div style={HEADING_STYLE}>{title}</div>
      <IonCard>
        <IonCardContent>
          <div className="analytics-pane">
            <div className="analytics-legends">
              {data.length === 0 ? (
                <IonText color="medium">
                  <p style={{ margin: 0 }}>No data available.</p>
                </IonText>
              ) : (
                data.map((item) => {
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  return (
                    <div key={item.label} className="legend-row">
                      <div className="legend-left">
                        <span className="legend-dot" style={{ background: item.color }} />
                        <span className="legend-label">{item.label}</span>
                      </div>
                      <div className="legend-right">{item.value} ({pct}%)</div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="analytics-chart-wrap">
              {data.length > 0 ? (
                <div className="analytics-chart-inner">
                  <Pie data={chartData} options={PIE_OPTIONS} />
                </div>
              ) : (
                <div className="analytics-empty">No chart data</div>
              )}
            </div>
          </div>
        </IonCardContent>
      </IonCard>
    </>
  );
};

const AnalyticsPage: React.FC = () => {
  const { learners } = useAppContext();
  const [activeSection, setActiveSection] = useState<SectionKey>('municipality');
  const [downloadScope, setDownloadScope] = useState<DownloadScope>('municipality');
  const [downloadTarget, setDownloadTarget] = useState<DownloadTarget>('overall');
  const [downloadError, setDownloadError] = useState('');

  const municipalityOptions = clusterCoverage.map((item) => item.municipality);
  const districtOptions = getDistrictOptions();
  const allBarangays = clusterCoverage.flatMap((item) => item.barangays);

  const stats = useMemo(() => {
    let total = 0;
    let male = 0;
    let female = 0;
    let fourPs = 0;
    let ip = 0;
    let pwd = 0;
    let studying = 0;
    let notStudying = 0;
    let interested = 0;
    let youth = 0;
    let adult = 0;
    let senior = 0;
    let elementary = 0;
    let jhs = 0;
    let blp = 0;

    const byBarangay: Record<string, number> = {};
    const gradeMap: Record<string, number> = {};
    const tongueMap: Record<string, number> = {};
    const civilMap: Record<string, number> = {};
    const transportMap: Record<string, number> = {};
    const pwdTypeMap: Record<string, number> = {};

    learners.forEach((l) => {
      total += 1;
      if (l.sex === 'Male') male += 1;
      if (l.sex === 'Female') female += 1;
      if (l.is4PsMember) fourPs += 1;
      if (l.isIP) ip += 1;
      if (l.isPwd) pwd += 1;
      if (l.currentlyStudying === 'Yes') studying += 1;
      if (l.currentlyStudying === 'No') notStudying += 1;
      if (l.interestedInALS === 'Yes') interested += 1;

      if (l.age <= 24) youth += 1;
      else if (l.age <= 59) adult += 1;
      else senior += 1;

      if (l.isBlp) blp += 1;
      else if (l.lastGradeCompleted === 'G1 – G6 (Elementary)') elementary += 1;
      else if (isJhsGradeCompleted(l.lastGradeCompleted)) {
        jhs += 1;
      }

      if (l.barangay) byBarangay[l.barangay] = (byBarangay[l.barangay] || 0) + 1;
      const edKey = l.isBlp ? 'Basic Literacy Program (BLP)' : (l.lastGradeCompleted || 'Not specified');
      gradeMap[edKey] = (gradeMap[edKey] || 0) + 1;
      if (l.motherTongue) tongueMap[l.motherTongue] = (tongueMap[l.motherTongue] || 0) + 1;
      if (l.civilStatus) civilMap[l.civilStatus] = (civilMap[l.civilStatus] || 0) + 1;
      if (l.transportMode) transportMap[l.transportMode] = (transportMap[l.transportMode] || 0) + 1;
      if (l.isPwd && l.pwdType) pwdTypeMap[l.pwdType] = (pwdTypeMap[l.pwdType] || 0) + 1;
    });

    const barangayEntries = BARANGAY_OPTIONS
      .map((b) => [b, byBarangay[b] || 0] as [string, number])
      .filter(([, value]) => value > 0);

    return {
      total,
      male,
      female,
      fourPs,
      ip,
      pwd,
      studying,
      notStudying,
      interested,
      youth,
      adult,
      senior,
      elementary,
      jhs,
      blp,
      barangayEntries,
      gradeEntries: Object.entries(gradeMap).sort((a, b) => b[1] - a[1]),
      topTongues: Object.entries(tongueMap).sort((a, b) => b[1] - a[1]).slice(0, 8),
      civilEntries: Object.entries(civilMap).sort((a, b) => b[1] - a[1]),
      transportEntries: Object.entries(transportMap).sort((a, b) => b[1] - a[1]),
      pwdTypeEntries: Object.entries(pwdTypeMap).sort((a, b) => b[1] - a[1]),
    };
  }, [learners]);

  const colorSets = {
    blue: ['#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1e3a8a', '#0ea5e9', '#0f766e'],
    warm: ['#e11d48', '#f43f5e', '#fb7185', '#f59e0b', '#f97316', '#ea580c', '#facc15', '#ef4444'],
    cool: ['#0f766e', '#14b8a6', '#2dd4bf', '#22c55e', '#84cc16', '#65a30d', '#16a34a', '#15803d'],
    purple: ['#7c3aed', '#9333ea', '#a855f7', '#c084fc', '#d8b4fe', '#6d28d9', '#581c87', '#4c1d95'],
  };

  const colorByMunicipality: Record<string, string> = {
    Libona: '#1d4ed8',
    'Manolo Fortich': '#0f766e',
    Baungon: '#e11d48',
    Malitbog: '#7c3aed',
  };

  const getLearnerMunicipality = (learner: { barangay: string; municipality?: string; learnerDistrict?: string }) =>
    learner.municipality ||
    (learner.learnerDistrict ? getMunicipalityByDistrict(learner.learnerDistrict) : undefined) ||
    getMunicipalityByBarangay(learner.barangay) ||
    'Unknown';

  const getLearnerDistrict = (learner: { barangay: string; municipality?: string; learnerDistrict?: string }) =>
    learner.learnerDistrict ||
    getDistrictByBarangay(learner.barangay, getLearnerMunicipality(learner) as any) ||
    'Unknown';

  const getExportScopeLabel = (scope: ExportScope): string => {
    if (scope === 'municipality') return 'Municipality';
    if (scope === 'district') return 'District';
    return 'Barangay';
  };

  const getExportScopeValue = (learner: typeof learners[number], scope: ExportScope): string => {
    if (scope === 'municipality') return getLearnerMunicipality(learner);
    if (scope === 'district') return getLearnerDistrict(learner);
    return `${learner.barangay || 'Unknown'} (${getLearnerMunicipality(learner)})`;
  };

  const getExportTargetKey = (learner: typeof learners[number], scope: ExportScope): string => {
    if (scope === 'municipality') return getLearnerMunicipality(learner);
    if (scope === 'district') return getLearnerDistrict(learner);
    return `${getLearnerMunicipality(learner)}::${learner.barangay}`;
  };

  const getExportTargetOptions = (scope: DownloadScope): ExportTargetOption[] => {
    if (scope === 'municipality') {
      return municipalityOptions.map((municipality) => ({ label: municipality, value: municipality }));
    }

    if (scope === 'district') {
      return districtOptions.map((district) => ({ label: district, value: district }));
    }

    const barangayCounts = learners.reduce<Record<string, number>>((acc, learner) => {
      const key = learner.barangay || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return clusterCoverage.flatMap((item) =>
      item.barangays.map((barangay) => ({
        label: barangayCounts[barangay] > 1 ? `${barangay} (${item.municipality})` : barangay,
        value: `${item.municipality}::${barangay}`,
      })),
    );
  };

  const getExportFilename = (scope: DownloadScope, target: DownloadTarget): string => {
    const safeScope = scope.replace(/\s+/g, '-').toLowerCase();
    if (target === 'overall') return `als-learners-by-${safeScope}-overall.xlsx`;
    const safeTarget = target.replace(/::/g, '-').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    return `als-learners-by-${safeScope}-${safeTarget}.xlsx`;
  };

  const buildExportRows = (scope: ExportScope, target: DownloadTarget): ExportRow[] => {
    const filteredLearners = target === 'overall'
      ? learners
      : learners.filter((learner) => getExportTargetKey(learner, scope) === target);

    return [...filteredLearners]
      .map((learner) => {
        const municipality = getLearnerMunicipality(learner);
        const district = getLearnerDistrict(learner);
        const scopeValue = getExportScopeValue(learner, scope);

        return {
          'Scope Type': getExportScopeLabel(scope),
          'Scope Value': scopeValue,
          Region: learner.region,
          Division: learner.division,
          District: learner.district,
          'Calendar Year': learner.calendarYear,
          'Mapped By': learner.mappedBy,
          'Last Name': learner.lastName,
          'First Name': learner.firstName,
          'Middle Name': learner.middleName,
          'Name Extension': learner.nameExtension || '',
          Sex: learner.sex,
          'Civil Status': learner.civilStatus,
          Birthdate: learner.birthdate,
          Age: learner.age,
          'Mother Tongue': learner.motherTongue,
          'Is IP': learner.isIP ? 'Yes' : 'No',
          'IP Tribe': learner.ipTribe || '',
          Religion: learner.religion || '',
          'Is 4Ps Member': learner.is4PsMember ? 'Yes' : 'No',
          '4Ps or IP': learner.fourPsOrIp || '',
          'Is PWD': learner.isPwd ? 'Yes' : 'No',
          'PWD Type': learner.pwdType || '',
          'PWD Type Other': learner.pwdTypeOther || '',
          Municipality: municipality,
          'Learner District': district,
          Barangay: learner.barangay,
          'Complete Address': learner.completeAddress,
          'Role in Family': learner.roleInFamily,
          'Father Name': learner.fatherName || '',
          'Mother Name': learner.motherName || '',
          'Guardian Name': learner.guardianName || '',
          'Guardian Occupation': learner.guardianOccupation || '',
          'School Name': learner.schoolName || '',
          'Currently Studying': learner.currentlyStudying,
          'Last Grade Completed': learner.lastGradeCompleted,
          'Reason For Not Attending': learner.reasonForNotAttending,
          'Reason For Not Attending Other': learner.reasonForNotAttendingOther || '',
          'Is BLP': learner.isBlp ? 'Yes' : 'No',
          'Occupation Type': learner.occupationType || '',
          'Employment Status': learner.employmentStatus || '',
          'Monthly Income': learner.monthlyIncome || '',
          'Interested In ALS': learner.interestedInALS,
          'Contact Number': learner.contactNumber || '',
          'Distance (km)': learner.distanceKm,
          'Travel Time': learner.travelTime,
          'Transport Mode': learner.transportMode,
          'Preferred Session Time': learner.preferredSessionTime,
          'Date Mapped': formatDate(learner.dateMapped),
        };
      })
      .sort((left, right) => {
        if (target !== 'overall') {
          const leftName = `${String(left['Last Name'])} ${String(left['First Name'])}`;
          const rightName = `${String(right['Last Name'])} ${String(right['First Name'])}`;
          return leftName.localeCompare(rightName);
        }

        const leftGroup = String(left['Scope Value']);
        const rightGroup = String(right['Scope Value']);
        if (leftGroup !== rightGroup) return leftGroup.localeCompare(rightGroup);
        const leftName = `${String(left['Last Name'])} ${String(left['First Name'])}`;
        const rightName = `${String(right['Last Name'])} ${String(right['First Name'])}`;
        return leftName.localeCompare(rightName);
      });
  };

  const overallByMunicipality = (predicate: (learner: typeof learners[number]) => boolean = () => true) => {
    const counts: Record<string, number> = {};
    learners.forEach((learner) => {
      if (!predicate(learner)) return;
      const municipality = getLearnerMunicipality(learner);
      counts[municipality] = (counts[municipality] || 0) + 1;
    });
    return municipalityOptions.map((municipality) => [municipality, counts[municipality] || 0] as [string, number]);
  };

  const byBarangay = (predicate: (learner: typeof learners[number]) => boolean = () => true) => {
    const counts: Record<string, number> = {};
    learners.forEach((learner) => {
      if (!predicate(learner)) return;
      counts[learner.barangay] = (counts[learner.barangay] || 0) + 1;
    });
    return allBarangays.map((barangay) => [barangay, counts[barangay] || 0] as [string, number]);
  };

  const overallByDistrict = (predicate: (learner: typeof learners[number]) => boolean = () => true) => {
    const counts: Record<string, number> = {};
    learners.forEach((learner) => {
      if (!predicate(learner)) return;
      const district = getLearnerDistrict(learner);
      counts[district] = (counts[district] || 0) + 1;
    });
    return districtOptions.map((district) => [district, counts[district] || 0] as [string, number]);
  };

  const isElementaryLearner = (learner: typeof learners[number]) => learner.lastGradeCompleted === 'G1 – G6 (Elementary)' && !learner.isBlp;
  const isJhsLearner = (learner: typeof learners[number]) => isJhsGradeCompleted(learner.lastGradeCompleted) && !learner.isBlp;
  const isBlpLearner = (learner: typeof learners[number]) => learner.isBlp;

  const toChart = (entries: [string, number][], colors: string[]): ChartDatum[] =>
    entries
      .filter(([, value]) => value > 0)
      .map(([label, value], index) => ({
        label,
        value,
        color: colors[index % colors.length],
      }));

  const sectionData: Record<SectionKey, { title: string; data: ChartDatum[] }> = {
    municipality: {
      title: 'Learners by Municipality',
      data: toChart(overallByMunicipality(), Object.values(colorByMunicipality)),
    },
    district: {
      title: 'Learners by District',
      data: toChart(overallByDistrict(), colorSets.purple),
    },
    barangay: {
      title: 'Learners by Barangay',
      data: toChart(byBarangay(), colorSets.blue),
    },
    overallElementary: {
      title: 'Overall Elementary by Municipality',
      data: toChart(overallByMunicipality(isElementaryLearner), Object.values(colorByMunicipality)),
    },
    overallJhs: {
      title: 'Overall JHS by Municipality',
      data: toChart(overallByMunicipality(isJhsLearner), Object.values(colorByMunicipality)),
    },
    overallBlp: {
      title: 'Overall BLP by Municipality',
      data: toChart(overallByMunicipality(isBlpLearner), Object.values(colorByMunicipality)),
    },
  };

  const downloadExcel = async (scope: ExportScope, target: DownloadTarget): Promise<void> => {
    const rows = buildExportRows(scope, target);
    if (!rows.length) {
      setDownloadError('No learner data available for the selected export range.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Learners');

    const columnWidths = Object.keys(rows[0] ?? { 'Scope Type': '', 'Scope Value': '' }).map((header) => ({
      wch: Math.max(header.length, ...rows.map((row) => String(row[header] ?? '').length), 12),
    }));
    worksheet['!cols'] = columnWidths;

    const filename = getExportFilename(scope, target);

    try {
      // Native WebView often blocks browser-style file downloads, so share the file instead.
      if (Capacitor.isNativePlatform() && typeof File !== 'undefined' && typeof navigator !== 'undefined') {
        const arrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
        const file = new File(
          [arrayBuffer],
          filename,
          { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        );

        const canShareFiles =
          typeof navigator.canShare === 'function' &&
          navigator.canShare({ files: [file] });

        if (canShareFiles && typeof navigator.share === 'function') {
          await navigator.share({
            title: 'ALS Learner Export',
            text: 'Learner analytics export',
            files: [file],
          });
          return;
        }
      }

      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        XLSX.writeFile(workbook, filename, { bookType: 'xlsx' });
        return;
      }

      setDownloadError('This device does not support file download/share for Excel export yet.');
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Unable to export Excel right now.');
    }
  };

  const current = sectionData[activeSection];

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

      <IonContent>
        <style>{`
          .analytics-pane {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }
          .analytics-legends {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 10px;
            order: 1;
          }
          .legend-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 6px 2px;
            border-bottom: 1px dashed #e2e8f0;
          }
          .legend-row:last-child { border-bottom: 0; }
          .legend-left {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
          }
          .legend-dot {
            width: 10px;
            height: 10px;
            border-radius: 999px;
            flex-shrink: 0;
          }
          .legend-label {
            font-size: 12px;
            font-weight: 600;
            color: #334155;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .legend-right {
            font-size: 12px;
            font-weight: 800;
            color: #0f172a;
            flex-shrink: 0;
          }
          .analytics-chart-wrap {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px;
            min-height: 280px;
            display: flex;
            align-items: center;
            justify-content: center;
            order: 2;
          }
          .analytics-chart-inner {
            width: 100%;
            max-width: 420px;
            height: 280px;
          }
          .analytics-empty {
            color: #64748b;
            font-size: 13px;
            font-weight: 600;
          }
          @media (min-width: 992px) {
            .analytics-pane {
              flex-direction: row;
              align-items: stretch;
            }
            .analytics-chart-wrap {
              flex: 1 1 65%;
              min-height: 360px;
              order: 1;
            }
            .analytics-chart-inner {
              max-width: 640px;
              height: 340px;
            }
            .analytics-legends {
              flex: 1 1 35%;
              max-width: 360px;
              order: 2;
              max-height: 360px;
              overflow: auto;
            }
          }
        `}</style>

        <div style={HEADING_STYLE}>Download Excel Reports</div>
        <IonCard>
          <IonCardContent>
            <div style={{ display: 'grid', gap: 12 }}>
              <IonItem lines="none" style={{ '--background': '#F8FAFC', borderRadius: 12 } as React.CSSProperties}>
                <IonLabel position="stacked">Download By</IonLabel>
                <IonSelect
                  value={downloadScope}
                  interface="popover"
                  onIonChange={(e) => {
                    const scope = e.detail.value as DownloadScope;
                    setDownloadScope(scope);
                    setDownloadTarget('overall');
                  }}
                >
                  <IonSelectOption value="municipality">By Municipality</IonSelectOption>
                  <IonSelectOption value="district">By District</IonSelectOption>
                  <IonSelectOption value="barangay">By Barangay</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem lines="none" style={{ '--background': '#F8FAFC', borderRadius: 12 } as React.CSSProperties}>
                <IonLabel position="stacked">
                  {downloadTarget === 'overall' ? 'Export Range' : `Selected ${getExportScopeLabel(downloadScope)}`}
                </IonLabel>
                <IonSelect
                  value={downloadTarget}
                  interface="popover"
                  onIonChange={(e) => setDownloadTarget(e.detail.value as DownloadTarget)}
                >
                  <IonSelectOption value="overall">Overall</IonSelectOption>
                  {getExportTargetOptions(downloadScope).map((option) => (
                    <IonSelectOption key={option.value} value={option.value}>
                      {option.label}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </div>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <IonButton onClick={() => downloadExcel(downloadScope, downloadTarget)} style={{ '--border-radius': '14px' } as React.CSSProperties}>
                <IonIcon slot="start" icon={downloadOutline} />
                Download Excel
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>

        <IonAlert
          isOpen={!!downloadError}
          onDidDismiss={() => setDownloadError('')}
          header="Export Failed"
          message={downloadError}
          buttons={['OK']}
        />

        <div style={HEADING_STYLE}>View Section</div>
        <IonCard>
          <IonCardContent>
            <IonItem lines="none" style={{ '--background': '#F8FAFC', borderRadius: 12 } as React.CSSProperties}>
              <IonLabel position="stacked">Analytics Category</IonLabel>
              <IonSelect
                value={activeSection}
                interface="popover"
                onIonChange={(e) => setActiveSection(e.detail.value as SectionKey)}
              >
                <IonSelectOption value="municipality">By Municipality</IonSelectOption>
                <IonSelectOption value="district">By District</IonSelectOption>
                <IonSelectOption value="barangay">By Barangay</IonSelectOption>
                <IonSelectOption value="overallElementary">Overall Elementary</IonSelectOption>
                <IonSelectOption value="overallJhs">Overall JHS</IonSelectOption>
                <IonSelectOption value="overallBlp">Overall BLP</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonCardContent>
        </IonCard>

        <PiePane title={current.title} data={current.data} />

        <div style={{ height: 28 }} />
      </IonContent>
    </IonPage>
  );
};

export default AnalyticsPage;
