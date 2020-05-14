var express = require('express')
var app = express();
var server = require('http').Server(app);
app.use(express.static('public'));

app.get('/',function(req,res) {
	res.sendFile(__dirname + '/client/index.html')
});
app.use('/client',express.static(__dirname+'/client'))
server.listen(5000);

var floor = [[
	[0,0,0,0,0,0],
	[0,1,0,0,0,0],
	[0,0,0,0,0,0],
	[0,0,0,0,0,0],
	[0,0,0,0,0,0],
	[0,0,0,0,0,0],  
  ]];

var walls = [[
  [[[2, 1], [2, 1]], [[0, 0], [2, 1]], [[0, 0], [0, 0]], [[0, 0], [2, 1]], [[0, 0], [2, 1]], [[0, 0], [2, 1]], [[1, 2], [0, 0]]],
  [[[2, 1], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[1, 2], [0, 0]]],
  [[[2, 1], [1, 1]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]]],
  [[[2, 1], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [1, 1]], [[1, 2], [0, 0]]],
  [[[2, 1], [1, 1]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[0, 0], [0, 0]], [[1, 2], [0, 0]]],
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
		rl:false,
		rr:false,
		au:false,
		ad:false,
		vel:0.1,
		rvel:3.5,
		avel:.01,
		angle:45,
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
		xd*=self.vel;
		yd*=self.vel;
		if(xd!=0 && yd!=0) self.vel *=Math.sqrt(2);

		var rad = (self.angle)*Math.PI/180;
		self.x+=xd*Math.cos(2*Math.PI-rad);
		self.x+=yd*Math.sin(rad);
		self.y+=xd*Math.sin(2*Math.PI-rad);
		self.y+=yd*Math.cos(rad);

		var locwalls = walls[self.mapId];
		
		//finish collisions
		var sxr = self.x | 0;
		var syr = self.y | 0;
		var oxr = ox | 0;
		var oyr = oy | 0;

		var xwz = self.x-sxr < wth/2 || self.x-sxr > 1-wth/2;
		var ywz = self.y-syr < wth/2 || self.y-syr > 1-wth/2;

		/*if(xwz && ywz) {
			self.x = (self.x>ox) ? (oxr+1-wth/2) : (oxr+wth/2);
			self.y = (self.y>oy) ? (oyr+1-wth/2) : (oyr+wth/2);
		} else if(xwz) {
			self.x = (self.x>ox) ? (oxr+1-wth/2) : (oxr+wth/2);
		} else if(ywz) {
			self.y = (self.y>oy) ? (oyr+1-wth/2) : (oyr+wth/2);
		}*/
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


var Bullet = function(sid,x,y,ang) {
	var self = {
		x:x,
		y:y,
		id:sid,
		angle:ang,
		vel:2
	}
	self.updateBul = function(){
		self.x += Math.cos(self.angle/180*Math.PI)*self.vel;
		self.y += Math.sin(self.angle/180*Math.PI)*self.vel;
	}
	Bullet.list[self.id] = self;
	return self;
}
bcnt = 0
Bullet.list = {};
Bullet.onShoot = function(angle,x,y){
	var bul = Bullet(bcnt,250,250,angle);
	bcnt+=1
}
Bullet.update = function(){
	for(var i in Bullet.list){
		var bullet = Bullet.list[i];
		bullet.updateBul();
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

	socket.on('mouse',function(){
		Bullet.onShoot(0)
	});

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
	}
	pack = JSON.stringify(pack);
	for(var i in SOCKET_LIST){
		SOCKET_LIST[i].emit('newPositions',pack);
	}
}, 1000/60);