import React, {Component } from 'react'
import { Breakpoint, Button, ButtonGroup, ClassNameHelper, Modal, TextInput } from 'pizi-react'
import { AppScreenProps, Heading, Table } from 'pizi-react'
import { PlayerModel } from '../../models/PlayerModel'
import { GameModalWarning } from '../GameModal/GameModalWarning'
import memoizeOne from 'memoize-one'

type PlayersState = {
    playerSelected: PlayerModel
    showPlayerInfo: boolean
    warningGameStarted: "asking" | "accepted"
}

interface PlayersProps extends AppScreenProps{
    socket: any
    breakpoint?: Breakpoint
    players: PlayerModel[]
}

export class Players extends Component<PlayersProps, PlayersState> {

    constructor(props: PlayersProps){
        super(props);
        this.state = {
            playerSelected: null,
            showPlayerInfo: false,
            warningGameStarted: null
        }
    }

    memoizedPlayers = memoizeOne((players: PlayerModel[]) => players.map(player => [
        player.getName(),
        this.getPlayerStatus(player)
    ]))

    getPlayerStatus(player: PlayerModel){
        if(!player) return
        switch(player.getStatus()){
            case "inGame":
                return "Dans une partie"
            case "disconnected":
                return "Déconnecté"
            case "connected":
            default:
                return "Connecté"
        }
    }

    join(){
        if(this.state.playerSelected.getGame()?.getAction()){
            this.setState({warningGameStarted: "asking"})
        } else {
            this.props.socket.emit("join", this.state.playerSelected.getGame().getName())
            this.setState({showPlayerInfo: false})
        }
    }

    shouldComponentUpdate(nextProps: PlayersProps, nextState: PlayersState){
        if(nextState.playerSelected !== this.state.playerSelected 
        || nextState.showPlayerInfo !== this.state.showPlayerInfo
        || nextState.warningGameStarted !== this.state.warningGameStarted
        || nextProps.breakpoint !== this.props.breakpoint
        || nextProps.players !== this.props.players){
            return true
        }
        return false
    }

    render(){
        console.log("render players")
        return  <div className={ClassNameHelper({
                                                    "screen players": true
                                                })}>
                    <Heading tag="h1" appearance="simple" color="secondary">Joueurs</Heading>
                    <Table  header={["Pseudo", "Status"]}
                            staticHeader
                            defaultOrder={{header: "Status", direction: "down"}}
                            data={this.memoizedPlayers(this.props.players)}
                            onSelected={selected => this.setState({playerSelected: selected ? this.props.players.filter(p => p.getName() === selected[0])[0] : null})}/>
                    <ButtonGroup size="large" appearance="simple" color="secondary">
                        <Button icon="info" 
                                disabled={!this.state.playerSelected}
                                align="right"
                                onClick={() => {
                                    if(this.state.playerSelected) this.setState({showPlayerInfo: true})
                                }}/>
                    </ButtonGroup>
                    <Modal  open={this.state.showPlayerInfo}
                            key={this.state.playerSelected?.getName()}
                            appearance="simple"
                            color="main"
                            type="info"
                            header="Info"
                            fullScreen={this.props.breakpoint === "xs"}
                            onClose={() => this.setState({showPlayerInfo: false})}>
                            <TextInput  readOnly 
                                        label="Pseudo"
                                        color="main"
                                        defaultValue={this.state.playerSelected?.getName()}/>
                            <TextInput  readOnly 
                                        label={this.state.playerSelected?.getStatus() === "disconnected" ? "Dernière connexion" : "Status"}
                                        color="main"
                                        placeholder="Aucune partie en cours"
                                        defaultValue={this.getPlayerStatus(this.state.playerSelected)}/>
                            <TextInput  readOnly 
                                        label="Partie"
                                        color="main"
                                        className="game-name"
                                        placeholder="Aucune partie en cours"
                                        defaultValue={this.state.playerSelected?.getGame()?.getName()}/>
                            <Button color="main" 
                                    appearance="fill"
                                    size="small"
                                    iconRight="sign-out-alt"
                                    className="join-game"
                                    disabled={!this.state.playerSelected?.getGame()}
                                    onClick={() => this.join()}>Rejoindre</Button>
                    </Modal>
                    <GameModalWarning   open={this.state.warningGameStarted === "asking"}
                                        onClose={(action) => this.setState({warningGameStarted: action === "confirm" ? "accepted" : null})}
                                        onClosed={ () => {
                                            this.state.warningGameStarted === "accepted" && this.props.socket.emit("join", this.state.playerSelected?.getGame()?.getName())
                                            this.setState({warningGameStarted: null})
                                        }}/>
                </div>
    }
}