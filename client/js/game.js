
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
var socket = io();
var id, locplayer;
var lw;

var size = {
  width: window.innerWidth || document.body.clientWidth,
  height: window.innerHeight || document.body.clientHeight
}

var mousePos = {x:0, y:0};

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

socket.on('newPositions', function(pack){
  data = JSON.parse(pack);
  gldata = data;

  if(id == null) return;

  updateScreen();
  draw(data);
});

function updateScreen() {
  updateSize();
  canvas.width = size.width;
  canvas.height = size.height;
  lw = size.width/10;
}

function draw(data) {
  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, size.width, size.height);

  drawfloor(data);
  drawObj(data);
}

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

  for(i in data.player) {
    var tplayer = data.player[i];
    if(i==id) tplayer = locplayer;
    for(j in tplayer.bullets) {
      var bullet = tplayer.bullets[j];
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
    if(i==locplayer.id) tplayer = locplayer;
    dx = tplayer.x-locplayer.x;
    dy = tplayer.y-locplayer.y;
    tr = getTransition((tplayer.x | 0)+0.5-locplayer.x, (tplayer.y | 0)+0.5-locplayer.y, locplayer.angle, locplayer.alt, lw);
    trd = getTransition(dx, dy, locplayer.angle, locplayer.alt, lw);
    
    atprad = (tplayer.mouseAngle+locplayer.angle)*Math.PI/180;
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

function updateSize() {
  size = {
    width: window.innerWidth || document.body.clientWidth,
    height: window.innerHeight || document.body.clientHeight
  }
}

socket.on('initial', function(pack) {
  data = JSON.parse(pack);
  id = data.id;
  locplayer = data.player;
});

document.onkeydown = function(event){
  if(event.keyCode === 68) locplayer.playerRight = true;
  if(event.keyCode === 83) locplayer.playerDown = true;
  if(event.keyCode === 65) locplayer.playerLeft = true;
  if(event.keyCode === 87) locplayer.playerUp = true;
  if(event.keyCode === 81) locplayer.rotateLeft = true;
  if(event.keyCode === 69) locplayer.rotateRight = true;
  if(event.keyCode === 38) locplayer.altUp = true;
  if(event.keyCode === 40) locplayer.altDown = true;
}

document.onkeyup = function(event){
  if(event.keyCode === 68) locplayer.playerRight = false;
  if(event.keyCode === 83) locplayer.playerDown = false;
  if(event.keyCode === 65) locplayer.playerLeft = false;
  if(event.keyCode === 87) locplayer.playerUp = false;
  if(event.keyCode === 81) locplayer.rotateLeft = false;
  if(event.keyCode === 69) locplayer.rotateRight = false;
  if(event.keyCode === 38) locplayer.altUp = false;
  if(event.keyCode === 40) locplayer.altDown = false;
}

document.onmousedown = function(event){
  locplayer.mouseDown = true;
}

document.onmouseup = function(event) {
  locplayer.mouseDown = false;
}

document.onmousemove = function(event){
  mousePos.x = event.clientX;
  mousePos.y = event.clientY;
}

function updateLocs() {
  updatePlayer();
  updateBullets();
}

function updatePlayer() {
  updateMouseAngle();

  if(locplayer.rotateLeft) locplayer.angle+=locplayer.rotateVel;
	if(locplayer.rotateRight) locplayer.angle-=locplayer.rotateVel;
	if(locplayer.angle<0) locplayer.angle+=360;
	if(locplayer.angle>=360) locplayer.angle-=360;

	if(locplayer.altUp) locplayer.alt-=locplayer.altVel;
	if(locplayer.altDown) locplayer.alt+=locplayer.altVel;
	if(locplayer.alt<0) locplayer.alt=0;
	if(locplayer.alt>0.9) locplayer.alt=0.9;

	var ox = locplayer.x;
	var oy = locplayer.y;
	var xd = 0;
	var yd = 0;

	if(locplayer.playerRight) xd++;
	if(locplayer.playerLeft) xd--;
	if(locplayer.playerUp) yd--;
	if(locplayer.playerDown) yd++;
		
	if(xd!=0 && yd!=0) locplayer.vel /=Math.sqrt(2);
	if(locplayer.mouseDown) locplayer.vel/=2;
  
  xd*=locplayer.vel;
	yd*=locplayer.vel;
  
  if(xd!=0 && yd!=0) locplayer.vel *=Math.sqrt(2);
	if(locplayer.mouseDown) locplayer.vel*=2;

  var rad = (locplayer.angle)*Math.PI/180;
	locplayer.x+=xd*Math.cos(2*Math.PI-rad);
	locplayer.x+=yd*Math.sin(rad);
	locplayer.y+=xd*Math.sin(2*Math.PI-rad);
	locplayer.y+=yd*Math.cos(rad);
		
	var sxr = locplayer.x | 0;
	var syr = locplayer.y | 0;
	var oxr = ox | 0;
	var oyr = oy | 0;

  var pwth = wth+0.25;
  var locwalls = walls[locplayer.mapId];

	if(locplayer.x<pwth/2) locplayer.x = pwth/2;
	if(locplayer.x>locwalls[0].length-1-pwth/2) locplayer.x = locwalls[0].length-1-pwth/2;
	if(locplayer.y<pwth/2) locplayer.y = pwth/2;
	if(locplayer.y>locwalls.length-1-pwth/2) locplayer.y = locwalls.length-1-pwth/2;

	var xwz = locplayer.x-sxr < pwth/2 || locplayer.x-sxr > 1-pwth/2;
	var ywz = locplayer.y-syr < pwth/2 || locplayer.y-syr > 1-pwth/2;
	var oxwz = ox-oxr < pwth/2 || ox-oxr > 1-pwth/2;
  var oywz = oy-oyr < pwth/2 || oy-oyr > 1-pwth/2;

	var xin = oxwz ? ((ox-oxr < pwth/2) ? 0 : 1) : ((locplayer.x-sxr<pwth/2) ? 0 : 1);
	var yin = oywz ? ((oy-oyr < pwth/2) ? 0 : 1) : ((locplayer.y-syr<pwth/2) ? 0 : 1);

	if(xwz&&!oxwz&&ywz&&!oywz) {
		if(locwalls[oyr][oxr+xin][0][0]!=0 && locwalls[oyr+yin][oxr][1][0]!=0) {
			locplayer.x = (locplayer.x<ox) ? oxr+pwth/2 : oxr+1-pwth/2;
			locplayer.y = (locplayer.y<oy) ? oyr+pwth/2 : oyr+1-pwth/2;
		} else if(locwalls[oyr][oxr+xin][0][0]!=0) {
			locplayer.x = (locplayer.x<ox) ? oxr+pwth/2 : oxr+1-pwth/2;
		} else if(locwalls[oyr+yin][oxr][1][0]!=0) {
			locplayer.y = (locplayer.y<oy) ? oyr+pwth/2 : oyr+1-pwth/2;
		} else if(locwalls[oyr+2*yin-1][oxr+xin][0][0]!=0){
			locplayer.x = (locplayer.x<ox) ? oxr+pwth/2 : oxr+1-pwth/2;
		} else if(locwalls[oyr+yin][oxr+2*xin-1][1][0]!=0) {
			locplayer.y = (locplayer.y<oy) ? oyr+pwth/2 : oyr+1-pwth/2;
		}
  } else if(xwz&&!oxwz&&ywz) {
    if((locwalls[oyr+yin-1]!=null && locwalls[oyr+yin-1][oxr+xin][0][0]!=0) || 
      locwalls[oyr+yin][oxr+xin][0][0]!=0 ||
      locwalls[oyr+yin][oxr+2*xin-1][1][0]!=0) {
      locplayer.x = (locplayer.x<ox) ? oxr+pwth/2 : oxr+1-pwth/2;
    }
  } else if(xwz&&ywz&&!oywz){
    if((locwalls[oyr+yin][oxr+xin-1]!=null && locwalls[oyr+yin][oxr+xin-1][1][0]!=0) || 
      locwalls[oyr+yin][oxr+xin][1][0]!=0 ||
      locwalls[oyr+2*yin-1][oxr+xin][0][0]!=0) {
      locplayer.y = (locplayer.y<oy) ? oyr+pwth/2 : oyr+1-pwth/2;
    }
  } else if(xwz&&!oxwz) {
    if(locwalls[oyr][oxr+xin][0][0]!=0) {
      locplayer.x = (locplayer.x<ox) ? oxr+pwth/2 : oxr+1-pwth/2;
    }
  } else if(ywz&&!oywz) {
    if(locwalls[oyr+yin][oxr][1][0]!=0) {
      locplayer.y = (locplayer.y<oy) ? oyr+pwth/2 : oyr+1-pwth/2;
    }
	}	

	locplayer.moveId = 0;
	var d = new Date();
	var n = d.getTime();
	var moving = locplayer.playerDown || locplayer.playerUp || locplayer.playerLeft || locplayer.playerRight;
		
	if(moving && n%(locplayer.walkspeed*4)<=locplayer.walkspeed) locplayer.moveId=3;
	else if(moving && n%(locplayer.walkspeed*4)<=locplayer.walkspeed*2) locplayer.moveId=0;
	else if(moving && n%(locplayer.walkspeed*4)<=locplayer.walkspeed*3) locplayer.moveId=6;
	else if(moving) locplayer.moveId = 0;
}

function updateMouseAngle() {
  locplayer.mouseAngle = (Math.atan2((mousePos.y-size.height/2+0.6*lw)/(1-locplayer.alt), (mousePos.x-size.width/2))/ Math.PI * 180-locplayer.angle+720) % 360;
}

function updateBullets() {
  for(var i = 0; i<locplayer.bullets.length; i++) {
    var bullet = locplayer.bullets[i];
    if(!updateBullet(bullet)) {
      locplayer.bullets.splice(i, 1);
      i--;
    }
  }
}

function updateBullet(bullet) {
  var ox = bullet.x;
	var oy = bullet.y;
	bullet.x += Math.cos(bullet.angle/180*Math.PI)*bullet.vel;
  bullet.y += Math.sin(bullet.angle/180*Math.PI)*bullet.vel;
  
  var locwalls = walls[locplayer.mapId];

  if(bullet.x<0 || bullet.x>locwalls[0].length-1) {
    return false;
  }
	else if(bullet.y<0 || bullet.y>locwalls.length-1) {
    return false;
  }

  var pwth = wth;

	var sxr = bullet.x | 0;
	var syr = bullet.y | 0;
	var oxr = ox | 0;
	var oyr = oy | 0;

	var xwz = bullet.x-sxr < pwth/2 || bullet.x-sxr > 1-pwth/2 || sxr!=oxr;
	var ywz = bullet.y-syr < pwth/2 || bullet.y-syr > 1-pwth/2 || syr!=oyr;

	var xin = (ox-oxr < .5) ? 0 : 1;
	var yin = (oy-oyr < .5) ? 0 : 1;

	if(xwz && ywz) {
		if((locwalls[oyr][oxr+xin]!=null && locwalls[oyr][oxr+xin][0][0]) || 
	   	(locwalls[oyr+yin]!=null && locwalls[oyr+yin][oxr][1][0]) ||
	   	(locwalls[oyr+2*yin-1]!=null && locwalls[oyr+2*yin-1][oxr+xin]!=null && locwalls[oyr+2*yin-1][oxr+xin][0][0]) ||
	  	(locwalls[oyr+yin]!=null && locwalls[oyr+yin][oxr+2*xin-1]!=null && locwalls[oyr+yin][oxr+2*xin-1][1][0])) {
      return false;
		}
	} else if(xwz) {
		if(locwalls[oyr][oxr+xin]!=null && locwalls[oyr][oxr+xin][0][0]) {
      return false;
		}
	} else if(ywz) {
		if(locwalls[oyr+yin]!=null && locwalls[oyr+yin][oxr][1][0]) {
      return false;
		}
  }
  return true;
}

function bulletZombieColls() {
  if(gldata==null) return [];

  var conns = [];
  var smap = [];

  var locfloor = floor[locplayer.mapId];

  for(var i = 0; i<locfloor.length; i++) {
    var inp = []
    for(var j = 0; j<locfloor[0].length; j++) {
      inp.push([]);
    }
    smap.push(inp);
  }

  for(var i in gldata.zombie) {
    var zombie = gldata.zombie[i];
    smap[zombie.y | 0][zombie.x | 0].push(zombie);
  }

  for(var i in locplayer.bullets) {
    var bullet = locplayer.bullets[i];
    var locchecks = smap[bullet.y | 0][bullet.x | 0];

    for(var j in locchecks) {
      var zombie = locchecks[j];
      if (bullet.x > zombie.x-0.2 && bullet.x < zombie.x+0.2  && 
          bullet.y > zombie.y-0.2 && bullet.y < zombie.y+0.2) {
          conns.push([zombie.id, bullet.damage]);
          locplayer.bullets.splice(i, 1);
          i--;
          break;
      }
    
    }
  }

  return conns;
}

function shoot() {
	var nx = locplayer.x + Math.cos(locplayer.mouseAngle/180*Math.PI)*0.4;
	var ny = locplayer.y + Math.sin(locplayer.mouseAngle/180*Math.PI)*0.4;
	var bul = Bullet(id,nx,ny,locplayer.mouseAngle);
  locplayer.bullets.push(bul);
}

var Bullet = function(sid,x,y,ang) {
	var self = {
		x:x,
		y:y,
		type:"n/a",
		angle:ang,
		vel:0.05,
		damage:20
	}

	return self;
}

setInterval(function(){
  if(locplayer==null) return;
  if(locplayer.mouseDown) shoot();
  updateLocs();
  var zHits = bulletZombieColls();
  
  var pack = {
    player:locplayer,
    zombieHits:zHits
  };

	pack = JSON.stringify(pack);
	socket.emit('move', pack);
}, 1000/60);