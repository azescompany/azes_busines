/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/forms/forms.test.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Form submit, validation summary, focus and aria wiring
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useForm, type Resolver } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { AzesThemeProvider } from '../theme/AzesThemeProvider';
import { AzesForm, AzesFormActions, AzesFormSection, AzesFormTextField } from './AzesForm';

type Values = { name: string; email: string };

function ProfileForm({ onSubmit }: { onSubmit: (values: Values) => void }) {
  const form = useForm<Values>({ defaultValues: { name: '', email: '' }, mode: 'onTouched' });
  return (
    <AzesForm form={form} onSubmit={onSubmit} aria-label="Profile">
      <AzesFormSection title="Profile" description="Shown to your team">
        <AzesFormTextField<Values>
          name="name"
          label="Full name"
          required
          helperText="As on your ID"
        />
        <AzesFormTextField<Values> name="email" label="Email" type="email" />
      </AzesFormSection>
      <AzesFormActions submitLabel="Save" resetLabel="Reset" />
    </AzesForm>
  );
}

function renderForm(onSubmit = vi.fn()) {
  render(
    <AzesThemeProvider>
      <ProfileForm onSubmit={onSubmit} />
    </AzesThemeProvider>,
  );
  return onSubmit;
}

describe('AzesForm', () => {
  it('labels the section group and links helper text', () => {
    renderForm();
    expect(screen.getByRole('group', { name: 'Profile' })).toHaveAccessibleDescription(
      'Shown to your team',
    );
    expect(screen.getByRole('textbox', { name: /Full name/ })).toHaveAccessibleDescription(
      'As on your ID',
    );
  });

  it('submits values', async () => {
    const onSubmit = renderForm();
    fireEvent.change(screen.getByRole('textbox', { name: /Full name/ }), {
      target: { value: 'Aysel' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ name: 'Aysel', email: '' });
  });
});

const requireName: Resolver<Values> = async (values) =>
  values.name
    ? { values, errors: {} }
    : { values: {}, errors: { name: { type: 'required', message: 'Name is required' } } };

function RequiredForm() {
  const form = useForm<Values>({ defaultValues: { name: '', email: '' }, resolver: requireName });
  return (
    <AzesForm form={form} onSubmit={() => undefined}>
      <AzesFormTextField<Values> name="email" label="Email" />
      <AzesFormTextField<Values> name="name" label="Name" />
      <AzesFormActions submitLabel="Save" />
    </AzesForm>
  );
}

describe('AzesForm validation', () => {
  it('shows a status summary, marks the field invalid and focuses it', async () => {
    render(
      <AzesThemeProvider>
        <RequiredForm />
      </AzesThemeProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('status')).toHaveTextContent('1 field needs attention.');
    const name = screen.getByRole('textbox', { name: 'Name' });
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription('Name is required');
    await waitFor(() => expect(name).toHaveFocus());
  });
});
