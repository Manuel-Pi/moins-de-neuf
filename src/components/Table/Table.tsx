import React, { useState } from 'react';
import { ClassNameHelper } from 'pizi-react';

type TableProps = {
    className?: string
    header: any[]
    body: any[]
    actions?: JSX.Element[]
    onSelect?: (data: any[]) => void
    selectable?: boolean
    animation?: string
    animationIncrement?: number
    animationDelay?: number
}

export const Table = ({ className, header, body = [], actions = [], onSelect, selectable = false, animation = "", animationIncrement = 1, animationDelay = 0}: TableProps) => {
    const[selectedRow, setSelectedRow] = useState(null);
    const tableClassName = ClassNameHelper({
        "table": true,
        "selectable": selectable
    }, className);

    const animationReverse = animation.indexOf("-reverse") !== -1;
    animation = animation.replace("-reverse", "");

    const trClassName = ClassNameHelper({
        "animate__animated": !!animation
    }, animation);

    const clickHandler = (i: number) => {
        setSelectedRow(i === selectedRow ? null : i);
        onSelect && onSelect(body[i === selectedRow ? null : i]);
    };

    return  <div className={tableClassName}>
                <div className="header">
                    <table>
                        <thead>
                        { header.map(el => <th>{el}</th>) }
                        </thead>
                        <tbody>
                        { body.map((row, i) => <tr className={ selectedRow === i ? "selected" : ""} onClick={e => clickHandler(i)}>{row.map((cell:any) => <td>{cell}</td>)}</tr>) }
                        </tbody>
                    </table>
                </div>
                <div className="body">
                    <table>
                        <thead>
                        { header.map(el => <th>{el}</th>) }
                        </thead>
                        <tbody>
                        { body.map((row, i) => <tr className={ trClassName + (selectedRow === i ? " selected" : "")} 
                                                    style={{animationDelay: ((animationReverse ? (body.length - i - 1) * animationIncrement: (i * animationIncrement)) + animationDelay) + "s"}}
                                                    onClick={e => clickHandler(i)}>{row.map((cell:any) => <td>{cell}</td>)}</tr>) 
                        }
                        </tbody>
                    </table>
                </div>
                <div className="actions animate__animated animate__fadeIn">
                { actions }
                </div>
            </div>
}