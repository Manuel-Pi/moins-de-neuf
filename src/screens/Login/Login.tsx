import React, { useState, useEffect, CSSProperties } from 'react';
import { Logo } from '../../components/Logo/Logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CreateClassName } from '../../utils/Utils';

type LoginProps = {
    className: string
    onLogin: (username:any) => void
}
 
export const Login = ({ onLogin, className}:LoginProps) => {
    onLogin = onLogin || (e => null);
    const[inputValue, setInputValue] = useState("");
    return  <div className={"login " + className}>
                <Logo/>
                <div className="input">
                    <input  type="text"
                            placeholder="Pseudo..." 
                            onChange={event => setInputValue(event.currentTarget.value)} 
                            autoFocus
                            onKeyDown={event => event.key === 'Enter' && onLogin(inputValue)}/>
                    <FontAwesomeIcon icon="paper-plane" onClick={e => onLogin(inputValue)}/>
                </div>
            </div>
}