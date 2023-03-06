const bcanvas = document.getElementById("myCanvas");
const bcontext = bcanvas.getContext("2d");



const scaleSz = 10;
const WIDTH = bcanvas.width/scaleSz;
const HEIGHT = bcanvas.height/scaleSz;
bcontext.scale(scaleSz, scaleSz);
bcontext.fillStyle = "#000";
bcontext.fillRect(0,0, WIDTH, HEIGHT);




const color = {
	blocked: "black",
	terminal: "red",
	open: "white",
	explored: "#ee7752",
	path: "red",
}

const colorCoding = {
	blocked: 0,
	terminal: 1,
	open: 2,
	explored: 3,
	path: 4,
}


const colorCode = [
		color.blocked,
		color.terminal,
		color.open,
		color.explored,
		color.path,
	]


function createMatrix(w, h, value) {
	matrix = [];
	while (h--) 
		matrix.push(new Array(w).fill(value));
	return matrix;
}

function drawMatrix(matrix) {
	matrix.forEach((row, y) => {
		row.forEach((value, x) => {
			bcontext.fillStyle = colorCode[value];
			bcontext.fillRect(x,y,1,1);
		});	
	});
}

function generateMap(w, h) {
	matrix = createMatrix(w, h, colorCoding.open);
	let sy = 0, sx = 0;
	let ex = 0, ey = 0;
	while (sy === 0 || sy === matrix.length-1)
		sy = HEIGHT * Math.random() | 0;
	while (sx === 0 || sx === matrix[0].length-1)
		sx = WIDTH * Math.random() | 0;
	while (ey === 0 || ey === matrix.length-1)
		ey = HEIGHT * Math.random() | 0;
	while (ex === 0 || ex === matrix[0].length-1 || (ex === sx && ey === sy))
		ex = WIDTH * Math.random() | 0;
	map.start_x = sx;
	map.start_y = sy;
	map.end_x = ex;
	map.end_y = ey;

	matrix[sy][sx] = matrix[ey][ex] = colorCoding.terminal;
	return matrix;
}

function generateObstacles(matrix) {
	// blocking the border
	for (let i=0; i<matrix[0].length; i++) {
		matrix[0][i] = colorCoding.blocked;
		matrix[matrix.length-1][i] = colorCoding.blocked;
	}
	for (let i=0; i<matrix.length; i++) {
		matrix[i][0] = colorCoding.blocked;
		matrix[i][matrix[0].length-1] = colorCoding.blocked;
	}

	// 25% obstacles
	let count = (WIDTH/2 * HEIGHT/2) | 0; // bitmasking for floor
	while (count--) {
		let x = 0, y = 0;
		while (matrix[y][x] !== colorCoding.open) {
			x = WIDTH * Math.random() | 0;
			y = HEIGHT * Math.random() | 0;
		}
		matrix[y][x] = colorCoding.blocked;
	}

	return matrix;
}

var map = {
	start_x: 0,
	start_y: 0,
	end_x: 0,
	end_y: 0,
}

//------------------ Queue Data Structure -----------------------------------
class Queue {
	constructor() {
		this._size = 0;
		this.arr = [];
	}
	empty() {
		if (this._size > 0)
			return false;
		return true;
	}
	push(x) {
		this.arr.push(x);
		this._size++;
	}
	pop1() {
		if (this._size > 0)
			this.arr.splice(0, 1);

		else
			console.log("ERR: cannot pop from an empty queue");
		this._size--;
	}
	front() {
		if (this._size > 0){
		
			return this.arr[0];
		}
		else
			console.log("ERR: no front in empty queue");
	}
}





// -------------------------------------------------------------------------------


var arena = generateMap(WIDTH, HEIGHT);
arena = generateObstacles(arena);
drawMatrix(arena);

//  BFS

var p= new Queue();
p.push({x: map.start_x, y: map.start_y});

var path = createMatrix(WIDTH, HEIGHT, {x: 0, y:0});


function displayPath() {
	let nd = path[map.end_y][map.end_x];
	if (nd.x === 0 && nd.y === 0)
		return;

	while (!(nd.x === map.start_x && nd.y === map.start_y)) {
		arena[nd.y][nd.x] = colorCoding.path;
		drawMatrix(arena);
		nd = path[nd.y][nd.x];
	}
}



function update(time = 5) {
	drawMatrix(arena);

	let nd = p.front();
	let y = nd.y;
	let x = nd.x;
	p.pop1();
	for (let xdir=-1; xdir<=1; xdir++) 
		for (let ydir=-1; ydir<=1; ydir++) {
			if (Math.abs(xdir) === Math.abs(ydir)) continue;
			if (arena[y+ydir][x+xdir] === colorCoding.open) {
				arena[y+ydir][x+xdir] = colorCoding.explored;
				path[y+ydir][x+xdir] = {x: x, y: y};
				p.push({x: x+xdir, y: y+ydir});
			} 
			else if (y+ydir === map.end_y && x+xdir === map.end_x) {
					console.log("found Terminal");
					path[y+ydir][x+xdir] = {x: x, y: y};
					displayPath();
					return;
				}
		}

	if (!p.empty())
		requestAnimationFrame(update);
	else
		displayPath();
}

update();


