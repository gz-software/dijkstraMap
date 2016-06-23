var pointList = Array();
var linkList = Array();
var circles = [];
var bgcolor;
//自动刷新
function reflesh() {
	window.location.href = window.location.href;
}
function getCo(e) {
	var x = e.clientX;
	var y = e.clientY;
	document.getElementById("xycoordiv").innerHTML = " &nbsp;&nbsp;current：x" + x + ' y' + y;
}
//删除左右两端的空格
function trim(str) {
	return str.replace(/(^\s*)|(\s*$)/g, "");
}
function clearCo() {
	document.getElementById("xycoordiv").innerHTML = "";
} //获取鼠标的坐标

// 根据pointId 从pointList中获得point对象
function getPointById(pointId) {
	for (var i = 0; i < pointList.length; i++) {
		var curPoint = pointList[i];
		if (curPoint.id == pointId) {
			return curPoint;
		} //end if
	} //end for
} //end func

// 传入两个point对象 计算出cost
function getCost(point1, point2) {
	var x1 = point1.x;
	var x2 = point2.x;
	var y1 = point1.y;
	var y2 = point2.y;
	var cost = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
	return parseInt(cost);
}

// Point类
function Point(id, name, x, y, type) {
	this.id = id;
	this.name = name;
	this.x = x;
	this.y = y;
	this.type = type;
}
// Link类
function Link(point1, point2, cost) {
	this.point1 = point1;
	this.point2 = point2;
	this.cost = cost;
}

$(document).ready(function () {
	var myCanvas = document.getElementById("myCanvas");
	var context = myCanvas.getContext("2d");

	//画坐标点
	var draw = function (context, x, y, fillcolor, radius, linewidth, strokestyle, fontcolor, textalign, fonttype, filltext) {
		context.beginPath();
		context.arc(x, y, radius, 0, 2 * Math.PI, false);
		context.fillStyle = fillcolor;
		context.fill();
		context.lineWidth = linewidth;
		context.strokeStyle = strokestyle;
		context.stroke();

		context.fillStyle = fontcolor;
		context.textAlign = textalign;
		context.textBaseline = "bottom";
		context.font = fonttype;
		context.fillText(filltext, x+24, y-7);//(文本,偏移X,Y)
	};

	var Circle = function (x, y, radius) {
		this.left = x - radius;
		this.top = y - radius;
		this.right = x + radius;
		this.bottom = y + radius;
	};
	
	var drawCircle = function (context, x, y, fillcolor, radius, linewidth, strokestyle, fontcolor, textalign, fonttype, filltext, circles) {
		draw(context, x, y, fillcolor, radius, linewidth, strokestyle, fontcolor, textalign, fonttype, filltext);
		var circle = new Circle(x, y, radius);
		circles.push(circle);
	};


	var num;
	var numlist = Array();
	var pic1 = new Image();
	pic1.src = "./images/A.png";
	var pic2 = new Image();
	pic2.src = "./images/B.png";
	//点击坐标出现提示图片
	$('#myCanvas').click(function (e) {
		var clickedX = e.pageX - this.offsetLeft;
		var clickedY = e.pageY - this.offsetTop;
		for (var i = 0; i < circles.length; i++) {
			//context.clearRect(590,224, 618, 254) 清除画布context.clearRect(x1,y1, x2, y)
			if (clickedX < circles[i].right && clickedX > circles[i].left && clickedY > circles[i].top && clickedY < circles[i].bottom) {
				num = i + 1;
				numlist.push(num);

				for (var k = 1; k < numlist.length + 1; k++) {
					context.drawImage(eval('pic' + k), clickedX-15, clickedY-25, 24, 24);
				}
			}
		}

		p1 = numlist[0];
		p2 = numlist[1];
		linkToBest(p1, p2);
		numlist = Array();
	   // setTimeout('reflesh()', 8000);
	});
	//连线
	function lineTo(x1, y1, x2, y2) {
		context.beginPath();
		context.strokeStyle='#666666';
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
		context.stroke(); //画线框    
	}
	//利用最优路径返回数据开始画图
	function linkToBest(p1, p2) {
		var a = findPath(p1, p2).toString();
		// alert(a.split(">")[0]);
		var x1, x2, y1, y2, t;
		var plist = Array();
		var alist = Array();
		var b = Array();
		//a.split(">")会把拿的数据拆成N个CHAR类型,整合起来获取需要的数据
		for (var i = 0; i < a.split(">").length; i++) {
			alist.push(a.split(">")[i]);
			b.push(alist[i].slice(0, 2).trim());
			//alert(b[i]);
			x2 = getPointById(b[i]).x;
			y2 = getPointById(b[i]).y;
			t = Array("" + x2, y2 + "");
			plist.push(t);
		}
		x1 = getPointById(b[0]).x;
		y1 = getPointById(b[0]).y;
		context.strokeStyle = 'red'; //线条颜色：绿色
		context.lineWidth = 5; //设置线宽
		context.beginPath();
		context.moveTo(x1, y1);
		for (var k = 0; k < plist.length; k++) {
			context.lineTo(plist[k][0], plist[k][1]);
		}
		context.stroke();
	}
   // var msg;

	$.get('./data/map.xml', function (d) {
		//获取坐标
		$(d).find('point').each(function () { // 转换xml的point记录为point对象并添加到pointList
			var $point = $(this);
			var id = $point.attr("id");
			var name = $point.attr("name");
			var x = parseInt($point.attr("x"));
			var y = parseInt($point.attr("y"));
			var type = $point.attr("type");
			var point = new Point(id, name, x, y, type);
			pointList.push(point);

		});
	 
		//获取可联通路径信息
		$(d).find('link').each(function () {
			var $link = $(this);
			var pid1 = $link.attr("point1");
			var pid2 = $link.attr("point2");
			var point1 = getPointById(pid1);
			var point2 = getPointById(pid2);
			var cost = getCost(point1, point2);
			var link = new Link(point1, point2, cost);
			linkList.push(link);
		});
		//点与点之间连线
		for (var i = 0; i < linkList.length; i++) {
			var x1 = linkList[i].point1.x;
			var y1 = linkList[i].point1.y;
			var x2 = linkList[i].point2.x;
			var y2 = linkList[i].point2.y;
			lineTo(x1, y1, x2, y2);
		}

		//获取pointList的记录在页面画圆
		for (var i = 0; i < pointList.length; i++) {
			if (pointList[i].type == "1") {
				bgcolor = "red";
			} else if (pointList[i].type == "2") {
				bgcolor = "green";
			} else {
				bgcolor = "yellow";
			}
			var px = pointList[i].x;
			var py = pointList[i].y;
			drawCircle(context, px, py, bgcolor, 8, 3, "#003300", "black", "center", "bold 10px Arial", pointList[i].name, circles);

		}


		// 把linkList写进Dijkstra
		for (var i = 0; i < linkList.length; i++) {
			var curLink = linkList[i];
			var point1 = curLink.point1;
			var point2 = curLink.point2;
			link(curLink.point1.id, curLink.point2.id, curLink.cost);
		} //end for


  
	});
	$("#btnClear").click(function () {
		window.location.href = window.location.href;
	});
});
     