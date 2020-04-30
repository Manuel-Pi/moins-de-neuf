import React, { useState, useEffect, CSSProperties } from 'react';
import {PlayerModel} from './PlayerModel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Score } from './Score';

type PlayersProps = {
    playerModels: PlayerModel[]
    className?: string
    currentPlayer: string
}

export const Players = ({ playerModels, className = "", currentPlayer}: PlayersProps) => {
    return  <div className={"players"}>
                <table>
                    <tbody>
                    {
                        playerModels.map( playerModel => 
                            <tr className={"player " + className + (currentPlayer === playerModel.getName() ? " current" : "")}>
                                <td>
                                    <span className="card-number">
                                        {playerModel.getCardNumber()}
                                    </span>
                                </td>
                                <td className="icon">
                                    {(!playerModel.isReady() || (currentPlayer === playerModel.getName())) ? 
                                        <FontAwesomeIcon icon="spinner"/> 
                                        : 
                                        <FontAwesomeIcon icon="check" className={currentPlayer ? "hidden" : ""}/>
                                    }
                                </td>
                                <td className="name">
                                    {playerModel.getName()}
                                </td>
                                <td className="score">
                                    <Score score={playerModel.getScore()} scoreStreak={playerModel.getScoreStreak()}/>
                                </td>
                            </tr>)
                    }
                    </tbody>
                </table>
            </div>
}