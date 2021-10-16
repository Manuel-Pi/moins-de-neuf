import React, { useState } from 'react';
import { ClassNameHelper } from 'pizi-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type ListInputProps = {
    className?: string
    onChange: (value:string) => void
    placeholder?: string
    values: string[]
    initialValue: string
}

export const ListInput = ({ className = "", onChange = (() => null), placeholder="", values = [], initialValue = ""}: ListInputProps) => {
    const initval = (values.includes(initialValue) ? initialValue : "") || values[0] || "";
    const[value, setValue] = useState(initval);
    const[isLast, setIsLast] = useState(values.length && values[values.length - 1] === initialValue);
    const[isFirst, setIsFirst] = useState(values[0] === initialValue);

    React.useEffect(() => { () => useState(initialValue) });

    const inputClassName = ClassNameHelper({
        "input": true,
        "list-input": true,
        "is-last": isLast,
        "is-first": isFirst
    }, className);

    function next(){
        let index = values.indexOf(value);
        let val = index + 1 < values.length ? values[index + 1] : value;
        setValue(val);
        setIsLast(values.length && values[values.length - 1] === val);
        setIsFirst(val === values[0]);
        onChange(val);
    }

    function previous(){
        let index = values.indexOf(value);
        let val = index - 1 < 0 ? value : values[index - 1];
        setValue(val);
        setIsLast(values.length && values[values.length - 1] === val);
        setIsFirst(val === values[0]);
        onChange(val);
    }

    return  <div className={inputClassName}>
                <div className="placeholder">{placeholder}</div>
                <div className="input-container">
                    <FontAwesomeIcon icon="angle-left" onClick={e => previous()}/>
                    <span>{value}</span>
                    <FontAwesomeIcon icon="angle-right"  onClick={e => next()}/>
                </div>
            </div>
};