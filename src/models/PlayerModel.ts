import { CardModel, CardJsonProps } from "./CardModel"
import { GameJsonProps, GameModel } from "./GameModel"
import { PlayerStats } from "./PlayerStatsModel"

type PlayerStatus = "connected" | "disconnected" | "inGame"

export type PlayerJsonProps = {
    name: string
    game?: GameJsonProps
    status?: PlayerStatus
    cardNumber?: number
    score?: number
    scoreStreak?: number
    ready?: boolean
    hand?: CardJsonProps[]
    stats?: any
    bot?: boolean
} 

export class PlayerModel{
    static idIndex = 0

    private name:string
    private cardNumber:number
    private score:number
    private scoreStreak:number
    private ready: boolean
    private hand: CardModel[]
    private bot: boolean
    private game: GameModel
    private status: PlayerStatus
    private stats: PlayerStats

    constructor({name = "no name", cardNumber = 0, score = 0, ready = false, hand = [], scoreStreak = 0, stats = {}, bot = false, game, status}: PlayerJsonProps){
        this.name = name
        this.cardNumber = cardNumber
        this.score = score
        this.ready = ready
        this.hand = hand.map(card => new CardModel(card))
        this.scoreStreak = scoreStreak
        this.stats = stats
        this.bot = bot
        this.game = game ? new GameModel(game) : null
        this.status = status
    }

    public getHand(){
        return this.hand
    }

    public isReady(){
        return this.ready
    }

    public getName(){
        return this.name
    }

    public setCardNumber(number:number){
        this.cardNumber = number
    }

    public getCardNumber(){
        return this.cardNumber
    }

    public setScore(score:number){
        this.score = score
    }

    public getScore(){
        return this.score
    }

    public getScoreStreak(){
        return this.scoreStreak
    }

    public isBot(){
        return this.bot
    }

    public getStats(){
        return this.stats
    }

    public getGame(){
        return this.game
    }

    public getStatus():PlayerStatus {
        if(this.game) return "inGame"
        return this.status
    }

    public getReactivity():number {
        let reactivity = 0
        if(this.stats.quickplay) reactivity = this.stats.quickplay.done / this.stats.quickplay.taken
        return reactivity
    }

    public getVictory():number {
        let reactivity = 0
        if(this.stats.quickplay) reactivity = this.stats.quickplay.done / this.stats.quickplay.taken
        return reactivity
    }
}