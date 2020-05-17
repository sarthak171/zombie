var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
var socket = io();
var id;

var size = {
  width: window.innerWidth || document.body.clientWidth,
  height: window.innerHeight || document.body.clientHeight
}

var floor = [[
	[0,0,0,0,0,0],
	[0,1,0,0,0,0],
	[0,0,0,0,0,0],
	[0,0,0,0,0,0],
	[0,0,0,0,0,0],
	[0,0,0,0,0,0],  
  ]];

var walls = [[
  [[[2, 1], [2, 1]], [[0, 0], [2, 1]], [[1, 1], [0, 0]], [[0, 0], [2, 1]], [[0, 0], [2, 1]], [[0, 0], [2, 1]], [[1, 2], [0, 0]]],
  [[[2, 1], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[1, 2], [0, 0]]],
  [[[2, 1], [1, 1]], [[0, 0], [1, 1]], [[0, 0], [1, 1]], [[0, 0], [1, 1]], [[1, 1], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]]],
  [[[2, 1], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[1, 1], [0, 0]], [[0, 0], [1, 1]], [[1, 2], [0, 0]]],
  [[[2, 1], [1, 1]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[1, 1], [0, 0]], [[0, 0], [0, 0]], [[1, 2], [0, 0]]],
  [[[2, 1], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[1, 2], [0, 0]]],
  [[[0, 0], [1, 2]], [[0, 0], [1, 2]], [[0, 0], [1, 2]], [[0, 0], [0, 0]], [[0, 0], [1, 2]], [[0, 0], [1, 2]], [[0, 0], [0, 0]]]
]];

var wth = 0.25;

var player1img = document.getElementById("player1");
var wall1img = document.getElementById("wall1");
var wall2img = document.getElementById("wall2");
var floor1img = document.getElementById("floor1");

document.getElementById("player1").style.display = "none";
document.getElementById("wall1").style.display = "none";
document.getElementById("wall2").style.display = "none";
document.getElementById("floor1").style.display = "none";

var playerimgs = [player1img];
var floorimgs = [floor1img];
var wallimgs = [null, wall1img, wall2img];

socket.on('newPositions', function(data){
  data = JSON.parse(data);
  if(id == null) return;
  if(data.player[id]==null) return;

  updateSize();
  canvas.width = size.width;
  canvas.height = size.height;
  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, size.width, size.height);

  drawfloor(data);
  drawObj(data);
  for(var i in data.bullet){
    console.log(data.bullet.length)
    ctx.fillRect(data.bullet[i].x,data.bullet[i].y,10,10);
  }

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
      ctx.drawImage(floor1img, -xdif*lw, -ydif*lw, lw+2, lw+2);
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
    //[sx, sy, t1, t2, t3, t4, t5, t6, start%, end%, w, h, type, img]
    var dobj = objvals[objinds[i]];
    ctx.setTransform(dobj[2], dobj[3], dobj[4], dobj[5], dobj[6], dobj[7]);    
    var dimg;
    var isImg = true;
    
    switch(dobj[12]) {
      case 'p': dimg = playerimgs[dobj[13]];
        break;
      case 'w': dimg = wallimgs[dobj[13]];
        break;
      default: isImg = false;
        break;
    }

    if(isImg) {
      ctx.drawImage(
        dimg, 
        dobj[8]*dimg.width, 0, (dobj[9]-dobj[8])*dimg.width, dimg.height, 
        -dobj[10]/2, -dobj[11]/2, dobj[10]+1, dobj[11]+1
      );
    } else {
      ctx.fillStyle = "black";
      ctx.fillRect(-dobj[10]/2, -dobj[11]/2, dobj[10]+1, dobj[11]+1)
    }
  }
}

function getWalls(data) {
  var wallvals = [];
  var locplayer = data.player[id];

  //console.log(locplayer.x + ", " + locplayer.y);

  var locwalls = walls[locplayer.mapId];
  var lw = size.width/15;

  var wlind1 = (locplayer.angle>180) ? 0 : 1;
  var wlind2 = (locplayer.angle>90 && locplayer.angle<270) ? 0 : 1;
  var modloc = (locplayer.angle%180)/90;
  
  var shift1 = (1-2*wlind1);
  var shift2 = (1-2*wlind2);

  var radian1 = (locplayer.angle+90.001) / 180 * Math.PI;
  var sin1 = Math.sin(radian1);
  var cos1 = Math.cos(radian1);

  var radian2 = (locplayer.angle+.001) / 180 * Math.PI;
  var sin2 = Math.sin(radian2);
  var cos2 = Math.cos(radian2);

  var dx, dy, xs, ys, tr, trd, per;
  for(var i=0; i<locwalls.length; i++) {
    for(var j=0; j<locwalls[i].length; j++) {
      
      //vert
      if(locwalls[i][j][0][0]!=0) {
        dx = j-locplayer.x;
        dy = i+.5-locplayer.y;
        var ys = [-0.5, 0.5];
        tr = getTransition(dx, dy, locplayer.angle, locplayer.alt, lw);
        
        if(locwalls[i][j+wlind1-1]!=null && locwalls[i][j+wlind1-1][1][0]!=0) ys[0]+=wth/2;
        //else if(locwalls[i][j-wlind1]!=null && locwalls[i][j-wlind1][1][0]!=0) ys[0]-=wth/2;
        else if(locwalls[i-1]==null || locwalls[i-1][j][0][0]==0) ys[0]-=wth/2;
        
        if(locwalls[i+1]!=null && locwalls[i+1][j+wlind1-1]!=null && locwalls[i+1][j+wlind1-1][1][0]!=0) ys[1]-=wth/2;
        //else if(locwalls[i+1]!=null && locwalls[i+1][j-wlind1]!=null && locwalls[i+1][j-wlind1][1][0]!=0) ys[1]+=wth/2;
        else if(locwalls[i+1]==null || locwalls[i+1][j][0][0]==0) ys[1]+=wth/2;

        per = [Math.max(0, ys[0]+0.5), Math.min(1, ys[1]+0.5)];
        trd = getTransition(dx-shift1*wth/2, (2*(dy-0.5)+per[0]+per[1])/2, locplayer.angle, locplayer.alt, lw);
        
        wallvals.push([
          tr[0], tr[1],
          cos1, sin1*(1-locplayer.alt), 0, locplayer.alt, trd[0], trd[1]-locplayer.alt*lw,
          per[0], per[1], lw*(per[1]-per[0]), lw*2, 'w', locwalls[i][j][0][wlind1]
        ]);

        if(ys[0]<-0.5) {
          per = [1+(ys[0]+0.5), 1];
          trd = getTransition(dx-shift1*wth/2, (2*dy-0.5+ys[0])/2, locplayer.angle, locplayer.alt, lw);
          wallvals.push([
            tr[0], tr[1],
            cos1, sin1*(1-locplayer.alt), 0, locplayer.alt, trd[0], trd[1]-locplayer.alt*lw,
            per[0], per[1], lw*(-0.5-ys[0]), lw*2, 'w', locwalls[i][j][0][wlind1]
          ]);
        }

        if(ys[1]>0.5) {
          per = [0, ys[1]-0.5];
          trd = getTransition(dx-shift1*wth/2, (2*dy+0.5+ys[1])/2, locplayer.angle, locplayer.alt, lw);
          wallvals.push([
            tr[0], tr[1],
            cos1, sin1*(1-locplayer.alt), 0, locplayer.alt, trd[0], trd[1]-locplayer.alt*lw,
            per[0], per[1], lw*(ys[1]-0.5), lw*2, 'w', locwalls[i][j][0][wlind1]
          ]);
        }

        var ystop = [dy-0.5-Math.abs(-0.5-ys[0]), dy+0.5+Math.abs(0.5-ys[1])];

        trd = getTransition(dx, (ystop[1]+ystop[0])/2, locplayer.angle, locplayer.alt, lw);
        wallvals.push([
          tr[0], tr[1],
          cos1, sin1*(1-locplayer.alt), -sin1, cos1 * (1-locplayer.alt), trd[0], trd[1]-(locplayer.alt)*lw*2,
          null, null, lw*(ystop[1]-ystop[0]), wth*lw, 'wtop', null
        ]);

        //if(ys[wlind2]==dy+0.5 || ys[wlind2]==dy-0.5) {
        if(ys[wlind2]>0.5 || ys[wlind2]<-0.5) {
          //if(locwalls[i+2*wlind2-1]==null || locwalls[i+2*wlind2-1][j][0][0]==0) {
          if(locwalls[i+wlind2]==null || locwalls[i+wlind2][j-wlind1]==null || locwalls[i+wlind2][j-wlind1][1][0]==0) {
            trd = getTransition(dx, dy+ys[wlind2], locplayer.angle, locplayer.alt, lw);
            wallvals.push([
              tr[0], tr[1],
              cos2, sin2*(1-locplayer.alt), 0, locplayer.alt, trd[0], trd[1]-locplayer.alt*lw, 
              0, wth, lw*wth, lw*2, 'w', locwalls[i][j][0][0]
            ]);
          }
        }
      }
      
      //horz
      if(locwalls[i][j][1][0]!=0) {
        dx = j+0.5-locplayer.x;
        dy = i-locplayer.y;
        xs = [-0.5, 0.5];
        tr = getTransition(dx, dy, locplayer.angle, locplayer.alt, lw);

        if(locwalls[i+wlind2-1]!=null && locwalls[i+wlind2-1][j][0][0]!=0) xs[0]+=wth/2;
        //else if(locwalls[i-wlind2]!=null && locwalls[i-wlind2][j][0][0]!=0) xs[0]-=wth/2;
        else if(locwalls[i][j-1]==null || locwalls[i][j-1][1][0]==0) xs[0]-=wth/2;
        
        if(locwalls[i+wlind2-1]!=null && locwalls[i+wlind2-1][j+1]!=null && locwalls[i+wlind2-1][j+1][0][0]!=0) xs[1]-=wth/2;
        //else if(locwalls[i-wlind2]!=null && locwalls[i-wlind2][j+1]!=null && locwalls[i-wlind2][j+1][0][0]!=0) xs[1]+=wth/2;
        else if(locwalls[i][j+1]==null || locwalls[i][j+1][1][0]==0) xs[1]+=wth/2;

        per = [Math.max(0, xs[0]+0.5), Math.min(1, xs[1]+0.5)];
        trd = getTransition((2*(dx-0.5)+per[0]+per[1])/2, dy-shift2*wth/2, locplayer.angle, locplayer.alt, lw);

        wallvals.push([
          tr[0], tr[1],
          cos2, sin2*(1-locplayer.alt), 0, locplayer.alt, trd[0], trd[1]-locplayer.alt*lw, 
          per[0], per[1], lw*(per[1]-per[0]), lw*2, 'w', locwalls[i][j][1][wlind2]
        ]);

        if(xs[0]<-0.5) {
          per = [1+(xs[0]+0.5), 1];
          trd = getTransition((2*dx-0.5+xs[0])/2, dy-shift2*wth/2, locplayer.angle, locplayer.alt, lw);
          wallvals.push([
            tr[0], tr[1],
            cos2, sin2*(1-locplayer.alt), 0, locplayer.alt, trd[0], trd[1]-locplayer.alt*lw, 
            per[0], per[1], lw*(-0.5-xs[0]), lw*2, 'w', locwalls[i][j][1][wlind2]
          ]);
        }

        if(xs[1]>0.5) {
          per = [0, xs[1]-0.5];
          trd = getTransition((2*dx+0.5+xs[1])/2, dy-shift2*wth/2, locplayer.angle, locplayer.alt, lw);
          wallvals.push([
            tr[0], tr[1],
            cos2, sin2*(1-locplayer.alt), 0, locplayer.alt, trd[0], trd[1]-locplayer.alt*lw, 
            per[0], per[1], lw*(xs[1]-0.5), lw*2, 'w', locwalls[i][j][1][wlind2]
          ]);
        }

        trd = getTransition((2*dx+xs[1]+xs[0])/2, dy, locplayer.angle, locplayer.alt, lw);
        wallvals.push([
          tr[0], tr[1],
          cos1, sin1*(1-locplayer.alt), -sin1, cos1 * (1-locplayer.alt), trd[0], trd[1]-(locplayer.alt)*lw*2,
          null, null, wth*lw, lw*(xs[1]-xs[0]), 'wtop', null
        ]);

        //if(xs[wlind1]==dx+0.5 || xs[wlind1]==dx-0.5) {
        if(xs[wlind1]>0.5 || xs[wlind1]<-0.5) {
          //if(locwalls[i][j+2*wlind1-1]==null || locwalls[i][j+2*wlind1-1][1][0]==0) {
          if(locwalls[i-wlind2]==null || locwalls[i-wlind2][j+wlind1]==null || locwalls[i-wlind2][j+wlind1][0][0]==0) {
            trd = getTransition(dx+xs[wlind1], dy, locplayer.angle, locplayer.alt, lw);
            wallvals.push([
              tr[0], tr[1],
              cos1, sin1*(1-locplayer.alt), 0, locplayer.alt, trd[0], trd[1]-locplayer.alt*lw,
              0, wth, lw*wth, lw*2, 'w', locwalls[i][j][1][0]
            ]);
          }
        }
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
  var dx, dy, tr, trd;
  var tplayer;
  var lw = size.width/15;
  for(var i in data.player) {
    //add player
    tplayer = data.player[i];
    dx = tplayer.x-locplayer.x;
    dy = tplayer.y-locplayer.y;
    tr = getTransition((tplayer.x | 0)+0.5-locplayer.x, (tplayer.y | 0)+0.5-locplayer.y, locplayer.angle, locplayer.alt, lw);
    trd = getTransition(dx, dy, locplayer.angle, locplayer.alt, lw);

    pllocs.push([
      tr[0], tr[1], 
      1, 0, 0, 1, trd[0], trd[1]-lw*.5, 
      0, 1, lw*0.3, lw, 'p', 0
    ]);
  }
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
  socket.emit('keyPress',{
    inputID:'fire',
    state:true
  });
}

document.onmouseup = function(event) {
  socket.emit('keyPress',{
    inputID:'fire',
    state:false
  });
}

document.onmousemove = function(event){
  socket.emit('keyPress',{
    inputID:'ang',
    state:Math.atan2((event.clientY-size.height/2),(event.clientX-size.width/2))/ Math.PI * 180
  });
}