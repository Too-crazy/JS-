/*Grid�����������ڣ�
�洢��ƹؿ�ʱ�Ĺؿ�����
��Ϊ�ؿ�������������״�ģ���Ϸ��һ��Ԫ��ռ�����һ�����ӣ����Դ洢ʱ�����ݴ��һ�����顣
*/
function Grid(size, previousState, charactor){
	this.size = size;
	this.cells = previousState ? this.fromState(previousState) : this.empty();
	//��ɫ����ʼλ��
	this.startpos = charactor ? charactor.pos : {x:0, y:0};
	//��ɫ����
	this.charatype = charactor ? charactor.type : "player1";
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
