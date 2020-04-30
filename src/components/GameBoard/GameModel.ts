import { CardModel } from "../Card/CardModel";
import { PlayerModel } from "../Player/PlayerModel";


type GameJsonProps = {
    action: string
    currentPlayer: string
    name: string
    cards: any[]
    players: any[]
}

export class GameModel{
    private action: string;
    private currentPlayer: string;
    private name: string;
    private playedCards: CardModel[] = [];
    private playerModels: PlayerModel[] = [];
   
    constructor(props: GameJsonProps){
        this.action = props.action;
        this.currentPlayer = props.currentPlayer;
        this.name = props.name;
        this.playedCards = props.cards ? props.cards.map(card => new CardModel(card)): [];
        this.playerModels = props.players ? props.players.map(player => new PlayerModel(player)): [];
    }

    public getAction() {
        return this.action;
    }

    public getCurrentPlayer() {
        return this.currentPlayer;
    }

    public getName() {
        return this.name;
    }

    public getPlayerModels() {
        return this.playerModels;
    }

    public getPlayedCards() {
        return this.playedCards;
    }
    
}