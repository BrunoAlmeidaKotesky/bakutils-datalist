import type { Leaves } from 'bakutils-types';

export type DeepKey4<T> = Leaves<T, 4>;
export type ColumnKey<T> = keyof T | DeepKey4<T>;