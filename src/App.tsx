import React, {Component } from 'react';
import { Login } from './screens/Login/Login';
import { Lobby } from './screens/Lobby/Lobby';
import { Menu } from './components/Menu/Menu';
import { GameBoard } from './screens/GameBoard/GameBoard';
import { CreateClassName } from './utils/Utils';
import { faMdb } from '@fortawesome/free-brands-svg-icons';
import { Modal } from './components/Modal/Modal';
import { Players } from './screens/Players/Players';

export enum SCREEN {
    LOGIN,
    LOBBY,
    GAME,
    PLAYERS
}

type AppProps = {
    socket: any
}

type AppState = {
    username: string
    currentGame: string
    currentScreen: SCREEN
}

export class App extends Component<AppProps, AppState> {

    constructor(props: AppProps){
        super(props);
        this.state = {
            username: localStorage.getItem("username"),
            currentGame: null,
            currentScreen: SCREEN.LOGIN
        }
    }

    componentDidMount(){
        // Try to reconnect
        this.props.socket.on("connect", () => {
            this.state.username && this.props.socket.emit("reconnectUser", this.state.username);
        });

        // Connection accepted
        this.props.socket.on("setGames", (games:any) => {
            const username = this.state.username;
            localStorage.setItem("username", username);
            this.setState({
                username,
                currentScreen: this.state.currentScreen === SCREEN.LOGIN ? SCREEN.LOBBY : this.state.currentScreen
            });
        });

        this.props.socket.on("gameInfo", (game:any) => {
           if(!game) this.setState({
                currentScreen: SCREEN.LOBBY
            });
        });
    }

    quit(disconnectUser = false){
        if(confirm(disconnectUser ? "Se déconnecter?" : "Quitter la partie?")){
            if(disconnectUser) localStorage.removeItem("username");
            this.setState({
                username: disconnectUser ? null : this.state.username,
                currentGame: null,
                currentScreen: disconnectUser ? SCREEN.LOGIN : this.state.currentScreen,
            }); 
            this.props.socket.emit("quit");
        }  
    }

    render(){
        const menuClassName = CreateClassName({
            hidden: this.state.currentScreen === SCREEN.LOGIN
        });
        const loginClassName = CreateClassName({
            hidden: this.state.currentScreen !== SCREEN.LOGIN
        });
        const lobbyClassName = CreateClassName({
            hidden: this.state.currentScreen !== SCREEN.LOBBY
        });
        const gameClassName = CreateClassName({
            hidden: this.state.currentScreen !== SCREEN.GAME
        });
        const playersClassName = CreateClassName({
            hidden: this.state.currentScreen !== SCREEN.PLAYERS
        });

        return  <div className={"app"}>
                    <Menu className={menuClassName} 
                        username={this.state.username} 
                        onClick={ currentScreen => this.setState({currentScreen})}
                        currentGame={this.state.currentGame}
                        onQuit={() => this.quit()}
                        onDisconnect={() => this.quit(true)}/>
                    <Login className={loginClassName} 
                        onLogin={ username => this.props.socket.emit("login", username) && this.setState({username})}/>
                    <Lobby className={lobbyClassName}
                        socket={this.props.socket} 
                        onGameSelected={ gameName => this.setState({currentGame: gameName, currentScreen: !this.state.currentGame ? SCREEN.GAME : this.state.currentScreen})}/>
                    <GameBoard  className={gameClassName}
                        socket={this.props.socket} 
                        username={this.state.username}
                        currentGame={this.state.currentGame}/>
                    <Players socket={this.props.socket} className={playersClassName}/>
                </div>
    }
}