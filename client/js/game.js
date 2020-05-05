var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
var socket = io();
var id;

var size = {
  width: window.innerWidth || document.body.clientWidth,
  height: window.innerHeight || document.body.clientHeight
}

var ratio = .7;
var map = [
  [0,0,0,0,0,1],
  [0,0,0,1,0,1],
  [0,0,0,1,0,1],
  [1,0,1,1,0,0],
  [1,0,0,0,0,0],
  [1,1,1,0,0,0],  
];

var player1img = document.getElementById("player1");
var wall1img = document.getElementById("wall1");
var floor1img = document.getElementById("floor1");

document.getElementById("player1").style.display = "none";
document.getElementById("wall1").style.display = "none";
document.getElementById("floor1").style.display = "none";


socket.on('newPositions', function(data){
  updateSize();
  canvas.width = size.width;
  canvas.height = size.height;
  ctx = canvas.getContext('2d');

  var lw = size.width/15;
  var rotation_degs = 45,
    rotation_rads = degs_to_rads(rotation_degs),
  angle_sine = Math.sin(rotation_rads),
  angle_cosine = Math.cos(rotation_rads);

  //ctx.drawImage(player1img, 0, 0, );

  for(var i=0;i<data.player.length;i++){
    //ctx.drawImage(player1img,data.player[i].x,data.player[i].y, size.width/40, size.width/12);
    ctx.drawImage(player1img,size.width/2-size.width/80,size.height/2-size.width/24, size.width/40, size.width/12);
    ctx.setTransform(angle_cosine, angle_sine, -angle_sine, angle_cosine, 0, 0);
    ctx.drawImage(player1img,size.width/2-size.width/80,size.height/2-size.width/24, size.width/40, size.width/12);

  }
});

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
