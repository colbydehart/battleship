var BS;
(function () {
  BS = {
    CZ : 50,
    GZ : 500,
    hits: 17,
    'aircraft-carrier': 5,
    battleship: 4,
    submarine: 3,
    destroyer: 3,
    'patrol-boat': 2,
    ships : [],
    processShot : function(shot){
      var msg = '',
          loc = BS.grid[shot[0]][shot[1]];
      if(loc.ship !== null){
        var shipName = loc.ship.split(' ')[0];
        msg += "Hit!";
        BS[shipName]--;
        BS.hits--;
        if (BS[shipName] === 0){
          msg += " You sunk my " + shipName.replace('-',' ') + "!!!";
          if (BS.hits === 0){
            msg += " You Win!";
          }
        }
        loc.ship = null;
      }
      else{
        msg += "Miss!";
      }
      loc.hit = true;
      return msg;
    },
    createGrid : function(cords){
      //creates a grid for the game where each cell has an object that
      //has:
      ////ship: string or false of the name of the ship in the cell
      ////hit: boolean of whether the opponent has shot at this square
      ////guess: boolean or string of 'hit' or 'miss' on cells you have
      ////       guessed on.
      if(!cords) return false;
      var result = [];
      for (var i = 0; i < 10; i++) {
        result[i] = [];
        for (var j = 0; j < 10; j++) {
          result[i][j] = {ship:false, hit:false, guess:false};
        }
      }
      for (var i = 0; i < 10; i++) {
        for ( var j = 0; j < 10; j++) {
          result[i][j].ship = cords[i][j] || null; 
        }
      }
      console.log(result);
      BS.grid = result;
      return true;
    }
  }

  ///////////////////
  //PRIVATE FUNCTIONS
  ///////////////////

  return BS;
}());

