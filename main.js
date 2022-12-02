let attachScript;
let pick;
let canvasData;
let context;

let addPoint;
let removePoint;
let printPoints;
let onPointClicked;
let onRightClick;
let onMouseMove;
let onMouseUp;

let savePointsToFile;

let mouseXInfoSpan;

let adjustPoints;

let invertPoints;

let mouseHeld = false;
let points = [];

attachScript = () => {
	mouseXInfoSpan = document.getElementById('mouse-x-sidebar');
	mouseYInfoSpan = document.getElementById('mouse-y-sidebar');

	canvasData = document.getElementById('canvas_display');
	context = canvasData.getContext('2d');

	canvasData.addEventListener('mousedown', (e) => (mouseHeld = true));
	canvasData.addEventListener('mouseup', (e) => onMouseUp(e));
	//canvasData.addEventListener("click", (event) => pick(event));
	canvasData.addEventListener('mousemove', (e) => onMouseMove(e));
	canvasData.addEventListener('contextmenu', (event) => onRightClick(event));
};

savePointsToFile = () => {};

onMouseMove = (event) => {
	const x = parseInt(mouseXInfoSpan.innerHTML);
	const y = parseInt(mouseYInfoSpan.innerHTML);

	if (mouseHeld && points.find((a) => a.x == x && a.y == y) == undefined)
		addPoint(x, y);
};

onMouseUp = (e) => {
	const x = parseInt(mouseXInfoSpan.innerHTML);
	const y = parseInt(mouseYInfoSpan.innerHTML);
	mouseHeld = false;
	addPoint(x, y);
};

onRightClick = (event) => {
	const x = parseInt(mouseXInfoSpan.innerHTML);
	const y = parseInt(mouseYInfoSpan.innerHTML);

	console.log('Right click!');

	if (points.find((a) => a.x == x && a.y == y) != undefined) {
		console.log('Removing point');
		removePoint(x, y);
	}
};

pick = (event) => {
	console.log('Clicked!');
	const x = parseInt(mouseXInfoSpan.innerHTML);
	const y = parseInt(mouseYInfoSpan.innerHTML);

	onPointClicked(x, y);
};

onPointClicked = (x, y) => {
	if (points.find((a) => a.x == x && a.y == y) == undefined) {
		addPoint(x, y);
		return;
	}
};

addPoint = (x, y) => {
	if (points.find((a) => a.x == x && a.y == y) == undefined)
		points.push({ x, y });
};

removePoint = (x, y) => {
	points = points.filter((a) => a.x != x || a.y != y);
};

printPoints = () => {
	points.forEach((p) => console.log(p));
};

// Adjusts points so that the first painted x value becomes starting x value
// Same for y

adjustPoints = (points) => {
	console.log(points[0]);

	const lowestX = points.reduce(
		(prev, curr) => (prev <= curr.x ? prev : curr.x),
		points[0].x
	);
	const highestY = points.reduce(
		(prev, curr) => (prev >= curr.y ? prev : curr.y),
		points[0].y
	);

	console.log('Lowest x:', lowestX);
	console.log('highest y:', highestY);

	// adjust array
	return points.map((p) => {
		return { x: p.x - lowestX, y: Math.abs(p.y - highestY) };
	});
};

savePointsToFile = (fileName) => {
	// Convert to file string
	/*const str = adjustPoints(points).reduce(
		(prev, point) => prev + `${point.x},${point.y};`,
		''
	);*/

	let fixedPoints = invertPoints(adjustPoints(points));
	let str = '#include "../type_declarations.h"\n';
	str +=
		`static const Point2D ${fileName}[] = ` +
		fixedPoints.reduce((prev, p) => prev + `{${p.x}, ${p.y}},`, '{');
	str = str + '};\n';
	str += `static i32 ${fileName}NumPoints = sizeof(${fileName}) / sizeof(Point2D);`
	console.log('fileStr', str);
	const blob = new Blob([str], {
		type: 'text/plain'
	});

	const data = window.URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = data;
	//link.download = fileName + '.pxl';
	// Using asset.h system
	link.download = fileName + '_asset.h';

	link.click();

	setTimeout(() => {
		window.URL.revokeObjectURL(data);
		link.remove();
	}, 200);

	//var file = new File([blob], fileName+".pixildata", {type: "text/plain"});
};

let askForFilename = () => {
	return prompt('Enter filename: ');
};

let attachDownloadButton = () => {
	//const panelButtonDiv = document.getElementById('panel-buttons');
	const panelButtonDiv = document.querySelectorAll('#panel-buttons')[0];
	console.log(panelButtonDiv);
	const myRowSection = document.createElement('div');
	myRowSection.classList.add('row-section');

	const downloadButtonDiv = document.createElement('div');
	downloadButtonDiv.classList.add('defaul-app-button');
	downloadButtonDiv.innerHTML = "Download: <i class='fa fa-download'></i>";
	downloadButtonDiv.addEventListener('click', (event) => {
		let fileName = askForFilename();
		if (fileName) savePointsToFile(fileName);
	});
	myRowSection.appendChild(downloadButtonDiv);

	panelButtonDiv.appendChild(myRowSection);
	//panelButtonDiv.children[1]
};

invertPoints = (points) => {
	return points.map(p => {
		return {x: p.x, y: -p.y}
	});
}



attachScript();
setTimeout(() => attachDownloadButton(), 400);
