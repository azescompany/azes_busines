/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/customers/components/CustomersView/CustomersView.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-26
 * ║ Updated: 2026-10-26
 * ║ Purpose: CRM customers list (TAGET M4) — tenant scoped
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { azesMutator } from '@azes/api';
import { useTranslation } from '@azes/i18n';
import { MuiBox, MuiButton, Stack, Text } from '@azes/ui-web';
import { AzesForm, AzesFormTextField, useForm } from '@azes/ui-web/forms';
import { AzesTable, type AzesTableProps } from '@azes/ui-web/table';
import { AzesSkeleton } from '@azes/ui-web/skeleton';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { z } from 'zod';

import { checkPermission } from '../../../../auth/checkPermission.js';
import { useSessionMe } from '../../../../auth/useSessionMe.js';
import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';

type CustomerRow = {
  id: string;
  name: string;
  email: string | null;
  status: string;
};

const createSchema = z.object({
  name: z.string().min(1, 'customers.validation.nameRequired'),
  email: z.string().email('customers.validation.emailInvalid').optional().or(z.literal('')),
});

type CreateValues = z.infer<typeof createSchema>;

export function CustomersView() {
  const { t, i18n } = useTranslation(ADMIN_NAMESPACE);
  const me = useSessionMe();
  const canRead = checkPermission(me.data?.permissions, 'crm.customers.read');
  const canCreate = checkPermission(me.data?.permissions, 'crm.customers.create');
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: ['/api/v1/crm/customers'],
    enabled: canRead && me.isSuccess,
    queryFn: () =>
      azesMutator<{ items: CustomerRow[] }>({
        url: '/api/v1/crm/customers',
        method: 'GET',
      }),
  });

  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', email: '' },
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateValues) =>
      azesMutator({
        url: '/api/v1/crm/customers',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
          name: values.name,
          email: values.email ? values.email : null,
        },
      }),
    onSuccess: async () => {
      setError(null);
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ['/api/v1/crm/customers'] });
    },
    onError: () => setError(t('customers.createError')),
  });

  const columns = useMemo<AzesTableProps<CustomerRow>['columns']>(
    () => [
      { accessorKey: 'name', header: t('customers.columns.name') },
      { accessorKey: 'email', header: t('customers.columns.email') },
      { accessorKey: 'status', header: t('customers.columns.status') },
    ],
    [t, i18n.language],
  );

  if (me.isLoading || listQuery.isLoading) {
    return <AzesSkeleton shape="rect" height={240} width="100%" />;
  }

  if (!canRead) {
    return (
      <Stack gap={2}>
        <Text size="2xl" weight="bold">
          {t('customers.title')}
        </Text>
        <Text tone="muted">{t('customers.forbidden')}</Text>
      </Stack>
    );
  }

  return (
    <Stack gap={3}>
      <Text size="2xl" weight="bold">
        {t('customers.title')}
      </Text>
      <Text tone="muted" size="sm">
        {t('customers.subtitle')}
      </Text>

      {canCreate ? (
        <MuiBox
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 2,
            maxWidth: 480,
          }}
        >
          <AzesForm
            form={form}
            onSubmit={(values) => {
              createMutation.mutate(values);
            }}
          >
            <Stack gap={2}>
              <AzesFormTextField name="name" label={t('customers.fields.name')} />
              <AzesFormTextField name="email" label={t('customers.fields.email')} />
              <MuiButton type="submit" variant="contained" disabled={createMutation.isPending}>
                {createMutation.isPending ? t('customers.creating') : t('customers.create')}
              </MuiButton>
              {error ? (
                <Text tone="secondary" size="sm">
                  {error}
                </Text>
              ) : null}
            </Stack>
          </AzesForm>
        </MuiBox>
      ) : null}

      <AzesTable
        aria-label={t('customers.title')}
        data={listQuery.data?.items ?? []}
        columns={columns}
        getRowId={(row) => row.id}
      />
    </Stack>
  );
}
