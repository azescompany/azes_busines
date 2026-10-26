/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/features/login/AuthFormCard.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-05
 * ║ Updated: 2026-10-19
 * ║ Purpose: Login form surface inside chrome canvas (no nested card)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  Alert,
  AlertTitle,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Link,
  MuiBox,
  MuiButton,
  Typography,
  useTheme,
} from '@azes/ui-web';
import { AzesForm, useForm } from '@azes/ui-web/forms';
import { IconCheck, IconLock, IconPerson } from '@azes/ui-web/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, type ReactNode } from 'react';

import { AuthTextField } from './AuthTextField.js';
import type { LoginSuccessPhase } from './hooks/useLoginSuccessTransition.js';
import { LoginSecurityNotice } from './LoginSecurityNotice.js';
import { loginSchema, type LoginFormValues } from './loginSchema.js';

export type TransitionPhase = LoginSuccessPhase;

export type AuthFormCardCopy = {
  brandName: string;
  welcome: string;
  title: string;
  username: string;
  password: string;
  forgotPassword: string;
  rememberDevice: string;
  showPassword: string;
  hidePassword: string;
  capsLock: string;
  submit: string;
  submitting: string;
  sessionEnded: string;
  successTitle: string;
  errorsGeneric: string;
  securityTitle: string;
  securityDetails: string;
  securityMore: string;
  securityLess: string;
  securityDeviceId: string;
};

export type AuthFormCardProps = {
  copy: AuthFormCardCopy;
  formError: string | null;
  logoutReason: string | null;
  isPending: boolean;
  transitionPhase: TransitionPhase;
  shakeToken: number;
  autoFocusUsername: boolean;
  onSubmit: (values: LoginFormValues) => Promise<void>;
};

const REMEMBER_KEY = 'azes.account.remember_username';

function StaggerItem({ index, children }: { index: number; children: ReactNode }) {
  return (
    <MuiBox
      className="azes-login-stagger-item"
      sx={{ ['--azes-stagger-i' as string]: index, width: '100%' }}
    >
      {children}
    </MuiBox>
  );
}

export function AuthFormCard({
  copy,
  formError,
  logoutReason,
  isPending,
  transitionPhase,
  shakeToken,
  autoFocusUsername,
  onSubmit,
}: AuthFormCardProps) {
  const theme = useTheme();
  const shell = theme.azes.loginShell;
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [shake, setShake] = useState(false);
  const busy = transitionPhase !== 'idle';
  const hideForm =
    transitionPhase === 'expanding' ||
    transitionPhase === 'scattering' ||
    transitionPhase === 'settled' ||
    transitionPhase === 'hold' ||
    transitionPhase === 'exiting' ||
    transitionPhase === 'redirecting';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { userName: '', password: '' },
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        form.setValue('userName', saved);
        setRemember(true);
      }
    } catch {
      // private mode
    }
  }, [form]);

  useEffect(() => {
    if (!shakeToken) return;
    setShake(true);
    const timer = window.setTimeout(() => setShake(false), shell.shakeDurationMs);
    return () => window.clearTimeout(timer);
  }, [shakeToken, shell.shakeDurationMs]);

  async function handleSubmit(values: LoginFormValues) {
    if (busy) return;
    try {
      if (remember) {
        localStorage.setItem(REMEMBER_KEY, values.userName);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
    } catch {
      // ignore
    }
    await onSubmit(values);
  }

  return (
    <MuiBox
      className={[
        'azes-login-stagger',
        shake ? 'azes-login-shake' : '',
        transitionPhase === 'collapsing' ? 'azes-login-form-fade' : '',
        hideForm ? 'azes-login-form-hidden' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-busy={busy || isPending || undefined}
      sx={{
        width: '100%',
        maxWidth: theme.spacing(shell.formMaxWidthSpacing),
        mx: 'auto',
        textAlign: 'start',
        pointerEvents: busy ? 'none' : 'auto',
        opacity: hideForm ? 0 : 1,
        color: theme.vars.palette.text.primary,
      }}
    >
      <StaggerItem index={0}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 700, mb: 0.75, textAlign: 'center' }}
        >
          {copy.title}
        </Typography>
      </StaggerItem>
      <StaggerItem index={1}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          {copy.welcome}
        </Typography>
      </StaggerItem>

      {logoutReason ? (
        <Alert
          severity="warning"
          sx={{
            mb: 2,
            width: '100%',
            maxWidth: '100%',
            alignItems: 'flex-start',
            '& .MuiAlert-message': {
              minWidth: 0,
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
            },
          }}
        >
          <AlertTitle>{copy.sessionEnded}</AlertTitle>
          {logoutReason}
        </Alert>
      ) : null}

      {formError ? (
        <Alert
          severity="error"
          role="alert"
          sx={{
            mb: 2,
            width: '100%',
            maxWidth: '100%',
            alignItems: 'flex-start',
            '& .MuiAlert-message': {
              minWidth: 0,
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
              typography: { xs: 'body2', sm: 'body1' },
            },
          }}
        >
          <AlertTitle sx={{ typography: { xs: 'subtitle2', sm: 'subtitle1' } }}>
            {copy.errorsGeneric}
          </AlertTitle>
          {formError}
        </Alert>
      ) : null}

      <AzesForm
        form={form}
        aria-labelledby={undefined}
        aria-label={copy.title}
        onSubmit={handleSubmit}
      >
        <StaggerItem index={2}>
          <AuthTextField<LoginFormValues>
            name="userName"
            label={copy.username}
            autoComplete="username"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoFocus={autoFocusUsername}
            disabled={isPending || busy}
            sx={{ mb: 2 }}
            startIcon={<IconPerson fontSize="small" aria-hidden />}
          />
        </StaggerItem>
        <StaggerItem index={3}>
          <AuthTextField<LoginFormValues>
            name="password"
            label={copy.password}
            autoComplete="current-password"
            spellCheck={false}
            disabled={isPending || busy}
            sx={{ mb: 1.5 }}
            startIcon={<IconLock fontSize="small" aria-hidden />}
            showPasswordToggle
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((v) => !v)}
            showPasswordLabel={copy.showPassword}
            hidePasswordLabel={copy.hidePassword}
            capsLockWarning={copy.capsLock}
          />
        </StaggerItem>

        <StaggerItem index={4}>
          <MuiBox
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              flexWrap: 'wrap',
              mb: 2.5,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={remember}
                  onChange={(_, checked) => setRemember(checked)}
                  disabled={isPending || busy}
                  size="small"
                />
              }
              label={copy.rememberDevice}
              sx={{
                m: 0,
                '& .MuiFormControlLabel-label': { typography: 'body2', fontWeight: 500 },
              }}
            />
            <Link
              component="button"
              type="button"
              underline="hover"
              color="primary"
              disabled={isPending || busy}
              onClick={(event) => event.preventDefault()}
              sx={{ typography: 'body2', fontWeight: 600 }}
            >
              {copy.forgotPassword}
            </Link>
          </MuiBox>
        </StaggerItem>

        <StaggerItem index={5}>
          <MuiButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isPending || busy}
            className="azes-login-btn-shine"
            aria-busy={isPending || undefined}
            sx={{
              minHeight: theme.azes.component.controlHeight[theme.azes.density] + 8,
              borderRadius: `${theme.shape.radiusMd}px`,
              fontWeight: 600,
              position: 'relative',
              overflow: 'hidden',
            }}
            startIcon={
              busy ? (
                <IconCheck fontSize="small" className="azes-login-btn-check" aria-hidden />
              ) : isPending ? (
                <CircularProgress size={theme.spacing(2.5)} color="inherit" aria-hidden />
              ) : undefined
            }
          >
            {busy ? copy.successTitle : isPending ? copy.submitting : copy.submit}
          </MuiButton>
        </StaggerItem>
      </AzesForm>

      <StaggerItem index={6}>
        <LoginSecurityNotice
          title={copy.securityTitle}
          details={copy.securityDetails}
          moreLabel={copy.securityMore}
          lessLabel={copy.securityLess}
          deviceIdLabel={copy.securityDeviceId}
          disabled={isPending || busy}
        />
      </StaggerItem>
    </MuiBox>
  );
}

/** @deprecated Prefer AuthFormCard — kept as alias during login UI rename. */
export const LoginCard = AuthFormCard;
