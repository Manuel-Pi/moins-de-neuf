import React, {Component, useReducer } from 'react';
import { TextInput } from '../../components/Input/TextInput';
import { Table } from '../../components/Table/Table';
import { Rest } from '../../utils/Rest';
import { CreateClassName } from '../../utils/Utils';

type AccountState = {
    user: {
        login: string,
        role: string
    }
}

type AccountProps = {
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
            this.setState({user});
        }).catch(rep => {
            console.log("error");
        });
}

    render(){

        const className = CreateClassName({
            "screen account": true
        }, this.props.className);

        return  <div className={className}>
                    <h1>Compte</h1>
                    <div className="content">
                        <TextInput  className="disabled"
                                    initialValue={this.state.user.login}
                                    placeholder="Username"/>
                        <TextInput  className="disabled"
                                    initialValue={this.state.user.role}
                                    placeholder="Role"/>
                    </div>
                </div>
    }
}