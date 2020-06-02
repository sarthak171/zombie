import math
import pygame as pg
from pygame.locals import *
import random as rand


pg.init()

clock = pg.time.Clock()

gameDisplay = pg.display.set_mode((720,720),pg.RESIZABLE)
gameDisplay.fill((0,0,0))

end = False

namenum = 1


pos = [[-0.3, -0.3], [2.3, -0.3], [2.7, -0.3], [2.7, 0.3], [6.3, -0.3], [1.7, 1.3], [2.3, 1.3], [4.3, 1.7], [5.7, 2.3], [6.3, 2.3], [4.7, 2.7], [4.7, 3.3],[6.3, 2.7], [1.3, 3.7], [1.3, 4.3], [3.7, 5.3], [4.3, 5.3], [-0.3, 6.3], [3.3, 5.7], [3.3, 6.3], [3.7, 5.7], [3.7, 6.3], [6.3, 6.3]];
#pos = [[2.3, -0.3], [2.7, -0.3], [2.7, 0.3], [1.7, 1.3], [2.3, 1.3], [4.3, 1.7], [5.7, 2.3], [6.3, 2.3], [4.7, 2.7], [4.7, 3.3],[6.3, 2.7], [1.3, 3.7], [1.3, 4.3], [3.7, 5.3], [4.3, 5.3], [3.3, 5.7], [3.3, 6.3], [3.7, 5.7], [3.7, 6.3]];
hWalls = [[0.25, 0.25, 1.75, 0.25], [-0.25, -0.25, 2.25, -0.25], [2.75, 0.25, 5.75, 0.25], [2.75, -0.25, 6.25, -0.25], [1.75, 1.25, 2.25, 1.25], [0.25, 2.25, 3.75, 2.25], [0.25, 1.75, 4.25, 1.75], [5.75, 2.25, 6.25, 2.25], [4.75, 3.25, 5.75, 3.25], [4.75, 2.75, 6.25, 2.75], [0.25, 3.75, 1.25, 3.75], [0.25, 4.25, 1.25, 4.25], [3.75, 5.25, 4.25, 5.25], [0.25, 5.75, 3.25, 5.75], [-0.25, 6.25, 3.25, 6.25], [3.75, 5.75, 5.75, 5.75], [3.75, 6.25, 6.25, 6.25]];
vWalls = [[0.25, 0.25, 0.25, 1.75], [0.25, 2.25, 0.25, 3.75], [0.25, 4.25, 0.25, 5.75], [-0.25, -0.25, -0.25, 6.25], [1.25, 3.75, 1.25, 4.25], [1.75, 0.25, 1.75, 1.25], [2.25, -0.25, 2.25, 1.25], [2.75, -0.25, 2.75, 0.25], [3.25, 5.75, 3.25, 6.25], [3.75, 2.25, 3.75, 5.25], [4.25, 1.75, 4.25, 5.25], [3.75, 5.75, 3.75, 6.25], [4.75, 2.75, 4.75, 3.25], [5.75, 0.25, 5.75, 2.25], [6.25, -0.25, 6.25, 2.25], [5.75, 3.25, 5.75, 5.75], [6.25, 2.75, 6.25, 6.25]];

#print(len(pos)*len(pos))
#print((len(hWalls)+len(vWalls))*len(pos)*2)
#print((len(hWalls)+len(vWalls))*len(pos)*90000)

for i in range(0,len(pos)):
	for j in range(0,len(pos[i])):
		pos[i][j] += 5
		pos[i][j] *= 50

for i in range(0,len(hWalls)):
	for j in range(0,len(hWalls[i])):
		hWalls[i][j] += 5
		hWalls[i][j] *= 50
	

for i in range(0,len(vWalls)):
	for j in range(0,len(vWalls[i])):
		vWalls[i][j] += 5
		vWalls[i][j] *= 50



class Player:
	def __init__(self,alt):
		self.x = 300
		self.y= 300
		self.xLen = 10
		self.yLen = 10
		self.color = (255,255,255)
		self.speed = 5
		self.drawR = None
		self.moveType = alt
	def move(self,keys):
		if(self.moveType):
			if keys[K_w]:
				self.y-=self.speed
			if(keys[K_s]):
				self.y+=self.speed     
			if(keys[K_d]):
				self.x+=self.speed       
			if(keys[K_a]):
				self.x-=self.speed
		else:
			if keys[K_UP]:
				self.y-=self.speed
			if(keys[K_DOWN]):
				self.y+=self.speed     
			if(keys[K_RIGHT]):
				self.x+=self.speed       
			if(keys[K_LEFT]):
				self.x-=self.speed
		if(self.x<=0 or self.x >=1280):
			self.x = 0
		if(self.y<=0 or self.y>=720):
			self.y = 0
	def draw(self):
		self.drawR = pg.draw.rect(gameDisplay,self.color,(self.x,self.y,self.xLen,self.yLen))

def line_rect(p1,p2,lwalls):
	if(p2[0]-p1[0] != 0):
		m = float(p2[1]-p1[1])/float(p2[0]-p1[0])
		b = float(p2[1])-float(m*p2[0])
	
		for i in range(0,len(lwalls)):
			if lwalls[i].orientation == 'h':
				y_hwall = lwalls[i].y;
				x = (y_hwall-b)/(m+.0001)
				miny = min(p2[1],p1[1])
				maxy = max(p2[1],p1[1])
				if(x>=lwalls[i].x and x<=lwalls[i].x1 and miny<=y_hwall and maxy>=y_hwall):
					return True
			else: 
				x_vwall = lwalls[i].x;
				y = m*x_vwall+b
				minx = min(p2[0],p1[0])
				maxx = max(p2[0],p1[0])
				if(y>=lwalls[i].y and y<=lwalls[i].y1 and minx<=x_vwall and maxx>=x_vwall):
					return True	
	else:
		for i in range(0,len(lwalls)):
			if lwalls[i].orientation == 'h':
				miny = min(p2[1],p1[1])
				maxy = max(p2[1],p1[1])
				if(miny<=lwalls[i].y and maxy>=lwalls[i].y and p2[0]>=lwalls[i].x and p2[0]<=lwalls[i].x1):
					return True
			else:
				miny = min(p2[1],p1[1])
				maxy = max(p2[1],p1[1])
				if(p2[0]==lwalls[i].x and ((miny<=lwalls[i].y and maxy>=lwalls[i].y) or (miny<=lwalls[i].y1 and maxy>=lwalls[i].y1))):
					return True
	return False
	
			
class Graph:
	def __init__(self,nodes):
		self.edges = {}
		self.weights = {}
		self.start = None
		self.end = None
		global namenum
		for i in range(0,namenum+1):
			self.edges[i]= set()
			self.weights[i]= set()
		for node in nodes:
			for c in node.edges:
				if(node.name != c[1].name):
					self.edges[node.name].add(c[1].name)
					self.edges[c[1].name].add(node.name)
					self.weights[(node.name,c[1].name)] = math.hypot(c[1].x-node.x,c[1].y-node.y)
					self.weights[(c[1].name,node.name)] = math.hypot(c[1].x-node.x,c[1].y-node.y)
					if(c[1].start):
						self.start = c[1].name
						#pg.draw.circle(gameDisplay,(0,255,255),(self.start.x,self.start.y),5)
					if(c[1].end):
						self.end = c[1].name
						#pg.draw.circle(gameDisplay,(0,255,255),(self.end.x,self.end.y),5)
	def pathfinder(self,start,end):
		shortest_paths = {start.name: (None, 0)}
		current_node = start.name
		visited = set()
		while(current_node != end.name):
			visited.add(current_node)
			destinations = self.edges[current_node]
			weight_to_current_node = shortest_paths[current_node][1]
			for next_node in destinations:
				weight = self.weights[(current_node, next_node)] + weight_to_current_node
				if next_node not in shortest_paths:
					shortest_paths[next_node] = (current_node, weight)
				else:
					current_shortest_weight = shortest_paths[next_node][1]
					if current_shortest_weight > weight:
						shortest_paths[next_node] = (current_node, weight)
			next_destinations = {node: shortest_paths[node] for node in shortest_paths if node not in visited}
			current_node = min(next_destinations, key=lambda k: next_destinations[k][1])
		path = []
		dist = shortest_paths[current_node][1]
		while current_node != None:
			path.append(current_node)
			next_node = shortest_paths[current_node][0]
			current_node = next_node
		path = path[::-1]
		return [path,dist]
def onePass(pos):
	nodes = []
	global namenum
	for i in pos:
		nodes.append(Node(i[0],i[1],False,False,namenum))
		namenum+=1
	return nodes
class Node:
	def __init__(self,x,y,s,e,n):
		self.x = x
		self.y= y
		self.xLen = 5
		self.yLen = 5
		self.color = (127,127,127)
		self.drawR = pg.draw.rect(gameDisplay,self.color,(self.x,self.y,self.xLen,self.yLen))
		self.edges = []
		self.start = s
		self.end = e
		self.name = n
	def draw(self,edgedraw):
		pg.draw.rect(gameDisplay,self.color,(self.x,self.y,self.xLen,self.yLen))
		if(edgedraw):
			for edge in self.edges:
				pg.draw.line(gameDisplay,(127,127,127),(self.x,self.y),(edge[1].x,edge[1].y))
def create_edges(nodes,lwall):
	for node in nodes:
		for c in nodes:
			collide = False
			temp = line_rect((node.x,node.y),(c.x,c.y),lwall)
			if(not temp):
				node.edges.append((node,c))
def player_edges(nodes,player,lwall):
	edges = []
	for node in nodes:
		if(not line_rect((node.x,node.y),(player.x,player.y),lwall)):
			edges.append(node.name)
	return edges

def create_dict(nodes,lwall):
	pos_edge = {}
	l = 0
	diff = .25
	h = int(7/.25)
	inc = 1
	for i in range(l,h,inc):
		for j in range(l,h,inc):
			pos_edge[(i*diff,j*diff)] = []
			for n in nodes:
				temp = line_rect(((i*diff+5)*50,(j*diff+5)*50),(n.x,n.y),lwall)
				if(not temp):
					pos_edge[(i*diff,j*diff)].append(n.name)
	values = []
	for k, v in pos_edge.items():
		must_insert = True
		for val in values:
			if val[0] == v:
				val[1].append(k)
				must_insert = False
				break
		if must_insert: values.append([v, [k]])
	#print(len(values)) #prints [[[10, 15], ['a', 'c']]]
	return pos_edge




class Walls:
	def __init__(self,info,ori):
		self.x = info[0]
		self.y = info[1]
		self.x1 = info[2]
		self.y1 = info[3]
		self.color = (0,0,255)
		self.drawR = None
		self.orientation = ori
	def draw(self):
		self.drawR = pg.draw.line(gameDisplay,self.color,(self.x,self.y),(self.x1,self.y1))

me = Player(False)
zomb = Player(True)

walls = []
for i in vWalls:
	walls.append(Walls(i,'v'))
for i in hWalls:
	walls.append(Walls(i,'h'))
nodes = onePass(pos)
create_edges(nodes,walls)
g = Graph(nodes)

dik_dic = {}
for n in nodes:
	for c in nodes:
		if(n.name != c.name):
			dik_dic[(n.name,c.name)] = g.pathfinder(n,c)
#f = create_dict(nodes,walls)
print(len(dik_dic))
#print(len(f))
while not end:
	for event in pg.event.get():
		if event.type == pg.QUIT:
			end = True
	gameDisplay.fill((0,0,0))
	keys = pg.key.get_pressed()
	me.move(keys)
	f = player_edges(nodes,me,walls)
	g = player_edges(nodes,zomb,walls)
	'''
	for i in f:
		pg.draw.line(gameDisplay,(0,127,127),(me.x,me.y),(nodes[i-1].x,nodes[i-1].y))
	for i in g:
		pg.draw.line(gameDisplay,(0,127,127),(zomb.x,zomb.y),(nodes[i-1].x,nodes[i-1].y))
	'''
	if(not line_rect((me.x,me.y),(zomb.x,zomb.y),walls)):
		pg.draw.line(gameDisplay,(127,127,127),(zomb.x,zomb.y),(me.x,me.y))
		a = math.atan2(me.y-zomb.y,me.x-zomb.x)
		zomb.x+=2*math.cos(a)
		zomb.y+=2*math.sin(a)
	else:
		min_dist = 200000
		vals = (0,0)
		for s in g:
			for e in f:
				if(s!=e):
					dist = dik_dic[s,e][1]+math.hypot(nodes[s-1].x-zomb.x,nodes[s-1].y-zomb.y)+math.hypot(nodes[e-1].x-me.x,nodes[e-1].y-me.y)
					if(dist<min_dist):
						vals = (s,e)
						min_dist=dist
		if(vals != (0,0)):
			pot = []
			index = 0
			path = dik_dic[vals][0]
			for z in path:
				pg.draw.rect(gameDisplay,(127,127,127),(nodes[z-1].x,nodes[z-1].y,5,5))
			for i in g:
				try:
					pot.append(path.index(i))
					print(path[path.index(i)])
				except ValueError:
					pass
			min_dist = 20000
			for i in pot:
				dist = math.hypot(nodes[path[i]-1].x-me.x,nodes[path[i]-1].y-me.y)
				'''
				if(path[i] != e):
					dist = dik_dic[(path[i],e)][1]
				else:
					dist = 0
				'''
				if(dist<min_dist):
					min_dist = dist
					index = i
			a = math.atan2(nodes[path[index]-1].y-zomb.y,nodes[path[index]-1].x-zomb.x)
			zomb.x+=2*math.cos(a)
			zomb.y+=2*math.sin(a)
		else:
			a = math.atan2(nodes[vals[0]-1].y-zomb.y,nodes[vals[0]-1].x-zomb.x)
			zomb.x+=2*math.cos(a)
			zomb.y+=2*math.sin(a)
	#print((me.x,me.y))
	#x_temp = (int(me.x/50-5)+int((me.x/50-5-int(me.x/50-5))*4)*.25)
	#y_temp = (int(me.y/50-5)+int((me.y/50-5-int(me.y/50-5))*4)*.25)
	#print(f[(x_temp,y_temp)])
	#for i in f[(x_temp,y_temp)]:
	#	pg.draw.line(gameDisplay,(0,127,127),((x_temp+5)*50,(y_temp+5)*50),(nodes[i-1].x,nodes[i-1].y))
	me.draw()
	zomb.draw()
	for i in range(0,len(walls)):
		walls[i].draw()
	'''
	for i in range(0,len(nodes)):
		nodes[i].draw(True)
	'''
	pg.display.update()
	clock.tick(60)
pg.quit()
quit()