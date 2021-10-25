import React, { useState, useEffect, useRef} from 'react';
import {Card} from "../Card/Card";
import { CardModel, Color } from '../../models/CardModel';

type HandProps = {
    cardModels?: CardModel[]
    onSelected?: (cardModel: CardModel) => void
    selectedCardModels?: CardModel[]
    className?: string
    turned?: boolean
}

export const Hand = ({cardModels, onSelected, selectedCardModels=[], className = "", turned = true}: HandProps) => {
    const [turnedList, setTurnedList] = useState(turned);
    const [width, setWidth] = useState(null);
    const handRef = useRef<HTMLDivElement>();

    useEffect(() => {
        setWidth(handRef.current.getBoundingClientRect().width);
    }, );

    useEffect(() => {
        setTurnedList(turned);
    }, [turned]);

    const lastWidth = width!== null && handRef.current.getBoundingClientRect().width;
    let lastCardWidth = handRef.current && handRef.current.children[0] && handRef.current.children[0].getBoundingClientRect().width + 1;
    if(!lastCardWidth){
        lastCardWidth = window.matchMedia( "(max-width: 500px)" ).matches ? 95 : 120;
    }

    function clickHandler(cardModel: CardModel){
        if(!turnedList){
            setTurnedList(true);
            return;
        }
        onSelected && onSelected(cardModel);
    }   

    return  <div ref={handRef} className={"hand " + className}>
                {cardModels && cardModels.map((cardModel, i) => {
                    cardModel.setTurned(turnedList);
                    let leftPx = (lastWidth / (cardModels.length)) * i;
                    leftPx = leftPx > lastCardWidth * i ? lastCardWidth * i : leftPx;
                    return <Card    className={(selectedCardModels.includes(cardModel)) ? "selected" : ""} 
                                    cardModel={cardModel} 
                                    style={{left: leftPx * 100 / lastWidth + "%"}} 
                                    onClick={ () => {clickHandler(cardModel)}}/>
                })}
            </div>
}