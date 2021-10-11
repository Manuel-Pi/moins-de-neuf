import React, { useState, useEffect, CSSProperties } from 'react';
import { Logo } from '../../components/Logo/Logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CreateClassName } from '../../utils/Utils';
import { TextInput } from '../../components/Input/TextInput';
import { Rest } from '../../utils/Rest';
import { AppScreenProps } from 'pizi-react';

interface LoginProps extends AppScreenProps {
    className?: string
    onLogin: (username:any, token:any) => void
    socket: any
}
 
export const Login = ({ onLogin = e => null, className, socket}:LoginProps) => {
    const[userValid, setUserValid] = useState(false);
    const[inputValue, setInputValue] = useState("");
    const[passwordValue, setPasswordValue] = useState("check");

    const inputsClassName = CreateClassName({
        "user-valid": userValid
    }, "inputs");

    const login = () => {
        Rest.getToken(inputValue, passwordValue).then((token:any) => {
            if(!token || !token.exist){
                onLogin(inputValue, token);
            } else {
                setUserValid(true);
            }
        })
    }
    
    return  <div className={"login " + className}>
                <Logo/>
                <div className={inputsClassName}>
                    <TextInput placeholder="Pseudo..."
                             onChange={value  => setInputValue(value)}
                             onKeyDown={event => event.key === 'Enter' && login()}/>
                    <TextInput placeholder="Password..." password
                             onChange={value  => setPasswordValue(value)}
                             onKeyDown={event => event.key === 'Enter' && login()}/>
                    <FontAwesomeIcon icon="paper-plane" onClick={e => login()}/>
                </div>
            </div>
}