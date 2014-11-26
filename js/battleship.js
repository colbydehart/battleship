var BS;
(function () {
  BS = {
    CZ : 50,
    GZ : 500,
    carrier: 5,
    battleship: 4,
    sub: 3,
    destroyer: 3,
    patrol: 2,
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
          result[i][j] = cords[i][j] ? cords[i][j] : null; 
        }
      }
      console.log(result);
      BS.grid = result;
      setShips(cords);
      return true;
    }
  };

  ///////////////////
  //PRIVATE FUNCTIONS
  ///////////////////
  function setShips(cords){
    //sets the ships object which has origins, lengths, and orientations
    //of ships for canvas drawing.
  }

  return BS;
}());

