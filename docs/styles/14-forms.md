<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/styles/14-forms.md
║ Author: AZES_COMPANY
║ Created: 2026-10-04
║ Updated: 2026-10-04
║ Purpose: Forms with react-hook-form, field binding, validation timing and error announcement
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# Forms

`@azes/ui-web/forms` binds MUI fields to `react-hook-form` (ADR-014). Schemas come from
`@azes/validation` (zod) in the app; ui-web holds no schemas and no zod dependency.

## API

```tsx
import {
  AzesForm,
  AzesFormTextField,
  AzesFormSection,
  AzesFormActions,
  useForm,
} from '@azes/ui-web/forms';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm<Values>({ resolver: zodResolver(schema), mode: 'onTouched', defaultValues });

<AzesForm form={form} onSubmit={save} aria-label="Profile">
  <AzesFormSection title="Profile" description="Shown to your team">
    <AzesFormTextField name="name" label="Full name" required />
    <AzesFormTextField name="email" label="Email" type="email" />
  </AzesFormSection>
  <AzesFormActions submitLabel="Save" resetLabel="Reset" />
</AzesForm>;
```

| Component           | Behavior                                                                                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AzesForm`          | `FormProvider` + `<form noValidate>`; calls `handleSubmit`; focuses the first invalid field; renders an `aria-live` summary of the error count after a failed submit |
| `AzesFormTextField` | `Controller`-bound `TextField`; `error`, `helperText` from field state; `aria-invalid`; helper linked by `aria-describedby`                                          |
| `AzesFormSection`   | `fieldset`-like group with title and description (`role="group"`, `aria-labelledby`)                                                                                 |
| `AzesFormActions`   | Submit (shows progress while submitting, `disabled` while pending) and optional reset                                                                                |

Other inputs (Select, Checkbox, Switch) bind with `useController` in the app until a second app
needs a bound version.

## Validation timing

- Default `mode: 'onTouched'`: errors appear after leaving a field, then update on change.
- On submit, all errors show at once and focus moves to the first invalid field.
- Server errors: call `form.setError(name, { message })` from the mutation's `onError`.

## Accessibility

- Labels always visible (no placeholder-only fields).
- Required fields use `required` (MUI adds the asterisk and `aria-required`).
- The error summary uses `role="status"` so screen readers announce it once per submit.
