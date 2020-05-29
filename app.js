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
		bullets:[],
		playerUp:false,
		playerDown:false,
		playerLeft:false,
		playerRight:false,
		mouseDown:false,
		mouseAngle:0,
		rotateLeft:false,
		rotateRight:false,
		altUp:false,
		altDown:false,
		vel:0.06,
		rotateVel:3.5,
		altVel:.01,
		angle:0,
		alt:0.8,
		mapId:0,
		imgId:0,
		moveId:0,
		walkspeed:150,
		lastUpdated:new Date().getTime(),
	}

	Player.list[self.id] = self;
	return self;
}

Player.list = {};
Player.onConnect = function(socket){
	var player = Player(socket.id);
	socket.on('move',function(pack){
		var data = JSON.parse(pack);
		processZombieHits(data.zombieHits);
		Player.list[player.id] = data.player;
	});
} 

function processZombieHits(hits) {
	for(var i in hits) {
		var hit = hits[i];
		if(Zombie.list[hit[0]]==null) continue;
		Zombie.list[hit[0]].health-=hit[1];
		if(Zombie.list[hit[0]].health<=0) delete Zombie.list[hit[0]];
	}
}

Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
}

Player.update = function(){
	return Player.list;
}

var Zombie = function(sid,x,y){
	var self = {
		x:x,
		y:y,
		vel:.01,
		health:100,
		id:sid,
		mapId:0,
		imgId:0,
		moveId:0
	}
	self.updateZomb = function(){
		var ox = self.x;
		var oy = self.y;

		var angle = self.getAngle();
		self.x += Math.cos(angle/180*Math.PI)*self.vel;
		self.y += Math.sin(angle/180*Math.PI)*self.vel;

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
	}
	self.getAngle = function() {
		//complete
		return 45;
	}
	Zombie.list[self.id] = self;
	return self;
}

Zombie.list = {};
zcnt = 0;
Zombie.update = function(){
	for(var i in Zombie.list){
		Zombie.list[i].updateZomb();
	}
	return Zombie.list;
}

var io = require('socket.io')(server,{});
io.sockets.on('connection', function(socket){
	console.log('socket connect');
	SOCKET_LIST[socket.id] = socket;
	Player.onConnect(socket);
	
	var pack = {id: socket.id, player: Player.list[socket.id]};
	pack = JSON.stringify(pack);
	SOCKET_LIST[socket.id].emit('initial', pack);
	for(var i =0; i<5;i++){
		zcnt+=1;
		Zombie(zcnt,1,1);
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
		zombie:Zombie.update()
	}
	pack = JSON.stringify(pack);
	for(var i in SOCKET_LIST){
		SOCKET_LIST[i].emit('newPositions',pack);
	}
}, 1000/60);
