import React, { Component } from 'react';
import {Hand} from "../Hand/Hand";
import { CardModel, CardParser } from '../Card/CardModel';
import { Card } from '../Card/Card';
import { PlayerModel } from '../Player/PlayerModel';
import { Players } from '../Player/Players';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GameModel, CheckPlayedCards } from './GameModel';
import { CreateClassName } from '../Utils/Utils';
import { Score } from '../Player/Score';
import { GameBoardModel } from './GameBoardModel';

type GameState = {
    menuActive: boolean,
    games: any[]
    currentGame: string
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
}

type GameProps = {
    socket: any
    username: string
    className: string
}

export class GameBoard extends Component<GameProps, GameState> {

    static  defaultProps: GameProps = {
        socket: null,
        username: "",
        className: ""
    }

    private resultPlayerGame:any = null;

    private pickCard: CardModel = new CardModel({value: "0", color: "heart"});

    constructor(props:GameProps){
        super(props);
        this.state = {
            menuActive: true,
            games: [],
            currentGame: null,
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
            quickPlayedOut: false
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
        this.props.socket.on("gameInfo", (gameInfo:{name: string, players: any[], playedCards: any[], currentPlayer: string, action: string, quickPlay: boolean}) => {
            this.setState({
                menuActive: false,
                currentGame: gameInfo.name,
                playedCards: gameInfo.playedCards.map(cards => cards.map((card: any) => new CardModel({...card, turned: true}))),
                players: gameInfo.players.map(player => new PlayerModel(player)),
                currentPlayer: gameInfo.currentPlayer,
                action: gameInfo.action,
                isMyTurn: gameInfo.currentPlayer === this.props.username,
                pickSelection: null,
                quickPlay: gameInfo.quickPlay
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
            alert("Pas possible de jouer ça!");
        });
        this.props.socket.on("quickPlayed", (playerName: string) => {
            this.setState({quickPlayed: playerName});
            setTimeout(e => {
                this.setState({quickPlayedOut: true});
                setTimeout(e => {this.setState({quickPlayed: null, quickPlayedOut: false});}, 800);
            }, 1600);
        });
        this.props.socket.on("gameEnd", (results: {scores:any, winners:{handScore: number, score:number, names: []}, players:any[], announcer:string}) => {
            this.setState({
                results,
                hand: [],
                currentSelection: [],
                playedCards: [],
                currentPlayer: null
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
        this.setState({pickSelection});
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
            
        if(this.state.isMyTurn || (this.state.quickPlay && isLastPlayer)){
            const buttons = [];
            if((this.state.pickSelection && this.state.action === "pick") || (this.state.currentSelection.length && this.state.action === "play")){
                buttons.push(<button onClick={() => this.action()}>jouer<FontAwesomeIcon icon="check"/></button>);
            }
            if(this.state.isMyTurn && this.state.lessThanNine && this.state.action === "play"){
                buttons.push(<button className="less-than-nine" onClick={() => this.lessThanNine()}>moins de neuf<FontAwesomeIcon icon={['fab', 'angellist']}/></button>);
            }
            if(buttons.length) return buttons;
        }

        let action = this.state.action === "pick" ? "piocher" : "jouer";
        const playerName = this.state.isMyTurn ? "toi" : this.state.currentPlayer;
        return <div className="animate__bounceIn">{`À  ${playerName} de ${action}`}</div>;
    }

    displayResults(){
        const winners = this.state.results.winners.names as string[];
        const scores = this.state.results.scores;
        return  <div className="results">
                    <FontAwesomeIcon icon="times" size="2x" onClick={e => this.setState({results: null})}/>
                    <h1 className="announcer">
                        <FontAwesomeIcon icon="bullhorn" size="2x"/>
                        {this.state.results.announcer} 
                    </h1>
                    <h1 className="winners">
                        <FontAwesomeIcon icon="trophy" size="2x"/>
                        {winners.join(", ")} 
                    </h1>
                    {Object.keys(scores).map(name =>
                        <div className={"playerHand " + (winners.includes(name) ? 'winner' : '')}>
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
        return  <div className={"quick-played " + (this.state.quickPlayedOut ? "out" : "")}>
                    <div>{this.state.quickPlayed + " a joué rapidement!"}</div>
                    <FontAwesomeIcon icon="kiss-wink-heart" size="2x" className="" onClick={e => this.setState({results: null})}/>
                </div>
    }
    
    render(){
        const className = CreateClassName({
            "gameboard": true,
            "my-turn": this.state.isMyTurn,
            "game-running": !!this.state.action
        }, this.props.className);

        const needToAct = this.state.isMyTurn && ((this.state.action === "play" && !this.state.currentSelection.length) || (this.state.action === "pick" && !this.state.pickSelection))

        const actionClassName = CreateClassName({
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
                            <Players playerModels={this.state.players} currentPlayer={this.state.currentPlayer}/>
                        </div>
                        <div className={actionClassName}>
                            {this.getAction()}
                        </div>
                    </div>
                    <div className="fold">
                        <Hand   className={"previous-play " + (this.state.action === "pick" ? "is-picking" : "")}
                                cardModels={this.state.playedCards[0]} 
                                selectedCardModels={[this.state.pickSelection]} 
                                onSelected={ cardModel => this.selectPickCard(cardModel)}
                                turned/>

                        <Hand   className="played" 
                                cardModels={this.state.playedCards[1]}/>
                    </div>
                    <div className="playerHand">
                        <Hand cardModels={this.state.hand} selectedCardModels={this.state.currentSelection} onSelected={ cardModel => this.selectCard(cardModel)}/>
                    </div>
                    {this.state.results && this.displayResults()}
                    {this.state.quickPlayed && this.displayQuickPlayed()}
                </div>
    }
}