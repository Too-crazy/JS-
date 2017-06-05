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

function createPaint(parent){
	var table = elt("table", {class: "background"});
	table.style.width = paintcolnum*scale + "px";
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

function getGridPos(event, element){
	var rect = element.getBoundingClientRect();
	var realX = Math.floor(event.clientX - rect.left);
	var realY = Math.floor(event.clientY - rect.top);
	return {x: Math.floor(realX/scale) ,
			y: Math.floor(realY/scale) };
}

tools.Point = function(event, table, onEnd){
	var pos = getGridPos(event, table);
	console.log(pos.x + " " + pos.y);
	table.childNodes[pos.y].childNodes[pos.x].className = "moon";
}
