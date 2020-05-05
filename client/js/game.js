var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
var socket = io();


socket.on('newPositions', function(data){
  ctx.clearRect(0,0,500,500);
  console.log(data)
  for(var i=0;i<data.player.length;i++){
    var img = document.getElementById("player")
    ctx.drawImage(img,data.player[i].x,data.player[i].y);
  }
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
