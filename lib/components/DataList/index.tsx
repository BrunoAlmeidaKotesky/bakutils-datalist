import { useDataListController } from './useDataListController';
import { CheckboxVisibility, CollapseAllVisibility, DetailsList, DetailsListLayoutMode } from '@fluentui/react/lib/DetailsList';
import type { IDataListProps } from '../../models/IDataList';
import { DataListCtx } from './Context';
import { useRef } from 'react'
import { createUseDataListStore } from './store';
import type { DataListState, DataListStore } from '../../models/DataListStore';
import { ContextualMenu } from '@fluentui/react/lib/ContextualMenu';
import { useStyling } from './useStyling';

function DataListInner<Row, ColMetaData = any>(props: IDataListProps<Row, ColMetaData>) {
    useStyling({ enableColBorder: !!props?.styles?.enableColBorder });
    const { state, handlers } = useDataListController(props);
    const { rows, columns, groups, contextMenu, headerMenuItems } = state;
    const { onItemClick, verifyVirtualization, renderPlugins, setContextMenu, onColumnClick } = handlers;

    return (
        <div style={props?.styles?.root ?? {}}>
            <div className="data-list-plugins-area">{renderPlugins()}</div>
            <div data-is-scrollable="true" style={{ position: 'relative', zIndex: 0, overflowY: 'auto', height: props?.maxHeight, ...props?.styles?.contentContainer }} id="DataList-root">
                <DetailsList
                    {...props?.detailsListProps}
                    //@ts-ignore
                    onRenderItemColumn={props?.onRenderItemColumn}
                    onRenderRow={(p, defaultRender) =>
                        <div onClick={() => onItemClick(p?.item)}>
                            {defaultRender && defaultRender({ ...p!, styles: { root: { cursor: props?.onItemClick ? 'pointer' : 'default' } } }!)}
                        </div>}
                    items={rows} columns={columns}
                    styles={props?.styles?.detailListStyles}
                    groupProps={{
                        isAllGroupsCollapsed: true,
                        collapseAllVisibility: CollapseAllVisibility.visible,
                        onRenderHeader: (props, defaultRender) => {
                            if (!props?.group!.name || !defaultRender)
                                return <></>;
                            return defaultRender(props);
                        },
                        showEmptyGroups: false
                    }}
                    onRenderDetailsHeader={(props, defaultRender) => {
                        return (
                            <div id="dataListHeaderContainer">
                                {defaultRender && defaultRender({ ...props!, onColumnClick: onColumnClick as any })}
                                <div id={`headerPortalZone`} />
                            </div>
                        )
                    }}
                    groups={groups?.length === 0 ? undefined : groups}
                    onShouldVirtualize={verifyVirtualization()}
                    layoutMode={props?.layoutMode ?? DetailsListLayoutMode.fixedColumns} isHeaderVisible={true}
                    checkboxVisibility={props?.detailsListProps?.checkboxVisibility ?? CheckboxVisibility.hidden} />
                {contextMenu.visible && (
                    <ContextualMenu
                        items={headerMenuItems}
                        target={{ x: contextMenu.x, y: contextMenu.y }}
                        onDismiss={() => setContextMenu({ visible: false, x: 0, y: 0 })}
                    />
                )}
            </div>
        </div>);
}

export function DataList<Row, ColMetaData = any>(props: IDataListProps<Row, ColMetaData>) {
    return (
        //@ts-ignore
        <DataListProvider
            rows={props?.rows} plugins={props?.plugins as any || []}
            allRows={[]} columns={props?.columns as any}
            columnMenuConfig={props?.columnMenuConfig}>
            <DataListInner {...props} />
        </DataListProvider>
    )
}

type DataListProviderProps<Row> = React.PropsWithChildren<DataListState<Row> & Pick<IDataListProps<Row>, 'columnMenuConfig'>>;
function DataListProvider<Row>({ children, ...props }: DataListProviderProps<Row>) {
    const storeRef = useRef<DataListStore<Row>>();
    if (!storeRef.current) {
        //@ts-ignore
        storeRef.current = createUseDataListStore(props);
    }
    return (
        //@ts-ignore
        <DataListCtx.Provider value={storeRef.current}>
            {children}
        </DataListCtx.Provider>
    )
}