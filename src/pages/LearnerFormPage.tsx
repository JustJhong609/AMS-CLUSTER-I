import React, { useEffect, useRef, useState } from 'react';
import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { checkmarkOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import StepIndicator from '../components/StepIndicator';
import AddressSection from '../components/form/AddressSection';
import EducationSection from '../components/form/EducationSection';
import FamilySection from '../components/form/FamilySection';
import LogisticsSection from '../components/form/LogisticsSection';
import PersonalInfoSection from '../components/form/PersonalInfoSection';
import { Learner, LearnerFormData } from '../types';
import { calculateAge, createEmptyFormData, formatTravelTime, generateId, parseTravelTime } from '../utils/helpers';
import { createLearner, updateLearner } from '../utils/learnerApi';
import { validateSection } from '../utils/validation';

const TOTAL_STEPS = 5;

const toYesNo = (value: boolean): string => (value ? 'Yes' : 'No');

const learnerToFormData = (learner: Learner): LearnerFormData => {
  const parsedTravelTime = parseTravelTime(learner.travelTime);

  return {
    region: learner.region,
    division: learner.division,
    district: learner.district,
    calendarYear: learner.calendarYear,
    mappedBy: learner.mappedBy,

    lastName: learner.lastName,
    firstName: learner.firstName,
    middleName: learner.middleName,
    nameExtension: learner.nameExtension ?? '',
    sex: learner.sex,
    civilStatus: learner.civilStatus,
    birthdate: learner.birthdate,
    age: String(learner.age),
    motherTongue: learner.motherTongue,
    motherTongueOther: '',
    isIP: toYesNo(learner.isIP),
    ipTribe: learner.ipTribe ?? '',
    religion: learner.religion ?? '',
    is4PsMember: toYesNo(learner.is4PsMember),
    fourPsOrIp: learner.fourPsOrIp ?? '',
    isPwd: toYesNo(learner.isPwd),
    pwdType: learner.pwdType ?? '',
    pwdTypeOther: learner.pwdTypeOther ?? '',

    municipality: learner.municipality,
    learnerDistrict: learner.learnerDistrict,
    barangay: learner.barangay,
    barangayOther: '',
    completeAddress: learner.completeAddress,

    roleInFamily: learner.roleInFamily,
    fatherName: learner.fatherName ?? '',
    motherName: learner.motherName ?? '',
    guardianName: learner.guardianName ?? '',
    guardianOccupation: learner.guardianOccupation ?? '',

    schoolName: learner.schoolName ?? '',
    currentlyStudying: learner.currentlyStudying,
    lastGradeCompleted: learner.lastGradeCompleted,
    reasonForNotAttending: learner.reasonForNotAttending,
    reasonForNotAttendingOther: learner.reasonForNotAttendingOther ?? '',
    isBlp: toYesNo(learner.isBlp),
    occupationType: learner.occupationType ?? '',
    employmentStatus: learner.employmentStatus ?? '',
    monthlyIncome: learner.monthlyIncome ?? '',
    interestedInALS: learner.interestedInALS,
    contactNumber: learner.contactNumber ?? '',

    distanceKm: String(learner.distanceKm),
    travelTime: parsedTravelTime.value,
    travelTimeUnit: parsedTravelTime.unit,
    transportMode: learner.transportMode,
    preferredSessionTime: learner.preferredSessionTime,
    dateMapped: learner.dateMapped,
  };
};

const LearnerFormPage: React.FC = () => {
  const { id } = useParams() as { id?: string };
  const { learners, setLearners, currentUserName } = useAppContext();
  const history = useHistory();
  const isEditMode = Boolean(id);
  const existingLearner = isEditMode ? learners.find((item) => item.id === id) : undefined;
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<LearnerFormData>(createEmptyFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef<HTMLIonContentElement>(null);

  useEffect(() => {
    if (!currentUserName.trim()) return;

    setFormData((prev) => (prev.mappedBy.trim() ? prev : { ...prev, mappedBy: currentUserName }));
  }, [currentUserName]);

  useEffect(() => {
    if (!isEditMode || !existingLearner) return;
    setFormData(learnerToFormData(existingLearner));
  }, [isEditMode, existingLearner]);

  useEffect(() => {
    if (!isEditMode) return;
    if (existingLearner) return;
    if (!learners.length) return;
    history.replace('/learners');
  }, [isEditMode, existingLearner, learners.length, history]);

  const handleChange = (field: keyof LearnerFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const goNext = () => {
    const result = validateSection(step, formData);
    if (!result.isValid) {
      setErrors(result.errors);
      contentRef.current?.scrollToTop(300);
      return;
    }

    setErrors({});
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
      contentRef.current?.scrollToTop(300);
    } else {
      setShowSaveAlert(true);
    }
  };

  const goBack = () => {
    if (step === 0) {
      history.goBack();
      return;
    }
    setErrors({});
    setStep(step - 1);
    contentRef.current?.scrollToTop(300);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    const OTHER_OPTION = 'Others (Please Specify)';
    const resolvedMotherTongue =
      formData.motherTongue === OTHER_OPTION && formData.motherTongueOther.trim()
        ? formData.motherTongueOther.trim()
        : formData.motherTongue;
    const resolvedBarangay =
      formData.barangay === OTHER_OPTION && formData.barangayOther.trim()
        ? formData.barangayOther.trim()
        : formData.barangay;
    const resolvedMunicipality = formData.municipality as Learner['municipality'];

    const learner: Learner = {
      id: existingLearner?.id ?? generateId(),
      region: formData.region,
      division: formData.division,
      district: formData.district,
      calendarYear: formData.calendarYear,
      mappedBy: formData.mappedBy.trim(),
      lastName: formData.lastName.trim(),
      firstName: formData.firstName.trim(),
      middleName: formData.middleName.trim(),
      nameExtension: formData.nameExtension.trim() || undefined,
      sex: formData.sex as 'Male' | 'Female',
      civilStatus: formData.civilStatus,
      birthdate: formData.birthdate,
      age: calculateAge(formData.birthdate),
      motherTongue: resolvedMotherTongue,
      isIP: formData.isIP === 'Yes',
      ipTribe: formData.ipTribe.trim() || undefined,
      religion: formData.religion.trim() || undefined,
      is4PsMember: formData.is4PsMember === 'Yes',
      fourPsOrIp: formData.fourPsOrIp || undefined,
      isPwd: formData.isPwd === 'Yes',
      pwdType: formData.pwdType || undefined,
      pwdTypeOther: formData.pwdTypeOther.trim() || undefined,
      municipality: resolvedMunicipality,
      learnerDistrict: formData.learnerDistrict,
      barangay: resolvedBarangay,
      completeAddress: formData.completeAddress.trim(),
      roleInFamily: formData.roleInFamily,
      fatherName: formData.fatherName.trim() || undefined,
      motherName: formData.motherName.trim() || undefined,
      guardianName: formData.guardianName.trim() || undefined,
      guardianOccupation: formData.guardianOccupation.trim() || undefined,
      schoolName: formData.schoolName.trim() || undefined,
      currentlyStudying: formData.currentlyStudying || 'No',
      lastGradeCompleted: formData.lastGradeCompleted,
      reasonForNotAttending: formData.reasonForNotAttending,
      reasonForNotAttendingOther: formData.reasonForNotAttendingOther.trim() || undefined,
      isBlp: formData.isBlp === 'Yes',
      occupationType: formData.occupationType || undefined,
      employmentStatus: formData.employmentStatus || undefined,
      monthlyIncome: formData.monthlyIncome.trim() || undefined,
      interestedInALS: formData.interestedInALS || 'No',
      contactNumber: formData.contactNumber.trim() || undefined,
      distanceKm: parseFloat(formData.distanceKm),
      travelTime: formatTravelTime(formData.travelTime, formData.travelTimeUnit),
      transportMode: formData.transportMode,
      preferredSessionTime: formData.preferredSessionTime,
      dateMapped: formData.dateMapped
    };

    try {
      if (isEditMode) {
        const updatedLearner = await updateLearner(learner);
        setLearners((prev) => prev.map((item) => (item.id === updatedLearner.id ? updatedLearner : item)));
      } else {
        const savedLearner = await createLearner(learner);
        setLearners((prev) => [savedLearner, ...prev]);
      }
      setShowSaveAlert(false);
      history.replace('/learners');
    } catch (error: any) {
      setShowSaveAlert(false);
      setSaveError(error?.message || 'Failed to save learner. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const sectionProps = { data: formData, errors, onChange: handleChange };
  const sections = [
    <PersonalInfoSection {...sectionProps} />,
    <EducationSection {...sectionProps} />,
    <AddressSection {...sectionProps} />,
    <FamilySection {...sectionProps} />,
    <LogisticsSection {...sectionProps} />
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/learners" />
          </IonButtons>
          <IonTitle>{isEditMode ? 'Edit Learner' : 'New Learner'}</IonTitle>
        </IonToolbar>
        <StepIndicator currentStep={step} />
      </IonHeader>

      <IonContent ref={contentRef} className="ion-padding">
        {sections[step]}
        <div style={{ height: 24 }} />
      </IonContent>

      <IonFooter>
        <IonToolbar style={{ padding: '10px 16px', '--background': '#fff', '--border-width': '0', boxShadow: '0 -1px 0 #F1F5F9' } as any}>
          <div style={{ display: 'flex', gap: 10 }}>
            <IonButton
              expand="block"
              fill="outline"
              onClick={goBack}
              disabled={isSaving}
              style={{ flex: 1, '--border-radius': '50px', '--border-color': '#CBD5E1', '--color': '#374151', '--background': '#F8FAFC', height: 48, fontWeight: 700 } as any}
            >
              <IonIcon slot="start" icon={chevronBackOutline} />
              {step === 0 ? 'Cancel' : 'Back'}
            </IonButton>
            <IonButton
              expand="block"
              onClick={goNext}
              disabled={isSaving}
              style={{ flex: 2, '--border-radius': '50px', '--background': 'linear-gradient(135deg,#1976d2 0%,#1565C0 60%,#0d47a1 100%)', '--box-shadow': '0 6px 20px rgba(21,101,192,0.38)', height: 48, fontWeight: 800 } as any}
            >
              {step === TOTAL_STEPS - 1 ? (
                <>
                  <IonIcon slot="start" icon={checkmarkOutline} /> Save Learner
                </>
              ) : (
                <>
                  Next <IonIcon slot="end" icon={chevronForwardOutline} />
                </>
              )}
            </IonButton>
          </div>
        </IonToolbar>
      </IonFooter>

      <IonAlert
        isOpen={showSaveAlert}
        onDidDismiss={() => setShowSaveAlert(false)}
        header={isEditMode ? 'Update Learner' : 'Save Learner'}
        message={`${isEditMode ? 'Update' : 'Save'} ${formData.firstName} ${formData.lastName}'s record?`}
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          { text: isEditMode ? 'Update' : 'Save', handler: handleSave }
        ]}
      />

      <IonAlert isOpen={!!saveError} onDidDismiss={() => setSaveError('')} header={isEditMode ? 'Update Failed' : 'Save Failed'} message={saveError} buttons={['OK']} />

      <IonLoading isOpen={isSaving} message={isEditMode ? 'Updating learner record...' : 'Saving learner record...'} spinner="crescent" />
    </IonPage>
  );
};

export default LearnerFormPage;
