import React, { Component } from 'react';
import {Hand} from "../Hand/Hand";
import { CardModel, CardParser } from '../Card/CardModel';
import { Card } from '../Card/Card';
import { PlayerModel } from '../Player/PlayerModel';
import { Players } from '../Player/Players';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { GameModel } from './GameModel';
import { CreateClassName } from '../Utils/Utils';
import { Score } from '../Player/Score';

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
    results: {scores:any, winners:{score: number, names: string[]}}
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
            results: null
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
        this.props.socket.on("gameInfo", (gameInfo:{name: string, players: any[], playedCards: any[], currentPlayer: string, action: string}) => {
            
            if(this.state.currentGame && this.state.currentGame !== gameInfo.name) return;
            
            this.setState({
                menuActive: false,
                currentGame: gameInfo.name,
                playedCards: gameInfo.playedCards.map(cards => cards.map((card: any) => new CardModel({...card, turned: true}))),
                players: gameInfo.players.map(player => new PlayerModel(player)),
                currentPlayer: gameInfo.currentPlayer,
                action: gameInfo.action,
                isMyTurn: gameInfo.currentPlayer === this.props.username
            });
        });
        this.props.socket.on("notAllowed", () => {
            alert("Pas possible de jouer ça!");
        });
        this.props.socket.on("gameEnd", (results: {scores:any, winners:{score:any, names: []}}) => {
            this.setState({results});
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

    selectPickCard(cardModel: CardModel){
        if(this.state.action !== "pick" || !this.state.isMyTurn) return;

        let isValid = false;
        // Only accept first and last card
        if(!!cardModel && this.state.playedCards[0]){
            const index = this.state.playedCards[0].indexOf(cardModel);
            isValid = index !== -1 && ( index === 0 || index === this.state.playedCards[0].length - 1);
        }
        this.setState({pickSelection: (isValid && this.state.pickSelection !== cardModel) ? cardModel: null });
    }

    lessThanNine(){
        this.props.socket.emit("moinsDeNeuf");
    }

    getAction(){

        if(!this.state.action){
            return <button onClick={() => this.props.socket.emit("isReady")}>Prêt<FontAwesomeIcon icon="check"/></button>
        }
            
        if(this.state.isMyTurn){
            const buttons = [];
            if((this.state.pickSelection && this.state.action === "pick") || (this.state.currentSelection.length && this.state.action === "play")){
                buttons.push(<button onClick={() => this.action()}>jouer<FontAwesomeIcon icon="check"/></button>);
            }
            if(this.state.lessThanNine && this.state.action === "play"){
                buttons.push(<button className="less-than-nine" onClick={() => this.lessThanNine()}>moins de neuf<FontAwesomeIcon icon={['fab', 'angellist']}/></button>);
            }
            if(buttons.length) return buttons;
        }

        let action = this.state.action === "pick" ? "piocher" : "jouer";
        const playerName = this.state.isMyTurn ? "toi" : this.state.currentPlayer;
        return `À  ${playerName} de ${action}`;
    }

    displayResults(){
        const winners = this.state.results.winners.names as string[];
        const scores = this.state.results.scores;
        return  <div className="results">
                    <FontAwesomeIcon icon="trophy" onClick={e => this.setState({results: null})}/>
                    <h1 className="winners">
                        <FontAwesomeIcon icon="trophy" size="2x"/>
                        {winners.join(", ")} 
                    </h1>
                    {this.state.players.map(player => 
                        <div className={"playerHand " + (winners.includes(player.getName()) ? 'winner' : '')}>
                            <span className="name">{player.getName()}</span>>
                            <Score score={scores[player.getName()].score} scoreStreak={scores[player.getName()].scoreStreak}/>
                            <Hand cardModels={player.getHand()} turned/>
                        </div>
                    )}
                </div>
    }
    
    render(){
        const className = CreateClassName({
            "gameboard": true,
            "my-turn": this.state.isMyTurn,
            "game-running": !!this.state.action
        }, this.props.className);

        return  <div className={className}>
                    <div className="top">
                        <div className="top-board">
                            <Card   cardModel={this.pickCard} 
                                    className={"pick " + (this.state.pickSelection === this.pickCard ? "selected" : "")}
                                    onClick={() => this.state.action === "pick" && this.state.isMyTurn && this.setState({pickSelection: this.state.pickSelection === this.pickCard ? null : this.pickCard})}/>
                            <Players playerModels={this.state.players} currentPlayer={this.state.currentPlayer}/>
                        </div>
                    </div>
                    <div className={"actions " + ((this.state.currentPlayer && this.props.username !== this.state.currentPlayer) ? "disabled" : "")}>
                        {this.getAction()}
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
                </div>
    }
}