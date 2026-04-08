import React, { useEffect, useMemo, useState } from 'react';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { logOutOutline, peopleOutline, statsChartOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../utils/supabase';

type ProfileRole = 'mapper' | 'admin' | 'superadmin';

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: ProfileRole;
  created_at: string;
};

type LearnerOwnerRow = {
  created_by: string;
};

const SuperAdminPage: React.FC = () => {
  const history = useHistory();
  const { currentUserId } = useAppContext();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [mappedCounts, setMappedCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState('');
  const [error, setError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const loadDashboard = async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [{ data: profileData, error: profileError }, { data: learnerData, error: learnerError }] = await Promise.all([
        supabase.from('app_profiles').select('id,email,full_name,role,created_at').order('created_at', { ascending: false }),
        supabase.from('learners').select('created_by'),
      ]);

      if (profileError) throw profileError;
      if (learnerError) throw learnerError;

      const learnerRows = (learnerData ?? []) as LearnerOwnerRow[];
      const counts = learnerRows.reduce<Record<string, number>>((acc, row) => {
        if (!row.created_by) return acc;
        acc[row.created_by] = (acc[row.created_by] || 0) + 1;
        return acc;
      }, {});

      setProfiles((profileData ?? []) as ProfileRow[]);
      setMappedCounts(counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load super admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const totalLearnersMapped = useMemo(
    () => Object.values(mappedCounts).reduce((sum, count) => sum + count, 0),
    [mappedCounts],
  );

  const facilitators = useMemo(
    () => profiles.filter((profile) => profile.role === 'mapper' || profile.role === 'admin'),
    [profiles],
  );

  const sortedByMapped = useMemo(
    () => [...profiles].sort((a, b) => (mappedCounts[b.id] || 0) - (mappedCounts[a.id] || 0)),
    [profiles, mappedCounts],
  );

  const handleRoleChange = async (userId: string, role: ProfileRole) => {
    if (!supabase) return;
    setSavingUserId(userId);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('app_profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) throw updateError;

      setProfiles((prev) => prev.map((item) => (item.id === userId ? { ...item, role } : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update user role.');
    } finally {
      setSavingUserId('');
    }
  };

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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Super Admin</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout} disabled={isLoggingOut}>
              <IonIcon slot="icon-only" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <IonIcon icon={peopleOutline} style={{ fontSize: 20, color: '#1d4ed8' }} />
              <strong>Registered Facilitators</strong>
            </div>
            <IonText color="medium">
              <p style={{ margin: 0 }}>{facilitators.length} facilitators are currently registered.</p>
            </IonText>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <IonIcon icon={statsChartOutline} style={{ fontSize: 20, color: '#0f766e' }} />
              <strong>Mapping Analytics</strong>
            </div>
            <IonText color="medium">
              <p style={{ margin: 0 }}>Total learners mapped so far: {totalLearnersMapped}</p>
            </IonText>
          </IonCardContent>
        </IonCard>

        {error && (
          <IonText color="danger">
            <p>{error}</p>
          </IonText>
        )}

        <IonCard>
          <IonCardContent>
            <h3 style={{ marginTop: 0 }}>Manage Users</h3>
            {loading ? (
              <IonText color="medium">
                <p>Loading users...</p>
              </IonText>
            ) : (
              <IonList lines="full">
                {profiles.map((profile) => {
                  const mapped = mappedCounts[profile.id] || 0;
                  const isSelf = profile.id === currentUserId;

                  return (
                    <IonItem key={profile.id}>
                      <IonLabel>
                        <h2>{profile.full_name || profile.email || 'Unnamed User'}</h2>
                        <p>{profile.email || 'No email'}</p>
                        <p>Learners mapped: {mapped}</p>
                        <IonChip color={profile.role === 'superadmin' ? 'danger' : profile.role === 'admin' ? 'warning' : 'medium'}>
                          <IonLabel>{profile.role}</IonLabel>
                        </IonChip>
                      </IonLabel>
                      <IonSelect
                        interface="popover"
                        value={profile.role}
                        disabled={savingUserId === profile.id || isSelf}
                        onIonChange={(e) => handleRoleChange(profile.id, e.detail.value as ProfileRole)}
                        style={{ minWidth: 150 }}
                      >
                        <IonSelectOption value="mapper">Mapper</IonSelectOption>
                        <IonSelectOption value="admin">Admin</IonSelectOption>
                        <IonSelectOption value="superadmin">Super Admin</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                  );
                })}
              </IonList>
            )}
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardContent>
            <h3 style={{ marginTop: 0 }}>Mapped Learners by User</h3>
            {loading ? (
              <IonText color="medium">
                <p>Loading analytics...</p>
              </IonText>
            ) : (
              <IonList lines="full">
                {sortedByMapped.map((profile) => (
                  <IonItem key={`${profile.id}-mapped`}>
                    <IonLabel>
                      <h2>{profile.full_name || profile.email || 'Unnamed User'}</h2>
                      <p>{profile.email || 'No email'}</p>
                    </IonLabel>
                    <IonChip color="primary">
                      <IonLabel>{mappedCounts[profile.id] || 0}</IonLabel>
                    </IonChip>
                  </IonItem>
                ))}
              </IonList>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default SuperAdminPage;