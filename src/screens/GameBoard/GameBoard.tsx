import React, { Component } from 'react';
import {Hand} from "../../components/Hand/Hand";
import { CardModel, CardParser } from '../../models/CardModel';
import { Card } from '../../components/Card/Card';
import { PlayerModel } from '../../models/PlayerModel';
import { Players } from '../../components/Player/Players';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GameModel } from '../../models/GameModel';
import { ClassNameHelper } from 'pizi-react';
import { Score } from '../../components/Player/Score';
import { Logo } from '../../components/Logo/Logo';
import { Modal } from '../../components/Modal/Modal';
import { Table } from '../../components/Table/Table';

type GameState = {
    menuActive: boolean,
    games: any[]
    playedCards: CardModel[][]
    hand: CardModel[]
    currentSelection: CardModel[]
    currentPlayer: string
    isMyTurn: boolean
    players: PlayerModel[]
    pickSelection: CardModel
    action: string
    lessThanNine: boolean
    actionMessage: string
    results: {scores:any, winners:{handScore: number, score: number, names: string[]}, players: any[], announcer:string}
    quickPlay: boolean,
    quickPlayed: string,
    quickPlayedOut: boolean,
    quickPlayedBashed: string,
    gameEnd: string,
    displayEnd: boolean,
    startTime: number,
    turn: number,
    round: number,
    roundStartTime: number,
    cardTurned: boolean,
    modal: any,
    spectators: PlayerModel[]
}

type GameProps = {
    socket: any
    username: string
    className: string
    currentGame: string
}

export class GameBoard extends Component<GameProps, GameState> {

    static  defaultProps: GameProps = {
        socket: null,
        username: "",
        className: "",
        currentGame: null
    }

    private pickCard: CardModel = new CardModel({value: "0", color: "heart"});

    constructor(props:GameProps){
        super(props);
        this.state = {
            menuActive: true,
            games: [],
            playedCards: [],
            hand: [],
            currentSelection: [],
            players: [],
            currentPlayer: null,
            isMyTurn: false,
            pickSelection: null,
            action: null,
            lessThanNine: false,
            actionMessage: "",
            results: null,
            quickPlay: false,
            quickPlayed: null,
            quickPlayedOut: false,
            quickPlayedBashed: null,
            gameEnd: null,
            displayEnd: false,
            startTime: 0,
            turn: 0,
            round: 0,
            roundStartTime: 0,
            cardTurned: false,
            modal: null,
            spectators: []
        }
    }

    componentDidMount(){
        this.props.socket.on("setGames", (games:any) => {
            this.setState({games: games.map((game: any) => new GameModel(game))});
        });
        this.props.socket.on("setHand", (cards:any) => {
            const hand:CardModel[] = cards.map((card: any) => new CardModel(card));
            this.setState({
                hand,
                currentSelection: [],
                pickSelection: null,
                lessThanNine: hand.reduce((sum, card) => sum + card.getIntValue(), 0) < 10
            });
        });
        this.props.socket.on("gameInfo", (gameInfo:{name: string, players: any[], spectators: any[], playedCards: any[], currentPlayer: string, action: string, quickPlay: boolean, gameEnd: null, startTime: number, turn: number, round: number, roundStartTime: number}) => {
            if(!gameInfo) return;
            this.setState({
                menuActive: false,
                playedCards: gameInfo.playedCards.map(cards => cards.map((card: any) => new CardModel({...card, turned: true}))),
                players: gameInfo.players.map(player => new PlayerModel(player)),
                currentPlayer: gameInfo.currentPlayer,
                action: gameInfo.action,
                isMyTurn: gameInfo.currentPlayer === this.props.username,
                pickSelection: null,
                quickPlay: gameInfo.quickPlay,
                gameEnd: gameInfo.gameEnd,
                startTime: gameInfo.startTime,
                turn: gameInfo.turn,
                round: gameInfo.round,
                roundStartTime: gameInfo.roundStartTime,
                spectators: gameInfo.spectators.map(player => new PlayerModel(player))
            });
        });
        this.props.socket.on("selectedPick", (card: any) => {
            let cardIndex:number = null;
            let cardModel = null;
            if(card && card.value === this.pickCard.getValue() && card.color === this.pickCard.getColor()){
                cardModel = this.pickCard;
            } else if(card){
                card && this.state.playedCards[0].forEach((c, index) => {
                    if(c.getValue() === card.value && c.getColor() === card.color){
                        cardIndex = index;
                        return;
                    }
                });
                cardModel = this.state.playedCards[0][cardIndex];
            }
            this.selectPickCard(cardModel, true);
        });
        this.props.socket.on("notAllowed", () => {
            this.setState({modal:   <Modal type="alert" onClose={() => this.setState({modal: null})}>
                                        Pas possible de jouer ça!
                                    </Modal>});
        });
        this.props.socket.on("quickPlayed", (playerName: string) => {
            this.setState({quickPlayed: playerName});
            setTimeout(e => {
                this.setState({quickPlayedOut: true});
                setTimeout(e => {this.setState({quickPlayed: null, quickPlayedOut: false});}, 700);
            }, 1600);
        });
        this.props.socket.on("bash", (playerName: string) => {
            this.setState({quickPlayedBashed: playerName});
            setTimeout(e => {
                this.setState({quickPlayedOut: true});
                setTimeout(e => {this.setState({quickPlayed: null, quickPlayedOut: false});}, 800);
            }, 1600);
        });
        this.props.socket.on("roundEnd", (results: {scores:any, winners:{handScore: number, score:number, names: []}, players:any[], announcer:string}) => {
            this.setState({
                results,
                hand: [],
                currentSelection: [],
                playedCards: [],
                currentPlayer: null,
                cardTurned: false
            });
        });
    }

    action(){
        if(this.state.action === "play"){
            this.props.socket.emit("play", CardParser.toJson(this.state.currentSelection));
        } else if(this.state.action === "pick"){
            if(this.state.pickSelection === this.pickCard){
                this.props.socket.emit("pick");
            } else if(this.state.pickSelection){
                this.props.socket.emit("pick", CardParser.toJson([this.state.pickSelection]));
            }
        }
    }   

    selectCard(cardModel: CardModel){
        let currentSelection = [...this.state.currentSelection];
        if(currentSelection.includes(cardModel)){
            currentSelection.splice(currentSelection.indexOf(cardModel),1);
        } else {
            currentSelection.push(cardModel);
        }
        this.setState({currentSelection});
    }

    selectPickCard(cardModel: CardModel, force:boolean = false){
        if(!force && (this.state.action !== "pick" || !this.state.isMyTurn)) return;

        let isValid = (cardModel && cardModel.getValue() === "0");
        // Only accept first and last card
        if(!isValid && !!cardModel && this.state.playedCards[0]){
            const index = this.state.playedCards[0].indexOf(cardModel);
            isValid = index !== -1 && ( index === 0 || index === this.state.playedCards[0].length - 1);
        }
        const pickSelection = (isValid && this.state.pickSelection !== cardModel) ? cardModel: null;
        this.setState({pickSelection, cardTurned: true});
        const cardSelection = pickSelection ? CardParser.toJson([pickSelection]) : null;
        !force && this.props.socket.emit("selectPick", cardSelection);
    }

    lessThanNine(){
        this.props.socket.emit("moinsDeNeuf");
    }

    getAction(){
        if(!this.state.action){
            return <button onClick={() => this.props.socket.emit("isReady")}>Prêt<FontAwesomeIcon icon="check"/></button>
        }

        let currentPlayer = this.state.players.filter(player => player.getName() === this.state.currentPlayer)[0];
        let previousIndex = this.state.players.indexOf(currentPlayer) - 1;
        previousIndex = previousIndex < 0 ? this.state.players.length - 1 : previousIndex;
        const isLastPlayer = this.state.players[previousIndex].getName() === this.props.username;
        const isQuickPlay = this.state.quickPlay && isLastPlayer && this.state.currentSelection.length === 1 && this.state.currentSelection[0] === this.state.hand[this.state.hand.length -1];
            
        if(this.state.isMyTurn || isQuickPlay){
            const buttons = [];
            if((this.state.pickSelection && this.state.action === "pick" && !isQuickPlay) || (this.state.currentSelection.length && this.state.action === "play")){
                buttons.push(<button className="animate__animated animate__pulse animate__infinite" onClick={() => this.action()}>jouer<FontAwesomeIcon icon="check"/></button>);
            }
            if(this.state.isMyTurn && this.state.lessThanNine && this.state.action === "play"){
                buttons.push(<button className="less-than-nine" onClick={() => this.lessThanNine()}>moins de neuf<FontAwesomeIcon icon={'bullhorn'}/></button>);
            }
            if(buttons.length) return buttons;
        }

        let action = this.state.action === "pick" ? "piocher" : "jouer";
        const playerName = this.state.isMyTurn ? "toi" : this.state.currentPlayer;
        return <div className="action animate__animated animate__bounceIn">À<span className="animate__animated animate__tada">{playerName}</span>de {action}</div>;
    }

    displayResults(){
        const winners = this.state.results.winners.names as string[];
        const scores = this.state.results.scores;
        return  <div className="results">
                    <FontAwesomeIcon icon="times" size="2x" onClick={e => this.setState({results: null, displayEnd: !!this.state.gameEnd})}/>
                    <div className="announcer animate__animated animate__jackInTheBoxPizi">
                        <Logo/>
                        <h1>
                            <FontAwesomeIcon icon="bullhorn" size="2x"/>
                            {this.state.results.announcer}
                        </h1>
                    </div>
                    <h1 className="winners animate__delay-2s animate__animated  animate__jackInTheBox">
                        <FontAwesomeIcon icon="trophy" size="2x" className="animate__animated animate__swing animate__infinite"/>
                        {winners.join(", ")} 
                    </h1>
                    <div className="game-info">
                        <span className="time animate__animated animate__fadeIn animate__delay-3s">Durée:<b>{Math.round(((new Date()).getTime() - this.state.roundStartTime) / 60000) + "min"}</b></span>
                        <span className="turn animate__animated animate__fadeIn animate__delay-3s">Tours:<b>{this.state.turn}</b></span>
                    </div>
                    {Object.keys(scores).sort((first, second) => {
                        if(scores[first].handScore < scores[second].handScore) return -1;
                        if(scores[first].handScore >scores[second].handScore) return 1;
                        if(scores[first].handScore ===scores[second].handScore) {
                            if(scores[first].scoreStreak <scores[second].scoreStreak) return 1;
                            if(scores[first].scoreStreak >scores[second].scoreStreak) return -1;
                            return 0;
                        }
                    }).map((name,i) =>
                        <div className={"playerHand " + (winners.includes(name) ? 'winner' : '') + " animate__delay-2s animate__animated animate__backInUp"}
                            style={{animationDelay: (2 + i * 0.4) + "s"}}>
                            <div className="score-info">
                                <span className="name">{name}</span>
                                <span className="hand-score">
                                    <FontAwesomeIcon icon="hand-paper"/>
                                    <Score score={scores[name].handScore} scoreStreak={0}/>
                                </span>
                                <span className="score">
                                    <FontAwesomeIcon icon="file-signature"/>
                                    <Score score={scores[name].score} scoreStreak={scores[name].scoreStreak}/>
                                </span>
                            </div>
                            <Hand cardModels={scores[name].hand.map((card: any) => new CardModel(card))} turned/>
                        </div>
                    )}
                </div>
    }

    displayQuickPlayed(){
        return  <Modal type="info" onClose={() => this.setState({quickPlayed: null, quickPlayedOut: false})} className={"quick-played " + (this.state.quickPlayedOut ? "out" : "")}>
                    <div>
                        <span>{this.state.quickPlayed}</span>
                        <span>a joué rapidement!</span>
                    </div>
                    <FontAwesomeIcon className="animate__animated animate__rubberBand" icon="kiss-wink-heart" size="2x"/>
                </Modal>
    }

    displayBash(){
        return  <div className={"quick-played " + (this.state.quickPlayedBashed ? "out" : "")}>
                    <div>
                        <span>{this.state.quickPlayed}</span>
                        <span>s'est fait bashé!"</span>
                    </div>
                    <FontAwesomeIcon icon="ban" size="2x"/>
                </div>
    }

    displayEndGame(){
        return <Modal onClose={() => this.props.socket.emit("quit")} className={"end-game"}>
            <h2>Fin de partie <FontAwesomeIcon icon="flag-checkered"/></h2>
            <span className="animate__animated animate__fadeIn animate__delay-1s">{ this.state.gameEnd === "time" ? "Temps max atteint" : "Score max atteint"}</span>
            <h3 className="time animate__animated animate__fadeIn animate__delay-2s">Durée:<b>{Math.round(((new Date()).getTime() - this.state.startTime) / 60000) + "min"}</b></h3>
            <h3 className="turn animate__animated animate__fadeIn animate__delay-2s">Manches:<b>{this.state.round}</b></h3>
            <Table  className="animate__animated animate__fadeIn animate__delay-3s"
                    header={["#", "Pseudo", "Score"]} 
                    body={this.state.players.map((player, index) => [index + 1, player.getName(), <Score score={player.getScore()} scoreStreak={player.getScoreStreak()}/>])}
                    animation="animate__backInUp-reverse"
                    animationDelay={4} animationIncrement={1.5}/>
            <FontAwesomeIcon className="animate__animated animate__fadeIn animate__delay-4s"
                icon="redo" onClick={ e => {
                this.setState({displayEnd: false, results: null, gameEnd: null, hand: [], currentPlayer: null});
                }}/>
            <FontAwesomeIcon className="animate__animated animate__fadeIn animate__delay-4s"
                icon="sign-out-alt" onClick={ e => {
                this.props.socket.emit("quit");
                this.setState({displayEnd: false, results: null, gameEnd: null, hand: [], currentPlayer: null});
                }}/>
        </Modal>
    }
    
    render(){
        if(!this.props.currentGame) return null;
        const className = ClassNameHelper({
            "gameboard": true,
            "my-turn": this.state.isMyTurn,
            "game-running": !!this.state.action
        }, this.props.className);

        const needToAct = this.state.isMyTurn && ((this.state.action === "play" && !this.state.currentSelection.length) || (this.state.action === "pick" && !this.state.pickSelection))

        const actionClassName = ClassNameHelper({
            "actions": true,
            "disabled": this.state.currentPlayer && (this.props.username !== this.state.currentPlayer) && !this.state.quickPlay,
            "need-to-act": needToAct,
            "need-to-validate": needToAct && (this.state.currentSelection.length || this.state.pickSelection)
        });

        return  <div className={className}>
                    <div className="top">
                        <div className="top-board">
                            <Card   cardModel={this.pickCard} 
                                    className={"pick " + (this.state.pickSelection === this.pickCard ? "selected" : "")}
                                    onClick={() => this.state.action === "pick" && this.state.isMyTurn && this.selectPickCard(this.pickCard)}/>
                            <Players playerModels={this.state.players} spectatorModels={this.state.spectators} currentPlayer={this.state.currentPlayer}/>
                        </div>
                        <div className={actionClassName}>
                            {this.getAction()}
                        </div>
                    </div>
                    <div className="fold">
                        <Hand   className={"previous-play " + (this.state.action === "pick" ? "is-picking" : "")}
                                cardModels={this.state.playedCards[0]} 
                                selectedCardModels={this.state.pickSelection ? [this.state.pickSelection] : []} 
                                onSelected={ cardModel => this.selectPickCard(cardModel)}/>
                        <Hand   className="played" 
                                cardModels={this.state.playedCards[1]}/>
                    </div>
                    <div className="playerHand">
                        <Hand   cardModels={this.state.hand} 
                                turned={this.state.cardTurned} 
                                selectedCardModels={this.state.currentSelection} 
                                onSelected={ cardModel => this.selectCard(cardModel)}
                                movingAllowed/>
                    </div>
                    {this.state.results && this.displayResults()}
                    {this.state.gameEnd && this.state.displayEnd && this.displayEndGame()}
                    {this.state.quickPlayed && this.displayQuickPlayed()}
                    {this.state.quickPlayedBashed && this.displayBash()}
                    {this.state.modal}
                </div>
    }
}