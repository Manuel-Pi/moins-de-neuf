const mongoose = require('mongoose')

const PlayerSchema = new mongoose.Schema({
    user: String,
    stats: {
        games: {
            won: {
                type: Number,
                default: 0
            },
            lost: {
                type: Number,
                default: 0
            }
        }, 
        moinsdeneuf: {
            call: {
                type: Number,
                default: 0
            },
            won: {
                type: Number,
                default: 0
            },
            lost: {
                type: Number,
                default: 0
            }
        },
        quickplay:{
            done: {
                type: Number,
                default: 0
            },
            taken: {
                type: Number,
                default: 0
            }
        },
        score: {
            min: {
                type: Number,
                default: 0
            },
            max: {
                type: Number,
                default: 0
            }
        }
    }
});

PlayerSchema.methods.updateStats = function(stats){
    this.stats.games.won += stats.games.won;
    this.stats.games.lost += stats.games.lost;

    this.stats.moinsdeneuf.call += stats.moinsdeneuf.call;
    this.stats.moinsdeneuf.won += stats.moinsdeneuf.won;
    this.stats.moinsdeneuf.lost += stats.moinsdeneuf.lost;

    this.stats.quickplay.done += stats.quickplay.done;
    this.stats.quickplay.taken += stats.quickplay.taken;

    if(stats.score < this.stats.score.min) this.stats.score.min = stats.score;
    if(stats.score > this.stats.score.max) this.stats.score.max = stats.score;

    // First time
    if(this.stats.score.max && this.stats.games.played === 1) this.stats.score.min = this.stats.score.max;
}

module.exports = mongoose.model('Player', PlayerSchema)