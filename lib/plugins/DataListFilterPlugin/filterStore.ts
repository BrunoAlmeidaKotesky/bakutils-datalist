import { createStore, useStore } from "zustand";
import { subscribeWithSelector } from 'zustand/middleware';
import { mutative } from 'zustand-mutative';
import type { Updater, ZustandSubscribe } from "../../models/DataListStore";
import type { FilterPluginState, FilterPluginStore, KeyWrapper, WrappedFilterState } from './types';
import type { ColumnKey } from '../../models/ColumnKey';
import type { Draft } from "mutative";

export function getWrappedFilterStoreValueHelper<K extends keyof WrappedFilterState>(
    valuesArray: KeyWrapper<WrappedFilterState[K][0]['value']> | undefined,
    clickedColumnKey: ColumnKey<any>
): WrappedFilterState[K][0]['value'] | undefined {
    if (valuesArray) {
        const valueObject = valuesArray?.find(obj => obj?.key === clickedColumnKey);
        return valueObject?.value;
    }

    return undefined;
}

const initialFilterPluginState: FilterPluginState<unknown> = {
    currentFiltering: null,
    queue: [],
    dateRange: null,
    options: null,
    applyFilter: false,
    selectedKeys: null,
    showBreadcrumb: false,
    dropdownValue: null,
}

export const filterPluginStore: FilterStoreOverwritten<unknown> = createStore<FilterPluginStore<unknown>>()(
    subscribeWithSelector(
        mutative((set, get, { subscribe, getInitialState }) => ({
            ...initialFilterPluginState,
            getInitialState,
            setCurrentFiltering: value => set(state => {
                //@ts-ignore
                state.currentFiltering = typeof value === 'function' ? value(state.currentFiltering) : value;
            }),
            resetState: (clearCb?: () => void) => set((state) => {
                for (const key in state) {
                    const k = key as keyof typeof state;
                    if (typeof state[k] !== 'function') {
                        const newValue = initialFilterPluginState[k as keyof typeof initialFilterPluginState];
                        state[k] = newValue as any;
                    }
                }
                if (clearCb) clearCb();
            }),
            setShowBreadcrumb: value => set(state => { state.showBreadcrumb = value }),
            setQueue: queue => set(state => {
                if (typeof queue === 'function')
                    state.queue = queue(state.queue as any[]);
                else
                    state.queue = queue;
            }),
            subscribe: subscribe as ZustandSubscribe<FilterPluginStore<unknown>>,
            getWrappedFilterStoreValue: <K extends keyof WrappedFilterState>(
                clickedColumnKey: ColumnKey<K>,
                key: K,
            ): WrappedFilterState[K][0]['value'] | undefined => {
                const valuesArray = get()[key] as unknown as KeyWrapper<WrappedFilterState[K][0]['value']>;
                return getWrappedFilterStoreValueHelper(valuesArray, clickedColumnKey);
            },
            setApplyFilter: value => set(state => { state.applyFilter = value }),
            setWrappedFilterStoreValue: <K extends keyof WrappedFilterState, V extends WrappedFilterState[K][0]['value']>(
                clickedColumnKey: ColumnKey<K>,
                key: K,
                value: Updater<V>
            ) => {
                //@ts-ignore
                set((state: FilterPluginStore<unknown>) => {
                    let valuesArray: KeyWrapper<V> | undefined = state[key] as unknown as KeyWrapper<V>;

                    if (valuesArray) {
                        const valueObjectIndex = valuesArray.findIndex(obj => obj.key === clickedColumnKey);
                        let newValue: V;

                        if (valueObjectIndex !== -1) {
                            // If the object was found, update it
                            newValue = typeof value === 'function' ? value(valuesArray[valueObjectIndex].value) : value;
                            valuesArray[valueObjectIndex].value = newValue;
                        } else {
                            // If the object was not found, add it
                            newValue = typeof value === 'function' ? value(undefined) : value;
                            valuesArray.push({ key: clickedColumnKey, value: newValue });
                        }
                    } else {
                        const newValue = typeof value === 'function' ? value(undefined) : value;
                        valuesArray = [{ key: clickedColumnKey, value: newValue }];
                    }
                    //@ts-ignore
                    state[key] = valuesArray as unknown as WrappedFilterState[K];
                });
            },
        }))
    )
);

export type FilterStoreOverwritten<T> = {
    getState: () => FilterPluginStore<T>;
    getInitialState: () => FilterPluginStore<T>;
    setState: (nextStateOrUpdater:
        FilterPluginStore<T> |
        Partial<FilterPluginStore<T>> |
        ((state: Draft<FilterPluginStore<T>>) => void),
        shouldReplace?: boolean
    ) => void
    subscribe: {
        (listener: (selectedState: FilterPluginStore<T>, previousSelectedState: FilterPluginStore<T>) => void): () => void;
        <U>(selector: (state: FilterPluginStore<T>) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: (a: U, b: U) => boolean;
            fireImmediately?: boolean;
        }): () => void;
    };
    destroy: any;
}

export function useFilterPluginStore<S>(selector: (state: FilterPluginStore<unknown>) => S): S {
    return useStore(filterPluginStore as any, selector as any);
}

type WrappedFilterValue<K extends keyof WrappedFilterState> = WrappedFilterState[K][0]['value'];
type FilterStoreValues<K extends keyof WrappedFilterState> = {
    [P in K]: WrappedFilterValue<P> | undefined;
};
export const useFilterPluginStoreValues = <K extends keyof WrappedFilterState>(
    clickedColumnKey: ColumnKey<any>,
    keys: K[],
): FilterStoreValues<K> => {
    return useFilterPluginStore(state => {
        const values: Partial<FilterStoreValues<K>> = {};

        for (const key of keys) {
            values[key] = getWrappedFilterStoreValueHelper(state[key] as unknown as KeyWrapper<WrappedFilterValue<K>>, clickedColumnKey);
        }

        return values as FilterStoreValues<K>;
    });
};

export const stateSelector = (state: FilterPluginStore<any>) => ({
    currentFiltering: state.currentFiltering,
    setQueue: state.setQueue,
    queue: state.queue,
    setWrappedValue: state.setWrappedFilterStoreValue,
    applyFilter: state.applyFilter,
    setApplyFilter: state.setApplyFilter,
    setShowBreadcrumb: state.setShowBreadcrumb,
    setCurrentFiltering: state.setCurrentFiltering
});