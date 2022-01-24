import { Modal, TextInput } from 'pizi-react'
import React, { useEffect, useRef, useState } from 'react'
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
    const[modalOpen, setModalOpen] = useState(open)

    const emailRef = useRef(null)
    const passwordRef = useRef(null)
    const checkCodeRef = useRef(null)

    useEffect(() => setForm({...form, login}), [login])
    useEffect(() => {
        setModalOpen(open)
        if(open && emailRef.current) setTimeout(() => emailRef.current.focus(), 400)
    }, [open])

    useEffect(() => {
        if(displayEmailCodeField && checkCodeRef.current) setTimeout(() => checkCodeRef.current.focus(), 400)
    }, [displayEmailCodeField])

    return <Modal  open={modalOpen}
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
            {
                displayEmailCodeField ? <p>
                                            Un email a été envoyé à <span className="username">{form.email}</span>.
                                            Utilisez le code reçu afin de valider votre compte.
                                        </p>
                                        :
                                        <>
                                            <p style={{textAlign: "center"}}>
                                                Aucun compte associé à <span className="username">{form.login}</span>!<br/>
                                            </p>
                                            <p style={{fontSize: "1em"}}>
                                                Vous pouvez vous connecter sans compte, cependant vos stats ne seront pas sauvegardées.
                                            </p>
                                            <p style={{fontSize: "1em"}}>
                                                Entrez votre email pour créer un compte (votre email sera seulement utilisé pour la gestion de votre compte).
                                            </p>
                                        </>
                                        

            }
            <TextInput  label="Email"
                    forwardRef={emailRef}
                    onError={setError}
                    onChange={email => setForm({...form, email})}
                    valdationRegex={InputValidation.email.regex}
                    display={!displayEmailCodeField}
                    valdationMessage={InputValidation.email.message}
                    onKeyEnter={() => passwordRef.current && passwordRef.current.focus()}/>
            <TextInput  label="Mot de passe"
                    type="text"
                    forwardRef={passwordRef}
                    valdationRegex={InputValidation.password.regex}
                    valdationMessage={InputValidation.password.message}
                    display={!displayEmailCodeField}
                    onError={setError}
                    onChange={password => setForm({...form, password})}/>
            <TextInput label="Code de vérification envoyé par email"
                    valdationRegex={/^\d{6}$/}
                    forwardRef={checkCodeRef}
                    valdationMessage="6 chiffres seulement"
                    error={wrongCode ? "Code incorrect!" : null}
                    display={displayEmailCodeField}
                    onError={setError}
                    onChange={checkCode => setForm({...form, checkCode})}/>
            {props.children}
        </Modal>
}
