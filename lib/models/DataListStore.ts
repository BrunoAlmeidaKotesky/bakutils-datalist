import type { ColumnKey } from './ColumnKey';
import type { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import type { IGroup } from '@fluentui/react/lib/DetailsList';
import type { IDataListProps, TColumn } from './IDataList';
import type { ReactNode } from 'react';
import type { StoreApi } from 'zustand';

export type CallbackSet<T> = (data: T) => T;
export type Updater<T> = T | CallbackSet<T>;

/** Use this interface to implement the actual plugin to be instantiated and passed to the DataList's plugin array */
export interface DataListPlugin<T> {
    /**The name  identifier of the plugin */
    name: string;
    /**You can use this property to specify the version of the plugin */
    version?: string;
    /**
     *`initialize` is required for plugin development.
     * 
     * Even if don't do anything on the `initialize` method, you must at least return a `Promise.resolve()`,
     * 
     * since the DataList component will wait for all the plugins to be initialized before rendering.
    */
    initialize(getStore: () => DataListStore<T>, initialProps?: IDataListProps<T>): Promise<void>;
    /**Method that happens after the plugin is initialized, this is a good place to set the initial state of the plugin. */
    onInitialized?(getStore: () => DataListStore<T>, initialProps?: IDataListProps<T>): void;
    /** Method that renders something within the DataList plugins area div 
     * 
     * `initialProps` is the props passed to the DataList component when the plugin was first initialized,
     * **it does not guarantee** that the props will be the same when the DataList props change.
    */
    render?: (getStore: () => DataListStore<T>, initialProps?: IDataListProps<T>) => ReactNode;
    /**A method that happens after you set your store to not render anymore. 
     * @example
     * getStore().setUnmountedPlugins('MyPluginIdentifier', true);
    */
    onUnmount?: (getStore: () => DataListStore<T>) => void;
}

export type ContextMenuState = {
    x: number;
    y: number;
    visible: boolean;
}
export interface DataListState<T> {
    /**The initial rows that were passed to the DataList component */
    rows: T[];
    /**Do not modify this value, it's used to store the initial rows when the props was passed, it can be used to compare the current rows to the initials.*/
    allRows: T[];
    headerMenuItems: IContextualMenuItem[];
    plugins: DataListPlugin<T>[];
    columns: TColumn<T>[];
    groups?: IGroup[];
    clickedColumnKey: ColumnKey<T> | null;
    contextMenu: ContextMenuState;
    unmountedPlugins: Map<string, boolean>;
    pluginStores: Record<string, StoreApi<unknown>>;
    originalRowValues: { values: { oldValue: unknown, transformedValue: string }[], key: string }[];
}

export interface DataListActions<T> {
    setGroups: (data: Updater<IGroup[]>) => void;
    /**Set the rows that will be displayed in the DataList */
    setRows: (data: Updater<T[]>) => void;
    /**Set the columns that will be displayed in the DataList */
    setColumns: (data: Updater<TColumn<T>[]>) => void;
    /**Set the groups that will be displayed in the DataList */
    setHeaderMenuItems: (data: CallbackSet<IContextualMenuItem[]>) => void;
    setOriginalRowValue: (key: string, oldValue: unknown, transformedValue: string) => void;
    setAllRows: (data: Updater<T[]>) => void;
    initializePlugin: (plugin: DataListPlugin<T>, props?: IDataListProps<T>) => Promise<void>;
    setPlugins: (plugins: Updater<DataListPlugin<T>[]>) => void;
    setContextMenu: (data: Updater<ContextMenuState>) => void;
    onColumnClick: (ev: React.MouseEvent<HTMLElement>, column: TColumn<T>) => void;
    setUnmountedPlugins: (pluginKey: string, value: boolean) => void;
    getStore: () => DataListStore<T>;
    getInitialState: () => DataListState<T>;
    subscribe: ZustandSubscribe<DataListStore<T>>;
    registerPluginStore: (pluginName: string, pluginStore: StoreApi<unknown>) => void;
    setState: (data: Updater<DataListState<T>>) => void;
}

export type DataListStore<T> = DataListState<T> & DataListActions<T>;

export type ZustandSubscribe<T> = {
    <U>(selector: (state: T) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
        equalityFn?: (a: U, b: U) => boolean;
        fireImmediately?: boolean;
    }): () => void;
};