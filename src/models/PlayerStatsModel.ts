export interface PlayerStats {
    games: {
        won: number,
        lost: number
    },
    moinsdeneuf: {
        call: number,
        won: number,
        lost: number
    },
    quickplay: {
        done: number,
        taken: number
    },
    score: {
        min: number,
        max: number
    }
}


export class PlayerStatsModel implements PlayerStats{
    games = {won: 0, lost: 0}
    moinsdeneuf = {won: 0, lost: 0, call:0}
    quickplay = {done: 0, taken: 0}
    score = {min: 0, max: 0}

    constructor(stats: PlayerStats){
        Object.assign(this, stats)
    }

    getRatio(propName: string): number{
        switch(propName){
            case "games":
            case "moinsdeneuf":
                return this[propName].won / (this[propName].lost || 1)
            case "quickplay":
                return this.quickplay.done / (this.quickplay.taken || 1)
            default:
                return 0
        }
    }
}