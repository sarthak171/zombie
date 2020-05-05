var express = require('express')
var app = express();
var server = require('http').Server(app);
app.use(express.static('public'));

app.get('/',function(req,res) {
	res.sendFile(__dirname + '/client/index.html')
});
app.use('/client',express.static(__dirname+'/client'))
server.listen(5000);



var SOCKET_LIST = {};
var Player = function(sid) {
	var self = {
		x:250,
		y:250,
		id:sid,
		pRight:false,
		pLeft:false,
		pUp:false,
		pDown:false,
		vel:1,
		cnt:0,
	}
	self.updatePos = function(t){
		self.cnt = 0;
		if(self.pRight)
			self.cnt+=1;
		if(self.pLeft)
			self.cnt+=1;
		if(self.pUp)
			self.cnt+=1;
		if(self.pDown)
			self.cnt+=1;
		if(self.cnt==2){
			self.vel /=Math.sqrt(2);
		}
		if(self.pRight){
			self.x += self.vel*t;
		}
		if(self.pLeft){
			self.x -= self.vel*t
		}
		if(self.pUp){
			hasGone = true;
			self.y -= self.vel*t;
		}
		if(self.pDown)
			self.y += self.vel*t;
		if(self.cnt==2)
			self.vel *= Math.sqrt(2);
	}
	Player.list[self.id] = self;
	return self;
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
	});
} 
Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
}
var lastUpdatetime = (new Date()).getTime();
Player.update = function(){
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		var currentTime = (new Date()).getTime();
		var tDiff = currentTime - lastUpdatetime;
		player.updatePos(tDiff);
		pack.push({
			x:player.x,
			y:player.y,
			number:player.number
		});
	}
	lastUpdatetime = currentTime;
	return pack;
}


var Bullet = function(ang) {
	var self = {
		x:250,
		y:250,
		id:Math.random(),
		angle:ang,
		vel:2
	}
	self.updateBul = function(){
		self.x += Math.cos(self.angle/180*Math.PI)*vel;
		self.y += Math.sin(self.angle/180*Math.PI)*vel;
	}
	Bullet.list[self.id] = self;
	return self;
}
Bullet.list = {};
Bullet.update = function(){
	var pack =[];
	for(var i in Bullet.list){
		var bullet = Bullet.list[i];
		bullet.updateBul();
		pack.push({
			x:bullet.x,
			y:bullet.y,
		});
	}
	return pack;
}



var io = require('socket.io')(server,{});
io.sockets.on('connection', function(socket){
	console.log('socket connect');
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	Player.onConnect(socket);

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
	for(var i in SOCKET_LIST){
		SOCKET_LIST[i].emit('newPositions',pack)
	}
}, 1000/60);