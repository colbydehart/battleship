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
    drawGrid($ships);
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
    $('<button>') .attr('id','fire') .text('FIRE')
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
        play();
      }
    });
    return false;
  }

  //PLAY
  function play(){
    //Set initial board settings
    if(!myTurn){
      myTurn = true;
      switchSides();
    }else{$ships.hide();}
    $('#fire').click(sendShot);
    fb.child('shots').on('child_added',function(snap){
      //if it is not my turn, process shot at snap.val()
      //then send message
    });
    fb.child('messages').on('child_added', function(snap){
      //if it is my turn, process whether I got a hit or not,
      //then delete messages and switch sides
    });
    fb.child('messages').on('child_removed', function(snap){
      //if it is not my turn, my message has been received, so 
      //switch sides
    })
  }

  function switchSides(){
    //My turn
    if(!myTurn){
      console.log("Now it's my turn!");
      $ships.hide();
      $('#fire').fadeIn(600);
      $playerGrid.css('background-color', '#036');
    }
    //Other Player's turn
    else{
      $ships.show();
      $('#fire').fadeOut(600);
      $playerGrid.css('background-color', '#403');
    }
  }

  function getShipLocs($ships) {
    var res = [];
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
    return false;
  }

  //DRAW functions
  function drawGrid($ships){
    for (var i = 0; i < 10; i++) {
      for (var j = 0; j < 10; j++) {
        playerCtx.strokeStyle = "#FFF";
        playerCtx.strokeRect(j*CZ, i*CZ, CZ, CZ);
      }
    }
    for (var i = 0; i < $ships.length; i++) {
      $ships.eq(i).css({
        top: '0',
        left: 5+CZ*i + 'px'
      });
    }
  }

})();
