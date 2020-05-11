import React, { CSSProperties } from 'react';
import {CardModel} from './CardModel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type CardProps = {
    cardModel: CardModel
    style?: CSSProperties 
    className?: string
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
    ref?: any
}

export const Card = ({ cardModel, onClick, style, className = "", ref = null }: CardProps) => {

    let value = "";
    let values = [];
    let symbols = [];

    if(!cardModel) return null;

    if(cardModel.isTurned()){
        value = cardModel.getValue();
        for(let i = 0; i < 4; i++){
            values.push(<div className="value">
                            <span className={cardModel.getColor()}>{value}</span>
                            <i className={cardModel.getColor()}></i>
                        </div>
            );
        }
        if(cardModel.getIntValue() < 11 && cardModel.getIntValue()){
            for(let i = 0; i < cardModel.getIntValue(); i++){
                symbols.push(<i className={cardModel.getColor()}></i>);
            }
        } else {
            switch(cardModel.getValue()){
                case "J":
                    symbols.push(<FontAwesomeIcon icon="graduation-cap" size="lg"  className={cardModel.getColor()}/>)
                    break;

                case "Q":
                    symbols.push(<FontAwesomeIcon icon="chess-queen" size="lg"  className={cardModel.getColor()}/>)
                    break;

                case "K":
                    symbols.push(<FontAwesomeIcon icon="chess-king" size="lg" className={cardModel.getColor()}/>)
                    break;
                
                case "*":
                    symbols.push(<FontAwesomeIcon icon="cannabis" size="lg" className={cardModel.getColor()}/>)
                    break;
            }
            
        }
    } else {
        symbols.push(<FontAwesomeIcon icon="carrot" size="lg"/>);
    }

    return  <div ref={ref} className={cardModel.isTurned() ? "card turn " + className : "card notTurned " + className} onClick={onClick} style={style}>
                {values}
                <div className={`symbol value-${value}`}>
                    {symbols}
                </div>
            </div>
}