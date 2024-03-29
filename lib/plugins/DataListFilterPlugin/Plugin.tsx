import type { DataListPlugin } from "../../models/DataListStore";
import type { DataListStore } from "../../models/DataListStore";
import type { AddOrRemoveConfig, FilterPluginConfig } from './types';
import type { IComboBoxOption } from "@fluentui/react/lib/ComboBox";
import { convertItemValue } from '../../helpers/internalUtilities';
import { getDeepValue } from "../../helpers/objectUtilities";
import { FilteringLogic } from './FilteringLogic';
import { FilterStoreOverwritten, filterPluginStore } from './filterStore';
import { FilterWrapper } from './FilterComponents';

export class FilterPlugin<T> implements DataListPlugin<T> {
    public name: string = 'DataListFilterPlugin';
    public version: string = '1.0.0';
    constructor(private config?: FilterPluginConfig<T>) { }

    public async initialize(getStore: () => DataListStore<T>) {
        const store = getStore();
        store.setHeaderMenuItems(items => {
            return [...items,
            {
                key: 'filter',
                text: this?.config?.filterText || 'Filter By',
                onClick: () => this.#onClickFilterOpt(getStore)
            }];
        });
        getStore().registerPluginStore('DataListFilterPlugin', filterPluginStore);
        return Promise.resolve();
    }

    public onInitialized(getStore: () => DataListStore<T>): void {
        filterPluginStore.subscribe(state => ({
            queue: state.queue,
            applyFilter: state.applyFilter
        }), ({ queue, applyFilter }) => {
            if (applyFilter)
                FilteringLogic.applyFilter(queue as any[], getStore as unknown as () => DataListStore<any>);
        });
        filterPluginStore.subscribe(state => state.currentFiltering, currentFiltering => {
            const options = currentFiltering?.values?.map<IComboBoxOption>(v => {
                if (currentFiltering?.column?.transformations?.renderAs !== 'date') {
                    const text = convertItemValue(currentFiltering?.column?.transformations, v);
                    return {
                        key: `${getStore().clickedColumnKey} - ${text}`,
                        text,
                        useAriaLabelAsText: true,
                        ariaLabel: text,
                        data: getStore().clickedColumnKey
                    };
                }
            }) || [];
            if (options.length > 0)
                filterPluginStore.getState().setWrappedFilterStoreValue(getStore().clickedColumnKey, 'options', options);
        });
        getStore()
            .subscribe(state => state.clickedColumnKey, clickedColumnKey => {
                if (!clickedColumnKey) return;
                const store = getStore();
                this.#addOrRemoveFilterItem({
                    clickedColumnKey,
                    getStore,
                    headerMenuItems: store.headerMenuItems,
                    setHeaderMenuItems: store.setHeaderMenuItems,
                });
            });
    }

    #onClickFilterOpt(getStore: () => DataListStore<T>): void {
        const store = getStore();
        const columnKey = store.clickedColumnKey;
        const column = store.columns.find(c => c.key === columnKey);
        if (!column) return;
        const values = [...new Set(
            store.rows
                .filter(r => {
                    const value = getDeepValue(r, columnKey as any);
                    if (value === undefined || value === null) return false;
                    return true;
                })
                .map(r => getDeepValue(r, columnKey as any))
        )];
        const dateRangeSliderConfig = this?.config?.dateRangeSliderConfig?.find(i => i.key === columnKey);
        (filterPluginStore as FilterStoreOverwritten<T>).setState({
            currentFiltering: {
                values,
                column,
                show: true,
                dateRangeSliderConfig
            }
        });
        filterPluginStore.getState().setApplyFilter(false);
        store.setUnmountedPlugins('DataListFilterPlugin', false);
    }

    #addOrRemoveFilterItem({
        clickedColumnKey, getStore,
        headerMenuItems, setHeaderMenuItems
    }: AddOrRemoveConfig<T>) {
        if (!clickedColumnKey) return;

        const filterItemIndex = headerMenuItems.findIndex(item => item.key === 'filter');
        let newHeaderMenuItems = [...headerMenuItems];

        if (this?.config?.excludeColumns?.includes(clickedColumnKey) && filterItemIndex !== -1) {
            newHeaderMenuItems = newHeaderMenuItems.filter((_, index) => index !== filterItemIndex);
        } else if (filterItemIndex === -1) {
            newHeaderMenuItems.push({
                key: 'filter',
                text: this?.config?.filterText || 'Filter By',
                onClick: () => this.#onClickFilterOpt(getStore)
            });
        }

        setHeaderMenuItems(() => newHeaderMenuItems);
    }

    public render = (getStore: () => DataListStore<T>) => (
        <FilterWrapper
            onFilterCleared={this?.config?.onFilterCleared}
            getStore={getStore as unknown as () => DataListStore<any>}
            applyFilterText={this?.config?.applyFilterText} />
    )
}