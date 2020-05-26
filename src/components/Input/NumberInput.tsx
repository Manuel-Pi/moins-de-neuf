import React, { useState } from 'react';
import { CreateClassName } from '../../utils/Utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type NumberInputProps = {
    className?: string
    onChange: (value:number) => void
    initialValue?: number
    placeholder?: string
    min?: number
    max?: number
    step?: number
}

export const NumberInput = ({ className = "", onChange = (() => null), initialValue = 0, placeholder="", min = 0, max = 1000, step = 1}: NumberInputProps) => {
    const[value, setValue] = useState(initialValue);
    const[isMax, setIsMax] = useState(initialValue === max);
    const[isMin, setIsMin] = useState(initialValue === min);

    React.useEffect(() => { () => useState(initialValue) });

    const inputClassName = CreateClassName({
        "input": true,
        "number-input": true,
        "is-max": isMax,
        "is-min": isMin
    }, className);

    function increment(){
        const val = value + step > max ? max : value + step
        setValue(val);
        setIsMax(val === max);
        setIsMin(val === min);
        onChange(val);
    }

    function decrement(){
        const val = value - step < min ? min : value - step;
        setValue(val);
        setIsMax(val === max);
        setIsMin(val === min);
        onChange(val);
    }

    return  <div className={inputClassName}>
                <div className="placeholder">{placeholder}</div>
                <div className="input-container">
                    <FontAwesomeIcon icon="minus" onClick={e => decrement()}/>
                    <span>{value}</span>
                    <FontAwesomeIcon icon="plus"  onClick={e => increment()}/>
                </div>
            </div>
};