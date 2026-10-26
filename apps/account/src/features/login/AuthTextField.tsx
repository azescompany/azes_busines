/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/features/login/AuthTextField.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-06
 * ║ Updated: 2026-10-11
 * ║ Purpose: Login field — static label above outlined input (no notch)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  MuiBox,
  TextField,
  useTheme,
} from '@azes/ui-web';
import { useController, type FieldPath, type FieldValues } from '@azes/ui-web/forms';
import { IconVisibility, IconVisibilityOff } from '@azes/ui-web/icons';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

export type AuthTextFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  type?: string;
  autoComplete?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  required?: boolean;
  spellCheck?: boolean;
  autoCapitalize?: string;
  autoCorrect?: string;
  startIcon?: ReactNode;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
  capsLockWarning?: string;
  sx?: object;
};

export function AuthTextField<T extends FieldValues>({
  name,
  label,
  type = 'text',
  autoComplete,
  disabled,
  autoFocus,
  required = true,
  spellCheck,
  autoCapitalize,
  autoCorrect,
  startIcon,
  showPasswordToggle,
  showPassword,
  onTogglePassword,
  showPasswordLabel = 'Show password',
  hidePasswordLabel = 'Hide password',
  capsLockWarning,
  sx,
}: AuthTextFieldProps<T>) {
  const theme = useTheme();
  const reactId = useId();
  const inputId = `${String(name)}-${reactId}`;
  const labelId = `${inputId}-label`;
  const { field, fieldState } = useController<T>({ name });
  const error = Boolean(fieldState.error);
  const message = fieldState.error?.message;
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;
  const [iconPop, setIconPop] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const wasFocused = useRef(false);
  const controlH = theme.azes.component.controlHeight[theme.azes.density] + 8;
  const shell = theme.azes.loginShell;
  const surface = `color-mix(in srgb, ${theme.vars.palette.text.primary} 4%, ${theme.vars.palette.background.paper})`;
  const surfaceHover = `color-mix(in srgb, ${theme.vars.palette.text.primary} 5%, ${theme.vars.palette.background.paper})`;

  useEffect(() => {
    if (!iconPop) return undefined;
    const timer = window.setTimeout(() => setIconPop(false), shell.shakeDurationMs);
    return () => window.clearTimeout(timer);
  }, [iconPop, shell.shakeDurationMs]);

  return (
    <MuiBox>
      <InputLabel
        id={labelId}
        htmlFor={inputId}
        required={required}
        error={error}
        sx={{
          position: 'static',
          transform: 'none',
          mb: 0.75,
          typography: 'body2',
          fontWeight: 600,
          color: theme.vars.palette.text.primary,
          '&.Mui-focused': { color: theme.vars.palette.text.primary },
          '&.Mui-error': { color: theme.vars.palette.error.main },
          '& .MuiInputLabel-asterisk': {
            color: error ? theme.vars.palette.error.main : theme.vars.palette.primary.main,
          },
        }}
      >
        {label}
      </InputLabel>
      <TextField
        fullWidth
        size="medium"
        variant="outlined"
        hiddenLabel
        id={inputId}
        name={field.name}
        type={inputType}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        value={field.value ?? ''}
        onChange={field.onChange}
        onBlur={() => {
          wasFocused.current = false;
          setCapsLockOn(false);
          field.onBlur();
        }}
        onFocus={() => {
          if (!wasFocused.current) {
            wasFocused.current = true;
            setIconPop(true);
          }
        }}
        onKeyUp={(event) => {
          if (!showPasswordToggle || !capsLockWarning) return;
          setCapsLockOn(event.getModifierState('CapsLock'));
        }}
        onKeyDown={(event) => {
          if (!showPasswordToggle || !capsLockWarning) return;
          setCapsLockOn(event.getModifierState('CapsLock'));
        }}
        inputRef={field.ref}
        disabled={disabled}
        error={error}
        helperText={message}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: controlH,
            borderRadius: `${theme.shape.radiusMd}px`,
            backgroundColor: surface,
            pl: 1.5,
            typography: 'body1',
            transition: theme.transitions.create(['background-color'], {
              duration: shell.formFadeDurationMs,
            }),
            '&:hover': { backgroundColor: surfaceHover },
            '&.Mui-focused': {
              backgroundColor: theme.vars.palette.background.paper,
              boxShadow: `0 0 0 ${theme.spacing(0.25)} color-mix(in srgb, ${theme.vars.palette.border.focus} 28%, transparent)`,
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
                borderColor: theme.vars.palette.border.focus,
              },
              '& .MuiInputAdornment-root': { color: theme.vars.palette.primary.main },
            },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.vars.palette.error.main,
            },
          },
          '& .MuiOutlinedInput-input': {
            py: 0,
            height: controlH,
            boxSizing: 'border-box',
            typography: 'body1',
            fontSize: theme.typography.body1.fontSize,
            lineHeight: theme.typography.body1.lineHeight,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            legend: { display: 'none' },
          },
          '& .MuiInputAdornment-root': {
            color: theme.vars.palette.text.secondary,
            marginInlineEnd: 1,
          },
          '& .MuiFormHelperText-root': { mx: 0.5 },
          '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus':
            {
              WebkitBoxShadow: `0 0 0 100px ${surface} inset`,
              WebkitTextFillColor: theme.vars.palette.text.primary,
              caretColor: theme.vars.palette.text.primary,
            },
          ...sx,
        }}
        slotProps={{
          input: {
            startAdornment: startIcon ? (
              <InputAdornment
                position="start"
                className={iconPop ? 'azes-login-icon-pop' : undefined}
              >
                {startIcon}
              </InputAdornment>
            ) : undefined,
            endAdornment:
              showPasswordToggle && onTogglePassword ? (
                <InputAdornment position="end">
                  <IconButton
                    type="button"
                    edge="end"
                    size="small"
                    aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
                    onClick={onTogglePassword}
                    disabled={disabled}
                    disableRipple
                    sx={{
                      width: theme.spacing(5),
                      height: theme.spacing(5),
                      bgcolor: 'transparent',
                      '&:hover': { bgcolor: 'transparent' },
                    }}
                  >
                    {showPassword ? (
                      <IconVisibilityOff fontSize="small" />
                    ) : (
                      <IconVisibility fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ) : undefined,
          },
          htmlInput: {
            'aria-invalid': error || undefined,
            spellCheck: spellCheck === false ? false : spellCheck,
            autoCapitalize,
            autoCorrect,
          },
        }}
      />
      {capsLockOn && capsLockWarning ? (
        <FormHelperText sx={{ mx: 0.5, color: 'warning.main' }}>{capsLockWarning}</FormHelperText>
      ) : null}
    </MuiBox>
  );
}
