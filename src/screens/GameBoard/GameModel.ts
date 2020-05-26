import { CardModel, CardParser } from "../../components/Card/CardModel";
import { PlayerModel } from "../../components/Player/PlayerModel";


type GameJsonProps = {
    action: string
    currentPlayer: string
    name: string
    cards: any[]
    players: any[]
    quickPlay: boolean
    conf: GameInfo
}

export type GameInfo = {
    name: string,
    minPlayer: number,
    maxPlayer: number,
    allowQuickPlay: boolean,
    allowStreak: boolean,
    allowWinEquality: boolean,
    onlyOneWinnerStreak: boolean,
    bonusMultiple50: boolean,
    playerKickTimeout: string,
    gameKickTimeout: string,
    gameEndScore: number,
    gameEndTime: string
}

export class GameModel{
    private action: string;
    private currentPlayer: string;
    private name: string;
    private playedCards: CardModel[] = [];
    private playerModels: PlayerModel[] = [];
    private quickPlay: boolean;
    private turn: number = 0;
    private conf: GameInfo = null;

    constructor(props: GameJsonProps){
        this.action = props.action;
        this.currentPlayer = props.currentPlayer;
        this.name = props.name;
        this.playedCards = props.cards ? props.cards.map(card => new CardModel(card)): [];
        this.playerModels = props.players ? props.players.map(player => new PlayerModel(player)): [];
        this.quickPlay = props.quickPlay;
        this.conf = props.conf;
    }

    public getAction() {
        return this.action;
    }

    public getConf(){
        return this.conf;
    }

    public isQuickPlay() {
        return this.quickPlay;
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

const getValue = (card: {value: string}) => {
    switch(card.value){
        case "J":
            return 11;
        case "Q":
            return 12;
        case "K":
            return 13;
        case "*":
            return 0;
        default:
            if(card.value.match(/^\d|10$/)){
                return parseInt(card.value);
            } else {
                throw new Error("Unknown card value: " + card.value);
            }
    }
}

export const CheckPlayedCards = (originalcards: CardModel[]) => {

    const cards = [...CardParser.toJson(originalcards)];

    // ***** No cards *****
    if(!cards || !cards.length) return false;
    
    // ***** One card *****
    if(cards.length === 1) return true;
        
    // ***** Multiple cards *****
    cards.sort((card1, card2) => getValue(card1) - getValue(card2));

    // Get jokers
    let jokers = 0;
    while(cards[jokers].value === "*") jokers++;
    // Extract jokers
    cards.splice(0, jokers);

    if(!cards.length || cards.length === 1) return true;

    if(cards[0].value === cards[1].value){
        for(let i = 2; i < cards.length; i++){
            if(cards[i].value !== cards[0].value) return false;
        }
        return true;

    } else if(originalcards.length > 2){
        // Change As value if needed (only one 1 could be there)
        if(getValue(cards[0]) === 1 && getValue(cards[1]) > 4){
            cards[0].value === "14";
            cards.sort((card1, card2) => getValue(card1) - getValue(card2));
        }

        // Fluch
        for(let i = 1; i < cards.length; i++){
            // Check value order
            const card1Value = getValue(cards[i - 1]);
            const card2Value = getValue(cards[i]);
            const diff = card2Value - card1Value;

            // Check color
            if(cards[i - 1].color !== cards[i].color) return false;

            // Logic order
            if(diff === 1) continue;

            // Use joker
            jokers = jokers - diff - 1;
            if(jokers < 0) return false;
        }
        return true;
    }
    return false;
};