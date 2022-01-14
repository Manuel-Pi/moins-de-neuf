import React from 'react';
import {PlayerModel} from '../../models/PlayerModel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Score } from './Score';

type PlayersProps = {
    playerModels: PlayerModel[]
    spectatorModels: PlayerModel[]
    className?: string
    currentPlayer: string
}

export const Players = ({ playerModels = [], className = "", currentPlayer, spectatorModels = []}: PlayersProps) => {
    return  <div className={"players-info"}>
                <table>
                    <tbody>
                    {
                        playerModels.map( playerModel => 
                            <tr className={"player " + className + (currentPlayer === playerModel.getName() ? " current" : "")} key={playerModel.getName()}>
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
                                <td className="score-td">
                                    <Score score={playerModel.getScore()} scoreStreak={playerModel.getScoreStreak()}/>
                                </td>
                            </tr>)
                        }
                        {
                            spectatorModels.map(playerModel => 
                                <tr className={"player spectator " + className + (currentPlayer === playerModel.getName() ? " current" : "")}>
                                    <td>
                                    </td>
                                    <td className="icon">
                                        {<FontAwesomeIcon icon="user-secret" />}
                                    </td>
                                    <td className="name">
                                        {playerModel.getName()}
                                    </td>
                                    <td className="score-td">
                                        ?
                                    </td>
                                </tr>)    
                        }
                    </tbody>
                </table>
            </div>
}