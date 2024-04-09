/**All the functions in this file are for internal use only. */

import { convertIsoToLocaleString, getDeepValue } from "./objectUtilities"
import { createNewSortInstance } from 'fast-sort';
import type { TColumn } from "../models/IDataList";
import type { ReactNode, ComponentType } from "react";
import type { ColumnKey } from "../models/ColumnKey";
import type { DataListStore } from "../models/DataListStore";
import type { ColumnItemTransformation } from "../models/ColumnItemTransformation";

/**
 * This function takes the transformations of a column and returns the rendered value of the item, 
 * using getDeepValue to get the value of the item.
 * 
 * @param item The current item to render
 * @param column The column of the item to render
 * @param processValue A function to process the value of the item
 * @param Wrapper A wrapper component to wrap the value
 * @returns 
 */
function renderValue<T>(
    item: T,
    column: TColumn<T>,
    processValue: (value: any) => ReactNode,
    Wrapper?: ComponentType<{ children: ReactNode }>
) {
    //@ts-ignore
    const fieldValue = getDeepValue(item, column?.key);
    const valueNode = processValue(fieldValue);
    return Wrapper ? <Wrapper>{valueNode}</Wrapper> : valueNode;
}

export function convertItemValue<T>(transformations: ColumnItemTransformation, fieldValue: unknown, item?: T): string {
    if (fieldValue === null || fieldValue === undefined) return "";
    if (!transformations?.renderAs) return fieldValue?.toString() ?? '';

    switch (transformations.renderAs) {
        case 'date': {
            return convertIsoToLocaleString(
                fieldValue as string,
                transformations?.locales,
                transformations?.formatOptions
            );
        }
        case 'boolean': {
            let valueToRender: string = '';
            if (typeof fieldValue === 'boolean') {
                valueToRender = fieldValue ? transformations?.trueText : transformations?.falseText;
            } else {
                valueToRender = transformations?.nullText;
            }
            return valueToRender;
        }
        case 'number': {
            return Number(fieldValue).toLocaleString(
                transformations?.locales,
                transformations?.formatOptions
            );
        }
        case 'custom': {
            return transformations?.mapFn(fieldValue, item);
        }
    }
}
type OnRender<T> = (item?: T, index?: number, column?: TColumn<T>) => ReactNode;
/**
 * Maps columns to be used in the DataList component, depending on the transformations provided (if any).
 * 
 * @param c Column to map
 * @returns Mapped column
 */
export function mapColumns<T>(column: TColumn<T>, store: DataListStore<T>, propRenderItem?: OnRender<T>): TColumn<T> {
    let onRender: OnRender<T>;
    const transformations = column?.transformations;
    if (!column.key) throw new Error('Column key is required.');
    if (!transformations) {
        if (propRenderItem) onRender = propRenderItem;
        else {
            onRender = (item: T | undefined, _index?: number, column?: TColumn<T> | undefined) => {
                //@ts-ignore
                const fieldValue = getDeepValue(item, column?.key);
                return <>{fieldValue || ''}</>
            }
        }
        return { ...column, fieldName: column?.key, isResizable: true, onRender: onRender as any };
    }
    onRender = (item: T | undefined, _index?: number, column?: TColumn<T>) => renderValue(
        item,
        column as any,
        (fieldValue) => {
            const newValue = convertItemValue(transformations, fieldValue, item);
            store.setOriginalRowValue(column?.key, fieldValue, newValue);
            return newValue;
        },
        transformations?.wrapper
    );
    return { ...column, onRender: onRender as any, isResizable: true };
}


const naturalSort = createNewSortInstance({
    comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
});

export function sortItems<T>(items: T[], columnKey: ColumnKey<T>, isSortedDescending: boolean): T[] {
    const sortType: 'asc' | 'desc' = isSortedDescending ? 'desc' : 'asc';
    if (sortType === 'asc') {
        return naturalSort(items).by({
            asc: u => getDeepValue(u as Record<string, any>, columnKey as any)?.toString(),
        });
    }
    return naturalSort(items).by({
        desc: u => getDeepValue(u as Record<string, any>, columnKey as any)?.toString(),
    });
}