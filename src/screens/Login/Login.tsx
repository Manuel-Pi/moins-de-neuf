import React, { useEffect, useRef, useState } from 'react'
import { Logo } from '../../components/Logo/Logo'
import { Breakpoint, Button, ClassNameHelper, Modal, TextInput } from 'pizi-react'
import { PiziToken, PiziUsers } from '../../utils/PiziServer'
import { InputValidation } from 'pizi-react/src/components/Inputs/TextInput/TextInput'
import { CreateAccountModal } from './CreateAccount'

interface LoginProps {
    onLogin: (username:any, token:any) => void
    breakpoint: Breakpoint
}
 
export const Login = ({ onLogin = e => null, breakpoint}:LoginProps) => {
    const[userStatus, setUserStatus] = useState("")
    const[inputValue, setInputValue] = useState("")
    const[passwordValue, setPasswordValue] = useState("")
    const[passwordError, setPasswordError] = useState("")
    const[error, setError] = useState(false)
    const passRef = useRef<HTMLInputElement>(null)

    const login = (password?: string) => {
        if(error) return

        if(!inputValue) return
        PiziToken.getToken(inputValue, password || "check").then((token:any) => {
            if(token && token.exist){
                if(password) setPasswordError("Mauvais mot de passe!")
                setUserStatus("exist")
            } else if(!password){
                setUserStatus("new")
            } else if(token){
                onLogin(inputValue, token)
            }
        })
    }
    
    return  <div className="login">
                <Logo/>
                <div className={ClassNameHelper("inputs",   {
                                                                "user-valid": userStatus === "exist",
                                                                "animate__animated animate__headShake": passwordError
                                                            })}>
                    <TextInput  label="login" 
                                appearance="alt"
                                autoFocus
                                valdationMessage={InputValidation.login.message}
                                valdationRegex={InputValidation.login.regex}
                                onChange={value => setInputValue(value)}
                                onError={setError}
                                onKeyEnter={() => {
                                    login(passwordValue)
                                    if(passRef.current) setTimeout(() => passRef.current.focus(), 400)
                                }}/>
                    <TextInput  label="password" 
                                type="password"
                                appearance="alt" 
                                autoFocus
                                error={passwordError}
                                onError={setError}
                                forwardRef={passRef}
                                onChange={value => {
                                    setPasswordValue(value)
                                    setPasswordError("")
                                }}
                                onKeyEnter={() => {
                                    login(passwordValue)
                                }}/>
                    <Button color="secondary" onClick={e => login(passwordValue)}>ok</Button>
                    <CreateAccountModal open={userStatus === "new"} 
                                        onCreated={token => onLogin(inputValue, token)} 
                                        login={inputValue} 
                                        fullScreen={breakpoint === "xs"}
                                        onClose={action => action === "cancel" ? setUserStatus("") : ""}>
                        <Button color="main" appearance="border" className="no-account" onClick={() => onLogin(inputValue, null)}>Continuer sans compte</Button>
                    </CreateAccountModal>
                </div>
                <a hidden={userStatus !== "exist"} className="reset-link" href="/server/password-reset">reset password!</a>
                <Button display={userStatus === "exist"} appearance="border" color="secondary" iconLeft="chevron-left" onClick={() => {
                    setUserStatus("")
                    setPasswordValue("")
                }}>change login</Button>
            </div>
}