import React, { Component } from 'react'
import { Login } from './screens/Login/Login'
import { Lobby } from './screens/Lobby/Lobby'
import { GameBoard } from './screens/GameBoard/GameBoard'
import { Players } from './screens/Players/Players'
import { Account } from './screens/Account/Account'
import { Rest } from './utils/Rest'
import { Stats } from './screens/Stats/Stats'
import { Modal, MenuApp, ClassNameHelper, debounce, throttle, onBreakpointChange } from 'pizi-react';
import { Logo } from './components/Logo/Logo'
import { globalHistory, navigate } from '@reach/router'
import { GameModel } from './screens/GameBoard/GameModel'
import { Button } from 'pizi-react/src/components/Button/Button'
import { Breakpoint, GetBreakpoint } from 'pizi-react/src/utils/Utils'

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
    games: GameModel[]
    players: {
        name: string,
        currentGame: {name: string}
    }[]
    currentGame: GameModel
    currentScreen: SCREEN
    piziChat: any
    userValid: boolean
    token: any
    modal: boolean
    warningQuit: "game" | "disconnect"
    displayGame: boolean
    open: boolean
    breakpoint: Breakpoint
}

const basepath = location.pathname.match(/^\/([^\/]+\/)/)[1]

export class App extends Component<AppProps, AppState> {

    constructor(props: AppProps){
        super(props)
        this.state = {
            token: null,
            username: localStorage.getItem("username"),
            currentGame: null,
            currentScreen: null,
            piziChat: null,
            userValid: false,
            modal: false,
            warningQuit: null,
            games: [],
            players: [],
            displayGame: false,
            open: false,
            breakpoint: GetBreakpoint()
        }
    }

    componentDidMount(){
        if(localStorage.getItem("token")) Rest.checkToken().then((token:any) => this.setState({username: token.user, token}, () => {
            this.props.socket.emit("reconnectUser", token.user, token)
        }))
        // Try to reconnect
        this.props.socket.on("connect", () => {
            if(!this.state.username) return
            this.state.username && this.props.socket.emit("reconnectUser", this.state.username, this.state.token)
        })

        // Connection accepted
        this.props.socket.on("setGames", (games:any) => {
            if(!this.state.username) return
            const username = this.state.username
            if(!localStorage.getItem("token")) localStorage.setItem("username", username)

            if(this.state.token) this.props.socket.emit("authenticate", username)

            let piziChat = this.state.piziChat
            if(!piziChat && typeof PiziChat !== "undefined"){
                piziChat = new PiziChat()
                piziChat.login(username, "moinsdeneuf")
            }

            this.setState({
                games: games.map((game: any) => new GameModel(game)),
                piziChat, 
                username
            })
        })

        this.props.socket.on("setPlayers", (players:any) => {
            this.setState({players})
        })

        this.props.socket.on("gameInfo", (game:any) => {
            if(game) {
                this.state.piziChat.join(game.name)
                this.setState({
                    currentGame: new GameModel(game),
                    displayGame: true
                })
            }
        })

        globalHistory.listen(({ action }) => {
            if(action === "PUSH") this.setState({displayGame: false})
        })

        onBreakpointChange(breakpoint => this.setState({breakpoint}))
    }

    quit(disconnectUser = false){
        this.setState({modal: true, warningQuit: disconnectUser ? "disconnect" : "game"})
    }

    getTopMenu(){
        const iconProps = this.state.breakpoint === "xs" ? "icon" : "iconRight"
    
        return  <div className={ClassNameHelper({invisible: !this.state.currentGame}, "current-game")}>
                    <div className="current-info">
                        <div className="label">Partie en cours</div>
                        <div className="game-name">{this.state.currentGame && this.state.currentGame.getName()}</div>
                    </div>
                    <Button color="secondary" appearance="border" {...{[iconProps]: "stop"}} align="right" onClick={() => this.quit()}>Quitter</Button>
                    <Button color="secondary" appearance="fill" {...{[iconProps]: "play"}} onClick={() => this.setState({displayGame: true, open: false})}>Reprendre</Button>
                </div>
    }

    getBottomMenu(){
        return  <div className="disconnect" >
                    <Button icon="power-off" 
                            appearance="simple"
                            color="main" 
                            size="large"
                            onClick={() => this.quit(true)}/>
                </div>
    }

    render(){
        if(!this.state.username){
            if(this.state.piziChat) this.state.piziChat.toggleChat("hide")
            return  <Login title="LOGIN"
                        icon=""
                        path="login"
                        hideInMenu={true}
                        socket={this.props.socket} onLogin={ (username, token) => this.props.socket.emit("login", username, token) && this.setState({username, token})} />
        }

        return  <>
                    <MenuApp    color="secondary" 
                                appearance="fill"
                                basepath={basepath}
                                logo={<Logo/>}
                                user={this.state.username}
                                open={this.state.open}
                                onSwitch={open => this.setState({open})}
                                menuTop={this.getTopMenu()}
                                menuBottom={this.getBottomMenu()}>
                        <Lobby title="PARTIES"
                            default
                            path="games"
                            icon="list"
                            games={this.state.games}
                            currentGame={this.state.currentGame}
                            chat={this.state.piziChat}
                            socket={this.props.socket}
                            breakpoint={this.state.breakpoint}/>
                        <Players title="JOUEURS"
                            path="players"
                            icon="users"
                            players={this.state.players}
                            socket={this.props.socket}
                            className=""/>
                        <Stats title="STATS"
                            path="stats"
                            icon="chart-bar"
                            username={this.state.username} 
                            token={this.state.token}/>
                        <Account title="COMPTE"
                            path="account"
                            icon="user-cog"
                            token={this.state.token}/>
                    </MenuApp>
                    <GameBoard className={ClassNameHelper({hidden: !this.state.displayGame})}
                            socket={this.props.socket} 
                            currentGame={this.state.currentGame && this.state.currentGame.getName()}
                            username={this.state.username}/>
                    <Modal  className="confirm-modal"
                            type="confirm" 
                            color="main"
                            open={this.state.modal}
                            onClose={(action) => {
                                this.setState({modal: null})
                            }}
                            onClosed={(action) => {
                                const disconnectUser = this.state.warningQuit === "disconnect"
                                if(action === "confirm"){
                                    if(disconnectUser){
                                        localStorage.removeItem("username")
                                        localStorage.removeItem("token")
                                    }
                                    this.state.piziChat.leave(this.state.currentGame.getName())
                                    this.setState({
                                        username: disconnectUser ? null : this.state.username,
                                        currentGame: null,
                                        currentScreen: disconnectUser ? SCREEN.LOGIN : this.state.currentScreen === SCREEN.GAME ? SCREEN.LOBBY : this.state.currentScreen,
                                    })
                                    this.props.socket.emit("quit", disconnectUser)
                                } 
                            }}>
                        {this.state.warningQuit === "disconnect" ? "Se déconnecter?" : "Quitter la partie?"}
                    </Modal>
                </>
    }
}