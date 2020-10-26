import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type ScoreProps = {
    className?: string
    score: number
    scoreStreak: number
}

export const Score = ({className = "", score = 0, scoreStreak = 0}: ScoreProps) => {

    const streak = [];
    while(scoreStreak){
        streak.push(<FontAwesomeIcon icon="star"/>);
        scoreStreak--;
    }

    return  <div className={"score " + className}> 
                <span className="value">{score}</span>
                <span className="streak">{streak}</span>
            </div>
}