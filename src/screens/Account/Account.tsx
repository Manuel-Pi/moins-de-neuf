import { AppScreenProps, Heading, TextInput } from 'pizi-react';
import React, {Component, useReducer } from 'react';
import { Rest } from '../../utils/Rest';
import { ClassNameHelper } from 'pizi-react';

type AccountState = {
    user: {
        login: string,
        role: string
    }
}

interface AccountProps extends AppScreenProps {
    className?: string
    token: any
}

export class Account extends Component<AccountProps, AccountState> {

    constructor(props: AccountProps){
        super(props);
        this.state = {
            user: {
                login: "",
                role: ""
            }
        }
    }

    componentDidMount(){
        if(this.props.token) Rest.get('users/' + this.props.token.user).then(user => {
            this.setState({user})
        }).catch(rep => {
            console.log("error")
        })
}

    render(){
        return  <div className={ClassNameHelper("screen account", this.props.className)}>
                    <Heading tag="h1" appearance="simple" color="secondary">Compte</Heading>
                    <div className="content">
                        <TextInput  label="Username"
                                    color="secondary"
                                    defaultValue={"this.state.user.login"}
                                    readOnly
                                    appearance="alt"/>
                        <TextInput  label="Role"
                                    color="secondary"
                                    defaultValue={"this.state.user.role"}
                                    readOnly
                                    appearance="alt"/>
                        <TextInput  label="Email"
                                    color="secondary"
                                    defaultValue={"exemple@pizi.com"}
                                    readOnly
                                    appearance="alt"/>
                    </div>
                </div>
    }
}