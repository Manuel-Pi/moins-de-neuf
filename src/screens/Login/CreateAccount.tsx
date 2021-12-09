import { Modal, TextInput } from 'pizi-react'
import React, { useEffect, useState } from 'react'
import { PiziToken, PiziUsers } from '../../utils/PiziServer'
import { InputValidation } from 'pizi-react/src/components/Inputs/TextInput/TextInput'

interface ICreateAccountDialogProps {
    open: boolean
    fullScreen?: boolean
    onCreated: (token: any) => void
    login: string
    onClose: (action: string) => void
}

export const CreateAccountModal: React.FunctionComponent<ICreateAccountDialogProps> = ({login = "", open = false, fullScreen = false, onCreated = () => null, onClose = () => null, ...props}) => {

    const[form, setForm] = useState({login, password: "", email: "", checkCode:""})
    const[error, setError] = useState(false)
    const[displayEmailCodeField, setDisplayEmailCodeField] = useState(false)
    const[wrongCode, setWrongCode] = useState(false)

    useEffect(() => setForm({...form, login}), [login])

    return <Modal  open={open}
            header="Créer compte"
            type="confirm"
            color="secondary"
            fullScreen={fullScreen}
            className="create-account"
            onClose={action => {
                if(action === "confirm"){
                    if(error || !form.email || !form.password || (displayEmailCodeField && !form.checkCode)) return
                    if(!displayEmailCodeField){
                        PiziUsers.createUser(form).then(res => setDisplayEmailCodeField(true)).catch(err => console.log("cannot send email"))
                    } else if(form.email && form.password && displayEmailCodeField){
                        PiziUsers.createUser(form).then(res => {
                            PiziToken.getToken(form.login, form.password || "check").then((token:any) => {
                                if(token && !token.exist) onCreated(token)
                            })
                        }).catch(err => setWrongCode(true))
                    }
                } else {
                    setForm({...form,
                        password: "",
                        email: ""
                    })
                }
                onClose(action)
            }}>
            <p>
                Aucun compte associé à <span className="username">{form.login}</span>.
                Vous pouvez vous connecter sans compte, cependant vos stats ne seront pas sauvegardées.
            </p>
            <TextInput  label="Email"
                    onError={setError}
                    onChange={email => setForm({...form, email})}
                    autoFocus
                    valdationRegex={InputValidation.email.regex}
                    display={!displayEmailCodeField}
                    valdationMessage={InputValidation.email.message}/>
            <TextInput  label="Mot de passe"
                    type="text"
                    valdationRegex={InputValidation.password.regex}
                    valdationMessage={InputValidation.password.message}
                    display={!displayEmailCodeField}
                    onError={setError}
                    onChange={password => setForm({...form, password})}/>
            <TextInput label="Code de vérification envoyé par email"
                    valdationRegex={/^\d{6}$/}
                    valdationMessage="6 chiffres seulement"
                    error={wrongCode ? "Code incorrect!" : null}
                    display={displayEmailCodeField}
                    onError={setError}
                    onChange={checkCode => setForm({...form, checkCode})}/>
            {props.children}
        </Modal>
}
