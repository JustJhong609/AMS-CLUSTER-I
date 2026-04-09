import React, { useEffect, useMemo, useState } from 'react';
import { IonButton, IonContent, IonIcon, IonPage, IonSpinner } from '@ionic/react';
import { checkmarkCircle, closeCircle, phonePortraitOutline } from 'ionicons/icons';
import type { EmailOtpType } from '@supabase/supabase-js';
import { useHistory } from 'react-router-dom';
import { supabase } from '../utils/supabase.ts';

type ConfirmationStatus = 'verifying' | 'success' | 'error';

const VALID_OTP_TYPES: EmailOtpType[] = ['signup', 'invite', 'magiclink', 'recovery', 'email', 'email_change'];

const ConfirmEmailPage: React.FC = () => {
  const history = useHistory();
  const [status, setStatus] = useState<ConfirmationStatus>('verifying');
  const [message, setMessage] = useState('Confirming your email...');

  const buttonLabel = useMemo(() => {
    if (status === 'success') return 'Back to App';
    if (status === 'verifying') return 'Please wait...';
    return 'Go to Sign In';
  }, [status]);

  useEffect(() => {
    let active = true;

    const verifyEmailConfirmation = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const tokenHash = searchParams.get('token_hash');
      const rawType = searchParams.get('type');
      const otpType = rawType && VALID_OTP_TYPES.includes(rawType as EmailOtpType) ? (rawType as EmailOtpType) : 'email';

      if (!tokenHash) {
        if (!active) return;
        setStatus('error');
        setMessage('Invalid confirmation link. Request a new confirmation email and try again.');
        return;
      }

      if (!supabase) {
        if (!active) return;
        setStatus('error');
        setMessage('App configuration is incomplete. Please contact support.');
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: otpType,
      });

      if (!active) return;

      if (error) {
        setStatus('error');
        setMessage(error.message || 'Email confirmation failed. Please request a new link.');
        return;
      }

      await supabase.auth.signOut().catch(() => {
        // Ignore sign-out failures; the confirmation step already completed.
      });

      setStatus('success');
      setMessage('Email confirmed successfully. You can now sign in.');
    };

    void verifyEmailConfirmation();

    return () => {
      active = false;
    };
  }, []);

  const handleBackToApp = () => {
    history.replace('/sign-in');
  };

  return (
    <IonPage>
      <IonContent className="auth-page" style={{ '--background': 'linear-gradient(152deg, #081a3a 0%, #0f3b7a 35%, #1458a8 66%, #0a214f 100%)' } as React.CSSProperties}>
        <style>{`
          .confirm-shell {
            min-height: 100%;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 18px;
            overflow: hidden;
          }

          .confirm-bg-pattern {
            position: absolute;
            inset: 0;
            background-image:
              radial-gradient(circle at 14% 18%, rgba(255,255,255,0.14) 0%, transparent 31%),
              radial-gradient(circle at 80% 14%, rgba(96,165,250,0.18) 0%, transparent 28%),
              radial-gradient(circle at 74% 85%, rgba(30,64,175,0.18) 0%, transparent 30%),
              radial-gradient(circle at 24% 82%, rgba(14,165,233,0.16) 0%, transparent 24%);
            z-index: 0;
          }

          .confirm-popup {
            position: relative;
            z-index: 1;
            width: min(92vw, 430px);
            border-radius: 28px;
            padding: 30px 22px 24px;
            background: rgba(255, 255, 255, 0.92);
            border: 1px solid rgba(255, 255, 255, 0.55);
            box-shadow:
              0 26px 60px rgba(4, 14, 34, 0.28),
              inset 0 1px 0 rgba(255, 255, 255, 0.68);
            backdrop-filter: blur(16px) saturate(130%);
            text-align: center;
            animation: confirmPopupIn 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
          }

          .confirm-icon-wrap {
            width: 74px;
            height: 74px;
            margin: 0 auto 16px;
            border-radius: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(160deg, #eff6ff 0%, #dbeafe 100%);
            box-shadow: 0 12px 30px rgba(29, 78, 216, 0.18);
            animation: confirmIconFloat 2.4s ease-in-out infinite;
          }

          .confirm-title {
            margin: 0;
            color: #0f172a;
            font-size: clamp(24px, 6vw, 28px);
            line-height: 1.18;
            font-weight: 900;
            letter-spacing: -0.35px;
          }

          .confirm-message {
            margin: 12px 0 0;
            color: #334155;
            font-size: 14px;
            line-height: 1.65;
          }

          .confirm-action {
            margin-top: 22px;
            --border-radius: 16px;
            --padding-top: 14px;
            --padding-bottom: 14px;
            --box-shadow: 0 12px 28px rgba(29, 78, 216, 0.34);
            --background: linear-gradient(135deg, #5fa5ff 0%, #3276eb 52%, #1d4ed8 100%);
            letter-spacing: 0.18px;
            font-weight: 700;
          }

          .confirm-action[disabled] {
            --box-shadow: none;
            opacity: 0.72;
          }

          .confirm-status {
            width: 24px;
            height: 24px;
            margin: 0 auto;
          }

          @keyframes confirmPopupIn {
            0% {
              opacity: 0;
              transform: translateY(16px) scale(0.96);
              filter: blur(4px);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0);
            }
          }

          @keyframes confirmIconFloat {
            0% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-4px);
            }
            100% {
              transform: translateY(0px);
            }
          }
        `}</style>

        <div className="confirm-shell">
          <div className="confirm-bg-pattern" />

          <div className="confirm-popup">
            <div className="confirm-icon-wrap" aria-hidden="true">
              {status === 'verifying' && <IonSpinner className="confirm-status" name="crescent" color="primary" />}
              {status === 'success' && <IonIcon icon={checkmarkCircle} style={{ fontSize: 44, color: '#16a34a' }} />}
              {status === 'error' && <IonIcon icon={closeCircle} style={{ fontSize: 44, color: '#dc2626' }} />}
            </div>

            <h1 className="confirm-title">
              {status === 'success' ? 'Email Confirmed' : status === 'error' ? 'Confirmation Failed' : 'Verifying Email'}
            </h1>
            <p className="confirm-message">{message}</p>

            <IonButton className="confirm-action" expand="block" disabled={status === 'verifying'} onClick={handleBackToApp}>
              <IonIcon slot="start" icon={phonePortraitOutline} />
              {status === 'success' ? 'Back to Sign In' : buttonLabel}
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ConfirmEmailPage;
