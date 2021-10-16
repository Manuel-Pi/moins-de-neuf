import React, { useState } from 'react';
import { ClassNameHelper } from 'pizi-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type CheckBoxProps = {
    className?: string
    onChange: (value:boolean) => void
    initialValue?: boolean
    placeholder?: string
}

export const CheckBox = ({ className = "", onChange = (() => null), initialValue = false, placeholder=""}: CheckBoxProps) => {
    const[value, setValue] = useState(initialValue);

    React.useEffect(() => { () => useState(initialValue) });

    const inputClassName = ClassNameHelper({
        "input": true,
        "checkbox": true,
        "checked": value
    }, className);


    function onToggle(){
        setValue(!value);
        onChange(!value);
    }

    return  <div className={inputClassName}>
                <div className="placeholder">{placeholder}</div>
                <FontAwesomeIcon icon="toggle-off" onClick={e => onToggle()}/>
                <FontAwesomeIcon icon="toggle-on"  onClick={e => onToggle()}/>
            </div>
};