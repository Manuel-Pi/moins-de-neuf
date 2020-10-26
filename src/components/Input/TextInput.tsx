import React, { useState } from 'react';
import { CreateClassName } from '../../utils/Utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect } from 'react';

type TextInputProps = {
    className?: string
    onChange?: (value:string) => void
    initialValue?: string
    placeholder?: string
    onKeyDown?: (e:any) => void
    password?: boolean
}

export const TextInput = ({ className = "", onChange = (() => null), initialValue = "", placeholder="", onKeyDown = (() => null), password}: TextInputProps) => {
    const[value, setValue] = useState(initialValue);
    const[isFocus, setFocus] = useState(false);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const inputClassName = CreateClassName({
        "input": true,
        "text-input": !password,
        "password-input": password,
        "empty": !value,
        "focus": isFocus
    }, className);

    function onChangeHandler(event: any){
        setValue(event.currentTarget.value);
        onChange(event.currentTarget.value);
    }

    return  <div className={inputClassName}>
                <div className="placeholder">{placeholder}</div>
                <input  type={password ? "password" : "text"}
                        value={value} 
                        onKeyDown={onKeyDown}
                        onChange={onChangeHandler} onFocus={e => setFocus(true)} onBlur={e => setFocus(false)}/>
            </div>
};