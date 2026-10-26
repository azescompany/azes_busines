/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/forms/AzesForm.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: react-hook-form bound form, text field, section and actions
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useId, useState, type ReactNode } from 'react';
import {
  Controller,
  FormProvider,
  useFormContext,
  type FieldErrors,
  type FieldPath,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form';

export type AzesFormProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  'aria-label'?: string;
  /** Builds the summary text after a failed submit. */
  errorSummary?: (count: number) => string;
  children: ReactNode;
};

const defaultSummary = (count: number) =>
  count === 1 ? '1 field needs attention.' : `${count} fields need attention.`;

function countErrors(errors: FieldErrors): number {
  return Object.values(errors).reduce<number>((total, value) => {
    if (!value) return total;
    if ('message' in value || 'type' in value) return total + 1;
    return total + countErrors(value as FieldErrors);
  }, 0);
}

export function AzesForm<T extends FieldValues>({
  form,
  onSubmit,
  'aria-label': ariaLabel,
  errorSummary = defaultSummary,
  children,
}: AzesFormProps<T>) {
  const [summary, setSummary] = useState('');

  const submit = form.handleSubmit(
    async (values, event) => {
      setSummary('');
      await onSubmit(values, event);
    },
    (errors) => {
      setSummary(errorSummary(countErrors(errors)));
    },
  );

  return (
    <FormProvider {...form}>
      <Box component="form" noValidate aria-label={ariaLabel} onSubmit={submit}>
        <Box
          role="status"
          aria-live="polite"
          sx={(theme) => ({
            ...theme.typography.body2,
            color: theme.vars.palette.error.main,
            marginBlockEnd: summary ? theme.spacing(4) : 0,
          })}
        >
          {summary}
        </Box>
        {children}
      </Box>
    </FormProvider>
  );
}

export type AzesFormTextFieldProps<T extends FieldValues> = Omit<
  TextFieldProps,
  'name' | 'value' | 'defaultValue' | 'error'
> & {
  name: FieldPath<T>;
};

export function AzesFormTextField<T extends FieldValues>({
  name,
  helperText,
  onBlur: onBlurProp,
  onChange: onChangeProp,
  ...props
}: AzesFormTextFieldProps<T>) {
  const { control } = useFormContext<T>();
  const helperId = useId();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const message = fieldState.error?.message ?? helperText;
        return (
          <TextField
            fullWidth
            {...props}
            name={field.name}
            value={field.value ?? ''}
            inputRef={field.ref}
            onChange={(event) => {
              field.onChange(event);
              onChangeProp?.(event);
            }}
            onBlur={(event) => {
              field.onBlur();
              onBlurProp?.(event);
            }}
            error={Boolean(fieldState.error)}
            helperText={message}
            slotProps={{
              ...props.slotProps,
              formHelperText: { id: helperId },
              htmlInput: {
                ...(props.slotProps?.htmlInput as object | undefined),
                'aria-invalid': fieldState.error ? true : undefined,
                'aria-describedby': message ? helperId : undefined,
              },
            }}
          />
        );
      }}
    />
  );
}

export type AzesFormSectionProps = { title: string; description?: string; children: ReactNode };

export function AzesFormSection({ title, description, children }: AzesFormSectionProps) {
  const titleId = useId();
  const descriptionId = useId();
  return (
    <Box
      role="group"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      sx={{ marginBlockEnd: 6 }}
    >
      <Typography id={titleId} component="h2" variant="subtitle1">
        {title}
      </Typography>
      {description ? (
        <Typography id={descriptionId} variant="body2" color="text.secondary">
          {description}
        </Typography>
      ) : null}
      <Stack sx={{ gap: 4, marginBlockStart: 4 }}>{children}</Stack>
    </Box>
  );
}

export type AzesFormActionsProps = { submitLabel: string; resetLabel?: string };

export function AzesFormActions({ submitLabel, resetLabel }: AzesFormActionsProps) {
  const { formState, reset } = useFormContext();
  const pending = formState.isSubmitting;
  return (
    <Stack direction="row" sx={{ gap: 2, justifyContent: 'flex-end' }}>
      {resetLabel ? (
        <Button
          type="button"
          variant="outlined"
          color="inherit"
          disabled={pending}
          onClick={() => reset()}
        >
          {resetLabel}
        </Button>
      ) : null}
      <Button
        type="submit"
        variant="contained"
        disabled={pending}
        startIcon={pending ? <CircularProgress size={16} color="inherit" aria-hidden /> : undefined}
      >
        {submitLabel}
      </Button>
    </Stack>
  );
}
