import { createStore, useStore } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useContext } from 'react';
import { DataListCtx } from './Context';
import { mutative } from 'zustand-mutative';
import { sortItems } from '../../helpers/internalUtilities';
import type { ColumnKey } from '../../models/ColumnKey';
import type { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import type { TColumn } from '../../models/IDataList';
import type { DataListState, DataListStore, ZustandSubscribe } from '../../models/DataListStore';
import type { IDataListProps } from '../../models/IDataList';
import type { Draft } from 'mutative';

type DataListStoreOverWritten = {
    getState: () => DataListStore<any>;
    getInitialState: () => DataListStore<any>;
    setState: (nextStateOrUpdater:
        DataListStore<any> |
        Partial<DataListStore<any>> |
        ((state: Draft<DataListStore<any>>) => void),
        shouldReplace?: boolean
    ) => void
    subscribe: {
        (listener: (selectedState: DataListStore<any>, previousSelectedState: DataListStore<any>) => void): () => void;
        <U>(selector: (state: DataListStore<any>) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: (a: U, b: U) => boolean;
            fireImmediately?: boolean;
        }): () => void;
    };
    destroy: any;
}

export const createUseDataListStore = <T>(initialStore: Partial<DataListStore<T>>, props?: IDataListProps<T>) => {
    const DEFAULT_STATE: Omit<DataListState<T>, 'headerMenuItems'> = {
        rows: [],
        columns: [],
        allRows: [],
        plugins: [],
        groups: [],
        clickedColumnKey: null,
        contextMenu: {
            visible: false,
            x: 0,
            y: 0
        },
        unmountedPlugins: new Map(),
        pluginStores: {},
        originalRowValues: []
    }

    const store = createStore<DataListStore<T>>()(subscribeWithSelector(mutative(
        (set, get, api) => {
            return ({
                ...DEFAULT_STATE,
                headerMenuItems: [
                    {
                        key: 'sortAsc',
                        text: props?.columnMenuConfig?.sortAscText || 'Sort Ascending',
                        onClick: () => {
                            const columnKey = get().clickedColumnKey;
                            const columnIdx = get().columns.findIndex(i => i.key === columnKey);

                            const result = sortItems(get().rows, columnKey, false);
                            if (columnIdx > -1) {
                                set(state => {
                                    state.columns[columnIdx] = {
                                        ...state.columns[columnIdx],
                                        isSortedDescending: false,
                                        isSorted: true
                                    },
                                        (state.rows as T[]) = result;
                                });
                            }
                        }
                    },
                    {
                        key: 'sortDesc',
                        text: props?.columnMenuConfig?.sortDescText || 'Sort Descending',
                        onClick: () => {
                            const columnKey = get().clickedColumnKey;
                            const columnIdx = get().columns.findIndex(i => i.key === columnKey);

                            const result = sortItems(get().rows, columnKey, true);
                            if (columnIdx > -1) {
                                set(state => {
                                    state.columns[columnIdx] = {
                                        ...state.columns[columnIdx],
                                        isSortedDescending: true,
                                        isSorted: true
                                    },
                                        (state.rows as T[]) = result;
                                });
                            }
                        }
                    }
                ],
                ...initialStore as Partial<DataListStore<T>>,
                setRows: rows => set(state => {
                    if (typeof rows === 'function')
                        (state.rows as T[]) = rows(state.rows as T[]);
                    else
                        (state.rows as T[]) = rows;
                }),
                setAllRows: allRows => set(state => {
                    if (typeof allRows === 'function')
                        (state.allRows as T[]) = allRows(state.allRows as T[]);
                    else
                        (state.allRows as T[]) = allRows;
                }),
                setGroups: groups => set(state => {
                    if (typeof groups === 'function')
                        state.groups = groups(state.groups);
                    else
                        state.groups = groups;
                }),
                setState: set,
                setOriginalRowValue: (key, oldValue, transformedValue) => set(state => {
                    if (state.originalRowValues?.map(i => i?.key).includes(key)) {
                        const index = state.originalRowValues.findIndex(i => i?.key === key);
                        state.originalRowValues[index].values.push({ oldValue, transformedValue });
                    }
                    else {
                        state.originalRowValues.push({ key, values: [{ oldValue, transformedValue }] });
                    }
                }),
                initializePlugin: async (plugin) => {
                    if (typeof plugin?.initialize === 'function') {
                        await plugin.initialize(() => get(), props);
                    } else {
                        console.error(`
                        [TRS] - Plugin ${plugin.name} does not implement the initialize method.\r\n 
                        This method is required to initialize the plugin`);
                    }
                },
                registerPluginStore: (pluginName, pluginStore) => set(state => {
                    state.pluginStores[pluginName] = pluginStore;
                }),
                setColumns: columns => set(state => {
                    if (typeof columns === 'function')
                        (state.columns as TColumn<T>[]) = columns(state.columns as TColumn<T>[]);
                    else
                        (state.columns as TColumn<T>[]) = columns;
                }),
                setPlugins: plugins => set(state => {
                    if (typeof plugins === 'function')
                        state.plugins = plugins(state.plugins);
                    else
                        state.plugins = plugins;
                }),
                setContextMenu: contextMenu => set(state => {
                    if (typeof contextMenu === 'function')
                        state.contextMenu = contextMenu(state.contextMenu);
                    else
                        state.contextMenu = contextMenu;
                }),
                onColumnClick: (e: React.MouseEvent<HTMLElement>, column: TColumn<T>): void => {
                    e.preventDefault();
                    if (!column) return;
                    set(state => {
                        state.contextMenu = {
                            visible: true,
                            x: e.clientX,
                            y: e.clientY,
                        };
                        (state.clickedColumnKey as ColumnKey<T>) = column.key;
                    });
                },
                setHeaderMenuItems: items => set(state => {
                    (state.headerMenuItems as IContextualMenuItem[]) = items(state.headerMenuItems as IContextualMenuItem[]);
                }),
                setUnmountedPlugins: (pluginKey, value) => set(state => {
                    const newUnmountedPlugins = new Map(state.unmountedPlugins);
                    newUnmountedPlugins.set(pluginKey, value);
                    state.unmountedPlugins = newUnmountedPlugins;
                }),
                getStore: () => get(),
                subscribe: api.subscribe as unknown as ZustandSubscribe<DataListStore<T>>,
                getInitialState: api.getInitialState
            })
        }
    )));
    return store as unknown as DataListStoreOverWritten;
}

export function useDataListContext<T, S>(
    selector: (state: DataListStore<T>) => S,
    equalityFn?: (left: T, right: T) => boolean
): S {
    const store = useContext(DataListCtx);
    if (!store) throw new Error('Missing DataListCtx.Provider in the tree')
    //@ts-ignore
    return useStore(store, selector, equalityFn)
}