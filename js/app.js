(function() {
  var CZ = BS.CZ, //Cell Size
  GZ = BS.GZ, //Grid Size
  $playerGrid = $('#playerGrid'),
  origin = [$playerGrid.offset().left,$playerGrid.offset().top],
  playerCtx = $playerGrid[0].getContext('2d'),
  $ships = $('.ship'),
  fb = new Firebase('https://battleship-1021.firebaseio.com/'),
  playerRef, 
  myTurn = true;

  $(function(){
    drawGrid();
    setStartShips($ships);
    fb.child('players').once('value', function(snap){
      var len = snap.val() ? Object.keys(snap.val()).length : 0;
      if(len){
        myTurn = false;
      }
      if(len > 1){
        $('body').html('<h1>Two players are already playing</h1>');
      }
      else{
        playerRef = fb.child('players').push(false);
      }
    });
    $ships.draggable({
      grid:[50,50],
      containment: '#playerGrid',
      revert: 'valid',
    });
    $ships.droppable({
      accept: '.ship',
      tolerance: 'touch'
    });
    $ships.dblclick(rotateShip);
    $('#battle').click(startGame);
  });

  function startGame(){
    if(!BS.createGrid(getShipLocs($ships))){
      alert('Ships may not overlap!');
      return false;
    }
    //Tell server that we are ready and remove battle button. 
    //Also disable ship moving
    playerRef.set(true);
    $('#battle').remove();
    $('<button>').attr('id','fire').text('FIRE')
      .appendTo('body');
    $ships.draggable('disable')
      .off('dblclick');

    //if other player is not ready, append waiting lightbox
    //to the dom
    fb.child('players').once('value', function(snap){
      $.each(snap.val(), function(key, val){
        if (!val){
          $('<h1>').text('Waiting for other player...')
            .attr('id', 'waiting').appendTo('body').fadeIn(400);
          return false;
        }
      });
    });
    //wait for other player
    fb.child('players').on('value', function(snap){
      var ready = true;
      $.each(snap.val(), function(key, val){
        if (!val && Object.keys(snap.val()).length===2) {ready =  false;}
      });
      if(ready){
        $('#waiting').fadeOut(400);
        console.log("players ready");
        fb.child('players').off('value');
        fb.child('players').set(null);
        play();
      }
    });
    return false;
  }

  //PLAY
  function play(){
    var selector=[];
    //Set initial board settings
    if(!myTurn){
      myTurn = true;
      switchSides();
    }else{$ships.hide();}
    $('canvas').click(setSelector);
    $('#fire').click(sendShot);
    fb.child('shots').on('child_added', shotsFired);
    fb.child('messages').on('child_added',messageReceived);
    fb.child('messages').on('child_removed', messageRemoved);
  }

  function win() {
    fb.set(null);
    fb = null;
    $('canvas').off('click');
    $('h1').text('YOU WIN!!!');
  }

  function lose() {
    fb = null;
    $('canvas').off('click');
    $('h1').text('YOU LOSE!!!');
  }

  function messageRemoved(snap){
    switchSides();
  }

  function messageReceived(snap){
    //if it is my turn, process whether I got a hit or not,
    //then delete messages and switch sides
    if (myTurn){
      var msg = snap.val(),
          hitOrMiss = msg.indexOf("Hit") !== -1 ? 'hit' : 'miss';
      BS.grid[selector[0]][selector[1]].guess = hitOrMiss;
      alertMessage(snap.val());
      //if i won, win.
      if(msg.indexOf('Win') !== -1){
        win();
      }
      fb.child('messages').set(null);
      fb.child('shots').set(null);
      selector = [];
    }
  }

  function alertMessage(msg) {
    var $message = $('<div>')
      .addClass('alert').text(msg);
    if(msg.indexOf("Hit") !== -1)
      {$message.addClass('hit');}
    $message.appendTo('body')
      .fadeIn(400, function(){
        setTimeout(function(){
          $message.fadeOut();
        }, 2000);
      });
  }

  function shotsFired(snap) {
    //if it is not my turn, process shot at snap.val()
    //then send message
    if(!myTurn){
      var coord = snap.val(),
          msg = BS.processShot(coord);
      //if there is a hit, put a peg on my ship
      if(msg.indexOf('Hit') !== -1){
        $('<div>').addClass('ship peg')
          .css({
            left: coord[0]*CZ+15 + 'px',
            top: coord[1]*CZ+15 + 'px' })
          .appendTo('.container');
      }
      fb.child('messages').push(msg);
      //if the other player has won, you lose.
      if(msg.indexOf('Win') !== -1){
        lose();
      }
      msg = msg
        .replace('You', 'They')
        .replace('my', 'your')
        .replace('Hit','They got a hit')
        .replace('Miss', 'They missed');

      alertMessage(msg);
    }
    
  }
  function sendShot(e){
    if(selector[0] !== undefined){
      fb.child('shots').push(selector);
      $('#fire').fadeOut();
      drawGrid();
    }
  }

  function setSelector(e) {
    //sets the selector of a shot and highlights it, 
    //if it is the players turn.
    if (myTurn) {
      drawGrid();
      var x = Math.floor(e.offsetX/CZ),
          y = Math.floor(e.offsetY/CZ);
      if(!BS.grid[x][y].guess){
        selector = [x,y];
        playerCtx.fillStyle = "#80D17B";
        playerCtx.fillRect(selector[0]*CZ, selector[1]*CZ, CZ, CZ);
      }
    }
  }


  function switchSides(){
    //My turn
    if(!myTurn){
      console.log("Now it's my turn!");
      $('.ship').hide();
      $('#fire').fadeIn(600);
      $playerGrid.css('background-color', '#036');
    }
    //Other Player's turn
    else{
      $('.ship').show();
      $('#fire').fadeOut(600);
      $playerGrid.css('background-color', '#403');
    }
    myTurn = !myTurn;
    drawGrid();
  }

  function getShipLocs($ships) {
    var res = [];
    BS.ships = [];
    for (var i = 0; i < 10; i++) {
      res[i] = [];
      for (var j = 0; j < 10; j++) {
        res[i][j] = 0;
      }
    }
    $ships.each(function(i, el){
      var shipOrigin = [$(el).offset().left, $(el).offset().top],
          height = Math.ceil(($(el).height())/CZ),
          width = Math.ceil(($(el).width())/CZ),
          x = Math.floor((shipOrigin[0] - origin[0])/50),
          y = Math.floor((shipOrigin[1] - origin[1])/50), 
          name = $(el).attr('id');
      if (res[x][y] !== 0){
        res = false;
        return false;
      }
      res[x][y] = name + ' origin';
      var down, right;
      down = right = 1;
      while(--height){
        if(res[x][y+down] !== 0){
          res = false;
          return false;
        }
        res[x][y+down] = name;
        down++;
      }
      while(--width){
        if(res[x+right][y] !== 0){
          res = false;
          return false;
        }
        res[x+right][y] = name;
        right++;
      }
    });
    return res;
  }

  function rotateShip(e){
    var $ship = $(e.target);
    if(flippable($ship)){
      $ship.toggleClass('flip');
      var top = +$ship.css('top').replace('px',''),
          left = +$ship.css('left').replace('px',''),
          flipped = $ship.hasClass('flip');
      $ship.css({
        top:flipped ? top+5 : top-5,
        left:flipped ? left-5 : left+5
      });
      if(left + $ship.width() > GZ){
        $ship.css({left: GZ - $ship.width() - 2.5 });
      }
      if(top + $ship.height() > GZ){
        $ship.css({top: GZ - $ship.height() - 2.5 });
      }
    }
    return false;
  }

  function flippable(ship) {
    //orientation, true = horizontal; false = vertical
    var top = +ship.css('top').replace('px',''),
        left = +ship.css('left').replace('px',''),
        right = left + ship.height(),
        bottom = top + ship.width(),
        ori = ship.width() > ship.height(),
        length = ori ? ship.width() : ship.height();
    if(right > GZ){
      right = GZ;
      left = GZ - ship.height();
    }
    if(bottom > GZ){
      bottom = GZ;
      top = GZ - ship.width();
    }
    $ships.each(function(i, el){
      var shipLeft = +$(this).css('left').replace('px',''),
          shipTop = +$(this).css('top').replace('px', ''),
          shipRight = shipLeft + $(this).width(),
          shipBottom = shipTop + $(this).height();
      if ((top > shipBottom || bottom < shipTop) && (left > shipRight || right < shipLeft)){
        return false;
      }
    });
    return true;
  }

  //DRAW functions
  function drawGrid(){
    playerCtx.clearRect(0,0,GZ,GZ);
    var color = '#FFF';
    for (var i = 0; i < 10; i++) {
      for (var j = 0; j < 10; j++) {
        playerCtx.strokeStyle = "#FFF";
        playerCtx.strokeRect(i*CZ, j*CZ, CZ, CZ);
        if(myTurn && BS.grid && BS.grid[i][j].guess){
          color = BS.grid[i][j].guess === 'hit' ?
            '#F01648' : '#BABABA';
          playerCtx.fillStyle = color;
          playerCtx.fillRect(i*CZ, j*CZ, CZ, CZ);
        }
      }
    }
  }

  function setStartShips($ships){
    for (var i = 0; i < $ships.length; i++) {
      $ships.eq(i).css({
        top: '0',
        left: 5+CZ*i + 'px'
      });
    }
    for (var i = 0; i < 10; i++) {
      $('<span>').addClass('cord')
        .text(''+i)
        .css({
          top: origin[1] - CZ,
          left: origin[0] + CZ*i
        })
        .appendTo('.container');
      $('<span>').addClass('cord')
        .html('&#' + (i+65) + ';')
        .css({
          top: origin[1] + CZ*i,
          left: origin[0] - CZ
        })
        .appendTo('.container');
    }
  }

})();
