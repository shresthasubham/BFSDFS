const dcanvas = document.getElementById("myCanvas2");
const dcontext = dcanvas.getContext("2d");


const dscaleSz = 10;
const WIDTH2= dcanvas.width/dscaleSz;
const HEIGHT2 = dcanvas.height/dscaleSz;
dcontext.scale(dscaleSz, dscaleSz);
dcontext.fillStyle = "#000";
dcontext.fillRect(0,0, WIDTH2, HEIGHT2);



const dcolor = {
	blocked: "grey",
	terminal: "red",
	open: "white",
	explored: "#b1cbd5",
	dpath: "#ee7752",
}

const dcolorCoding = {
	blocked: 0,
	terminal: 1,
	open: 2,
	explored: 3,
	dpath: 4,
}


const dcolorCode = [
		dcolor.blocked,
		dcolor.terminal,
		dcolor.open,
		dcolor.explored,
		dcolor.dpath,
	]


function dcreateMatrix(w, h, value) {
	dmatrix = [];
	while (h--) 
		dmatrix.push(new Array(w).fill(value));
	return dmatrix;
}

function ddrawMatrix(dmatrix) {
	dmatrix.forEach((drow, y) => {
		drow.forEach((value, x) => {
			dcontext.fillStyle = dcolorCode[value];
			dcontext.fillRect(x,y,1,1);
		});	
	});
}

function dgenerateMap(w, h) {
	dmatrix = dcreateMatrix(w, h, dcolorCoding.open);
	let dsy = 0, dsx = 0;
	let dex = 0, dey = 0;
	while (dsy === 0 || dsy === dmatrix.length-1)
		dsy = HEIGHT2 * Math.random() | 0;
	while (dsx === 0 || dsx === dmatrix[0].length-1)
		dsx = WIDTH2 * Math.random() | 0;
	while (dey === 0 || dey === dmatrix.length-1)
		dey = HEIGHT2 * Math.random() | 0;
	while (dex === 0 || dex === dmatrix[0].length-1 || (dex === dsx && dey === dsy))
		dex = WIDTH2 * Math.random() | 0;
	dmap.dstart_x = dsx;
	dmap.dstart_y = dsy;
	dmap.dend_x = dex;
	dmap.dend_y = dey;

	dmatrix[dsy][dsx] = dmatrix[dey][dex] = dcolorCoding.terminal;
	return dmatrix;
}

function dgenerateObstacles(dmatrix) {
	// blocking the border
	for (let i=0; i<dmatrix[0].length; i++) {
		dmatrix[0][i] = dcolorCoding.blocked;
		dmatrix[dmatrix.length-1][i] = dcolorCoding.blocked;
	}
	for (let i=0; i<dmatrix.length; i++) {
		dmatrix[i][0] = dcolorCoding.blocked;
		dmatrix[i][dmatrix[0].length-1] = dcolorCoding.blocked;
	}

	// 25% obstacles
	let dcount = (WIDTH2/2 * HEIGHT2/2) | 0; // bitmasking for floor
	while (dcount--) {
		let x = 0, y = 0;
		while (dmatrix[y][x] !== dcolorCoding.open) {
			x = WIDTH2* Math.random() | 0;
			y = HEIGHT2 * Math.random() | 0;
		}
		dmatrix[y][x] = dcolorCoding.blocked;
	}

	return dmatrix;
}

var dmap = {
	dstart_x: 0,
	dstart_y: 0,
	dend_x: 0,
	dend_y: 0,
}

//------------------ Queue Data Structure -----------------------------------
class stack{
    constructor() {
        this._size = 0;
        this.arr = [];
    }


empty (){
	if (this._size > 0)
		return false;
	return true;
}

push(x) {
	this.arr.push(x);
	this._size++;
}

pop2 () {
	if (this._size > 0) 
    
		this.arr.pop();
	else
		console.log("ERR: cannot pop from an empty stack");
	this._size--;
}

front() {
	if (this._size > 0)
		return this.arr[this.arr.length-1];
	else 
		console.log("ERR: no front in empty stack");
}
}
// -------------------------------------------------------------------------------


var darena = dgenerateMap(WIDTH2, HEIGHT2);
darena = dgenerateObstacles(darena);
ddrawMatrix(darena);

//  BFS

var q = new stack();
q.push({x: dmap.dstart_x, y: dmap.dstart_y});

var dpath = dcreateMatrix(WIDTH2, HEIGHT2, {x: 0, y:0});


function ddisplayPath() {
	let dnd = dpath[dmap.dend_y][dmap.dend_x];
	if (dnd.x === 0 && dnd.y === 0)
		return;

	while (!(dnd.x === dmap.dstart_x && dnd.y === dmap.dstart_y)) {
		darena[dnd.y][dnd.x] = dcolorCoding.dpath;
		ddrawMatrix(darena);
		dnd= dpath[dnd.y][dnd.x];
	}
}



function dupdate(time = 1000000) {
	ddrawMatrix(darena);

	let dnd = q.front();
	
	let x = dnd.x;
    let y = dnd.y;
	q.pop2();
	for (let dxdir=-1; dxdir<=1; dxdir++) 
		for (let dydir=-1; dydir<=1; dydir++) {
			if (Math.abs(dxdir) === Math.abs(dydir)) continue;
			if (darena[y+dydir][x+dxdir] === dcolorCoding.open) {
				darena[y+dydir][x+dxdir] = dcolorCoding.explored;
				dpath[y+dydir][x+dxdir] = {x: x, y: y};
				q.push({x: x+dxdir, y: y+dydir});
			} 
			else if (y+dydir === dmap.dend_y && x+dxdir === dmap.dend_x) {
					console.log("found Terminal");
					dpath[y+dydir][x+dxdir] = {x: x, y: y};
					ddisplayPath();
					return;
				}
		}

	if (!q.empty())
		requestAnimationFrame(dupdate);
	else
		ddisplayPath();
}

dupdate();

