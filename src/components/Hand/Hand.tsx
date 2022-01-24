import React, { useState, useEffect, useRef} from 'react';
import {Card} from "../Card/Card";
import { CardModel, Color } from '../../models/CardModel';

type HandProps = {
    cardModels?: CardModel[]
    onSelected?: (cardModel: CardModel) => void
    selectedCardModels?: CardModel[]
    className?: string
    turned?: boolean
    movingAllowed?: boolean
}

// To avoid array ref loop
const defaultArray: any[] = []

export const Hand = ({cardModels = defaultArray, onSelected, selectedCardModels=[], className = "", turned = true, movingAllowed = false}: HandProps) => {
    const [turnedList, setTurnedList] = useState(turned);
    const [width, setWidth] = useState(null);
    const handRef = useRef<HTMLDivElement>();
    const [movingOffset, setMovingOffset] = useState({index: null, offset: 0});
    const [customOrder, setCustomOrder] = useState(cardModels.length ? cardModels.map((card, i) => ({left: getLeft(i), card})): [])

    useEffect(() => {
        setWidth(handRef.current.getBoundingClientRect().width)
    }, [])

    useEffect(() => {
        const existingCards: CardModel[] = []
        const newCards: CardModel[] = []

        cardModels.forEach(c => {
            if(c.isIn(customOrder.map(({card}) => card))) existingCards.push(c)
            else newCards.push(c)
        })

        let newHand = customOrder.filter(({card}) => card.isIn(existingCards)).map(({card}) => card)
        newHand = [...newHand, ...newCards]

        setCustomOrder(newHand.map((card, i) => ({card, left: getLeft(i)})))
    }, [cardModels])

    useEffect(() => {
        setCustomOrder(customOrder.map(({card}, i) => ({left: getLeft(i), card})))
    }, [movingOffset])

    useEffect(() => {
        setTurnedList(turned)
    }, [turned])

    const lastWidth = width!== null && handRef.current.getBoundingClientRect().width;
    let lastCardWidth = handRef.current && handRef.current.children[0] && handRef.current.children[0].getBoundingClientRect().width + 1;
    if(!lastCardWidth){
        lastCardWidth = window.matchMedia( "(max-width: 500px)" ).matches ? 95 : 120;
    }

    function getLeft(index: number){
        if(movingOffset.index === index) return movingOffset.offset
        else {
            let leftPx = (lastWidth / (cardModels.length)) * index;
            return leftPx > lastCardWidth * index ? lastCardWidth * index : leftPx 
        }
    }

    let jokers = 0

    function getKey(card: CardModel){

        let key = card.getColor() + "-" + card.getValue()
        if(card.getColor() === Color.Jocker){
            jokers++
            key += "-" + jokers
        }
        return key
    }

    return  <div ref={handRef} className={"hand " + className}>
                {customOrder && customOrder.map(({left, card}, i) => {
                    card.setTurned(turnedList)
                    return <Card    className={card.isIn(selectedCardModels) ? "selected" : ""} 
                                    cardModel={card} 
                                    movingAllowed={movingAllowed}
                                    key={getKey(card)}
                                    style={{left: left * 100 / lastWidth + "%"}} 
                                    onClick={ () => {
                                        if(!turnedList) setTurnedList(true)
                                        else onSelected(cardModels.filter(c => c.getValue() === card.getValue() && c.getColor() === card.getColor())[0])
                                    }}
                                    onDrag={x => setMovingOffset({index: i, offset: x})}
                                    onDrop = {() => {
                                        setMovingOffset(prev => ({index: null, offset: 0}))
                                        setCustomOrder(customOrder.sort((a, b) => a.left - b.left))
                                    }}/>
                })}
            </div>
}