//读取关卡
function Level(plan){
	this.width = plan[0].length;//地图宽度
	this.height = plan.length;//地图高度
	this.grid = [];//网格
	this.actors = [];//活动元素
	for (var y = 0; y < this.height; y++) {
		var line = plan[y], gridLine = [];
		for (var x = 0; x < this.width; x++) {
		  var ch = line[x], fieldType = null;
		  var Actor = actorChars[ch];
		  if (Actor)
			this.actors.push(new Actor(new Vector(x, y), ch));
		  else if (ch == "x")
			fieldType = "wall";
		  else if (ch == "!")
			fieldType = "lava";
		  gridLine.push(fieldType);
		}
		this.grid.push(gridLine);
	}
	
	
	
}

//元素的位置以及尺寸
function Vector(x, y) {
  this.x = x; this.y = y;
}
Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};
Vector.prototype.times = function(factor) {
  return new Vector(this.x * factor, this.y * factor);
};

//关联活动元素
var actorChars = {
  "@": Player,
  "o": Coin,
  "=": Lava, "|": Lava
};

//生成玩家类型
function Player(pos) {
  this.pos = pos.plus(new Vector(0, -0.5));
  this.size = new Vector(0.8, 1.5);
  this.speed = new Vector(0, 0);
}
Player.prototype.type = "player";

//熔浆对象
function Lava(pos, ch) {
  this.pos = pos;
  this.size = new Vector(1, 1);
  if (ch == "=") {
    this.speed = new Vector(2, 0);
  } else if (ch == "|") {
    this.speed = new Vector(0, 2);
	this.repeatPos = pos;
  }
}
Lava.prototype.type = "lava";

//金币对象
function Coin(pos) {
  this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
  this.size = new Vector(0.6, 0.6);
  this.wobble = Math.random() * Math.PI * 2;
}
Coin.prototype.type = "coin";


function runGame(){
	
}