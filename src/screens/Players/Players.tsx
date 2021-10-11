import React, {Component } from 'react';
import { CreateClassName } from '../../utils/Utils';
import { AppScreenProps, Heading, Table } from 'pizi-react';
import { ButtonGroup } from 'pizi-react/src/components/ButtonGroup/ButtonGroup';
import { Button } from 'pizi-react/src/components/Button/Button';

type PlayersState = {
    
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
            players: []
        }
    }

    render(){
        return  <div className={CreateClassName({
                                                    "screen players": true
                                                }, this.props.className)}>
                    <Heading tag="h1" appearance="simple" color="secondary">Joueurs</Heading>
                    <Table  header={["Pseudo", "Partie"]}
                            data={this.props.players.map(player => [
                                player.name,
                                player.currentGame ? player.currentGame.name : ""
                            ])}/>
                    <ButtonGroup size="large" appearance="simple" color="secondary">
                        <Button icon="info" onClick={() => {}} disabled={true} align="center"></Button>
                        <Button icon="sign-in-alt" onClick={() =>{}} disabled={true} align="center"></Button>
                    </ButtonGroup>
                </div>
    }
}