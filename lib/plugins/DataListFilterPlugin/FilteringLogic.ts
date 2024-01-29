import type { FilterQueueValue, FilterRowConfig } from './types';
import type { TColumn } from "../../models/IDataList";
import type { DateDropdownValues } from '../../components/DateRangeDropdown';
import type { DataListStore } from "../../models/DataListStore";
import { getDeepValue } from '../../helpers/objectUtilities';

export class FilteringLogic {
    public static applyFilter<T>(
        queue: FilterQueueValue<{ type: 'date', dropdownValue?: DateDropdownValues }>[],
        getStore: () => DataListStore<T>
    ) {
        let rows = [...getStore().allRows];

        if (queue.length === 0) {
            rows = [...getStore().allRows];
            getStore().setRows(rows);
            return;
        }

        const columns = getStore().columns;

        rows = queue.reduce((filteredRows, filter) => {
            const column: TColumn<T> = columns.find(column => column.key === filter.key);

            if (!column) return filteredRows;
            if (filter?.metadata?.type === 'date') {
                const rangeStart = new Date(filter.values[0] as string);
                rangeStart.setHours(0, 0, 0, 0);
                const rangeEnd = new Date(filter.values[1] as string);
                rangeEnd.setHours(23, 59, 59, 999);
                return filteredRows.filter(row => {
                    //@ts-ignore
                    const currentValue = new Date(getDeepValue(row, column.key));
                    return currentValue >= rangeStart && currentValue <= rangeEnd;
                });
            } else {
                return filteredRows.filter(row => FilteringLogic.includeRow({ filter, row, column }, getStore));
            }
        }, rows);

        getStore().setRows(rows);
    }

    private static includeRow<T>({ column, filter, row }: FilterRowConfig<T>, getStore: () => DataListStore<T>): T {
        let filterValues = filter.values;
        const transformations = column?.transformations;
        if (transformations?.renderAs)
            filterValues = FilteringLogic.findOriginalValue(getStore, filter);
        //@ts-ignore
        return filterValues.includes(getDeepValue(row, column.key));
    }

    private static findOriginalValue<T>(getStore: () => DataListStore<T>, filter: FilterQueueValue<any>): T[] {
        const originalRowValues = getStore().originalRowValues;
        const foundItem = originalRowValues?.find(originalRow => originalRow?.key === filter.key);
        const originalValues = foundItem?.values
            ?.filter(value => filter?.values
                ?.includes(value?.transformedValue))
            ?.map(v => v?.oldValue);
        return originalValues as T[];
    }
}