/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/api/src/admin/admin-budget/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-04
 * ║ Purpose: ADMIN admin-budget API facade
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

export * from './overdue';

export {
  getApiV1AdminbudgetOrganizationOrganizationIdBudgets,
  getApiV1AdminbudgetOrganizationOrganizationIdCurrentBudget,
  getApiV1AdminbudgetOrganizationOrganizationIdDebt,
  getGetApiV1AdminbudgetOrganizationOrganizationIdBudgetsQueryKey,
  getGetApiV1AdminbudgetOrganizationOrganizationIdBudgetsQueryOptions,
  getGetApiV1AdminbudgetOrganizationOrganizationIdCurrentBudgetQueryKey,
  getGetApiV1AdminbudgetOrganizationOrganizationIdCurrentBudgetQueryOptions,
  getGetApiV1AdminbudgetOrganizationOrganizationIdDebtQueryKey,
  getGetApiV1AdminbudgetOrganizationOrganizationIdDebtQueryOptions,
  getPostApiV1AdminbudgetCalculateOrganizationIdMutationOptions,
  getPostApiV1AdminbudgetOrganizationOrganizationIdUnlockMutationOptions,
  getPostApiV1AdminbudgetPaymentBudgetIdMutationOptions,
  getPostApiV1AdminbudgetTableMutationOptions,
  postApiV1AdminbudgetCalculateOrganizationId,
  postApiV1AdminbudgetOrganizationOrganizationIdUnlock,
  postApiV1AdminbudgetPaymentBudgetId,
  postApiV1AdminbudgetTable,
  useGetApiV1AdminbudgetOrganizationOrganizationIdBudgets,
  useGetApiV1AdminbudgetOrganizationOrganizationIdCurrentBudget,
  useGetApiV1AdminbudgetOrganizationOrganizationIdDebt,
  usePostApiV1AdminbudgetCalculateOrganizationId,
  usePostApiV1AdminbudgetOrganizationOrganizationIdUnlock,
  usePostApiV1AdminbudgetPaymentBudgetId,
  usePostApiV1AdminbudgetTable,
} from '../../../generated/admin/admin-budget/admin-budget';

export type {
  GetApiV1AdminbudgetOrganizationOrganizationIdBudgetsQueryError,
  GetApiV1AdminbudgetOrganizationOrganizationIdBudgetsQueryResult,
  GetApiV1AdminbudgetOrganizationOrganizationIdCurrentBudgetQueryError,
  GetApiV1AdminbudgetOrganizationOrganizationIdCurrentBudgetQueryResult,
  GetApiV1AdminbudgetOrganizationOrganizationIdDebtQueryError,
  GetApiV1AdminbudgetOrganizationOrganizationIdDebtQueryResult,
  PostApiV1AdminbudgetCalculateOrganizationIdMutationError,
  PostApiV1AdminbudgetCalculateOrganizationIdMutationResult,
  PostApiV1AdminbudgetOrganizationOrganizationIdUnlockMutationBody,
  PostApiV1AdminbudgetOrganizationOrganizationIdUnlockMutationError,
  PostApiV1AdminbudgetOrganizationOrganizationIdUnlockMutationResult,
  PostApiV1AdminbudgetPaymentBudgetIdMutationBody,
  PostApiV1AdminbudgetPaymentBudgetIdMutationError,
  PostApiV1AdminbudgetPaymentBudgetIdMutationResult,
  PostApiV1AdminbudgetTableMutationBody,
  PostApiV1AdminbudgetTableMutationError,
  PostApiV1AdminbudgetTableMutationResult,
} from '../../../generated/admin/admin-budget/admin-budget';
