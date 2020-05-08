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
  [[[1, 1], [1, 1]], [[0, 0], [1, 1]], [[0, 0], [1, 1]], [[0, 0], [1, 1]], [[0, 0], [1, 1]], [[0, 0], [1, 1]], [[1, 1], [0, 0]]],
  [[[1, 1], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[1, 1], [0, 0]]],
  [[[1, 1], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[1, 1], [0, 0]]],
  [[[1, 1], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[1, 1], [0, 0]]],
  [[[1, 1], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[1, 1], [0, 0]]],
  [[[1, 1], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[1, 1], [0, 0]]],
  [[[0, 0], [1, 1]], [[0, 0], [1, 1]], [[0, 0], [1, 1]], [[0, 0], [1, 1]], [[0, 0], [1, 1]], [[0, 0], [1, 1]], [[0, 0], [0, 0]]]
]];

var player1img = document.getElementById("player1");
var wall1img = document.getElementById("wall1");
var floor1img = document.getElementById("floor1");

document.getElementById("player1").style.display = "none";
document.getElementById("wall1").style.display = "none";
document.getElementById("floor1").style.display = "none";


socket.on('newPositions', function(data){
  if(id == null) return;
  if(data.player[id]==null) return;

  updateSize();
  canvas.width = size.width;
  canvas.height = size.height;
  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  drawfloor(data);
  //drawWalls(data);
  
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(player1img,size.width/2-size.width/80,size.height/2-size.width/12, size.width/40, size.width/12);
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

function drawWalls(data) {
  var locplayer = data.player[id];
  var locwalls = walls[locplayer.mapId];

  for(var i=0; i<locwalls.length; i++) {
    for(var j=0; j<locwalls[i].length; j++) {
      var wlind;
      if(locwalls[i][j][0][0]!=0) {
        if(locplayer.angle>180) wlind = 0;
        else wlind = 1;
        //draw
      }
      if(locwalls[i][j][1][0]!=0) {
        if(locplayer.angle>90 && locplayer.angle<270) wlind = 0;
        else wlind = 1;
        //draw
      }
    }
  }
  /*var locplayer = data.player[id];
  var locmap = map[locplayer.mapId];

  var lw = size.width/15;
  var lh = 2*lw;
  
  var radian = (360-locplayer.angle) / 180 * Math.PI;
  var xdif = locplayer.x-5;
  var ydif = locplayer.y-0;
  var phase = (360-Math.atan(ydif/xdif)) / 180 * Math.PI;;
  
  var sin = Math.sin(radian);
  var cos = Math.cos(radian);
  ctx.setTransform(
    cos, 
    sin*(1-locplayer.alt), 
    0, 
    cos * locplayer.alt,
    (size.width/2)+50*Math.sqrt(xdif**2+ydif**2)*Math.cos(radian+phase),
    (size.height/2)+50*Math.sqrt(xdif**2+ydif**2)*Math.sin(radian+phase)
  );  
  
  ctx.drawImage(wall1img, -lw/2, -lh/2, lw, lh);*/
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
