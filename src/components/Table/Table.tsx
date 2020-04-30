import React, { useState } from 'react';
import { CreateClassName } from '../Utils/Utils';

type TableProps = {
    className: string
    header: any[]
    body: any[]
    actions?: JSX.Element[]
    onSelect?: (data: any[]) => void
    selectable?: boolean
}

export const Table = ({ className, header, body = [], actions = [], onSelect, selectable = false}: TableProps) => {
    const[selectedRow, setSelectedRow] = useState(null);
    const tableClassName = CreateClassName({
        "table": true,
        "selectable": selectable
    }, className);

    const clickHandler = (i: number) => {
        setSelectedRow(i === selectedRow ? null : i);
        onSelect && onSelect(body[i === selectedRow ? null : i]);
    };

    return  <div className={tableClassName}>
                <table>
                    <thead>
                    { header.map(el => <th>{el}</th>) }
                    </thead>
                    <tbody>
                    { body.map((row, i) => <tr className={ selectedRow === i ? "selected" : ""} onClick={e => clickHandler(i)}>{row.map((cell:any) => <td>{cell}</td>)}</tr>) }
                    </tbody>
                </table>
                <div className="actions">
                { actions }
                </div>
            </div>
}