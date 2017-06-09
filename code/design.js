//工具函数，传入节点名称、属性和子节点,创建节点
function elt(name, attributes){
	var node = document.createElement(name);
	if(attributes){
		for(var attr in attributes)
			if(attributes.hasOwnProperty(attr))
				node.setAttribute(attr, attributes[attr]);
	}
	for(var i=2; i<arguments.length; i++){
		var child = arguments[i];
		if(typeof child == "string")
			child=document.createTextNode(child);
		node.appendChild(child);
	}
	return node;
}

var controls = Object.create(null);	//画布下方的控制区域对象
var tools = Object.create(null);	//控制区域中的工具对象
var scale = 20;
var paintrownum = 20;	//画布的行数
var paintcolnum = 40;	//画布的列数
var defaultElement = "wall";
var grid = new Grid({width:paintcolnum, height:paintrownum});
var gridSprites = document.createElement("img");
gridSprites.src = "img/sprites.png";
var spritesSeq = {"wall": 0, "lava": 1};

function drawBackground(paint){
	grid.eachCell(function(x, y, cell){
		if(cell){
			var tileX = spritesSeq[cell]*scale;
			paint.drawImage(gridSprites,
						tileX, 0, scale, scale,
						x*scale, y*scale, scale, scale);
		}
	});
}

function runAnimation(paint){
	var lastTime = null;
	function frame(time){
		if(lastTime != null){
			var timeStep = Math.min(time - lastTime, 100) / 1000;
			paint.fillStyle = "rgb(52, 166, 251)";
			paint.fillRect(0,0,
				paint.canvas.width, paint.canvas.height);
			drawBackground(paint);
		}
		lastTime = time;
		requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
}

function createPaint(parent){
	var paint = elt("table", {class: "background"});
	var paint = elt("canvas");
	paint.width = paintcolnum*scale;
	paint.height = paintrownum*scale;
	var cx = paint.getContext("2d");
	cx.elementType = defaultElement;	//给cx加一个新属性，用来区分绘画的元素
	/*for(var i=0; i<paintrownum; i++){
		var rowElt = paint.appendChild(elt("tr"));
		rowElt.style.height = scale + "px"
		for(var j=0; j<paintcolnum; j++){
			rowElt.appendChild(elt("td"));
		}
	}*/
	runAnimation(cx);
	var toolbar = elt("div", {class: "toolbar"});
	for(var name in controls)
		toolbar.appendChild(controls[name](cx));
	var panel = elt("div", {class: "drawpanel"}, paint);
	parent.appendChild(elt("div", null, panel, toolbar));
}

controls.tool = function(paint){
	var select = elt("select");
	for(var name in tools)
		select.appendChild(elt("option", null, name));
	paint.canvas.addEventListener("mousedown", function(event){
		if(event.which==1){
			tools[select.value](event, paint);
			event.preventDefault();
		}
	});
	return elt("span", null, "Tools: ", select);
}

//用于获得画布中的网格坐标
function getGridPos(event, element){
	var rect = element.getBoundingClientRect();
	var realX = Math.floor(event.clientX - rect.left);
	var realY = Math.floor(event.clientY - rect.top);
	return {x: Math.floor(realX/scale) ,
			y: Math.floor(realY/scale) };
}

//工具函数，设置鼠标拖动的按键监听
function trackDrag(onMove, onEnd, paint){
	function end(event){
		removeEventListener("mousemove", onMove);
		removeEventListener("mouseup", end);
		if(onEnd)
			onEnd(event);
	}
	if(paint)
		paint.addEventListener("mousemove", onMove);
	else
		addEventListener("mousemove", onMove);
	addEventListener("mouseup", end);
}

//用于画线
tools.Line = function(event, paint, onEnd){
	var pos = getGridPos(event, paint.canvas);
	grid.insertTile(pos, paint.elementType);
	trackDrag(function(event){
		pos = getGridPos(event, paint.canvas);
		grid.insertTile(pos, paint.elementType);
	}, onEnd);
}

//画矩形
tools.Rect = function(event, paint, onEnd){
	var pos = getGridPos(event, paint.canvas);
	var pos_start = pos;
	//paint.childNodes[pos.y].childNodes[pos.x].className = paint.elementType;
	var tileX = spritesSeq[paint.elementType]*scale;
	paint.drawImage(gridSprites,
					tileX, 0, scale, scale,
					pos.x*scale, pos.y*scale, scale, scale);
	trackDrag(function(event){
		pos = getGridPos(event, paint.canvas);
		paint.drawImage(gridSprites,
					tileX, 0, scale, scale,
					pos.x*scale, pos.y*scale, (pos_start.x-pos.x)*scale, (pos_start.y-pos.y)*scale);
	}, onEnd);
}

//调整位置
tools.Pick = function(event, paint, onEnd){
	var pos = getGridPos(event, paint.canvas);
	pickStyle = grid.getTile(pos);
	if(!pickStyle)
		return;
	var pickout = elt("div", {style: "height:20px; width:20px; overflow:hidden; position:absolute"}
						, elt("img", {src: "img/sprites.png", style:"position:absolute"}));
	pickout.childNodes[0].style.left=-spritesSeq[pickStyle]*scale + "px";
	document.body.appendChild(pickout);
	grid.removeTile(pos);
	var rect = paint.canvas.getBoundingClientRect();
	pickout.style.left = pos.x*scale+rect.left + "px";
	pickout.style.top = pos.y*scale+rect.top + "px";
	trackDrag(function(event){
		pos = getGridPos(event, paint.canvas);
		pickout.style.left = pos.x*scale+rect.left + "px";
		pickout.style.top = pos.y*scale+rect.top + "px";
	}, function(event){
		grid.insertTile(pos, pickStyle);
		document.body.removeChild(pickout);
	}, paint.canvas);
}

controls.element = function(paint){
	var select = elt("select");
	select.appendChild(elt("option", null, paint.elementType));
	["lava"].forEach(function(element){
		select.appendChild(elt("option", null, element));
	});
	select.addEventListener("change", function(){
		paint.elementType = select.value;
	});
	return elt("span", null, "Elements: ", select);
}

controls.clear = function(paint){
	var button = elt("button");
	button.textContent = "clear";
	button.addEventListener("click", function(){
		for(var i=0; i<paintrownum; i++){
			for(var j=0; j<paintcolnum; j++){
				//paint.childNodes[i].childNodes[j].className = null;
				paint.className = null;
			}
		}
	});
	return button;
}


