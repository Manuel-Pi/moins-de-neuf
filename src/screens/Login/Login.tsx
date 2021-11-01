import React, { useState } from 'react'
import { Logo } from '../../components/Logo/Logo'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Breakpoint, Button, ClassNameHelper, Modal, TextInput } from 'pizi-react'
import { TextInput as OldTextInput } from '../../components/Input/TextInput'
import { PiziToken, PiziUsers } from '../../utils/PiziServer'
import { InputValidation } from 'pizi-react/src/components/Inputs/TextInput/TextInput'

interface LoginProps {
    onLogin: (username:any, token:any) => void
    breakpoint: Breakpoint
}
 
export const Login = ({ onLogin = e => null, breakpoint}:LoginProps) => {
    const[userStatus, setUserStatus] = useState("")
    const[inputValue, setInputValue] = useState("")
    const[passwordValue, setPasswordValue] = useState("")
    const[error, setError] = useState(false)
    const[emailCode, setEmailCode] = useState(null)
    const[email, setEmail] = useState(null)
    const[displayEmailCodeField, setDisplayEmailCodeField] = useState(false)
    const[wrongCode, setWrongCode] = useState(false)

    const login = () => {
        PiziToken.getToken(inputValue, passwordValue || "check").then((token:any) => {
            if(token && token.exist){
                setUserStatus("exist")
            } else if(!passwordValue){
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
                    <OldTextInput placeholder="Pseudo..."
                             onChange={value  => setInputValue(value)}
                             onKeyDown={event => event.key === 'Enter' && login()}/>
                    <OldTextInput placeholder="Password..." password
                             onChange={value  => setPasswordValue(value)}
                             onKeyDown={event => event.key === 'Enter' && login()}/>
                    <FontAwesomeIcon icon="paper-plane" onClick={e => login()}/>
                    <Modal  open={userStatus === "new"}
                            header="Créer compte"
                            type="confirm"
                            color="secondary"
                            fullScreen={breakpoint === "xs"}
                            onClose={action => {
                                if(action === "confirm"){
                                    if(error || !email || !passwordValue || (displayEmailCodeField && !emailCode)) return
                                    if(!displayEmailCodeField){
                                        PiziUsers.createUser({login: inputValue, password: passwordValue, email}).then(res => {
                                            setDisplayEmailCodeField(true)
                                        }).catch(err => console.log("cannot send email"))
                                        return
                                    } else if(email && passwordValue && displayEmailCodeField){
                                        PiziUsers.createUser({login: inputValue, checkCode: emailCode}).then(res => {
                                            setUserStatus("")
                                            login()
                                            return
                                        }).catch(err => {
                                            setWrongCode(true)
                                        })
                                    }
                                } else {
                                    setUserStatus("")
                                    setPasswordValue("")
                                    setEmail("")
                                } 
                            }}>
                        <p>
                            Aucun compte associé à <span className="username">{inputValue}</span>.
                            Vous pouvez vous connecter sans compte, cependant vos stats ne seront pas sauvegardées.
                        </p>
                        <TextInput  label="Email"
                                    onError={setError}
                                    onChange={setEmail}
                                    autoFocus
                                    valdationRegex={InputValidation.email.regex}
                                    valdationMessage={InputValidation.email.message}/>
                        <TextInput  label="Mot de passe"
                                    type="text"
                                    valdationRegex={InputValidation.password.regex}
                                    valdationMessage={InputValidation.password.message}
                                    onError={setError}
                                    onChange={setPasswordValue}/>
                        <TextInput label="Code de vérification envoyé par email"
                                   valdationRegex={/^\d{6}$/}
                                   valdationMessage="6 chiffres seulement"
                                   error={wrongCode ? "Code incorrect!" : null}
                                   display={displayEmailCodeField}
                                   onError={setError}
                                   onChange={setEmailCode}/>
                        <Button color="main" appearance="border" className="change-password" onClick={() => onLogin(inputValue, null)}>Continuer sans compte</Button>
                    </Modal>
                </div>
            </div>
}