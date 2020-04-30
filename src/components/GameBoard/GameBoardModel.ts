import { CardModel, Color } from "../Card/CardModel";

export class GameBoardModel{


    public constructor(){
        this.generateCards();
    }

    public generateCards(): CardModel[]{
        let cardGame = [];
        const colorsToGenerate = [Color.Club, Color.Diamond, Color.Spade, Color.Heart];
        const valuesToGenerate = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

        colorsToGenerate.forEach(color => {
            valuesToGenerate.forEach(value => cardGame.push(new CardModel({value, color})))
        });

        cardGame.push(new CardModel({value: "0", color: Color.Jocker}));
        cardGame.push(new CardModel({value: "0", color: Color.Jocker}));

        return this.shuffle(cardGame);
    }

    public pickCards(number:number,cardGame:CardModel[]): CardModel[]{
        let cards:CardModel[] = [];
        while(number-- && cardGame.length){
            cards.push(cardGame.splice(0, 1)[0]);
        }

        return cards;
    }

    public shuffle(array:any[]) {
        var currentIndex = array.length, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
        return array;
      }
}