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
var PLAYER_LIST = {};


var Player = function(sid) {
	var self = {
		x:250,
		y:250,
		id:sid,
		number:"" + Math.floor(10 * Math.random()),
		pRight:false,
		pLeft:false,
		pUp:false,
		pDown:false,
		vel:1,
	}
	self.updatePos = function(){
		if(self.pRight)
			self.x += self.vel;
		if(self.pLeft)
			self.x -= self.vel;
		if(self.pUp)
			self.y -= self.vel;
		if(self.pDown)
			self.y += self.vel;
	}
	return self;
}


var io = require('socket.io')(server,{});

io.sockets.on('connection', function(socket){
	console.log('socket connect');
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	var player = Player(socket.id);
	PLAYER_LIST[socket.id] = player;

	socket.on('disconnect',function(){
		console.log('socket disconnect');
		delete SOCKET_LIST[socket.id];
		delete PLAYER_LIST[socket.id];
	});

	socket.on('keyPress',function(data){
		if(data.inputID === 'r')
			player.pRight = data.state;
		if(data.inputID === 'l')
			player.pLeft = data.state;
		if(data.inputID === 'd')
			player.pDown = data.state;
		if(data.inputID === 'u')
			player.pUp = data.state;

	});
});

setInterval(function(){
	var pack = [];
	for(var i in PLAYER_LIST){
		var player=PLAYER_LIST[i];
		player.updatePos();
		pack.push({
			x:player.x,
			y:player.y,
		});
	}
	for(var i in SOCKET_LIST){
		SOCKET_LIST[i].emit('newPositions',pack)
	}
});