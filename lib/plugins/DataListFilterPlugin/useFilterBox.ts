import type { IComboBoxProps } from '@fluentui/react/lib/ComboBox';
import { useOuterClick } from '../../helpers/useOuterClick';
import type { DateRangeDdpChange } from '../../components/DateRangeDropdown';
import type { FilterQueueValue, FilterAreaProps } from './types';
import { Draft, create } from 'mutative';
import type { ColumnKey } from '../../models/ColumnKey';
import { useFilterPluginStoreValues, useFilterPluginStore, stateSelector } from './filterStore';

type QueueUpdate = (queue: FilterQueueValue[], filterIndex: number, value: string, clickedKey?: ColumnKey<unknown>) => FilterQueueValue<unknown>[];
export function useFilterBox<T>({ getStore }: FilterAreaProps<T>) {
    const { currentFiltering, setQueue, queue, setWrappedValue, setApplyFilter, setShowBreadcrumb, setCurrentFiltering } = useFilterPluginStore(stateSelector);
    const { dropdownValue, dateRange, selectedKeys, options } = useFilterPluginStoreValues(
        getStore().clickedColumnKey,
        ['dropdownValue', 'dateRange', 'selectedKeys', 'options']
    );

    const clickedKey = getStore().clickedColumnKey as ColumnKey<T>;
    const TARGET_SELECTOR = `div[data-item-key="${clickedKey}"]` as const;

    const onApplyFilter = () => {
        setCurrentFiltering({ ...currentFiltering, show: false });
        if (queue.length > 0) {
            setApplyFilter(true);
            setShowBreadcrumb(true);
        } else {
            setShowBreadcrumb(false);
        }
        const pluginsContainer = [...document.querySelectorAll('.filterPluginContainer')];
        if (pluginsContainer?.length > 0)
            pluginsContainer.forEach(i => i.remove());
    }

    const useOuterClickRef = useOuterClick<HTMLDivElement>({
        onOuterClick: onApplyFilter,
        cancellationFn: (e) => !!(e.target instanceof HTMLElement && e.target.closest(`span[id^="header"]`))
    });

    const updateQueueWithSelectedOption: QueueUpdate = (queue, filterIndex, value, clickedKey) =>
        create(queue, draft => {
            if (filterIndex !== -1) {
                if (!draft[filterIndex].values.includes(value))
                    draft[filterIndex].values.push(value);
            } else
                draft.push({ key: clickedKey as Draft<ColumnKey<unknown>>, values: [value] });
        });

    const removeFromQueue: QueueUpdate = (queue, filterIndex, optionKey) =>
        create(queue, draft => {
            if (filterIndex !== -1) {
                const values = draft[filterIndex].values;
                const keyIndex = values.findIndex(i => i === optionKey);
                if (keyIndex !== -1) values.splice(keyIndex, 1);
                if (values.length === 0) draft.splice(filterIndex, 1);
            }
        });

    const onComboBoxChange: IComboBoxProps['onChange'] = (_e, opt) => {
        const clickedKey = getStore().clickedColumnKey as any;
        if (!clickedKey) return;

        const currentQueue = queue;
        const currentFilterIndex = currentQueue.findIndex(i => i.key === clickedKey);

        let newQueue: FilterQueueValue<unknown>[];
        if (opt?.selected)
            newQueue = updateQueueWithSelectedOption(currentQueue, currentFilterIndex, opt.text, clickedKey);
        else
            newQueue = removeFromQueue(currentQueue, currentFilterIndex, opt?.text);
        setQueue(newQueue);
        setWrappedValue(clickedKey, 'selectedKeys', (previousSelectedKeys) => {
            if (opt?.selected) {
                // if the option is selected, add it to the list
                return [...(previousSelectedKeys || []), opt.key as any];
            } else {
                // if the option is unselected, remove it from the list
                return previousSelectedKeys.filter((key) => key !== opt?.key);
            }
        });
    }

    const onDateDropdownChange: DateRangeDdpChange = (date, value, label) => {
        const stateIdx = queue.findIndex(i => i.key === clickedKey);
        if (stateIdx !== -1) {
            const newQueue = create(queue, draft => {
                draft[stateIdx].values = [date?.start?.toISOString(), date?.end?.toISOString()];
                draft[stateIdx].metadata = { type: 'date', dropdownValue: value, label }
            });
            setQueue(newQueue);
        } else {
            const newQueue = create(queue, draft => {
                draft.push({
                    key: clickedKey as Draft<ColumnKey<unknown>>,
                    values: [date?.start?.toISOString(), date?.end?.toISOString()],
                    metadata: { type: 'date', dropdownValue: value, label }
                });
            });
            setQueue(newQueue);
        }
        setWrappedValue(clickedKey, 'dropdownValue', value);
        setWrappedValue(clickedKey, 'dateRange', date as any);
    }

    const onDateValueChange: DateRangeDdpChange = (value, ddp, label) => {
        if (value.start && value.end) {
            const start = value.start.toISOString();
            const end = value.end.toISOString();
            const stateIdx = queue.findIndex(i => i.key === clickedKey);
            if (stateIdx !== -1) {
                const newQueue = create(queue, draft => {
                    draft[stateIdx].values = [start, end];
                    draft[stateIdx].metadata = { type: 'date', dropdownValue: ddp, label }
                });
                setQueue(newQueue);
            } else {
                const newQueue = create(queue, draft => {
                    draft.push({
                        key: clickedKey as Draft<ColumnKey<unknown>>,
                        values: [start, end],
                        metadata: { type: 'date', dropdownValue: ddp, label }
                    });
                });
                setQueue(newQueue);
            }
        }
        setWrappedValue(clickedKey, 'dateRange', value as any);
        setWrappedValue(clickedKey, 'dropdownValue', ddp);
    }

    const onDateSelected: DateRangeDdpChange = (date, opt, label) => {
        if (opt === 'range') return onDateValueChange(date, opt, label);
        return onDateDropdownChange(date, opt, label);
    }

    const targetDom = document.querySelector(TARGET_SELECTOR);
    const width = targetDom?.clientWidth;
    const newDiv = document.createElement('div');
    newDiv.className = 'filterPluginContainer';
    newDiv.style.position = 'fixed';
    newDiv.style.zIndex = '99999';
    const sibling = targetDom?.appendChild(newDiv);

    return {
        state: {
            width, sibling, targetDom, useOuterClickRef,
            dropdownValue, dateRange, selectedKeys, options,
            currentFiltering
        },
        handlers: {
            onComboBoxChange, onDateSelected, onApplyFilter
        }
    }
}