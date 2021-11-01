import { AppScreenProps, Heading, Modal, TextInput } from 'pizi-react';
import React, {useEffect, useState } from 'react';
import { PiziToken, PiziUsers } from '../../utils/PiziServer';
import { ClassNameHelper } from 'pizi-react';
import { UserProps } from '../../models/UserModel';
import { Button } from 'pizi-react/src/components/Controls/Button/Button';
import { InputValidation } from 'pizi-react/src/components/Inputs/TextInput/TextInput';

interface AccountProps extends AppScreenProps {
    token: any
}

type FieldData = {
    initialValue: string
    value: string
    label: string
    regex: RegExp
    validationMessage: string
    needPassword: boolean
    needEmailCode: boolean
    password: string
    emailCode: string
}

type EditedFieldValues = "email" | "login" | "password" | "delete"

export const Account: React.FC<AccountProps> = ({
    token = null
}) => {

    const DEFAULT_FIELD_DATA = {
        initialValue: "",
        value: "",
        label: "",
        regex: null,
        needPassword: false,
        validationMessage: null
    } as FieldData

    const[user, setUser]: [UserProps, (user: UserProps) => void] = useState(null)
    const[error, setError] = useState(false)
    const[displayEmailCodeField, setDisplayEmailCodeField] = useState(false)
    const[emailCode, setEmailCode] = useState(null)
    const[displayPasswordField, setDisplayPasswordField] = useState(false)
    const[checkPassword, setCheckPassword] = useState("")
    const[editedField, setEditedField] = useState(null as EditedFieldValues)
    const[fieldData, setFieldData] = useState(DEFAULT_FIELD_DATA)
    const[wrongCode, setWrongCode] = useState(false)

    useEffect(() => {
        switch (editedField) {
            case "email":
                setFieldData({
                    initialValue: user.email,
                    value: user.email,
                    label: "Nouvel email",
                    regex:  InputValidation.email.regex,
                    validationMessage: InputValidation.email.message,
                    needPassword: true,
                    needEmailCode: true,
                    password: "",
                    emailCode: ""
                })
                break

            case "login":
                setFieldData({
                    initialValue: user.login,
                    value: user.login,
                    label: "Nouveau login",
                    regex:  InputValidation.text.regex,
                    validationMessage: InputValidation.text.message,
                    needPassword: true,
                    needEmailCode: false,
                    password: "",
                    emailCode: ""
                })
                break

            case "password":
                setFieldData({
                    initialValue: "",
                    value: "",
                    label: "Nouveau mot de passe",
                    regex:  InputValidation.password.regex,
                    validationMessage: InputValidation.password.message,
                    needPassword: true,
                    needEmailCode: false,
                    password: "",
                    emailCode: ""
                })
                break

            case "delete":
                setFieldData({
                    initialValue: "delete",
                    value: "",
                    label: "",
                    regex:  null,
                    validationMessage: null,
                    needPassword: true,
                    needEmailCode: false,
                    password: "",
                    emailCode: ""
                })
                break
        
            default:
                break
        }
    },[editedField])

    useEffect(() => {
        if(token) PiziUsers.getUser(token.user).then(setUser).catch(rep => {
            console.log("cannot get user!", rep)
        })
    },[token])

    return  <div className={ClassNameHelper("screen account")}>
                <Heading tag="h1" appearance="simple" color="secondary">Compte</Heading>
                <div className="pizi-container">
                    <div className="pizi-input-container">
                        <TextInput  label={"Login"}
                                    color="secondary"
                                    defaultValue={user?.login}
                                    readOnly
                                    appearance="alt"/>
                        <Button icon="edit" appearance="fill" color="secondary" onClick={() => setEditedField("login")}/>
                    </div>
                    <div className="pizi-input-container">
                        <TextInput  label={"Email"}
                                    color="secondary"
                                    defaultValue={user?.email}
                                    readOnly
                                    appearance="alt"/>
                        <Button icon="edit" appearance="fill" color="secondary" onClick={() => setEditedField("email")}/>
                    </div>
                    <Button color="secondary" className="change-password" onClick={() => setEditedField("password")}>Changer le mot de passe</Button>
                    <Button color="error" onClick={() => {
                                                            setEditedField("delete")
                                                            setDisplayPasswordField(true)
                                                        }}>Supprimer le compte</Button>
                </div>
                <Modal  type="confirm" 
                        open={!!editedField}
                        header="Édition"
                        color="secondary"
                        onClose={action => {
                            if(action === "confirm" && fieldData.value !== fieldData.initialValue){
                                if(error) return false
                                if(fieldData.needPassword && !displayPasswordField){
                                    setDisplayPasswordField(true)
                                    return false
                                }
                                if(fieldData.needEmailCode && !displayEmailCodeField){
                                    // Update user
                                    PiziUsers.updateUser(user.login, {[editedField]: fieldData.value, checkPassword}).then(param => {
                                        setDisplayEmailCodeField(true)
                                    }).catch(err => console.log("cannot send email"))
                                    return 
                                }
                                if(editedField === "delete"){
                                    PiziUsers.deleteUser(user.login, {checkPassword}).then(() => location.reload())
                                } else {
                                    // Update user
                                    PiziUsers.updateUser(user.login, {[editedField]: fieldData.value, checkPassword, checkCode: emailCode}).then(param => {
                                        // Refresh token and page if login changed
                                        if(editedField === "login"){
                                            PiziToken.getToken(fieldData.value, checkPassword).then(() => location.reload())
                                        } else location.reload()
                                    }).catch(error => {})
                                }
                                return
                            }
                            setEditedField(null) 
                            setCheckPassword(null)
                            setFieldData(DEFAULT_FIELD_DATA)
                        }}
                        onClosed={() => {
                            setDisplayEmailCodeField(false)
                            setDisplayPasswordField(false)
                            setEditedField(null) 
                            setCheckPassword(null)
                            setFieldData(DEFAULT_FIELD_DATA)
                        }}>
                        <TextInput  display={!!fieldData.label}
                                    label={fieldData.label} 
                                    defaultValue={fieldData.value}
                                    valdationRegex={fieldData.regex}
                                    valdationMessage={fieldData.validationMessage}
                                    onError={setError}
                                    readOnly={displayPasswordField || displayEmailCodeField}
                                    onChange={value => setFieldData({...fieldData, value})}/>
                        <p  className="password-needed" 
                            hidden={!displayPasswordField}>
                            Saisir le mot de passe actuel pour valider ce changement.
                        </p>
                        <TextInput  label="Mot de passe"
                                    type="password"
                                    display={displayPasswordField}
                                    onError={setError}
                                    onChange={setCheckPassword}/>
                        <TextInput label="Code de vérification envoyé par email"
                                   valdationRegex={/^\d{6}$/}
                                   valdationMessage="6 chiffres seulement"
                                   error={wrongCode ? "Code incorrect!" : null}
                                   onError={setError}
                                   onChange={setEmailCode}
                                   display={displayEmailCodeField}/>
                </Modal>
            </div>
}