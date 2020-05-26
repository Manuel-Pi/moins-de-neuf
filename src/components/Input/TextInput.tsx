import React, { useState } from 'react';
import { CreateClassName } from '../../utils/Utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type TextInputProps = {
    className?: string
    onChange: (value:string) => void
    initialValue?: string
    placeholder?: string
}

export const TextInput = ({ className = "", onChange = (() => null), initialValue = "", placeholder=""}: TextInputProps) => {
    const[value, setValue] = useState(initialValue);
    const[isFocus, setFocus] = useState(false);

    React.useEffect(() => { () => useState(initialValue) });

    const inputClassName = CreateClassName({
        "input": true,
        "text-input": true,
        "empty": !value,
        "focus": isFocus
    }, className);

    function onChangeHandler(event: any){
        setValue(event.currentTarget.value);
        onChange(event.currentTarget.value);
    }

    return  <div className={inputClassName}>
                <div className="placeholder">{placeholder}</div>
                <input  type="text" 
                        value={value} 
                        onChange={onChangeHandler} onFocus={e => setFocus(true)} onBlur={e => setFocus(false)}/>
            </div>
};