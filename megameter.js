// =========== MEGAMETER - CORE FUNCTIONALITY =====================

var Megameter = function(game){
    this.game = game;
    this.deck = new Deck();
    
    var hands = this.deck.dealHands();
    
    //TODO - these need to eventually support more than 2 players
    this.board = {
        
        playingArea: [
            {
                hand: hands[0],
                discard: [],
                km: [],
                status: [],
                safeties: [],
                speed: [],
                score: 0
            },
            {
                hand: hands[1],
                discard: [],
                km: [],
                status: [],
                safeties: [],
                speed: [],
                score: 0
            },
        ]
    };
    
}

/**
 *   Playing areas ==> 0 = discard, 1 = km, 2 = status, 3 = safeties, 4 = speed, 5 = opponent status, 6 = opponent speed
 * 
 */ 

/**---------validateMove method---------------
 *  
 *  Validates the requested move.  If the move is legal, true is returned, false otherwise
 *  card = the index of the card to play, area = the index of the playing area to play it to 
 *  player = the number of the player requesting the move 
 * 
 */
  
Megameter.prototype.validateMove = function(card, area, player){
    
    //check for completely outlandish entries
    if(card < 0 || card > 6 || area < 0 || area > 6 || player < 0 || player > 3) return false;
    
    //check for correct area
    if(Number(area) === 0) return true;  //discard is always ok 
    
    if(Number(area) === 1 && typeof board.playingArea[player].hand[card] === 'number')  return true;
    
    //if(Number(area) === 2 && )
    
    
};

/**---------playCard method---------------
 *  
 *  First validates the requested move.  If the move is legal, the requested move is played
 *  and the game board (state) is updated. 
 *  card = the index of the card to play, area = the index of the playing area to play it to 
 *  player = the number of the player requesting the move 
 * 
 */

Megameter.prototype.playCard = function(card, area, player){
    
};

/**---------checkForWinner method---------------
 *  
 *  Checks the game state to see if a player has won
 * 
 */
 
 Megameter.prototype.checkForWinner = function(){
    
};

/**---------getBoardState method---------------
 *  
 *  Returns the state of the board as an object which can then be parsed by the client
 * 
 */

Megameter.prototype.getBoardState = function(){
    return this.board;
};

//======== DECK FUNCTIONALITY ==============

// Create the deck

/**
 *  CARD TYPES:
 *  25, 50, 75, 100, 200 = km cards (numbers)
 *  Gas, Spare Tire, Repairs, Go = remedy cards ==> 'GS', 'ST', 'RP', 'GO'
 *  Out of Gas, Flat Tire, Accident, Stop = attack cards ==> 'OOG', 'FLT', 'ACC', 'STP'
 *  Speed Limit = speed attack card ==> 'SPDL'
 *  End of Speed Limit = speed card ==> 'ENDSL'
 *  Right of Way, Driving Ace, Puncture-Proof Tires, Extra Tank - Safeties ==> 'RGTWAY', 'DRVACE', 'PNCPRF', 'EXTANK'  
 */ 

var Deck = function(){
    
    this.numberCards = [200, 200, 200, 200, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 
      75, 75, 75, 75, 75, 75, 75, 75, 75, 75, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25];
    this.remedyCards = ['GS','GS','GS','GS','GS', 'GS', 'ST', 'ST','ST', 'ST','ST', 'ST', 'RP','RP','RP','RP','RP','RP',
      'GO', 'GO', 'GO', 'GO', 'GO', 'GO', 'GO','GO', 'GO', 'GO', 'GO', 'GO', 'GO', 'GO'];
    this.attackCards = ['OOG','OOG','OOG', 'FLT','FLT','FLT', 'ACC','ACC','ACC', 'STP', 'STP', 'STP', 'STP', 'STP'];
    this.speedLimitCards = ['SPDL','SPDL','SPDL','SPDL'];
    this.speedCards = ['ENDSL', 'ENDSL', 'ENDSL', 'ENDSL', 'ENDSL','ENDSL'];
    this.safetyCards = ['RGTWAY', 'DRVACE', 'PNCPRF', 'EXTANK'];
    this.cards = this.numberCards.concat(this.remedyCards).concat(this.attackCards).concat(this.speedLimitCards).concat(speedCards).concat(safetyCards);
    
    
    //push all of the cards onto the deck
};

//Deal out starting hands 

Deck.prototype.dealHands = function(){
    
    //shuffle the Deck
    shuffle(this.cards);
    var hands = [[],[]];  //TODO - again - bad.  expand for more players
    
    //create two arrays from the deck of cards
    for(var i = 0; i< 6; i++)
    {
        hands[0].push(this.dealOne());
        hands[1].push(this.dealOne());
    }
    
    return hands;
};

//Deal the top card off of the deck to a player 

Deck.prototype.dealOne = function(){
    
    //pop the top card off of the deck and return it 
    var card = this.cards[0];
    this.cards.splice(0,1);
    
    return card;
    
};

function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}
