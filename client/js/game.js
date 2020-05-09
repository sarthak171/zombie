var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
var socket = io();
var id;

var size = {
  width: window.innerWidth || document.body.clientWidth,
  height: window.innerHeight || document.body.clientHeight
}

var ratio = .7;

var floor = [[
	[0,0,0,0,0,0],
	[0,1,0,0,0,0],
	[0,0,0,0,0,0],
	[0,0,0,0,0,0],
	[0,0,0,0,0,0],
	[0,0,0,0,0,0],  
  ]];

var walls = [[
  [[[2, 1], [2, 1]], [[0, 0], [2, 1]], [[0, 0], [2, 1]], [[0, 0], [2, 1]], [[0, 0], [2, 1]], [[0, 0], [2, 1]], [[1, 2], [0, 0]]],
  [[[2, 1], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[1, 2], [0, 0]]],
  [[[2, 1], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[1, 2], [0, 0]]],
  [[[2, 1], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[1, 2], [0, 0]]],
  [[[2, 1], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[1, 2], [0, 0]]],
  [[[2, 1], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[1, 2], [0, 0]]],
  [[[0, 0], [1, 2]], [[0, 0], [1, 2]], [[0, 0], [1, 2]], [[0, 0], [1, 2]], [[0, 0], [1, 2]], [[0, 0], [1, 2]], [[0, 0], [0, 0]]]
]];

var player1img = document.getElementById("player1");
var wall1img = document.getElementById("wall1");
var floor1img = document.getElementById("floor1");

document.getElementById("player1").style.display = "none";
document.getElementById("wall1").style.display = "none";
document.getElementById("floor1").style.display = "none";

var playerimgs = [player1img];
var floorimgs = [floor1img];
var wallimgs = [null, wall1img];



socket.on('newPositions', function(data){
  if(id == null) return;
  if(data.player[id]==null) return;

  updateSize();
  canvas.width = size.width;
  canvas.height = size.height;
  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  drawfloor(data);
  drawObj(data);
  
  //ctx.setTransform(1, 0, 0, 1, 0, 0);
  //ctx.drawImage(playerimgs[data.player[id].imgId],size.width/2-size.width/80,size.height/2-size.width/12, size.width/40, size.width/12);
});

function drawfloor(data) {
  var locplayer = data.player[id];
  var locfloor = floor[locplayer.mapId];

  var lw = size.width/15;
  var radian = (locplayer.angle) / 180 * Math.PI;
  var sin = Math.sin(radian);
  var cos = Math.cos(radian);

  ctx.setTransform(
    cos, 
    sin*(1-locplayer.alt), 
    -sin, 
    cos * (1-locplayer.alt),
    size.width/2,
    size.height/2,
  );

  for(var i=0; i<locfloor.length; i++) {
    for(var j=0; j<locfloor[i].length; j++) {
      if(locfloor[i][j]!=0) continue;
      var xdif = locplayer.x-j;
      var ydif = locplayer.y-i;
      ctx.drawImage(floor1img, -xdif*lw, -ydif*lw, lw+2, lw+1);
    }
  }
}

function drawObj(data) {
  var objvals = [];
  Array.prototype.push.apply(objvals, getWalls(data));
  //Array.prototype.push.apply(objvals, getObjects(data));
  Array.prototype.push.apply(objvals, getPlayers(data));

  var objinds = [];
  for(var i=0; i<objvals.length; i++) {
    objinds.push(i);
  }

  objinds.sort(function(a, b){return objvals[a][1] - objvals[b][1]});

  for(var i=0; i<objinds.length; i++) {
    //[sx, sy, t1, t2, t3, t4, t5, t6, w, h, type, img]
    var dobj = objvals[objinds[i]];
    
    ctx.setTransform(
      dobj[2], 
      dobj[3], 
      dobj[4], 
      dobj[5], 
      dobj[6], 
      dobj[7], 
    );
    
    var dimg;
    var isImg = true;
    
    switch(dobj[10]) {
      case 'p': dimg = playerimgs[dobj[11]];
        break;
      case 'w': dimg = wallimgs[dobj[11]];
        break;
      default: isImg = false;
        break;
    }

    if(isImg) {
      ctx.drawImage(dimg, -dobj[8]/2, -dobj[9]/2, dobj[8]+2, dobj[9]+2);
    } else {
      ctx.fillStyle = "black";
      ctx.fillRect(-dobj[8]/2, -dobj[9]/2, dobj[8]+2, dobj[9]+2)
    }
  }
}

function getWalls(data) {
  var wallvals = [];
  var locplayer = data.player[id];
  var locwalls = walls[locplayer.mapId];
  var lw = size.width/15;

  var wlind;
  var dx, dy, tr;
  var radianl, sinl, cosl;
  for(var i=0; i<locwalls.length; i++) {
    for(var j=0; j<locwalls[i].length; j++) {
      //vert
      if(locwalls[i][j][0][0]!=0) {
        if(locplayer.angle>180) wlind = 0;
        else wlind = 1;

        dx = j-locplayer.x;
				dy = i+.5-locplayer.y;
        tr = getTransition(dx, dy, locplayer.angle, locplayer.alt, lw);
        
        radianl = (locplayer.angle+90) / 180 * Math.PI;
        sinl = Math.sin(radianl);
        cosl = Math.cos(radianl);

        wallvals.push([
          tr[0], tr[1],
          cosl, 
          sinl*(1-locplayer.alt), 
          0, 
          locplayer.alt,
          tr[0],
          tr[1]-locplayer.alt*lw,
          lw, lw*2, 
          'w', 1
        ]);
      }
      
      //add horz wall
      if(locwalls[i][j][1][0]!=0) {
        if(locplayer.angle>90 && locplayer.angle<270) wlind = 0;
        else wlind = 1;
        
        dx = j+0.5-locplayer.x;
        dy = i-locplayer.y;
        tr = getTransition(dx, dy, locplayer.angle, locplayer.alt, lw);
        
        radianl = (locplayer.angle) / 180 * Math.PI;
        sinl = Math.sin(radianl);
        cosl = Math.cos(radianl);

        wallvals.push([
          tr[0], tr[1],
          cosl, 
          sinl*(1-locplayer.alt), 
          0, 
          locplayer.alt,
          tr[0],
          tr[1]-locplayer.alt*lw,
          lw, lw*2, 
          'w', 1
        ]);
      }
    }
  }
  return wallvals;
}

function getObjects(data) {
  return [];
}

function getPlayers(data) {
  var locplayer = data.player[id];
  var pllocs = [];
  var dx, dy, tr;
  var tplayer;
  var lw = size.width/15;
  for(var i in data.player) {
    //add player
    tplayer = data.player[i];
    dx = tplayer.x-locplayer.x;
    dy = tplayer.y-locplayer.y;
    tr = getTransition(dx, dy, locplayer.angle, locplayer.alt, lw);

    pllocs.push([
      tr[0], tr[1], 
      1, 0, 0, 1, tr[0]-lw*0.15, tr[1]-lw*.5, 
      lw*0.3, lw,
      'p', 0
    ]);
  }
  /*pllocs.push([size.width/2, size.height/2, 
    1, 0, 0, 1, size.width/2-size.width/80,size.height/2-size.width/24, 
    size.width/40, size.width/12, 
    'p', 0
  ]);*/
  return pllocs;
}

function getTransition(dx, dy, angle, alt, lw) {
  var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy,  2));
	var tang = (Math.atan2(dy, dx)+angle*Math.PI/180)%(2*Math.PI);
	var xc = size.width/2+Math.cos(tang)*dist*lw;
  var yc = size.height/2+Math.sin(tang)*dist*lw*(1-alt);
  return [xc, yc];
}

function degs_to_rads (degs) { return degs / (180/Math.PI); }
function rads_to_degs (rads) { return rads * (180/Math.PI); }

function updateSize() {
  size = {
    width: window.innerWidth || document.body.clientWidth,
    height: window.innerHeight || document.body.clientHeight
  }
}

socket.on('initial', function(data) {
  id = data[0];
});

document.onkeydown = function(event){
  if(event.keyCode === 68)
    socket.emit('keyPress', {inputID:'r',state:true});
  if(event.keyCode === 83)
    socket.emit('keyPress', {inputID:'d',state:true});
  if(event.keyCode === 65)
    socket.emit('keyPress', {inputID:'l',state:true});
  if(event.keyCode === 87)
    socket.emit('keyPress', {inputID:'u',state:true});
  if(event.keyCode === 81)
    socket.emit('keyPress', {inputID:'rl',state:true});
  if(event.keyCode === 69)
    socket.emit('keyPress', {inputID:'rr',state:true});
  if(event.keyCode === 38)
    socket.emit('keyPress', {inputID:'au',state:true});
  if(event.keyCode === 40)
    socket.emit('keyPress', {inputID:'ad',state:true});
}
document.onkeyup = function(event){
  if(event.keyCode === 68)
    socket.emit('keyPress', {inputID:'r',state:false});
  if(event.keyCode === 83)
    socket.emit('keyPress', {inputID:'d',state:false});
  if(event.keyCode === 65)
    socket.emit('keyPress', {inputID:'l',state:false});
  if(event.keyCode === 87)
    socket.emit('keyPress', {inputID:'u',state:false});
  if(event.keyCode === 81)
    socket.emit('keyPress', {inputID:'rl',state:false});
  if(event.keyCode === 69)
    socket.emit('keyPress', {inputID:'rr',state:false});
  if(event.keyCode === 38)
    socket.emit('keyPress', {inputID:'au',state:false});
  if(event.keyCode === 40)
    socket.emit('keyPress', {inputID:'ad',state:false});
}

document.onmousedown = function(event){
  socket.emit('mouse',{
    mouseDown:true,
    x:(event.clientX-size.width/2),
    y:(event.clientY-size.height/2),
  });
}

document.onmouseup = function(event) {
  socket.emit('mouse',{
    mouseDown:false,
    x:(event.clientX-size.width/2),
    y:(event.clientY-size.height/2),
  });
}

function multiplyPoint(px, py, mat) {
  return {
    x: px * mat[0][0] + py * mat[0][1] + mat[0][2],
    y: px * mat[1][0] + py * mat[1][1] + mat[1][2]
  }
}