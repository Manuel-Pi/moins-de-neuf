import React, {Component } from 'react';
import { GameModel } from '../GameBoard/GameModel';
import { Modal as OldModal} from '../../components/Modal/Modal';
import {Table, Heading, Modal, AppScreenProps} from 'pizi-react';
import { ButtonGroup } from 'pizi-react/src/components/ButtonGroup/ButtonGroup';
import { Button } from 'pizi-react/src/components/Button/Button';
import { GameModal } from '../GameModal/GameModal';

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

    render(){
        return  <div className={"screen lobby"}>
                    <Heading tag="h1" appearance="simple" color="secondary">Parties</Heading>
                    <Table  appearance="simple" 
                            color="secondary"
                            header={["Partie", "Joueurs", "Status"]}
                            staticHeader
                            data={this.props.games.map(game => [
                                game.getName(),
                                game.getPlayerModels().length + "/" + game.getConf().maxPlayer,
                                game.getAction() ? "En cours" : "En attente"
                            ])}
                            onSelected={selected => this.setState({gameSelected: selected ? this.props.games.filter(game => game.getName() === selected[0])[0] : null})}
                            defaultOrder={{
                                direction: 'up',
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
                                onClose={(gameData) => {
                                    gameData ? this.props.socket.emit("createGame", gameData) : this.setState({displayGameInfo: false})
                                }}/>
                    <Modal  className="warning-game-started"
                            open={this.state.warningGameStarted === "asking"}
                            color="main"
                            appearance="simple"
                            type="confirm"
                            onClose={(action) => this.setState({warningGameStarted: action === "confirm" ? "accepted" : null})}
                            onClosed={ () => {
                                this.state.warningGameStarted === "accepted" && this.props.socket.emit("join", this.state.gameSelected.getName())
                                this.setState({warningGameStarted: null})
                            }}>
                            <h3>Partie en cours!</h3>
                            <p>Vous pouvez rejoindre en tant que spectateur.
                            Une fois la manche terminée vous pourrez rejoindre la partie.
                            </p>
                            <p className="detail">(Votre score initial sera égal à la moyenne des scores des autres joueurs)</p>
                    </Modal>
                </div>
    }
}