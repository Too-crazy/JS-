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
var elements = Object.create(null);	//控制区域中的选择元素对象
var scale = 20;
var paintrownum = 20;	//画布的行数
var paintcolnum = 40;	//画布的列数
//var defaultElement = "wall";
var grid = new Grid({width:paintcolnum, height:paintrownum});
var gridSprites = document.createElement("img");
var manipulateSprites = document.createElement("img");
var bgSprite = ["wall", "lava"];				//背景元素数组
var activeSprite = ["type1", "type2"];			//活动元素数组
var manipulateSprite = ["player1", "player2"];	//操控元素数组
gridSprites.src = "img/sprites.png";
var spritesSeq = {"wall": 0, "lava": 1};
var canvasEvents = [];


function drawBackground(paint){
	grid.eachCell(function(x, y, cell){
		if(cell){
			var tileX = spritesSeq[cell]*scale;
			paint.drawImage(gridSprites,
						tileX, 0, scale, scale,
						x*scale, y*scale, scale, scale);
		}
	});
	manipulateSprites.src = "img/"+grid.charatype+".png";
	paint.drawImage(manipulateSprites,
						0, 0, 24, 30,
						grid.startpos.x*scale, (grid.startpos.y+1)*scale-30, 24, 30);
}

function runAnimation(paint){
	var lastTime = null;
	function frame(time){
		if(lastTime != null){
			var timeStep = Math.min(time - lastTime, 100) / 1000;
			paint.fillStyle = "rgb(155, 166, 251)";
			paint.fillRect(0,0,
				paint.canvas.width, paint.canvas.height);
			drawBackground(paint);
		}
		lastTime = time;
		requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
}

//启动函数
function createPaint(parent){
	var paint = elt("canvas");
	paint.width = paintcolnum*scale;
	paint.height = paintrownum*scale;
	var inputw = elt("input", {class: "settinginput"});
	inputw.value = paintcolnum;
	var inputh = elt("input", {class: "settinginput"});
	inputh.value = paintrownum;
	var ok = elt("button");
	ok.textContent = "OK";
	ok.addEventListener("click", function(){

		paint.width=inputw.value * scale;
		paint.height=inputh.value * scale;
		grid.resize({width:paint.width, height:paint.height});
	});
	var reset = elt("button");
	reset.textContent = "reset";
	reset.addEventListener("click", function(){
		inputw.value = paintcolnum;
		inputh.value = paintrownum;
		paint.width = paintcolnum*scale;
		paint.height = paintrownum*scale;
	});
	var canvasset = elt("div", {class: "setting"},
		 elt("span", null, "width: ", inputw),
		 elt("span", null, "height: ", inputh), ok, reset);
	var cx = paint.getContext("2d");
	cx.elementType = null;	//给cx加一个新属性，用来区分绘画的元素
	runAnimation(cx);
	var toolbar = elt("div", {class: "toolbar"});
	for(var name in controls)
		toolbar.appendChild(controls[name](cx));
	var panel = elt("div", {class: "drawpanel"}, paint);
	parent.appendChild(elt("div",{id:"mainplain"}, canvasset, panel, toolbar));
}

controls.tool = function(paint){
	var select = elt("select");
	for(var name in tools)
		select.appendChild(elt("option", null, name));
	//画布上的tools按键监听
	var tooldown = function(event){
		if(event.which==1){
			tools[select.value](event, paint);
			event.preventDefault();
		}
	}
	canvasEvents.push(tooldown);
	paint.canvas.addEventListener("mousedown", tooldown);
	return elt("span", null, "Tools: ", select);
}

controls.element = function(paint){
	var select = elt("select");
	var span = elt("span", null, "Elements: ", select);
	for(var name in elements)
		select.appendChild(elt("option", null, name));
	var detail = elements[select.value](paint);
	span.appendChild(detail);
	select.addEventListener("change", function(){
		span.removeChild(detail);
		paint.canvas.removeEventListener("mousedown", canvasEvents[1]);
		paint.canvas.addEventListener("mousedown", canvasEvents[0]);
		detail = elements[select.value](paint);
		span.appendChild(detail);
	});
	return span;
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
	grid.insertTile(pos_start, paint.elementType);
	trackDrag(function(event){
		
	}, function(event){
		pos = getGridPos(event, paint.canvas);
		for(var i=pos_start.x; i<=pos.x; i++)
			for(var j=pos_start.y; j<=pos.y; j++)
				grid.insertTile({x:i, y:j}, paint.elementType);
	});
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
	pickout.style.left = pos.x*scale+rect.left+window.scrollX + "px";
	pickout.style.top = pos.y*scale+rect.top+window.scrollY + "px";
	trackDrag(function(event){
		pos = getGridPos(event, paint.canvas);
		pickout.style.left = pos.x*scale+rect.left+window.scrollX + "px";
		pickout.style.top = pos.y*scale+rect.top+window.scrollY + "px";
	}, function(event){
		grid.insertTile(pos, pickStyle);
		document.body.removeChild(pickout);
	}, paint.canvas);
}

elements.bgElement = function(paint){
	var select = elt("select");
	paint.elementType = bgSprite[0];
	bgSprite.forEach(function(element){
		select.appendChild(elt("option", null, element));
	});
	select.addEventListener("change", function(){
		paint.elementType = select.value;
	});
	return elt("span", null, "Background Sprites: ", select);
}

elements.activeElement = function(paint){
	var select = elt("select");
	paint.elementType = activeSprite[0];
	activeSprite.forEach(function(element){
		select.appendChild(elt("option", null, element));
	});
	select.addEventListener("change", function(){
		paint.elementType = select.value;
	});
	return elt("span", null, "Active Sprites: ", select);
}

elements.playerElement = function(paint){
	var select = elt("select");
	paint.elementType = manipulateSprite[0];
	manipulateSprite.forEach(function(element){
		select.appendChild(elt("option", null, element));
	});
	paint.canvas.removeEventListener("mousedown", canvasEvents[0]);
	var playerdown = function(event){
		if(event.which==1){
			grid.startpos = getGridPos(event, paint.canvas);
			grid.charatype = select.value;
			event.preventDefault();
		}
	}
	canvasEvents.push(playerdown);
	paint.canvas.addEventListener("mousedown", playerdown);
	return elt("span", null, "Player Sprites: ", select);
}

controls.clear = function(paint){
	var button = elt("button");
	button.textContent = "clear";
	button.addEventListener("click", function(){
		grid.cells = grid.empty();
	});
	return button;
}

controls.gametest = function(paint){
	var button = elt("button");
	button.textContent = "test";
	button.addEventListener("click", function(){
		document.getElementById("main-container").removeChild(mainplain);
		//runGame(grids);
	});
	return button;
}
