import React, {Component } from 'react';
import { GameModel } from '../../models/GameModel';
import {Table, Heading, AppScreenProps, Breakpoint, ButtonGroup, Button} from 'pizi-react';
import { GameModal } from '../GameModal/GameModal';
import { GameModalWarning } from '../GameModal/GameModalWarning';
import memoizeOne from 'memoize-one';

type LobbyState = {
    gameSelected: GameModel
    gameInfo: "create" | "info"
    displayGameInfo: boolean
    warningGameStarted: "asking" | "accepted"
}

interface LobbyProps extends AppScreenProps {
    socket: any
    onGameSelected?: (gameName:string) => void
    chat: any
    games: GameModel[]
    currentGame: GameModel
    breakpoint?: Breakpoint
}

export class Lobby extends Component<LobbyProps, LobbyState> {

    constructor(props: LobbyProps){
        super(props);
        this.state = {
            gameSelected: null,
            gameInfo: null,
            displayGameInfo: false,
            warningGameStarted: null
        }
    }

    memoizedPlayers = memoizeOne((games: GameModel[]) => games.map(game => [
        game.getName(),
        game.getPlayerModels().length + "/" + game.getConf().maxPlayer,
        game.getAction() ? "En cours" : "En attente"
    ]))

    componentDidMount(){
        this.props.socket.on("gameCreated", (game:any) =>  this.setState({displayGameInfo: false})) 
    }

    quit(){
        this.setState({gameSelected: null})
        this.props.socket.emit("quit")
        this.props.onGameSelected(null)
        this.props.chat.leave(this.state.gameSelected)
    }

    join(){
        if(this.state.gameSelected && this.state.gameSelected.getAction()){
            this.setState({warningGameStarted: "asking"})
        } else {
            this.props.socket.emit("join", this.state.gameSelected.getName())
        }
    }

    remove(){
        this.props.socket.emit("removeGame", this.state.gameSelected.getName())
        this.setState({gameSelected: null})
    }

    shouldComponentUpdate(nextProps: LobbyProps, nextState: LobbyState){
        if(nextState.gameSelected !== this.state.gameSelected 
        || nextState.gameInfo !== this.state.gameInfo
        || nextState.displayGameInfo !== this.state.displayGameInfo
        || nextState.warningGameStarted !== this.state.warningGameStarted
        || nextProps.breakpoint !== this.props.breakpoint
        || nextProps.games !== this.props.games
        || nextProps.currentGame !== this.props.currentGame){
            return true
        }
        return false
    }

    render(){
        return  <div className={"screen lobby"}>
                    <Heading tag="h1" appearance="simple" color="secondary">Parties</Heading>
                    <Table  appearance="simple" 
                            color="secondary"
                            header={["Partie", "Joueurs", "Status"]}
                            staticHeader
                            data={this.memoizedPlayers(this.props.games)}
                            onSelected={selected => this.setState({gameSelected: selected ? this.props.games.filter(game => game.getName() === selected[0])[0] : null})}
                            defaultOrder={{
                                direction: 'down',
                                header: "Partie"
                            }}>
                    </Table>
                    <ButtonGroup size="large" appearance="simple" color="secondary">
                        <Button icon="plus" onClick={() => this.setState({gameInfo: "create", displayGameInfo: true})}></Button>
                        <Button icon="minus" onClick={() => this.remove()} disabled={!this.state.gameSelected}></Button>
                        <Button icon="info" onClick={() =>  this.setState({gameInfo: "info", displayGameInfo: true})} disabled={!this.state.gameSelected}></Button>
                        <Button icon="sign-in-alt" align="right" onClick={() => this.join()} disabled={!this.state.gameSelected}></Button>
                        <Button icon="sign-out-alt" onClick={() => this.quit()} disabled={!this.state.gameSelected || !this.props.currentGame || this.props.currentGame.getName() !== this.state.gameSelected.getName()}></Button>
                    </ButtonGroup>
                    <GameModal  key={this.state.gameInfo + this.state.gameSelected?.getName()}
                                open={this.state.displayGameInfo}
                                game={this.state.gameSelected}
                                type={this.state.gameInfo}
                                fullScreen={this.props.breakpoint === "xs"}
                                onClose={(gameData) => {
                                    gameData ? this.props.socket.emit("createGame", gameData) : this.setState({displayGameInfo: false})
                                }}/>
                    <GameModalWarning   open={this.state.warningGameStarted === "asking"}
                                        onClose={(action) => this.setState({warningGameStarted: action === "confirm" ? "accepted" : null})}
                                        onClosed={() => {
                                            this.state.warningGameStarted === "accepted" && this.props.socket.emit("join", this.state.gameSelected.getName())
                                            this.setState({warningGameStarted: null})
                                        }}/>
            </div>
    }
}