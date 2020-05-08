import React, {Component } from 'react';
import { Logo } from '../Logo/Logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CreateClassName } from '../Utils/Utils';

import { GameModel } from '../GameBoard/GameModel';
import { Table } from '../Table/Table';
import { Menu } from '../Menu/Menu';
import { GameBoard } from '../GameBoard/GameBoard';

type LobbyState = {
    username: string
    games: GameModel[]
    currentGame: string,
    gameSelected: string,
    toggleGame: boolean
}

type LobbyProps = {
    socket: any
    username: string
    games?: GameModel[]
    currentGame?: string
}

export class Lobby extends Component<LobbyProps, LobbyState> {

    private inputValue: string = "";

    constructor(props: LobbyProps){
        super(props);
        this.state = {
            username: localStorage.getItem("username"),
            games: [],
            currentGame: null,
            gameSelected: null,
            toggleGame: false
        }
    }

    componentDidMount(){
        this.props.socket.on("setGames", (games:any) => {
            localStorage.setItem("username", this.state.username || this.inputValue);
            this.setState({
                games: games.map((game: any) => new GameModel(game)),
                username: this.state.username || this.inputValue
            });
        });
        this.props.socket.on("gameInfo", (game:any) => {
            if(this.state.currentGame) return;
            this.setState({
                currentGame: game.name,
                toggleGame: this.state.currentGame !== game.name || this.state.toggleGame
            });
        });
        this.props.socket.on("connect", (game:any) => {
            console.log("try to reconnect");
            if(this.state.username){
                this.props.socket.emit("reconnectUser", this.state.username);
            }
        });
    }

    login(){
        this.props.socket.emit("login", this.inputValue);
    }

    renderLogin(){
        this.inputValue = "";
        return  <div className="login">
                    <Logo/>
                    <div className="input">
                        <input  type="text"
                                placeholder="Pseudo..." 
                                onChange={event => this.inputValue = event.currentTarget.value} 
                                autoFocus
                                onKeyDown={event => event.key === 'Enter' && this.login()}/>
                        <FontAwesomeIcon icon="paper-plane" onClick={e => this.login()}/>
                    </div>
                </div>
    }

    disconnect(){
        localStorage.removeItem("username");
        this.setState({
            username: null,
            games: [],
            currentGame: null,
            gameSelected: null,
            toggleGame: false
        }); 
        this.props.socket.emit("quit");
    }

    quit(){
        this.setState({currentGame: null, gameSelected: null});
        this.props.socket.emit("quit");
    }

    join(){
        this.props.socket.emit("join", this.state.gameSelected);
        this.setState({currentGame: null});
    }

    remove(){
        this.setState({currentGame: null, gameSelected: null});
        this.props.socket.emit("removeGame", this.state.gameSelected);
    }

    create(){
        const name = prompt("Name ?");
        this.props.socket.emit("createGame", {name});
    }

    renderGames(){

        const isStarted = this.state.gameSelected && !!this.state.games.filter(game => game.getName() === this.state.gameSelected)[0].getAction();

        const createClassName = CreateClassName({
            "create": true
        });

        const joinClassName = CreateClassName({
            "join": true,
            "disabled": !this.state.gameSelected || (this.state.gameSelected === this.state.currentGame) || isStarted,
            "hidden": this.state.gameSelected && this.state.gameSelected === this.state.currentGame
        });

        const deleteClassName = CreateClassName({
            "remove": true,
            "hidden": !this.state.gameSelected || this.state.games.reduce((acc, game) => {
                if(acc && game.getName() === this.state.gameSelected && !game.getPlayerModels().length){
                    return false;
                }
            }, true)
        });

        const quitClassName = CreateClassName({
            "quit": true,
            "hidden": !this.state.gameSelected || this.state.gameSelected !== this.state.currentGame
        });

        const disconnectClassname = CreateClassName({
            "disconnect": true,
            "hidden": this.state.toggleGame
        });
        
        return  <>
                    <Menu username={this.state.username} onAction={ data => data.toggle && this.setState({toggleGame: this.state.currentGame && !this.state.toggleGame})}/>
                    {this.state.currentGame && <GameBoard className={ !this.state.toggleGame && "hidden"} socket={this.props.socket} username={this.state.username}/>}
                    <Table  className={"games " + (this.state.toggleGame && "hidden")}
                            header={["Partie", "Joueurs", "Status"]}
                            body={this.state.games.map(game => [
                                game.getName(),
                                game.getPlayerModels().length,
                                game.getAction() ? "En cours" : "En attente"
                            ])}
                            actions={[
                                <button className={createClassName} onClick={e => this.create()}>Créer</button>,
                                <button className={deleteClassName} onClick={e => this.remove()}>Supprimer</button>,
                                <button className={quitClassName} onClick={e => this.quit()}>Quitter</button>,
                                <button className={joinClassName} onClick={e => this.join()}>Rejoindre</button>
                            ]}
                            onSelect={selected => this.setState({gameSelected: selected && selected[0]})}/>
                    <button className={disconnectClassname} onClick={e => this.disconnect()}>Déconnecter</button>
                </>
    }


    render(){
        return  <div className="lobby">
                    { !this.state.username ? this.renderLogin() : this.renderGames()}
                </div>
    }
}