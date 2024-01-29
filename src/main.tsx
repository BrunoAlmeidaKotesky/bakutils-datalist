import { render } from 'react-dom'
import { DataList, FilterPlugin, SearchBoxPlugin, TColumn } from '../lib/index';
import { initializeIcons } from '@fluentui/react/lib/Icons';

type MyRow = {
    name: string;
    age: number;
    address: string;
    issueDate: string;
}
initializeIcons();
const plugins = [
    new FilterPlugin<MyRow>(),
    new SearchBoxPlugin<MyRow>()
]
const rows: MyRow[] = [
    {
        name: "John",
        age: 24,
        address: "London",
        issueDate: "2021-05-01"
    },
    {
        name: "Jane",
        age: 22,
        address: "Paris",
        issueDate: "2021-05-01"
    },
    {
        name: "Jack",
        age: 26,
        address: "New York",
        issueDate: "2021-05-01"
    },
    {
        name: "Jill",
        age: 28,
        address: "Tokyo",
        issueDate: "2021-05-01"
    }
];
const columns: TColumn<MyRow>[] = [
    {
        key: "name",
        name: "Name",
        fieldName: "name",
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        onColumnClick: (ev, column) => {
            console.log(column);
        }
    },
    {
        key: "age",
        name: "Age",
        fieldName: "age",
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        transformations: {
            renderAs: 'number',
            locales: ['en']
        },
        onColumnClick: (ev, column) => {
            console.log(column);
        }
    },
    {
        key: "address",
        name: "Address",
        fieldName: "address",
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        onColumnClick: (ev, column) => {
            console.log(column);
        }
    },
    {
        key: "issueDate",
        name: "Issue Date",
        fieldName: "issueDate",
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        onColumnClick: (ev, column) => {
            console.log(column);
        },
        transformations: {
            renderAs: 'date',
            locales: ['en']
        }
    }
]

render(<DataList rows={rows} columns={columns} plugins={plugins} />, document.getElementById('root'));
