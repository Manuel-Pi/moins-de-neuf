import React, { useState } from 'react'
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

    const login = (password?: string) => {
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
                                                                "user-valid": userStatus === "exist"
                                                            })}>
                    <TextInput  label="login" 
                                appearance="alt" 
                                onChange={value => setInputValue(value)}
                                onKeyDown={event => event.key === 'Enter' && login(passwordValue)}/>
                    <TextInput  label="password" 
                                type="password"
                                appearance="alt" 
                                error={passwordError}
                                onChange={value => {
                                    setPasswordValue(value)
                                    setPasswordError("")
                                }}
                                onKeyDown={event => event.key === 'Enter' && login(passwordValue)}/>
                    <Button color="secondary" onClick={e => login(passwordValue)}>ok</Button>
                    <CreateAccountModal open={userStatus === "new"} 
                                        onCreated={token => onLogin(inputValue, token)} 
                                        login={inputValue} 
                                        fullScreen={breakpoint === "xs"}
                                        onClose={action => action === "cancel" ? setUserStatus("") : ""}>
                        <Button color="main" appearance="border" className="change-password" onClick={() => onLogin(inputValue, null)}>Continuer sans compte</Button>
                    </CreateAccountModal>
                </div>
                <Button display={userStatus === "exist"} iconLeft="chevron-left" onClick={() => {
                    setUserStatus("")
                    setPasswordValue("")
                }}>change login</Button>
            </div>
}