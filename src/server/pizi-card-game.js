const COLORS = ["club", "diamond", "spade", "heart"];
const VALUES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const shuffle = (array) => {
    let currentIndex = array.length, temporaryValue, randomIndex;
  
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

const generateCards = () => {
    let cardGame = [];
    // Generate cards
    COLORS.forEach(color => {
        VALUES.forEach(value => cardGame.push({
            value,
            color
        }))
    });
    // Add jokers
    cardGame.push({
        value: "*",
        color: "joker"
    });
    cardGame.push({
        value: "*",
        color: "joker"
    });
    return shuffle(cardGame);
};

const sort = (cards) => {
    cards.sort((card1, card2) => getValue(card1) - getValue(card2));
};

const getValue = (card) => {
    switch(card.value){
        case "J":
            return 11;
        case "Q":
            return 12;
        case "K":
            return 13;
        case "*":
            return 0;
        default:
            if(card.value.match(/^\d|10$/)){
                return parseInt(card.value);
            } else {
                throw new Error("Unknown card value: " + card.value);
            }
    }
}

module.exports = {
    generateCards,
    shuffle,
    sort,
    getValue
}