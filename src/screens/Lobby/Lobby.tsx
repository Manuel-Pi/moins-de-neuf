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

type LobbyState = {
    games: GameModel[]
    gameSelected: string
    currentGame: string
    gameInfo: string
    gameData: GameInfo
}

type LobbyProps = {
    className: string
    socket: any
    onGameSelected: (gameName:string) => void
}

const DEFAULT_GAME: GameInfo = {
    name: "",
    minPlayer: 3,
    maxPlayer: 6,
    allowQuickPlay: true,
    allowStreak: true,
    onlyOneWinnerStreak: false,
    allowWinEquality: true,
    bonusMultiple50: true,
    playerKickTimeout: "2min",
    gameKickTimeout: "10min",
    gameEndScore: 200,
    gameEndTime: "30s",
}

export class Lobby extends Component<LobbyProps, LobbyState> {

    constructor(props: LobbyProps){
        super(props);
        this.state = {
            games: [],
            gameSelected: null,
            currentGame: null,
            gameInfo: null,
            gameData: null
        }
    }

    componentDidMount(){
        // Connection accepted
        this.props.socket.on("setGames", (games:any) => {
            this.setState({
                games: games.map((game: any) => new GameModel(game)),
            });
        });

        // Game joined
        this.props.socket.on("gameInfo", (game:any) => {
            this.setState({currentGame: game ? game.name : null});
            this.props.onGameSelected(game ? game.name : null);
        });

        this.props.socket.on("gameCreated", (game:any) => this.setState({gameData: null}));       
    }

    quit(){
        this.setState({gameSelected: null});
        this.props.socket.emit("quit");
        this.props.onGameSelected(null);
    }

    join(){
        this.props.socket.emit("join", this.state.gameSelected);
    }

    remove(){
        this.setState({gameSelected: null});
        this.props.socket.emit("removeGame", this.state.gameSelected);
    }

    create(){
        //const name = prompt("Name ?");
        this.setState({gameInfo: "create", gameData: DEFAULT_GAME});
        //this.props.socket.emit("createGame", {name});
    }

    info(){
        for(let i = 0; i < this.state.games.length; i++){
            if(this.state.games[i].getName() === this.state.gameSelected){
                this.setState({gameInfo: "info", gameData: this.state.games[i].getConf()});
                break;
            }
        }  
    }

    gameInfo(){
        if(!this.state.gameData) return null;
        const createButtonClassName = CreateClassName({
            disabled: !this.state.gameData.name
        });
        const inputClassName = CreateClassName({
            disabled: this.state.gameInfo !== "create"
        });
        let currentGameModel = this.state.games.filter(game => game.getName() === this.state.gameSelected)[0];

        let tabs = [];

        tabs.push({
            title: <h2>{this.state.gameInfo === "create" ? "Nouvelle Partie" : "Infos"}</h2>,
            content: <>
                <TextInput  className={inputClassName}
                            initialValue={this.state.gameData.name}
                            placeholder="Nom"
                            onChange={name => this.setState({
                                gameData: {
                                    ...this.state.gameData,
                                    name
                                }
                            })}/>
                <NumberInput    className={inputClassName}
                                placeholder="Joueurs minimum"
                                min={1}
                                max={7}
                                initialValue={this.state.gameData.minPlayer}
                                onChange={minPlayer => this.setState({
                                    gameData: {
                                        ...this.state.gameData,
                                        minPlayer
                                    }
                                })}/>
                <NumberInput    className={inputClassName}
                                placeholder="Joueurs maximum"
                                min={1}
                                max={7}
                                initialValue={this.state.gameData.maxPlayer}
                                onChange={maxPlayer => this.setState({
                                    gameData: {
                                        ...this.state.gameData,
                                        maxPlayer
                                    }
                                })}/>
                <NumberInput    className={inputClassName}
                                placeholder="Score de fin de partie"
                                min={-100}
                                max={1000}
                                step={50}
                                initialValue={this.state.gameData.gameEndScore}
                                onChange={gameEndScore => this.setState({
                                    gameData: {
                                        ...this.state.gameData,
                                        gameEndScore
                                    }
                                })}/>
                <ListInput  className={inputClassName}
                            placeholder="Finir la partie après:"
                            initialValue={this.state.gameData.gameEndTime}
                            values={["30s", "10min", "15min", "20min", "30min", "45min", "1h", "Jamais"]}
                            onChange={gameEndTime => this.setState({
                                gameData: {
                                    ...this.state.gameData,
                                    gameEndTime
                                }
                            })}/>
                <CheckBox   className={inputClassName}
                            placeholder="Jeux rapide"
                            initialValue={this.state.gameData.allowQuickPlay}
                            onChange={allowQuickPlay => this.setState({
                                gameData: {
                                    ...this.state.gameData,
                                    allowQuickPlay
                                }
                            })}/>
                <CheckBox   className={inputClassName}
                            placeholder="Avec étoiles"
                            initialValue={this.state.gameData.allowStreak}
                            onChange={allowStreak => this.setState({
                                gameData: {
                                    ...this.state.gameData,
                                    allowStreak
                                }
                            })}/>
                <CheckBox   className={inputClassName}
                            placeholder="Étoile seulement si 1 gagnant"
                            initialValue={this.state.gameData.onlyOneWinnerStreak}
                            onChange={onlyOneWinnerStreak => this.setState({
                                gameData: {
                                    ...this.state.gameData,
                                    onlyOneWinnerStreak
                                }
                            })}/>
                <CheckBox   className={inputClassName}
                            placeholder="-50 sur les multiple de 50"
                            initialValue={this.state.gameData.bonusMultiple50}
                            onChange={bonusMultiple50 => this.setState({
                                gameData: {
                                    ...this.state.gameData,
                                    bonusMultiple50
                                }
                            })}/>
                <CheckBox   className={inputClassName}
                            placeholder="Autoriser égalité"
                            initialValue={this.state.gameData.allowWinEquality}
                            onChange={allowWinEquality => this.setState({
                                gameData: {
                                    ...this.state.gameData,
                                    allowWinEquality
                                }
                            })}/>
                <ListInput  className={inputClassName}
                            placeholder="Déconnecter joueur si inactif après:"
                            initialValue={this.state.gameData.playerKickTimeout}
                            values={["30s", "1min", "2min", "5min", "10min", "30min", "Jamais"]}
                            onChange={playerKickTimeout => this.setState({
                                gameData: {
                                    ...this.state.gameData,
                                    playerKickTimeout
                                }
                            })}/>
                <ListInput  className={inputClassName}
                            placeholder="Supprimer partie si inactive après:"
                            initialValue={this.state.gameData.gameKickTimeout}
                            values={["2min", "5min", "10min", "30min", "Jamais"]}
                            onChange={gameKickTimeout => this.setState({
                                gameData: {
                                    ...this.state.gameData,
                                    gameKickTimeout
                                }
                            })}/>
                {this.state.gameInfo === "create" ? <div className="create">
                    <span className={createButtonClassName} onClick={e => this.props.socket.emit("createGame", this.state.gameData)}>
                        Créer
                    </span>
                </div>: null}
            </>
        });

        if(currentGameModel && this.state.gameInfo !== "create"){
            tabs.push({
                title: <h2>Joueurs</h2>,
                content: <Table className={"players-info"}
                                header={["#", "Pseudo", "Score"]} 
                                body={currentGameModel.getPlayerModels().map((player, index) => [index + 1, player.getName(), <Score score={player.getScore()} scoreStreak={player.getScoreStreak()}/>])}/>
    
            });
        }

        return  <Modal onClose={() => this.setState({gameData: null})}>
                    <Tabs tabs={tabs}/>
                </Modal>
    }

    render(){
        const isStarted = this.state.gameSelected && !!this.state.games.filter(game => game.getName() === this.state.gameSelected)[0].getAction();
        const gameName = this.state.currentGame || "";

        const createClassName = CreateClassName({
            "create": true,
        });

        const joinClassName = CreateClassName({
            "join": true,
            "disabled": !this.state.gameSelected || (this.state.gameSelected === gameName) || isStarted || (this.state.gameSelected && this.state.gameSelected === gameName)
        });

        const deleteClassName = CreateClassName({
            "remove": true,
            "disabled": !this.state.gameSelected || this.state.games.reduce((acc, game) => {
                if(acc && game.getName() === this.state.gameSelected && !game.getPlayerModels().length){
                    return false;
                }
            }, true)
        });

        const quitClassName = CreateClassName({
            "quit": true,
            "disabled": !this.state.gameSelected || this.state.gameSelected !== gameName
        });

        return  <div className={"lobby " + this.props.className}>
                    <h1>Parties</h1>
                    <Table  className="games"
                            header={["Partie", "Joueurs", "Status"]}
                            body={this.state.games.map(game => [
                                game.getName(),
                                game.getPlayerModels().length + "/" + game.getConf().maxPlayer,
                                game.getAction() ? "En cours" : "En attente"
                            ])}
                            actions={[
                                <FontAwesomeIcon icon="plus" className={createClassName} onClick={e => this.create()}/>,
                                <FontAwesomeIcon icon="minus" className={deleteClassName} onClick={e => this.remove()}/>,
                                <FontAwesomeIcon icon="info" className={deleteClassName} onClick={e => this.info()}/>,
                                <FontAwesomeIcon icon="sign-out-alt" className={quitClassName} onClick={e => this.quit()}/>,
                                <FontAwesomeIcon icon="sign-in-alt" className={joinClassName} onClick={e => this.join()}/>
                            ]}
                            onSelect={selected => this.setState({gameSelected: selected && selected[0]})}/>
                        {this.gameInfo()}
                </div>
    }
}