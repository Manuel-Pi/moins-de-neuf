import { CardModel, CardJsonProps } from "../Card/CardModel";
import { Card } from "../Card/Card";

type PlayerJsonProps = {
    name: string
    cardNumber: number
    score: number
    scoreStreak: number
    ready: boolean
    hand: CardJsonProps[]
} 

export class PlayerModel{

    static idIndex = 0;

    private name:string;
    private cardNumber:number;
    private score:number;
    private scoreStreak:number;
    private ready: boolean;
    private hand: CardModel[];

    constructor({name = "no name", cardNumber = 0, score = 0, ready = false, hand = [], scoreStreak = 0}: PlayerJsonProps){
        this.name = name;
        this.cardNumber = cardNumber;
        this.score = score;
        this.ready = ready;
        this.hand = hand.map(card => new CardModel(card));
        this.scoreStreak = scoreStreak;
    }

    public getHand(){
        return this.hand;
    }

    public isReady(){
        return this.ready;
    }

    public getName(){
        return this.name;
    }

    public setCardNumber(number:number){
        this.cardNumber = number;
    }

    public getCardNumber(){
        return this.cardNumber;
    }

    public setScore(score:number){
        this.score = score;
    }

    public getScore(){
        return this.score;
    }

    public getScoreStreak(){
        return this.scoreStreak;
    }
}