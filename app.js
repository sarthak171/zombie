//tester
var express = require('express')
var app = express();
var server = require('http').Server(app);
app.use(express.static('public'));

app.get('/',function(req,res) {
	res.sendFile(__dirname + '/client/index.html')
});
app.use('/client',express.static(__dirname+'/client'))
server.listen(5000);

var bulletnum = 0;

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

var SOCKET_LIST = {};
var Player = function(sid) {
	var self = {
		x:1,
		y:1,
		id:sid,
		pRight:false,
		pLeft:false,
		pUp:false,
		pDown:false,
		pMouse:false,
		angMouse:0,
		rl:false,
		rr:false,
		au:false,
		ad:false,
		vel:0.1,
		rvel:3.5,
		avel:.01,
		angle:0,
		alt:0.8,
		mapId:0,
		imgId:0,
	}
	self.updatePos = function(t){
		if(self.rl) self.angle+=self.rvel;
		if(self.rr) self.angle-=self.rvel;
		if(self.angle<0) self.angle+=360;
		if(self.angle>=360) self.angle-=360;

		if(self.au) self.alt-=self.avel;
		if(self.ad) self.alt+=self.avel;
		if(self.alt<0) self.alt=0;
		if(self.alt>0.9) self.alt=0.9;

		var ox = self.x;
		var oy = self.y;
		var xd = 0;
		var yd = 0;

		if(self.pRight) xd++;
		if(self.pLeft) xd--;
		if(self.pUp) yd--;
		if(self.pDown) yd++;
		
		if(xd!=0 && yd!=0) self.vel /=Math.sqrt(2);
		if(self.pMouse) self.vel/=2;
		xd*=self.vel;
		yd*=self.vel;
		if(xd!=0 && yd!=0) self.vel *=Math.sqrt(2);
		if(self.pMouse) self.vel*=2;

		var rad = (self.angle)*Math.PI/180;
		self.x+=xd*Math.cos(2*Math.PI-rad);
		self.x+=yd*Math.sin(rad);
		self.y+=xd*Math.sin(2*Math.PI-rad);
		self.y+=yd*Math.cos(rad);

		var locwalls = walls[self.mapId];
		
		var sxr = self.x | 0;
		var syr = self.y | 0;
		var oxr = ox | 0;
		var oyr = oy | 0;

		var pwth = wth+0.25;

		if(self.x<pwth/2) self.x = pwth/2;
		if(self.x>locwalls[0].length-1-pwth/2) self.x = locwalls[0].length-1-pwth/2;
		if(self.y<pwth/2) self.y = pwth/2;
		if(self.y>locwalls.length-1-pwth/2) self.y = locwalls.length-1-pwth/2;

		var xwz = self.x-sxr < pwth/2 || self.x-sxr > 1-pwth/2;
		var ywz = self.y-syr < pwth/2 || self.y-syr > 1-pwth/2;
		var oxwz = ox-oxr < pwth/2 || ox-oxr > 1-pwth/2;
		var oywz = oy-oyr < pwth/2 || oy-oyr > 1-pwth/2;

		var xin = oxwz ? ((ox-oxr < pwth/2) ? 0 : 1) : ((self.x-sxr<pwth/2) ? 0 : 1);
		var yin = oywz ? ((oy-oyr < pwth/2) ? 0 : 1) : ((self.y-syr<pwth/2) ? 0 : 1);

		if(xwz&&!oxwz&&ywz&&!oywz) {
			if(locwalls[oyr][oxr+xin][0][0]!=0 && locwalls[oyr+yin][oxr][1][0]!=0) {
				self.x = (self.x<ox) ? oxr+pwth/2 : oxr+1-pwth/2;
				self.y = (self.y<oy) ? oyr+pwth/2 : oyr+1-pwth/2;
			} else if(locwalls[oyr][oxr+xin][0][0]!=0) {
				self.x = (self.x<ox) ? oxr+pwth/2 : oxr+1-pwth/2;
			} else if(locwalls[oyr+yin][oxr][1][0]!=0) {
				self.y = (self.y<oy) ? oyr+pwth/2 : oyr+1-pwth/2;
			} else if(locwalls[oyr+2*yin-1][oxr+xin][0][0]!=0){
				self.x = (self.x<ox) ? oxr+pwth/2 : oxr+1-pwth/2;
			} else if(locwalls[oyr+yin][oxr+2*xin-1][1][0]!=0) {
				self.y = (self.y<oy) ? oyr+pwth/2 : oyr+1-pwth/2;
			}
        } else if(xwz&&!oxwz&&ywz) {
            if((locwalls[oyr+yin-1]!=null && locwalls[oyr+yin-1][oxr+xin][0][0]!=0) || 
                locwalls[oyr+yin][oxr+xin][0][0]!=0 ||
                locwalls[oyr+yin][oxr+2*xin-1][1][0]!=0) {
                self.x = (self.x<ox) ? oxr+pwth/2 : oxr+1-pwth/2;
            }
        } else if(xwz&&ywz&&!oywz){
            if((locwalls[oyr+yin][oxr+xin-1]!=null && locwalls[oyr+yin][oxr+xin-1][1][0]!=0) || 
                locwalls[oyr+yin][oxr+xin][1][0]!=0 ||
                locwalls[oyr+2*yin-1][oxr+xin][0][0]!=0) {
                self.y = (self.y<oy) ? oyr+pwth/2 : oyr+1-pwth/2;
            }
        } else if(xwz&&!oxwz) {
            if(locwalls[oyr][oxr+xin][0][0]!=0) {
                self.x = (self.x<ox) ? oxr+pwth/2 : oxr+1-pwth/2;
            }
        } else if(ywz&&!oywz) {
            if(locwalls[oyr+yin][oxr][1][0]!=0) {
                self.y = (self.y<oy) ? oyr+pwth/2 : oyr+1-pwth/2;
            }
		}	

		if(self.pMouse){
			nx = self.x + Math.cos(self.angMouse/180*Math.PI)*0.25;
			ny = self.y + Math.sin(self.angMouse/180*Math.PI)*0.25;
			self.shootBul(self.angMouse, nx, ny);
		}

		self.shootBul = function(angle, x, y){
			var bul = Bullet(bulletnum,angle,x,y);
			bulletnum++;
		}
	}

	Player.list[self.id] = self;
	return self;
}

function isValid(mapId, x, y) {
	if(x>=0 && x<map[mapId][0].length && y>=0 && y<map[mapId].length) return true;
	else return false;
}

Player.list = {};
Player.onConnect = function(socket){
		var player = Player(socket.id);
		socket.on('keyPress',function(data){
		if(data.inputID === 'r'){
			player.pRight = data.state;
		}
		if(data.inputID === 'l'){
			player.pLeft = data.state;
		}
		if(data.inputID === 'd'){
			player.pDown = data.state;
		}
		if(data.inputID === 'u'){
			player.pUp = data.state;
		}
		if(data.inputID === 'rl'){
			player.rl = data.state;
		}
		if(data.inputID === 'rr'){
			player.rr = data.state;
		}
		if(data.inputID === 'au'){
			player.au = data.state;
		}
		if(data.inputID === 'ad'){
			player.ad = data.state;
		}
		if(data.inputID === 'fire'){
			player.pMouse = data.state;
		}
		if(data.inputID === 'ang'){
			player.angMouse = data.state;
		}
	});
} 
Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
}
var lastUpdatetime = (new Date()).getTime();
Player.update = function(){
	var currentTime = (new Date()).getTime();
	var tDiff = currentTime - lastUpdatetime;
	for(var i in Player.list){
		Player.list[i].updatePos(tDiff);
	}
	lastUpdatetime = currentTime;
	return Player.list;
}

var Zombie = function(sid,x,y){
	var self = {
		x:x,
		y:y,
		vel:.1,
		health:100,
		id:sid
	}
	self.updateZomb = function(){
		var ox = self.x;
		var oy = self.y;
		self.x += Math.cos(self.angle/180*Math.PI)*self.vel;
		self.y += Math.sin(self.angle/180*Math.PI)*self.vel;
	}
	Zombie.list[self.id] = self;
	return self;
}
Zombie.list = {};
zcnt = 0
Zombie.update = function(){
	for(var i in Zombie.list){
		Zombie.list[i].updateZomb();
	}
	return Zombie.list;
}

var Bullet = function(sid,ang,x,y) {
	var self = {
		x:x,
		y:y,
		id:sid,
		angle:ang,
		vel:0.15,
		mapId:0,
		damage
	}
	self.updateBul = function(){
		var ox = self.x;
		var oy = self.y;
		self.x += Math.cos(self.angle/180*Math.PI)*self.vel;
		self.y += Math.sin(self.angle/180*Math.PI)*self.vel;

		var locwalls = walls[self.mapId];

		if(self.x<0 || self.x>locwalls[0].length-1) delete Bullet.list[self.id];
		else if(self.y<0 || self.y>locwalls.length-1) delete Bullet.list[self.id];

		var pwth = wth;

		var sxr = self.x | 0;
		var syr = self.y | 0;
		var oxr = ox | 0;
		var oyr = oy | 0;

		var xwz = self.x-sxr < pwth/2 || self.x-sxr > 1-pwth/2 || sxr!=oxr;
		var ywz = self.y-syr < pwth/2 || self.y-syr > 1-pwth/2 || syr!=oyr;

		var xin = (ox-oxr < .5) ? 0 : 1;
		var yin = (oy-oyr < .5) ? 0 : 1;

		if(xwz && ywz) {
			if((locwalls[oyr][oxr+xin]!=null && locwalls[oyr][oxr+xin][0][0]) || 
			   	(locwalls[oyr+yin]!=null && locwalls[oyr+yin][oxr][1][0]) ||
			   	(locwalls[oyr+2*yin-1]!=null && locwalls[oyr+2*yin-1][oxr+xin]!=null && locwalls[oyr+2*yin-1][oxr+xin][0][0]) ||
			   	(locwalls[oyr+yin]!=null && locwalls[oyr+yin][oxr+2*xin-1]!=null && locwalls[oyr+yin][oxr+2*xin-1][1][0])) {
				delete Bullet.list[self.id];
			}
		} else if(xwz) {
			if(locwalls[oyr][oxr+xin]!=null && locwalls[oyr][oxr+xin][0][0]) {
				delete Bullet.list[self.id];
			}
		} else if(ywz) {
			if(locwalls[oyr+yin]!=null && locwalls[oyr+yin][oxr][1][0]) {
				delete Bullet.list[self.id];
			}
		}
	}
	Bullet.list[self.id] = self;
	return self;
}
bcnt = 0
Bullet.list = {};
Bullet.update = function(){
	for(var i in Bullet.list){
		Bullet.list[i].updateBul();
	}
	return Bullet.list;
}



var io = require('socket.io')(server,{});
io.sockets.on('connection', function(socket){
	console.log('socket connect');
	SOCKET_LIST[socket.id] = socket;
	Player.onConnect(socket);

	var data = [socket.id];
	SOCKET_LIST[socket.id].emit('initial', data);
	for(var i =0; i<5;i++){
		zcnt+=1
		Zombie(zcnt,1,1)
	}


	socket.on('disconnect',function(){
		console.log('socket disconnect');
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});
});


setInterval(function(){

	var pack = {
		player:Player.update(),
		bullet:Bullet.update(),
		zombie:Zombie.update()
	}
	pack = JSON.stringify(pack);
	for(var i in SOCKET_LIST){
		SOCKET_LIST[i].emit('newPositions',pack);
	}
}, 1000/60);
