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
            username: null,
            games: [],
            currentGame: null,
            gameSelected: null,
            toggleGame: false
        }
    }

    componentDidMount(){
        this.props.socket.on("setGames", (games:any) => {
            this.setState({
                games: games.map((game: any) => new GameModel(game)),
                username: this.inputValue
            });
        });
        this.props.socket.on("gameInfo", (game:any) => {
            this.setState({
                currentGame: game.name,
                toggleGame: this.state.currentGame !== game.name || this.state.toggleGame
            });
        });
    }

    login(){
        this.props.socket.emit("login", this.inputValue)
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
                        <FontAwesomeIcon icon="paper-plane" onClick={this.login}/>
                    </div>
                </div>
    }

    renderGames(){

        const joinClassName = CreateClassName({
            "join": true,
            "disabled": !this.state.gameSelected
        });

        const deleteClassName = CreateClassName({
            "remove": true,
            "disabled": true
        });
        
        return  <>
                    <Menu username={this.state.username} onAction={ data => data.toggle && this.setState({toggleGame: !this.state.toggleGame})}/>
                    <GameBoard className={ !this.state.toggleGame && "hidden"} socket={this.props.socket} username={this.state.username}/>
                    <Table  className={"games " + (this.state.toggleGame && "hidden")}
                            header={["Partie", "Joueurs", "Status"]}
                            body={this.state.games.map(game => [
                                game.getName(), 
                                game.getPlayerModels().length, 
                                game.getAction() ? "En cours" : "En attente"
                            ])}
                            actions={[
                                <button className="create disabled">Créer</button>,
                                <button className={deleteClassName}>Supprimer</button>,
                                <button className={joinClassName} onClick={event => this.props.socket.emit("join", this.state.gameSelected)}>Rejoindre</button>
                            ]}
                            onSelect={selected => this.setState({gameSelected: selected && selected[0]})}/>
                </>
    }


    render(){
        return  <div className="lobby">
                    { !this.state.username ? this.renderLogin() : this.renderGames()}
                </div>
    }
}