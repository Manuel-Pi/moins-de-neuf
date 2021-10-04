import React, {Component } from 'react';
import { CreateClassName } from '../../utils/Utils';
import { Heading, Table } from 'pizi-react';

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
        return  <div className={CreateClassName({
                                                    "screen players": true
                                                }, this.props.className)}>
                    <Heading tag="h1" appearance="simple" color="secondary">Joueurs</Heading>
                    <Table  header={["Pseudo", "Partie"]}
                            data={this.state.players.map(player => [
                                player.name,
                                player.currentGame ? player.currentGame.name : ""
                            ])}/>
                </div>
    }
}