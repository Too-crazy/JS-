/*Grid�����������ڣ�
1.�洢��ƹؿ�ʱ�Ĺؿ�����
2.
��Ϊ�ؿ�������������״�ģ���Ϸ��һ��Ԫ��ռ�����һ�����ӣ����Դ洢ʱ�����ݴ��һ�����顣
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
Grid.prototype.insertTile = function(x, y, tile) {
	this.cells[x][y] = tile;
};

Grid.prototype.removeTile = function(x, y, tile) {
	this.cells[x][y] = null;
};

// Call callback for every cell
Grid.prototype.eachCell = function(callback){
	for(var x=0; x<this.size.width; x++)
		for(var y=0; y<this.size.height; y++)
			callback(x, y, this.cells[x][y]);
}
