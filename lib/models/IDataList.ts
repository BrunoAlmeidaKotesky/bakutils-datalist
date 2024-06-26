import type { ColumnKey } from './ColumnKey';
import type { IColumn, IDetailsListProps, IListProps } from "@fluentui/react";
import type { DataListPlugin } from './DataListStore';
import type { ColumnItemTransformation } from './ColumnItemTransformation';

export type TColumn<T, MetaData = any> = IColumn & {
    /**If the desired value is from an nested object, provide the value with dots. 
     * @example "file.name" will get the value from the file object.
    */
    //Type of key should be either keyof T or DeepPath
    key: ColumnKey<T>;
    /**
     * Apply a transformations to all the items (cells) of this column.
     * 
     * You can use the `renderAs` property to render the value as a `date`, `number`, `boolean` or a `custom` render function.
     * 
     * If you do want to modify the value string format, you can use the `mapFn` when using the `custom` on `renderAs` property.
     * 
     * You can also use the `wrapper` property to wrap the value with a custom component, otherwise it will be wrapped with a `<span />` tag.
     * 
     * See {@link ColumnItemTransformation} for examples.*/
    transformations?: ColumnItemTransformation<T>;
    /**Use this if you don't want to display the column all it's rows, with this you can still use this column on for actions like filtering or grouping. 
     * @default false */
    hideColumn?: boolean;
    /**A way to store any metadata you want to this column. */
    metadata?: MetaData;
}

export type IFluentDetailsListProps = Omit<
    IDetailsListProps,
    'columns' | 'items' | 'onRenderItemColumn' | 'onRenderRow' | 'onShouldVirtualize' | 'layoutMode' | 'styles'
>

/**Represents all the functions that can be used. */
export interface IDataListHandler<T, ColMetaData = any> {
    /**A custom event to be fired when a row is clicked. */
    onItemClick?: (row: T) => void;
    /**
     * You should see the `transformations` property from `TColumn<T>` first, since it will probably solve your problem.
     * 
     * Otherwise, if you still need to modify the render and the `mapFn` from `transformations` is not enough, you can use this property.
     * Cases like this can happen if the component that you are trying to render depends on a more complex state management logic.
     * 
     * If a specific column has a `transformations` property, it will be used instead of this one on that column.
     * 
     @example
     ```tsx
     <DataList onRenderItemColumn={(item, index, col) => {
        if(col.transformations && col.onRender) return col.onRender;
        //If not, make your custom render.
        return <span>{item[col.key]}</span>;
     }}
     ```
     */
    onRenderItemColumn?: (item?: T, index?: number, column?: TColumn<T, ColMetaData>) => React.ReactNode;
}

export interface IDataListStyles {
    /**The root <div> of the whole component, including the header and list. */
    root?: React.CSSProperties;
    /**The container of the `<DetailsList />` list. */
    contentContainer?: React.CSSProperties;
    detailListStyles?: IDetailsListProps['styles'];
    enableColBorder?: boolean;
}


export interface IDataListProps<T, ColMetaData = any> extends IDataListHandler<T, ColMetaData> {
    /**
     * If a `maxHeight` is not set, the list will not be virtualized by default, even if you return `true` on this property.
     * We do that to ensure that, to ensure with no max height is se to the list, the @fluentui virtualization bug does not occur.
     */
    onShouldVirtualize?: IListProps['onShouldVirtualize'];
    /**Use this property to set a maximum height for the DetailsList.
     * 
     * Note that this is just a easier way to set the `detailsListProps={{styles: {root: {maxHeight: '...'}}}}` property.
     * 
     * When setting this property, the `onShouldVirtualize` will be by default set to `(() => true)`, 
     * you can overwrite it by setting the `onShouldVirtualize` property, but we do not recommend.
     **/
    maxHeight?: string | number;
    layoutMode?: IDetailsListProps['layoutMode'];
    /**Use this to overwrite the default props `IDetailListProps` from Microsoft's `@fluent-ui` */
    detailsListProps?: IFluentDetailsListProps;
    /**Configure the header behavior, such as to enable filter and other functionalities. */
    /**The column model to be applied to the list.
     * It extends the Microsoft `@fluent-ui` `IColumn` interface.
     *
     * If you want to the values that are ISO dates to be automatically converted to locale strings, use the `dateConversionOptions` property.
     * If you want to change the type of the component to be used on the filter panel, use the `renderFilterAs` property.
     * @example
     * ```ts
     * //Remember to fill the default `IColumn` interface required properties.
     * const columns: TColumn[] = [{
     *      key: 'file.name',
     *      fieldName: 'file.name',
     *      renderFilterAs: 'SearchBox',
     *      dateConversionOptions: {
     *          shouldConvertToLocaleString: true,
     *          locales: ['en-US']
     *      }
     *  }];
     * ```
     * 
     * @note - You can use a `key` names that are not present on your interface for rendering custom columns, you just need to cast it to some other type, such as `any`:
     * ```tsx
     * //Icon does not exist on my inferred interface, use hiddenGroupKeys and hiddenFilterKeys, so it won't be rendered on the filter panel or the group panel.
     * <DataList 
     *  hiddenGroupKeys={['Icon']} hiddenFilterKeys={['Icon']}  
     *  columns={[
            {key: 'Icon' as any, name: 'Nome Do Projeto', fieldName: 'Title', minWidth: 100, maxWidth: 200, isResizable: true, renderFilterAs: 'SearchBox'}]} />
     * ```
    */
    columns: TColumn<T, ColMetaData>[];
    /**The list of items to be displayed.*/
    rows: T[];
    /**Custom styles to the component container and root. */
    styles?: IDataListStyles;
    plugins?: DataListPlugin<T>[];
    /**Configure the text of the column menu. */
    columnMenuConfig?: {
        sortAscText?: string;
        sortDescText?: string;
    }
}