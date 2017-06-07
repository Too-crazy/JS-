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
var defaultElement = "g";

function createPaint(parent){
	var table = elt("table", {class: "background"});
	table.style.width = paintcolnum*scale + "px";
	table.elementType = defaultElement;	//给table加一个新属性，用来区分绘画的元素
	for(var i=0; i<paintrownum; i++){
		var rowElt = table.appendChild(elt("tr"));
		rowElt.style.height = scale + "px"
		for(var j=0; j<paintcolnum; j++){
			rowElt.appendChild(elt("td"));
		}
	}
	var toolbar = elt("div", {class: "toolbar"});
	for(var name in controls)
		toolbar.appendChild(controls[name](table));
	var panel = elt("div", {class: "drawpanel"}, table);
	parent.appendChild(elt("div", null, panel, toolbar));
}

controls.tool = function(table){
	var select = elt("select");
	for(var name in tools)
		select.appendChild(elt("option", null, name));
	table.addEventListener("mousedown", function(event){
		if(event.which==1){
			tools[select.value](event, table);
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
function trackDrag(onMove, onEnd, table){
	function end(event){
		removeEventListener("mousemove", onMove);
		removeEventListener("mouseup", end);
		if(onEnd)
			onEnd(event);
	}
	if(table)
		table.addEventListener("mousemove", onMove);
	else
		addEventListener("mousemove", onMove);
	addEventListener("mouseup", end);
}

//用于画线
tools.Line = function(event, table, onEnd){
	var pos = getGridPos(event, table);
	table.childNodes[pos.y].childNodes[pos.x].className = table.elementType;
	trackDrag(function(event){
		pos = getGridPos(event, table);
		//console.log(pos.x + " " + pos.y);
		if(pos.x>=0 && pos.y>=0 && pos.y<paintrownum && pos.x<paintcolnum)
			table.childNodes[pos.y].childNodes[pos.x].className = table.elementType;
	}, onEnd);
}

//画矩形
tools.Rect = function(event, table, onEnd){
	var pos = getGridPos(event, table);
	var pos_start = pos;
	table.childNodes[pos.y].childNodes[pos.x].className = table.elementType;
	trackDrag(function(event){
		pos = getGridPos(event, table);
		if(pos.x>=0 && pos.y>=0 && pos.y<paintrownum && pos.x<paintcolnum){
			for(var i=0; i<paintrownum; i++){
				for(var j=0; j<paintcolnum; j++){
					if(i>=pos_start.y && j>=pos_start.x && i<=pos.y && j<=pos.x)
						table.childNodes[i].childNodes[j].className = table.elementType;
					//else
						//table.childNodes[i].childNodes[j].className = "background";
				}
			}
		}
	}, onEnd, table);
}

//调整位置
tools.Pick = function(event, table, onEnd){
	var pos = getGridPos(event, table);
	var pickstyle = table.childNodes[pos.y].childNodes[pos.x].className;
	table.childNodes[pos.y].childNodes[pos.x].className=null;
	var pickout = elt("div", {class: pickstyle, style: "height:20px; width:20px; position:absolute"});
	table.appendChild(pickout);
	var rect = table.getBoundingClientRect();
	pickout.style.left = pos.x*scale+rect.left + "px";
	pickout.style.top = pos.y*scale+rect.top + "px";
	trackDrag(function(event){
		pos = getGridPos(event, table);
		pickout.style.left = pos.x*scale+rect.left + "px";
		pickout.style.top = pos.y*scale+rect.top + "px";
	}, function(event){
		table.childNodes[pos.y].childNodes[pos.x].className=pickstyle;
		table.removeChild(pickout);
	}, table);
}

controls.element = function(table){
	var select = elt("select");
	select.appendChild(elt("option", null, table.elementType));
	["r", "b", "eraser"].forEach(function(element){
		select.appendChild(elt("option", null, element));
	});
	select.addEventListener("change", function(){
		table.elementType = select.value;
	});
	return elt("span", null, "Elements: ", select);
}

controls.clear = function(table){
	var button = elt("button");
	button.textContent = "clear";
	button.addEventListener("click", function(){
		for(var i=0; i<paintrownum; i++){
			for(var j=0; j<paintcolnum; j++){
				table.childNodes[i].childNodes[j].className = null;
			}
		}
	});
	return button;
}


