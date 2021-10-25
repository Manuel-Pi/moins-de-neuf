import { AppScreenProps, Heading, Modal, TextInput } from 'pizi-react';
import React, {Component, useEffect, useReducer, useState } from 'react';
import { Rest } from '../../utils/Rest';
import { ClassNameHelper } from 'pizi-react';
import { UserProps } from '../../models/UserModel';
import { Button } from 'pizi-react/src/components/Controls/Button/Button';
import { ValidationRegExp } from 'pizi-react/src/components/Inputs/TextInput/TextInput';

interface AccountState {
    user: {
        login: string,
        role: string
    }
}

interface AccountProps extends AppScreenProps {
    token: any
}

type FieldData = {
    initialValue: string
    value: string
    label: string
    regex: RegExp
    needPassword: boolean
    needEmailCode: boolean
    password: string
    emailCode: string
}

type EditedFieldValues = "email" | "login" | "password"

export const Account: React.FC<AccountProps> = ({
    token = null
}) => {

    const DEFAULT_FIELD_DATA = {
        initialValue: "",
        value: "",
        label: "",
        regex: null,
        needPassword: false,
    } as FieldData

    const[user, setUser]: [UserProps, (user: UserProps) => void] = useState(null)
    const[error, setError] = useState(false)
    const[displayEmailCodeField, setDisplayEmailCodeField] = useState(false)
    const[emailCode, setEmailCode] = useState(null)
    const[displayPasswordField, setDisplayPasswordField] = useState(false)
    const[password, setPassword] = useState(false)
    const[editedField, setEditedField] = useState(null as EditedFieldValues)
    const[fieldData, setFieldData] = useState(DEFAULT_FIELD_DATA)

    useEffect(() => {
        switch (editedField) {
            case "email":
                setFieldData({
                    initialValue: user.email,
                    value: user.email,
                    label: "Nouvel email",
                    regex:  ValidationRegExp.email,
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
                    regex:  ValidationRegExp.text,
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
                    regex:  ValidationRegExp.text,
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
        if(token) Rest.get('users/' + token.user).then(setUser).catch(rep => {
            console.log("error")
        })
    },[])

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
                    <Button color="error">Supprimer le compte</Button>
                </div>
                <Modal  type="confirm" 
                        open={!!editedField}
                        header="Édition"
                        color="secondary"
                        onClose={action => {
                            if(error) return false
                            if(action === "confirm" && fieldData.value !== fieldData.initialValue){
                                if(fieldData.needPassword && !displayPasswordField){
                                    setDisplayPasswordField(true)
                                    return false
                                }
                                if(fieldData.needEmailCode && !displayEmailCodeField){
                                    setDisplayEmailCodeField(true)
                                    return false
                                }
                            }
                            setEditedField(null) 
                        }}
                        onClosed={() => {
                            setDisplayEmailCodeField(false)
                            setDisplayPasswordField(false)
                            setFieldData(DEFAULT_FIELD_DATA)
                        }}>
                        <TextInput  label={fieldData.label} 
                                    defaultValue={fieldData.value}
                                    valdationRegex={fieldData.regex}
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
                                    onChange={password => setFieldData({...fieldData, password})}/>
                        <TextInput label="Code de vérification envoyé par email"
                                   valdationRegex={/\d{6}/}
                                   display={displayEmailCodeField}/>
                </Modal>
            </div>
}