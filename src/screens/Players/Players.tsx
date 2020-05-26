import React, {Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CreateClassName } from '../../utils/Utils';
import { GameModel, GameInfo } from '../GameBoard/GameModel';
import { Table } from '../../components/Table/Table';
import { Modal } from '../../components/Modal/Modal';
import { TextInput } from '../../components/Input/TextInput';
import { NumberInput } from '../../components/Input/NumberInput';
import { CheckBox } from '../../components/Input/CheckBox';
import { ListInput } from '../../components/Input/ListInput';
import { Tabs } from '../../components/Tabs/Tabs';
import { Score } from '../../components/Player/Score';

type PlayersState = {
    players: {
        name: string,
        currentGame: {name: string}
    }[]
}

type PlayersProps = {
    socket: any
    className: string
}

export class Players extends Component<PlayersProps, PlayersState> {

    constructor(props: PlayersProps){
        super(props);
        this.state = {
            players: []
        }
    }

    componentDidMount(){
        // Connection accepted
        this.props.socket.on("setPlayers", (players:any) => {
            this.setState({ players });
        });     
    }

    render(){

        const className = CreateClassName({
            "players": true
        }, this.props.className);

        return  <div className={className}>
                    <h1>Joueurs</h1>
                    <Table  className="player-table"
                            header={["Pseudo", "Partie"]}
                            body={this.state.players.map(player => [
                                player.name,
                                player.currentGame ? player.currentGame.name : ""
                            ])}/>
                </div>
    }
}