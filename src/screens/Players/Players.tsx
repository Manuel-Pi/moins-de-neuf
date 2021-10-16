import React, {Component } from 'react';
import { ClassNameHelper } from 'pizi-react';
import { AppScreenProps, Heading, Table } from 'pizi-react';
import { ButtonGroup } from 'pizi-react/src/components/ButtonGroup/ButtonGroup';
import { Button } from 'pizi-react/src/components/Button/Button';

type PlayersState = {
    playerSelected: string
}

interface PlayersProps extends AppScreenProps{
    socket: any
    className: string
    players: {
        name: string,
        currentGame: {name: string}
    }[]
}

export class Players extends Component<PlayersProps, PlayersState> {

    constructor(props: PlayersProps){
        super(props);
        this.state = {
            playerSelected: ""
        }
    }

    render(){
        return  <div className={ClassNameHelper({
                                                    "screen players": true
                                                }, this.props.className)}>
                    <Heading tag="h1" appearance="simple" color="secondary">Joueurs</Heading>
                    <Table  header={["Pseudo", "Status"]}
                            data={this.props.players.map(player => [
                                player.name,
                                "connecté"
                            ])}
                            onSelected={selected => this.setState({playerSelected: selected ? selected[0] : ""})}/>
                    <ButtonGroup size="large" appearance="simple" color="secondary">
                        <Button icon="info" onClick={() => {}} disabled={!this.state.playerSelected} align="right"></Button>
                        <Button icon="chart-bar" onClick={() => {}} disabled={!this.state.playerSelected}></Button>
                    </ButtonGroup>
                </div>
    }
}