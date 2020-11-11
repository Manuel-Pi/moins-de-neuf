import React, {Component } from 'react';
import { Login } from './screens/Login/Login';
import { Lobby } from './screens/Lobby/Lobby';
import { Menu } from './components/Menu/Menu';
import { GameBoard } from './screens/GameBoard/GameBoard';
import { CreateClassName } from './utils/Utils';
import { faMdb } from '@fortawesome/free-brands-svg-icons';
import { Modal } from './components/Modal/Modal';
import { Players } from './screens/Players/Players';
import { Account } from './screens/Account/Account';
import { Rest } from './utils/Rest';
import { Stats } from './screens/Stats/Stats';

export enum SCREEN {
    LOGIN,
    LOBBY,
    GAME,
    PLAYERS,
    ACCOUNT,
    STATS
}

type AppProps = {
    socket: any
}

type AppState = {
    username: string
    currentGame: string
    currentScreen: SCREEN
    piziChat: any
    userValid: boolean
    token: any
    modal: any
}

export class App extends Component<AppProps, AppState> {

    constructor(props: AppProps){
        super(props);
        this.state = {
            token: null,
            username: localStorage.getItem("username"),
            currentGame: null,
            currentScreen: SCREEN.LOBBY,
            piziChat: null,
            userValid: false,
            modal: null
        }
    }

    componentDidMount(){
        if(localStorage.getItem("token")) Rest.checkToken().then((token:any) => this.setState({username: token.user, token}, () => {
            this.props.socket.emit("reconnectUser", token.user, token);
        }));
        // Try to reconnect
        this.props.socket.on("connect", () => {
            if(!this.state.username) return;
            this.state.username && this.props.socket.emit("reconnectUser", this.state.username, this.state.token);
        });

        // Connection accepted
        this.props.socket.on("setGames", (games:any) => {
            if(!this.state.username) return;
            const username = this.state.username;
            if(!localStorage.getItem("token")) localStorage.setItem("username", username);

            if(this.state.token) this.props.socket.emit("authenticate", username);

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
            if(game) this.state.piziChat.join(game.name);
        }); 
    }

    quit(disconnectUser = false, callback?: () => void){

        this.setState({modal:   <Modal  type="confirm" 
                                        onClose={() => {
                                            this.setState({modal: null});
                                            callback && callback();
                                        }}
                                        onConfirm={() => {
                                            if(disconnectUser){
                                                localStorage.removeItem("username");
                                                localStorage.removeItem("token");
                                            }
                                            this.state.piziChat.leave(this.state.currentGame);
                                            this.setState({
                                                username: disconnectUser ? null : this.state.username,
                                                currentGame: null,
                                                modal: null,
                                                currentScreen: disconnectUser ? SCREEN.LOGIN : this.state.currentScreen === SCREEN.GAME ? SCREEN.LOBBY : this.state.currentScreen,
                                            }); 
                                            this.props.socket.emit("quit", disconnectUser);
                                            callback && callback();
                                        }}>
                                    {disconnectUser ? "Se déconnecter?" : "Quitter la partie?"}
                                </Modal>});
    }

    render(){
        const screen = !this.state.username ? SCREEN.LOGIN : this.state.currentScreen;
        const menuClassName = CreateClassName({
            hidden: screen === SCREEN.LOGIN
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

        if(!this.state.username && this.state.piziChat){
            this.state.piziChat.toggleChat("hide");
        }

        const accountScreen = screen === SCREEN.ACCOUNT ? <Account token={this.state.token}/> : null;
        const statsScreen = screen === SCREEN.STATS ? <Stats username={this.state.username} token={this.state.token}/> : null;
        const loginScreen = screen === SCREEN.LOGIN ? <Login socket={this.props.socket} onLogin={ (username, token) => this.props.socket.emit("login", username, token) && this.setState({username, token})} /> : null;

        return  <div className={"app"}>
                    <Menu className={menuClassName} 
                        username={this.state.username} 
                        onClick={ currentScreen => this.setState({currentScreen})}
                        currentGame={this.state.currentScreen === SCREEN.GAME && this.state.currentGame}
                        onQuit={() => this.quit()}
                        onDisconnect={() => this.quit(true)}
                        onDoubleClick={() => this.props.socket.emit("refresh")}/>
                    <Lobby className={lobbyClassName}
                        chat={this.state.piziChat}
                        socket={this.props.socket} 
                        onGameSelected={ gameName => this.setState({currentGame: gameName, currentScreen: !this.state.currentGame ? SCREEN.GAME : this.state.currentScreen})}/>
                    <GameBoard  className={gameClassName}
                        socket={this.props.socket} 
                        username={this.state.username}
                        currentGame={this.state.currentGame}/>
                    <Players socket={this.props.socket} className={playersClassName}/>
                    {accountScreen}
                    {statsScreen}
                    {loginScreen}
                    {this.state.modal}
                </div>
    }
}