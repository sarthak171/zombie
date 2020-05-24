
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
var socket = io();
var id, gldata, locplayer, lw;

var size = {
  width: window.innerWidth || document.body.clientWidth,
  height: window.innerHeight || document.body.clientHeight
}

var mousePos = {
  x: 0,
  y: 0
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

var player1sideimg = document.getElementById("player1side");
var player1sidemove1img = document.getElementById("player1sidemove1");
var player1sidemove2img = document.getElementById("player1sidemove2");
var player1backimg = document.getElementById("player1back");
var player1backmove1img = document.getElementById("player1backmove1");
var player1backmove2img = document.getElementById("player1backmove2");
var player1frontimg = document.getElementById("player1front");
var player1frontmove1img = document.getElementById("player1frontmove1");
var player1frontmove2img = document.getElementById("player1frontmove2");

var wall1img = document.getElementById("wall1");
var wall2img = document.getElementById("wall2");
var floor1img = document.getElementById("floor1");
var uzisideimg = document.getElementById("uziside");
var uzitopimg = document.getElementById("uzitop");
var backmediumimg = document.getElementById("backmedium");
var frontmediumimg = document.getElementById("frontmedium");
var forwardmediumimg = document.getElementById("forwardmedium");
var backwardmediumimg = document.getElementById("backwardmedium");

var zombie1img = document.getElementById("zombie1");

document.getElementById("player1side").style.display = "none";
document.getElementById("player1sidemove1").style.display = "none";
document.getElementById("player1sidemove2").style.display = "none";
document.getElementById("player1back").style.display = "none";
document.getElementById("player1backmove1").style.display = "none";
document.getElementById("player1backmove2").style.display = "none";
document.getElementById("player1front").style.display = "none";
document.getElementById("player1frontmove1").style.display = "none";
document.getElementById("player1frontmove2").style.display = "none";
document.getElementById("wall1").style.display = "none";
document.getElementById("wall2").style.display = "none";
document.getElementById("floor1").style.display = "none";
document.getElementById("uziside").style.display = "none";
document.getElementById("uzitop").style.display = "none";
document.getElementById("backmedium").style.display = "none";
document.getElementById("frontmedium").style.display = "none";
document.getElementById("forwardmedium").style.display = "none";
document.getElementById("backwardmedium").style.display = "none";
document.getElementById("zombie1").style.display = "none";

var playerimgs = [player1sideimg, player1backimg, player1frontimg, 
                  player1sidemove1img, player1backmove1img, player1frontmove1img, 
                  player1sidemove2img, player1backmove2img , player1frontmove2img];

var gunimgs = [uzisideimg, uzitopimg];
var floorimgs = [floor1img];
var wallimgs = [null, wall1img, wall2img];
var handimgs = [backmediumimg,frontmediumimg, backwardmediumimg, forwardmediumimg];
var zombieimgs = [zombie1img];

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

  gldata = data;
  locplayer = data.player[id];
  lw = size.width/10;

  socket.emit('keyPress',{
    inputID:'ang',
    state: (Math.atan2((mousePos.y-size.height/2+0.6*lw)/(1-locplayer.alt), (mousePos.x-size.width/2))/ Math.PI * 180-locplayer.angle+720) % 360
  });

  drawfloor(data);
  drawObj(data);
});


function drawfloor(data) {
  var locfloor = floor[locplayer.mapId];

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
  Array.prototype.push.apply(objvals, getObjects(data));
  Array.prototype.push.apply(objvals, getPlayers(data));
  Array.prototype.push.apply(objvals, getZombies(data));

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
    
    var clr = false;
    switch(dobj[12]) {
      case 'p': dimg = playerimgs[dobj[13]];
        break;
      case 'g': dimg = gunimgs[dobj[13]];
		    break;
      case 'h': dimg = handimgs[dobj[13]];
		    break;
      case 'w': dimg = wallimgs[dobj[13]];
        break;
      case 'z': dimg = zombieimgs[dobj[13]];
      break;
      default: isImg = false;
        break;
    }

    if(clr) ctx.globalAlpha = 0.25;
    else ctx.globalAlpha = 1;

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

  var locwalls = walls[locplayer.mapId];

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

  var wallh = 1.5;

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
          //cos1, sin1*(1-locplayer.alt), 0, locplayer.alt, trd[0], trd[1]-locplayer.alt*lw*wallh/2,
          cos1, sin1*(1-locplayer.alt), 0, 1, trd[0], trd[1]-lw*wallh/2,
          per[0], per[1], lw*(per[1]-per[0]), lw*wallh, 'w', locwalls[i][j][0][wlind1]
        ]);

        if(ys[0]<-0.5) {
          per = [1+(ys[0]+0.5), 1];
          trd = getTransition(dx-shift1*wth/2, (2*dy-0.5+ys[0])/2, locplayer.angle, locplayer.alt, lw);
          wallvals.push([
            tr[0], tr[1],
            //cos1, sin1*(1-locplayer.alt), 0, locplayer.alt, trd[0], trd[1]-locplayer.alt*lw*wallh/2,
            cos1, sin1*(1-locplayer.alt), 0, 1, trd[0], trd[1]-lw*wallh/2,
            per[0], per[1], lw*(-0.5-ys[0]), lw*wallh, 'w', locwalls[i][j][0][wlind1]
          ]);
        }

        if(ys[1]>0.5) {
          per = [0, ys[1]-0.5];
          trd = getTransition(dx-shift1*wth/2, (2*dy+0.5+ys[1])/2, locplayer.angle, locplayer.alt, lw);
          wallvals.push([
            tr[0], tr[1],
            //cos1, sin1*(1-locplayer.alt), 0, locplayer.alt, trd[0], trd[1]-locplayer.alt*lw*wallh/2,
            cos1, sin1*(1-locplayer.alt), 0, 1, trd[0], trd[1]-lw*wallh/2,
            per[0], per[1], lw*(ys[1]-0.5), lw*wallh, 'w', locwalls[i][j][0][wlind1]
          ]);
        }

        var ystop = [dy-0.5-Math.abs(-0.5-ys[0]), dy+0.5+Math.abs(0.5-ys[1])];

        trd = getTransition(dx, (ystop[1]+ystop[0])/2, locplayer.angle, locplayer.alt, lw);
        wallvals.push([
          tr[0], tr[1],
          //cos1, sin1*(1-locplayer.alt), -sin1, cos1 * (1-locplayer.alt), trd[0], trd[1]-(locplayer.alt)*lw*wallh,
          cos1, sin1*(1-locplayer.alt), -sin1, cos1 * (1-locplayer.alt), trd[0], trd[1]-lw*wallh,
          null, null, lw*(ystop[1]-ystop[0]), wth*lw, 'wtop', null
        ]);

        //if(ys[wlind2]==dy+0.5 || ys[wlind2]==dy-0.5) {
        if(ys[wlind2]>0.5 || ys[wlind2]<-0.5) {
          //if(locwalls[i+2*wlind2-1]==null || locwalls[i+2*wlind2-1][j][0][0]==0) {
          if(locwalls[i+wlind2]==null || locwalls[i+wlind2][j-wlind1]==null || locwalls[i+wlind2][j-wlind1][1][0]==0) {
            trd = getTransition(dx, dy+ys[wlind2], locplayer.angle, locplayer.alt, lw);
            wallvals.push([
              tr[0], tr[1],
              //cos2, sin2*(1-locplayer.alt), 0, locplayer.alt, trd[0], trd[1]-locplayer.alt*lw*wallh/2, 
              cos2, sin2*(1-locplayer.alt), 0, 1, trd[0], trd[1]-lw*wallh/2, 
              0, wth, lw*wth, lw*wallh, 'w', locwalls[i][j][0][0]
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
          //cos2, sin2*(1-locplayer.alt), 0, locplayer.alt, trd[0], trd[1]-locplayer.alt*lw*wallh/2, 
          cos2, sin2*(1-locplayer.alt), 0, 1, trd[0], trd[1]-lw*wallh/2, 
          per[0], per[1], lw*(per[1]-per[0]), lw*wallh, 'w', locwalls[i][j][1][wlind2]
        ]);

        if(xs[0]<-0.5) {
          per = [1+(xs[0]+0.5), 1];
          trd = getTransition((2*dx-0.5+xs[0])/2, dy-shift2*wth/2, locplayer.angle, locplayer.alt, lw);
          wallvals.push([
            tr[0], tr[1],
            //cos2, sin2*(1-locplayer.alt), 0, locplayer.alt, trd[0], trd[1]-locplayer.alt*lw*wallh/2, 
            cos2, sin2*(1-locplayer.alt), 0, 1, trd[0], trd[1]-lw*wallh/2, 
            per[0], per[1], lw*(-0.5-xs[0]), lw*wallh, 'w', locwalls[i][j][1][wlind2]
          ]);
        }

        if(xs[1]>0.5) {
          per = [0, xs[1]-0.5];
          trd = getTransition((2*dx+0.5+xs[1])/2, dy-shift2*wth/2, locplayer.angle, locplayer.alt, lw);
          wallvals.push([
            tr[0], tr[1],
            //cos2, sin2*(1-locplayer.alt), 0, locplayer.alt, trd[0], trd[1]-locplayer.alt*lw*wallh/2, 
            cos2, sin2*(1-locplayer.alt), 0, 1, trd[0], trd[1]-lw*wallh/2, 
            per[0], per[1], lw*(xs[1]-0.5), lw*wallh, 'w', locwalls[i][j][1][wlind2]
          ]);
        }

        trd = getTransition((2*dx+xs[1]+xs[0])/2, dy, locplayer.angle, locplayer.alt, lw);
        wallvals.push([
          tr[0], tr[1],
          //cos1, sin1*(1-locplayer.alt), -sin1, cos1 * (1-locplayer.alt), trd[0], trd[1]-(locplayer.alt)*lw*wallh,
          cos1, sin1*(1-locplayer.alt), -sin1, cos1 * (1-locplayer.alt), trd[0], trd[1]-lw*wallh,
          null, null, wth*lw, lw*(xs[1]-xs[0]), 'wtop', null
        ]);

        //if(xs[wlind1]==dx+0.5 || xs[wlind1]==dx-0.5) {
        if(xs[wlind1]>0.5 || xs[wlind1]<-0.5) {
          //if(locwalls[i][j+2*wlind1-1]==null || locwalls[i][j+2*wlind1-1][1][0]==0) {
          if(locwalls[i-wlind2]==null || locwalls[i-wlind2][j+wlind1]==null || locwalls[i-wlind2][j+wlind1][0][0]==0) {
            trd = getTransition(dx+xs[wlind1], dy, locplayer.angle, locplayer.alt, lw);
            wallvals.push([
              tr[0], tr[1],
              //cos1, sin1*(1-locplayer.alt), 0, locplayer.alt, trd[0], trd[1]-locplayer.alt*lw*wallh/2,
              cos1, sin1*(1-locplayer.alt), 0, 1, trd[0], trd[1]-lw*wallh/2,
              0, wth, lw*wth, lw*wallh, 'w', locwalls[i][j][1][0]
            ]);
          }
        }
      }
    }
  }
  return wallvals;
}

function getObjects(data) {
  var objectVals = [];
  Array.prototype.push.apply(objectVals, getBullets(data));
  return objectVals;
}

function getBullets(data) {
  var bulletVals = [];
  var dx, dy;
  var tr;

  for(i in data.bullet) {
    var bullet = data.bullet[i];
    dx = bullet.x-locplayer.x;
    dy = bullet.y-locplayer.y;
    tr = getTransition(dx, dy, locplayer.angle, locplayer.alt, lw);

    var obrad = ((bullet.angle+locplayer.angle)%360)*Math.PI/180;
    var brad = Math.atan2(Math.sin(obrad)*(1-locplayer.alt), Math.cos(obrad));
    var rad = (brad+2*Math.PI)%(2*Math.PI);
    var sin = Math.sin(rad);
    var cos = Math.cos(rad);

    bulletVals.push([
      tr[0], tr[1],
      cos, sin, -sin, cos, tr[0]+0.01*lw, tr[1]-.6*lw+0.005*lw,
      null, null, lw*0.02, lw*0.01, 'b', null
    ]);
  }

  return bulletVals;
}

function getPlayers(data) {
  var pllocs = [];
  var dx, dy, tr, trd;
  var tplayer;
  
  var gunh, gunw;
  var handh, handw;
  var whratio, rpratio;
  var atprad, atpang, tpang;
  var sin, cos;
  
  var handwidths = [0.15];
  var handheights = [0.6];
  
  var flip;
  var playerimgId, gunimgId;

  var altskew = 1;
  var shift = lw/6;
  
  //Player, Gun, FrontHand, BackHand
  var drawOrder = [0.01, 0.02, 0, 0.03];
    
  for(var i in data.player) {
    //add player
    tplayer = data.player[i];
    dx = tplayer.x-locplayer.x;
    dy = tplayer.y-locplayer.y;
    tr = getTransition((tplayer.x | 0)+0.5-locplayer.x, (tplayer.y | 0)+0.5-locplayer.y, locplayer.angle, locplayer.alt, lw);
    trd = getTransition(dx, dy, locplayer.angle, locplayer.alt, lw);
    
    atprad = (tplayer.angMouse+locplayer.angle)*Math.PI/180;
    atpang = (Math.atan2(Math.sin(atprad)*(1-locplayer.alt), Math.cos(atprad))*180/Math.PI+360)%360;
    tpang = ((atpang >= 135) && (atpang <= 225)) ? -1*(atpang-180) : atpang;
    sin = Math.sin(tpang/180*Math.PI);
    cos = Math.cos(tpang/180*Math.PI);
    
    flip = (tpang==atpang) ? 1 : -1;
    playerimgId = ((atpang > 225 ) && (atpang < 315)) ? 1 : (((atpang > 45) && (atpang<135)) ? 2 : 0);
    gunimgId = (((atpang >= 315) || (atpang <= 45)) || ((atpang >= 135) && (atpang <= 225))) ? 0 : 1;
    drawOrder = ((atpang >= 315) || (atpang <= 45)) ? [0.01, 0.02, 0, 0.03] :
                ((atpang >= 135) && (atpang <= 225)) ? [0.01, 0.02, 0, 0.03] :
                ((atpang > 225 ) && (atpang < 315)) ? [0.03, 0.02, 0.01, 0] : [0, 0.03, 0.01, 0.02];

    widthratio = (lw*0.3)/15;
    playerwidth = playerimgs[playerimgId+tplayer.moveId].naturalWidth*widthratio;
    
    pllocs.push([
      tr[0], tr[1]+drawOrder[0], 
      flip*1, 0, 0, 1, trd[0], trd[1]-lw*.5, 
      0, 1, playerwidth, lw, 'p', playerimgId+tplayer.moveId
    ]);
    
    gunh = gunimgs[gunimgId].naturalHeight;
    gunw = gunimgs[gunimgId].naturalWidth;
    whratio = gunh/gunw;
    gunw = (lw/2);
    gunh = gunw*whratio;
    rpratio = gunw/gunimgs[gunimgId].naturalWidth;
    
    pllocs.push([
      tr[0], tr[1]+drawOrder[1], 
      flip*cos, sin*altskew, flip*-sin, cos*altskew, trd[0]+cos*shift*flip, trd[1]-lw*handheights[0]+sin*shift, 
      0, 1, gunw, gunh, 'g', gunimgId
    ]);

    handh = handimgs[playerimgId + Math.min(playerimgId, 1)].naturalHeight*rpratio;
    handw = handimgs[playerimgId + Math.min(playerimgId, 1)].naturalWidth*rpratio;

    pllocs.push([
      tr[0], tr[1]+drawOrder[2], 
      flip*cos, sin*altskew, flip*-sin, cos*altskew, trd[0]+cos*shift*flip, trd[1]-lw*handheights[0]+sin*shift, 
      0, 1, handw, handh, 'h', playerimgId + Math.min(playerimgId, 1)
    ]);
    
    //Left or Right
    if(playerimgId === 0) {
      handh = handimgs[1].naturalHeight*rpratio;
      handw = handimgs[1].naturalWidth*rpratio;
      
      pllocs.push([
        tr[0], tr[1]+drawOrder[3], 
        flip*cos, sin*altskew, flip*-sin, cos*altskew, trd[0]+cos*shift*flip, trd[1]-lw*handheights[0]+sin*shift, 
        0, 1, handw, handh, 'h', 1
      ]);
    }
  }
  return pllocs;
}

function getZombies(data) {
  var pllocs = [];
  var dx, dy, tr, trd;
  var tzombie;

  for(var i in data.zombie) {
    console.log(i);
    tzombie = data.zombie[i];
    dx = tzombie.x-locplayer.x;
    dy = tzombie.y-locplayer.y;
    tr = getTransition((tzombie.x | 0)+0.5-locplayer.x, (tzombie.y | 0)+0.5-locplayer.y, locplayer.angle, locplayer.alt, lw);
    trd = getTransition(dx, dy, locplayer.angle, locplayer.alt, lw);

    pllocs.push([
      tr[0], tr[1], 
      1, 0, 0, 1, trd[0], trd[1]-lw*.5, 
      0, 1, lw*.6, lw, 'z', 0
    ]);
  }
  return pllocs
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
    state:true,
  });
}

document.onmouseup = function(event) {
  socket.emit('keyPress',{
    inputID:'fire',
    state:false,
  });
}

document.onmousemove = function(event){
  mousePos.x = event.clientX;
  mousePos.y = event.clientY;
}