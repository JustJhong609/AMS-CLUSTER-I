import React, { useMemo, useState } from 'react';
import {
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
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAppContext } from '../context/AppContext';
import { clusterCoverage } from '../data/clusterCoverage';
import { BARANGAY_OPTIONS } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import { getDistrictByBarangay, getDistrictOptions, getMunicipalityByBarangay } from '../utils/locationMapping';

ChartJS.register(ArcElement, Tooltip, Legend);

type ChartDatum = { label: string; value: number; color: string };
type SectionKey = 'municipality' | 'district' | 'barangay' | 'overallElementary' | 'overallJhs' | 'overallBlp';

type DownloadScope = 'overall' | 'municipality' | 'district' | 'barangay';

type ReportRow = {
  firstName: string;
  lastName: string;
  middleName: string;
  sex: 'Male' | 'Female';
  age: number;
  barangay: string;
  civilStatus: string;
  isBlp: boolean;
  lastGradeCompleted: string;
  schoolName: string;
  is4PsMember: boolean;
  isIP: boolean;
  isPwd: boolean;
  pwdType: string;
  dateMapped: string;
};

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
  const [downloadScope, setDownloadScope] = useState<DownloadScope>('overall');

  const municipalityOptions = clusterCoverage.map((item) => item.municipality);
  const districtOptions = getDistrictOptions();
  const allBarangays = clusterCoverage.flatMap((item) => item.barangays);

  const barangayToMunicipality = clusterCoverage.reduce<Record<string, string>>((acc, item) => {
    item.barangays.forEach((barangay) => {
      acc[barangay] = item.municipality;
    });
    return acc;
  }, {});

  const filteredExportRows = useMemo(() => {
    return learners.map((learner) => ({
      firstName: learner.firstName,
      lastName: learner.lastName,
      middleName: learner.middleName,
      sex: learner.sex,
      age: learner.age,
      barangay: learner.barangay,
      civilStatus: learner.civilStatus,
      isBlp: learner.isBlp,
      lastGradeCompleted: learner.lastGradeCompleted,
      schoolName: learner.schoolName || '',
      is4PsMember: learner.is4PsMember,
      isIP: learner.isIP,
      isPwd: learner.isPwd,
      pwdType: learner.pwdType || '',
      dateMapped: learner.dateMapped,
    }));
  }, [learners]);

  const reportRows = useMemo<ReportRow[]>(() => {
    return learners.map((l) => ({
      firstName: l.firstName,
      lastName: l.lastName,
      middleName: l.middleName,
      sex: l.sex,
      age: l.age,
      barangay: l.barangay,
      civilStatus: l.civilStatus,
      isBlp: l.isBlp,
      lastGradeCompleted: l.lastGradeCompleted,
      schoolName: l.schoolName || '',
      is4PsMember: l.is4PsMember,
      isIP: l.isIP,
      isPwd: l.isPwd,
      pwdType: l.pwdType || '',
      dateMapped: l.dateMapped,
    }));
  }, [learners]);

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
      else if (
        l.lastGradeCompleted?.includes('1st Year HS') ||
        l.lastGradeCompleted?.includes('2nd Year HS') ||
        l.lastGradeCompleted?.includes('3rd Year HS')
      ) {
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

  const getLearnerMunicipality = (learner: { barangay: string; municipality?: string }) => learner.municipality || barangayToMunicipality[learner.barangay] || getMunicipalityByBarangay(learner.barangay) || 'Unknown';
  const getLearnerDistrict = (learner: { barangay: string; municipality?: string; learnerDistrict?: string }) => learner.learnerDistrict || getDistrictByBarangay(learner.barangay, getLearnerMunicipality(learner) as any) || 'Unknown';

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
  const isJhsLearner = (learner: typeof learners[number]) => (
    learner.lastGradeCompleted?.includes('1st Year HS') ||
    learner.lastGradeCompleted?.includes('2nd Year HS') ||
    learner.lastGradeCompleted?.includes('3rd Year HS')
  ) && !learner.isBlp;
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

  const downloadPDF = (scope: DownloadScope, rows: ReportRow[]) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const title = 'ALS Learner Analytics Report';
    const subtitle = `Generated: ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}`;

    const summaryStats = rows.reduce(
      (acc, row) => {
        acc.total += 1;
        if (row.sex === 'Male') acc.male += 1;
        if (row.sex === 'Female') acc.female += 1;
        if (row.is4PsMember) acc.fourPs += 1;
        if (row.isIP) acc.ip += 1;
        if (row.isPwd) acc.pwd += 1;
        if (row.isBlp) acc.blp += 1;
        else if (row.lastGradeCompleted === 'G1 – G6 (Elementary)') acc.elementary += 1;
        else if (
          row.lastGradeCompleted?.includes('1st Year HS') ||
          row.lastGradeCompleted?.includes('2nd Year HS') ||
          row.lastGradeCompleted?.includes('3rd Year HS')
        ) {
          acc.jhs += 1;
        }
        if (row.age <= 24) acc.youth += 1;
        else if (row.age <= 59) acc.adult += 1;
        else acc.senior += 1;
        return acc;
      },
      {
        total: 0,
        male: 0,
        female: 0,
        fourPs: 0,
        ip: 0,
        pwd: 0,
        blp: 0,
        elementary: 0,
        jhs: 0,
        youth: 0,
        adult: 0,
        senior: 0,
      },
    );

    const addHeader = () => {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 14, 16);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, 14, 23);
    };

    if (scope === 'municipality') {
      addHeader();
      const grouped: Record<string, ReportRow[]> = {};
      rows.forEach((row) => {
        const municipality = barangayToMunicipality[row.barangay] ?? 'Unknown';
        if (!grouped[municipality]) grouped[municipality] = [];
        grouped[municipality].push(row);
      });

      let y = 28;
      municipalityOptions.forEach((municipality) => {
        const list = grouped[municipality] ?? [];
        if (y > 170) {
          doc.addPage();
          y = 14;
        }
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${municipality} (${list.length} learners)`, 14, y);
        y += 3;
        autoTable(doc, {
          startY: y,
          head: [['Barangay', 'Total Learners']],
          body: clusterCoverage
            .find((item) => item.municipality === municipality)
            ?.barangays.map((barangay) => [barangay, rows.filter((row) => row.barangay === barangay).length]) ?? [],
          styles: { fontSize: 8 },
          headStyles: { fillColor: [21, 101, 192] },
          margin: { top: 28 },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      });
      doc.save('als-learners-by-municipality.pdf');
      return;
    }

    if (scope === 'barangay') {
      addHeader();
      const grouped: Record<string, ReportRow[]> = {};
      rows.forEach((row) => {
        if (!grouped[row.barangay]) grouped[row.barangay] = [];
        grouped[row.barangay].push(row);
      });

      let y = 28;
      BARANGAY_OPTIONS.forEach((barangay) => {
        const list = grouped[barangay] ?? [];
        if (y > 170) {
          doc.addPage();
          y = 14;
        }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${barangay} (${list.length} learners)`, 14, y);
        y += 3;
        autoTable(doc, {
          startY: y,
          head: [['Full Name', 'Sex', 'Age', 'Municipality', 'Date Mapped']],
          body: list.map((row) => [
            `${row.lastName}, ${row.firstName}`,
            row.sex,
            row.age,
            barangayToMunicipality[row.barangay] ?? 'Unknown',
            formatDate(row.dateMapped),
          ]),
          styles: { fontSize: 7 },
          headStyles: { fillColor: [0, 137, 123] },
          margin: { top: 28 },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      });
      doc.save('als-learners-by-barangay.pdf');
      return;
    }

    if (scope === 'district') {
      addHeader();
      const grouped: Record<string, ReportRow[]> = {};
      rows.forEach((row) => {
        const municipality = barangayToMunicipality[row.barangay] ?? getMunicipalityByBarangay(row.barangay) ?? '';
        const district = getDistrictByBarangay(row.barangay, municipality as any) ?? 'Unknown';
        if (!grouped[district]) grouped[district] = [];
        grouped[district].push(row);
      });

      let y = 28;
      districtOptions.forEach((district) => {
        const list = grouped[district] ?? [];
        if (y > 170) {
          doc.addPage();
          y = 14;
        }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${district} (${list.length} learners)`, 14, y);
        y += 3;
        const districtRows = Object.entries(
          list.reduce<Record<string, { municipality: string; count: number }>>((acc, row) => {
            const municipality = barangayToMunicipality[row.barangay] ?? getMunicipalityByBarangay(row.barangay) ?? 'Unknown';
            const key = row.barangay;
            if (!acc[key]) acc[key] = { municipality, count: 0 };
            acc[key].count += 1;
            return acc;
          }, {}),
        ).map(([barangay, value]) => [barangay, value.municipality, value.count]);
        autoTable(doc, {
          startY: y,
          head: [['Barangay', 'Municipality', 'Learners']],
          body: districtRows,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [76, 29, 149] },
          margin: { top: 28 },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      });
      doc.save('als-learners-by-district.pdf');
      return;
    }

    if (scope === 'overall') {
      addHeader();
      const overallStats = rows.reduce(
        (acc, row) => {
          acc.total += 1;
          if (row.sex === 'Male') acc.male += 1;
          if (row.sex === 'Female') acc.female += 1;
          if (row.is4PsMember) acc.fourPs += 1;
          if (row.isIP) acc.ip += 1;
          if (row.isPwd) acc.pwd += 1;
          if (row.isBlp) acc.blp += 1;
          else if (row.lastGradeCompleted === 'G1 – G6 (Elementary)') acc.elementary += 1;
          else if (
            row.lastGradeCompleted?.includes('1st Year HS') ||
            row.lastGradeCompleted?.includes('2nd Year HS') ||
            row.lastGradeCompleted?.includes('3rd Year HS')
          ) {
            acc.jhs += 1;
          }
          return acc;
        },
        { total: 0, male: 0, female: 0, fourPs: 0, ip: 0, pwd: 0, blp: 0, elementary: 0, jhs: 0 },
      );

      autoTable(doc, {
        startY: 28,
        head: [['Category', 'Value']],
        body: [
          ['Total Learners', overallStats.total],
          ['Male', overallStats.male],
          ['Female', overallStats.female],
          ["4Ps Members", overallStats.fourPs],
          ['IP', overallStats.ip],
          ['PWD', overallStats.pwd],
          ['Elementary', overallStats.elementary],
          ['JHS', overallStats.jhs],
          ['BLP', overallStats.blp],
        ],
        styles: { fontSize: 10 },
        headStyles: { fillColor: [21, 101, 192] },
        columnStyles: { 1: { halign: 'center', fontStyle: 'bold' } },
      });
      doc.save('als-analytics-summary.pdf');
      return;
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

        <div style={HEADING_STYLE}>Download PDF Reports</div>
        <IonCard>
          <IonCardContent>
            <IonItem lines="none" style={{ '--background': '#F8FAFC', borderRadius: 12 } as React.CSSProperties}>
              <IonLabel position="stacked">Download Scope</IonLabel>
              <IonSelect
                value={downloadScope}
                interface="popover"
                onIonChange={(e) => setDownloadScope(e.detail.value as DownloadScope)}
              >
                <IonSelectOption value="overall">Overall</IonSelectOption>
                <IonSelectOption value="municipality">Municipality</IonSelectOption>
                <IonSelectOption value="district">District</IonSelectOption>
                <IonSelectOption value="barangay">Barangay</IonSelectOption>
              </IonSelect>
            </IonItem>
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <IonButton onClick={() => downloadPDF(downloadScope, filteredExportRows)} style={{ '--border-radius': '14px' } as React.CSSProperties}>
                <IonIcon slot="start" icon={downloadOutline} />
                Download PDF
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>

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
