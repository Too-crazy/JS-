/*Grid对象类型用于：
1.存储设计关卡时的关卡内容
2.
因为关卡的内容是网格状的，游戏中一个元素占网格的一个格子，所以存储时将内容存成一个数组。
*/
function Grid(size, previousState){
	this.size = size;
	this.cells = previousState ? this.fromState(previousState) : this.empty();
}

// Build a grid of the specified size
Grid.prototype.empty = function () {
	var cells = [];
	for (var x = 0; x < this.size.width; x++) {
		var row = cells[x] = [];
		for (var y = 0; y < this.size.heght; y++) {
			row.push(null);
		}
	}
	return cells;
};

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
