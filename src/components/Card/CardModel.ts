export type CardJsonProps = {
    value: string
    color: string
    turned?: boolean
}

export class CardModel {
    private value:string = null;
    private color:Color = null;
    private turned:boolean = false;
    private intValue:number = null;

    public constructor (props: CardJsonProps){
        const parsedColor = CardParser.parseColor(props.color);
        const isJocker = parsedColor === Color.Jocker;
        if(!parsedColor || !isJocker && !props.value.match(/\d|10|[JQK*]/)) throw new Error("Unknown card value: " + props.value);
        this.color = parsedColor;
        this.value =  props.value;
        this.intValue = getIntValue(props.value);
        this.turned = !!props.turned;
    }

    public getValue(){
        return this.value;
    }

    public getColor(){
        return this.color;
    }

    public isTurned(){
        return this.turned;
    }

    public setTurned(value:boolean){
        this.turned = value;
    }

    public getIntValue(){
        return this.intValue;
    }

    public toJson(){
        return {value: this.value, color: this.color};
    }
}

const getIntValue = (value:string) => {
    switch(value){
        case "J":
            return 11;
        case "Q":
            return 12;
        case "K":
            return 13;
        case "*":
            return 0;
        default:
            if(value.match(/^\d|10$/)){
                return parseInt(value);
            } else {
                console.error("IntValue null (" + value + ")!");
                return null;
            }
    }
};

export enum Color {
    Heart = "heart",
    Spade = "spade",
    Club = "club",
    Diamond = "diamond",
    Jocker = "joker"
}

export const CardParser = {
    parseCardsArray(cardsArray: {value: string, color: string}[][], isTurned:boolean = false):CardModel[][]{
        return cardsArray.map(cards => cards.map(card => new CardModel({...card, turned: isTurned})));
    },
    parseColor(color: string):Color{
        switch(color){
            case "heart":
            return Color.Heart;
            case "spade":
            return Color.Spade;
            case "diamond":
            return Color.Diamond;
            case "club":
            return Color.Club;
            case "joker":
            return Color.Jocker;
        }
    },
    toJson(cardModels: CardModel[]): {value:string, color: string}[]{
        return cardModels.map(cardModel => ({color: cardModel.getColor(), value: cardModel.getValue()}))
    }
}