/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/forms/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Public entry point for @azes/ui-web/forms (react-hook-form bindings)
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import '../theme/mui-augment';

export {
  AzesForm,
  AzesFormActions,
  AzesFormSection,
  AzesFormTextField,
  type AzesFormActionsProps,
  type AzesFormProps,
  type AzesFormSectionProps,
  type AzesFormTextFieldProps,
} from './AzesForm';
export {
  useForm,
  useFormContext,
  useController,
  type FieldPath,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form';
