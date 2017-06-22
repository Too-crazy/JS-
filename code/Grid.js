/*Grid对象类型用于：
存储设计关卡时的关卡内容
因为关卡的内容是网格状的，游戏中一个元素占网格的一个格子，所以存储时将内容存成一个数组。
*/
function Grid(size, previousState, charactor){
	this.size = size;
	this.cells = previousState ? this.fromState(previousState) : this.empty();
	//角色的起始位置
	this.startpos = charactor ? 
		charactor.pos : new Vector(Math.floor(this.size.width/3),
									Math.floor(this.size.height/2));
	//角色类型
	this.charatype = charactor ? charactor.type : "player1";
}

// Build a grid of the specified size
Grid.prototype.empty = function () {
	var cells = [];
	for (var x = 0; x < this.size.width; x++) {
		var row = cells[x] = [];
		for (var y = 0; y < this.size.height; y++) {
			row.push(" ");
		}
	}
	return cells;
};

Grid.prototype.fromState = function (state) {
    var cells = [];

    for (var x = 0; x < this.size.width; x++) {
        var row = cells[x] = [];

        for (var y = 0; y < this.size.height; y++) {
            var tile = state[x][y];
            row.push(tile ? tile: null);
        }
    }

    return cells;
};

//网格对象重新调整大小，仅仅改变size变量可能会出错
Grid.prototype.resize = function(size){
	if(size.width > this.size.width)
		for (var x = this.size.width; x < size.width; x++) {
			this.cells[x] = [];
		}
	this.size = size;	
}

Grid.prototype.getTile = function(pos){
	return this.cells[pos.x][pos.y];
}
// Inserts a tile at its position
Grid.prototype.insertTile = function(pos, tile) {
	this.cells[pos.x][pos.y] = tile;
};

Grid.prototype.removeTile = function(pos) {
	this.cells[pos.x][pos.y] = null;
};

// Call callback for every cell
Grid.prototype.eachCell = function(callback){
	for(var x=0; x<this.size.width; x++)
		for(var y=0; y<this.size.height; y++)
			callback(x, y, this.cells[x][y]);
}
