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
		mapId:0,
		imgId:0,
		moveId:0,

		vel:0.06,
		rotateVel:3.5,
		altVel:.01,
		walkspeed:150,

		mouseAngle:0,
		angle:0,
		alt:0.8,

		bullets:[],
		health:100,
		
		lastUpdated:new Date().getTime(),

		playerUp:false,
		playerDown:false,
		playerLeft:false,
		playerRight:false,
		mouseDown:false,
		rotateLeft:false,
		rotateRight:false,
		altUp:false,
		altDown:false
	}

	Player.list[self.id] = self;
	return self;
}

Player.list = {};
Player.onConnect = function(socket){
	var player = Player(socket.id);
	socket.on('move',function(pack){
		var data = JSON.parse(pack);
		processbzHits(data.bzHits);
		processzpHits(data.zpHits);
		Player.list[player.id] = data.player;
	});
} 

function processbzHits(hits) {
	for(var i in hits) {
		var hit = hits[i];
		if(Zombie.list[hit[0]]==null) continue;
		Zombie.list[hit[0]].health-=hit[1];
		if(Zombie.list[hit[0]].health<=0) delete Zombie.list[hit[0]];
	}
}

function processzpHits(hits) {
	
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
		angle: 0.0,
		health:100,
		id:sid,
		mapId:0,
		imgId:0,
		moveId:0
	}
	self.updateZomb = function(){
		var ox = self.x;
		var oy = self.y;

		self.x += Math.cos(self.angle/180*Math.PI)*self.vel;
		self.y += Math.sin(self.angle/180*Math.PI)*self.vel;

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

	Zombie.list[self.id] = self;
	return self;
}

Zombie.list = {};
zcnt = 0;
Zombie.update = function(){
	setZombieMovement();

	for(var i in Zombie.list){
		Zombie.list[i].updateZomb();
	}
	return Zombie.list;
}

function setZombieMovement() {

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


const top = 0;
const parent = i => ((i + 1) >>> 1) - 1;
const left = i => (i << 1) + 1;
const right = i => (i + 1) << 1;

class PriorityQueue {
  constructor(comparator = (a, b) => a > b) {
    this._heap = [];
    this._comparator = comparator;
  }
  size() {
    return this._heap.length;
  }
  isEmpty() {
    return this.size() == 0;
  }
  peek() {
    return this._heap[top];
  }
  push(...values) {
    values.forEach(value => {
      this._heap.push(value);
      this._siftUp();
    });
    return this.size();
  }
  pop() {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if (bottom > top) {
      this._swap(top, bottom);
    }
    this._heap.pop();
    this._siftDown();
    return poppedValue;
  }
  replace(value) {
    const replacedValue = this.peek();
    this._heap[top] = value;
    this._siftDown();
    return replacedValue;
  }
  _greater(i, j) {
    return this._comparator(this._heap[i], this._heap[j]);
  }
  _swap(i, j) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }
  _siftUp() {
    let node = this.size() - 1;
    while (node > top && this._greater(node, parent(node))) {
      this._swap(node, parent(node));
      node = parent(node);
    }
  }
  _siftDown() {
    let node = top;
    while (
      (left(node) < this.size() && this._greater(left(node), node)) ||
      (right(node) < this.size() && this._greater(right(node), node))
    ) {
      let maxChild = (right(node) < this.size() && this._greater(right(node), left(node))) ? right(node) : left(node);
      this._swap(node, maxChild);
      node = maxChild;
    }
  }
}

function fillArray(value, len) {
	var arr = [];
	for (var i = 0; i < len; i++) {
	  arr.push(value);
	}
	return arr;
  }

function dijkstra(adjList, src) {
	var dist = fillArray(1000000, adjList.length);
	var path = fillArray(-1, adjList.length);
	const pq = new PriorityQueue((a,b) => a[1] > b[1]);
	var settled = new Set();
	
	pq.push([src, 0]);
	dist[src] = 0;
	path[src] = src;

	while(!pq.isEmpty()) {
		var u = pq.pop()[0];
		settled.add(u);
		e_Neighbors(u, adjList, dist, path, settled, pq);
	}
}

function e_Neighbors(u, adjList, dist, path, settled, pq) {
	var edgeDistance = 1;
	var newDistance = 1;
	
	for(var i = 0; i<adjList[u].length; i++) {
		var v = adjList[u][i];
		if(!settled.has(v[0])) {
			edgeDistance = v[1];
			newDistance = dist[u]+edgeDistance;

			if(newDistance < dist[v[0]]) {
				dist[v[0]] = newDistance;

				if(v[0] == src) path[v[0]] = v[0];
				else path[v[0]] = path[u];
				pq.push([v[0], dist[v[0]]]);
			}
		}
	}
}