import type { DataListStore } from "../../models/DataListStore";
import { createContext } from "react";

export const DataListCtx = createContext<DataListStore<any> | null>(null);