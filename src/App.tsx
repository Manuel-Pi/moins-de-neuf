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
    piziChat: any
}

export class App extends Component<AppProps, AppState> {

    constructor(props: AppProps){
        super(props);
        this.state = {
            username: localStorage.getItem("username"),
            currentGame: null,
            currentScreen: SCREEN.LOGIN,
            piziChat: null
        }
    }

    componentDidMount(){
        // Try to reconnect
        this.props.socket.on("connect", () => {
            this.state.username && this.props.socket.emit("reconnectUser", this.state.username);
        });

        // Connection accepted
        this.props.socket.on("setGames", (games:any) => {
            if(!this.state.username) return;
            const username = this.state.username;
            localStorage.setItem("username", username);

            let piziChat = this.state.piziChat;
            if(!piziChat){
                piziChat = new PiziChat();
                piziChat.login(username, "moinsdeneuf");
            }

            this.setState({
                piziChat, 
                username,
                currentScreen: this.state.currentScreen === SCREEN.LOGIN ? SCREEN.LOBBY : this.state.currentScreen
            });
        });

        this.props.socket.on("gameInfo", (game:any) => {
           if(this.state.username && !game) this.setState({
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
                currentScreen: disconnectUser ? SCREEN.LOGIN : this.state.currentScreen === SCREEN.GAME ? SCREEN.LOBBY : this.state.currentScreen,
            }); 
            this.props.socket.emit("quit", disconnectUser);
        }  
    }

    render(){
        const screen = !this.state.username ? SCREEN.LOGIN : this.state.currentScreen;
        const menuClassName = CreateClassName({
            hidden: screen === SCREEN.LOGIN
        });
        const loginClassName = CreateClassName({
            hidden: screen !== SCREEN.LOGIN
        });
        const lobbyClassName = CreateClassName({
            hidden: screen !== SCREEN.LOBBY
        });
        const gameClassName = CreateClassName({
            hidden: screen !== SCREEN.GAME
        });
        const playersClassName = CreateClassName({
            hidden: screen !== SCREEN.PLAYERS
        });

        return  <div className={"app"}>
                    <Menu className={menuClassName} 
                        username={this.state.username} 
                        onClick={ currentScreen => this.setState({currentScreen})}
                        currentGame={this.state.currentGame}
                        onQuit={() => this.quit()}
                        onDisconnect={() => this.quit(true)}
                        onDoubleClick={() => this.props.socket.emit("refresh")}/>
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