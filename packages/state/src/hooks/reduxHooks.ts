/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/state/src/hooks/reduxHooks.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-08-22
 * ║ Updated: 2026-08-22
 * ║ Purpose: Typed useDispatch / useSelector for AZES store
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch } from '../store/createStore';
import type { RootState } from '../store/types';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
