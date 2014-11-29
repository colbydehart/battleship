describe('Tests', function(){
  it('Should work', function(){
    BS.CZ.should.equal(50);
  });
});

describe('processShot', function(){
  BS.grid = [
    [1,1,1,1,1,0,0,0,0,0],
    [1,1,1,1,0,0,0,0,0,0],
    [1,1,1,0,0,0,0,0,0,0],
    [1,1,1,0,0,0,0,0,0,0],
    [1,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0]
  ];
  it('should have coords right', function(){
    BS.grid[0][4].should.equal(1);
  });
  it('should display a hit', function(){
    BS.processShot([0,4]).should.equal("Hit!");
  });
  it('should display a miss', function(){
    BS.processShot([0,5]).should.equal("Miss!");
  });
});
