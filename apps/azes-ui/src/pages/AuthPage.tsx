/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/pages/AuthPage.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: Full-page AzesAuthLayout pilot (sign-in form, no side navigation)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { Checkbox, FormControlLabel, Link, MuiBox, Typography } from '@azes/ui-web';
import { AzesForm, AzesFormActions, AzesFormTextField, useForm } from '@azes/ui-web/forms';
import { AzesAuthLayout } from '@azes/ui-web/layout';
import { emailString, z } from '@azes/validation';
import { zodResolver } from '@hookform/resolvers/zod';

import { ShowcaseLogo } from '../app/ShowcaseLogo.js';

const signInSchema = z.object({
  email: emailString,
  password: z.string().min(8, 'At least 8 characters'),
});

type SignInValues = z.infer<typeof signInSchema>;

export function AuthPage({ onSignedIn }: { onSignedIn: () => void }) {
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
  });

  return (
    <AzesAuthLayout
      slots={{
        logo: <ShowcaseLogo />,
        headerEnd: (
          <Link href="#/overview" underline="hover">
            Back to showcase
          </Link>
        ),
        aside: (
          <MuiBox sx={{ maxWidth: 360 }}>
            <Typography variant="h4" component="p" gutterBottom>
              One platform, every product.
            </Typography>
            <Typography color="text.secondary">
              The auth layout splits into aside and form from md up and centers the card below.
            </Typography>
          </MuiBox>
        ),
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom>
        Sign in
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 6 }}>
        Use any email and an 8+ character password.
      </Typography>
      <AzesForm form={form} onSubmit={onSignedIn} aria-label="Sign in">
        <MuiBox sx={{ display: 'grid', gap: 4, mb: 4 }}>
          <AzesFormTextField<SignInValues>
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
          />
          <AzesFormTextField<SignInValues>
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            required
          />
          <FormControlLabel control={<Checkbox defaultChecked />} label="Remember me" />
        </MuiBox>
        <AzesFormActions submitLabel="Sign in" />
      </AzesForm>
    </AzesAuthLayout>
  );
}
