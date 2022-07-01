"use strict";
// declaring the global constants
const MAXX = 1195;
const MINX = 60;
const MINY = 20;
const MAXY = 490;
const width = 1200;
const height = 600;
const textHeight = 550;
const scale = window.devicePixelRatio;
const gridColor = "yellow";
const lineColor = "white";
const highlightColor = "red";
const INSIDE = 0; // 0000
const LEFT = 1; // 0001
const RIGHT = 2; // 0010
const BOTTOM = 4; // 0100
const TOP = 8; // 1000
const EMPTY = "";
// global variables
let timesNextCalled = 0;
const canvas = document.getElementById("canvas");
// marks the 4 borders of the rectangular grid
let left, up, right, down;
// mark the line coordinates
let point1 = [],
  point2 = [];
let firstPoints = [];
let rectangularPoints = [];
let secondPoints = [];
let MESSAGE = EMPTY;
let clipEdge = EMPTY;
let submit = false;
const ctx = canvas.getContext("2d");
// set the canvas properties
// set the buttons control objects
const nextButton = document.getElementById("next_button");
const submitButton = document.getElementById("submit");
const previousButton = document.getElementById("prev_button");
const resetButton = document.getElementById("reset_button");
const errorx1 = document.getElementById("error-x1");
const errory1 = document.getElementById("error-y1");
const errory2 = document.getElementById("error-y2");
const errorx2 = document.getElementById("error-x2");
const errorLeft = document.getElementById("error-rect-left");
const errorRight = document.getElementById("error-rect-right");
const errorTop = document.getElementById("error-rect-top");
const errorBottom = document.getElementById("error-rect-bottom");
let valid = true;
const pointx1 = document.getElementById("ln-top-left-x");
const pointy1 = document.getElementById("ln-top-left-y");
const pointx2 = document.getElementById("ln-bottom-right-x");
const pointy2 = document.getElementById("ln-bottom-right-y");
const leftBorder = document.getElementById("cnt-top-left-x");
const topBorder = document.getElementById("cnt-top-left-y");
const rightBorder = document.getElementById("cnt-bottom-right-x");
const bottomBorder = document.getElementById("cnt-bottom-right-y");
const canvasTextAreaColor = "#f1f1f1";
let pointsSoFar = 0;
// a map that points characters to letters
let pointMap = new Map();
// map that tells whether or not to show the points
let showPoints = new Map();
function formValidate(text, errorClass, elementId, minVal, maxVal) {
  const element = document.getElementById(elementId);
  const value = element.value;
  if (value < minVal || value > maxVal) {
    valid = false;
    element.classList.add("error");
    errorClass.style.display = "block";
    errorClass.innerHTML = `${text}'s value must be between ${minVal} and ${maxVal}`;
  } else {
    valid = true;
    element.classList.remove("error");
    errorClass.innerHTML = EMPTY;
    errorClass.style.display = "none";
  }
}
canvas.onmousemove = function (e) {
  e.preventDefault();
  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  if (x > 0 && x < canvas.width && y > 0 && y < canvas.height) {
    for (let i = 0; i < firstPoints.length; i++) {
      const mapObject = `${firstPoints[i][0]},${firstPoints[i][1]}`;
      const divElem = document.getElementById(pointMap.get(mapObject));
      if (
        x >= parseFloat(firstPoints[i][0]) - 40 &&
        x <= parseFloat(firstPoints[i][0]) + 40 &&
        y <= parseFloat(firstPoints[i][1]) + 40 &&
        y >= parseFloat(firstPoints[i][1]) - 40
      ) {
        canvas.style.cursor = "pointer";
        divElem.style.display = "block";
        return;
      } else {
        divElem.style.display = "none";
      }
    }
    canvas.style.cursor = "default";
    for (let i = 0; i < secondPoints.length; i++) {
      const mapObject = `${secondPoints[i][0]},${secondPoints[i][1]}`;
      const divElem = document.getElementById(pointMap.get(mapObject));
      if (
        x >= parseFloat(secondPoints[i][0]) - 40 &&
        x <= parseFloat(secondPoints[i][0]) + 40 &&
        y <= parseFloat(secondPoints[i][1]) + 40 &&
        y >= parseFloat(secondPoints[i][1]) - 40
      ) {
        canvas.style.cursor = "pointer";
        divElem.style.display = "block";
        return;
      } else {
        divElem.style.display = "none";
      }
    }
    for (let i = 0; i < rectangularPoints.length; i++) {
      const mapObject = `${rectangularPoints[i][0]},${rectangularPoints[i][1]}`;
      const divElem = document.getElementById(pointMap.get(mapObject));
      if (
        x >= parseFloat(rectangularPoints[i][0]) - 40 &&
        x <= parseFloat(rectangularPoints[i][0]) + 40 &&
        y <= parseFloat(rectangularPoints[i][1]) + 40 &&
        y >= parseFloat(rectangularPoints[i][1]) - 40
      ) {
        canvas.style.cursor = "pointer";
        divElem.style.display = "block";
        return;
      } else {
        divElem.style.display = "none";
      }
    }
  }
};
pointx1.onchange = () =>
  formValidate("X1", errorx1, "ln-top-left-x", MINX, MAXX);
pointy1.onchange = () =>
  formValidate("Y1", errory1, "ln-top-left-y", MINY, MAXY);
pointx2.onchange = () =>
  formValidate("X2", errorx2, "ln-bottom-right-x", MINX, MAXX);
pointy2.onchange = () =>
  formValidate("Y2", errory2, "ln-bottom-right-y", MINY, MAXY);
topBorder.onchange = () =>
  formValidate("Top", errorTop, "cnt-top-left-y", MINY, MAXY);
leftBorder.onchange = () =>
  formValidate("Left", errorLeft, "cnt-top-left-x", MINX, MAXX);
rightBorder.onchange = () =>
  formValidate("Right", errorRight, "cnt-bottom-right-x", MINX, MAXX);
bottomBorder.onchange = () =>
  formValidate("Bottom", errorBottom, "cnt-bottom-right-y", MINY, MAXY);

// helper function , converting to binary representation
function encodePoint(x, y) {
  let code = INSIDE;
  if (parseFloat(x) < parseFloat(left)) {
    code |= LEFT;
  } else if (parseFloat(x) > parseFloat(right)) {
    code |= RIGHT;
  }
  if (parseFloat(y) > parseFloat(down)) {
    code |= BOTTOM;
  } else if (parseFloat(y) < parseFloat(up)) {
    code |= TOP;
  }
  return code;
}
// helper function for displaying meesage on the canvas
function canvasMessage(message) {
  ctx.font = "20px serif";
  ctx.clearRect(0, textHeight, canvas.width, height - textHeight);
  ctx.fillStyle = canvasTextAreaColor;
  ctx.fillRect(0, textHeight, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.rect(0, textHeight, canvas.width, height - textHeight);
  ctx.fillText(message, width / 2, textHeight + 20);
}
// function to display the coordinantes on the canvas
function coordinatesText(x, y) {
  ctx.font = "bold 20px serif";
  x = parseFloat(x);
  y = parseFloat(y);
  ctx.fillStyle = "white";
  const mapObject = `${x},${y}`;
  // if showPoints[mapObject] is true, then display the point
  if (showPoints.get(mapObject)) {
    ctx.fillText(pointMap.get(mapObject), x - 10, y - 10);
  }
}
function clearTable() {
  const table = document.getElementById("observations-table");
  const rows = table.rows.length;
  for (let i = 1; i < rows; i++) {
    table.deleteRow(1);
  }
}
function fillTable() {}
// function draw line between the given two points
function drawLine(x1, y1, x2, y2, width, color) {
  if (color === undefined || color === "") {
    color = gridColor;
  }
  ctx.beginPath();
  x1 = parseFloat(x1) + 0.5;
  y1 = parseFloat(y1) + 0.5;
  x2 = parseFloat(x2) + 0.5;
  y2 = parseFloat(y2) + 0.5;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.stroke();
}
// helper function to draw the point on the canvas
function makePoint(x, y, dotColor, textColor) {
  // render the point dot on the canvas
  x = parseFloat(x);
  y = parseFloat(y);
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
  ctx.lineWidth = 5;
  ctx.strokeStyle = dotColor;
  ctx.stroke();
  ctx.beginPath();
  let mapObject = `${x},${y}`;
  if (!pointMap.has(mapObject)) {
    pointMap.set(mapObject, String.fromCharCode(65 + pointMap.size));
    showPoints.set(mapObject, true);
    let div = document.createElement("div");
    div.style.left = x + "px";
    div.style.top = y + "px";
    div.id = `${pointMap.get(mapObject)}`;
    div.className = "point-div";
    div.innerHTML = `<p>( ${x.toFixed(1)} , ${y.toFixed(1)})</p>`;

    document.getElementById("canvas-wrap").appendChild(div);
  }
  coordinatesText(x, y, textColor);
}
// function to draw the rectangle grid on the canvas
function drawGrid(leftColor, rightColor, bottomColor, topColor) {
  // draw the rectangular grid lines
  drawLine(left, 0, left, textHeight, 2, leftColor);
  drawLine(right, 0, right, textHeight, 2, rightColor);
  drawLine(0, down, width, down, 2, bottomColor);
  drawLine(0, up, width, up, 2, topColor);
  drawLine(0, textHeight, width, textHeight, 2, "black");
  // mark the coordinates for the rectangular grid's intersection
  makePoint(left, up, "red", "red");
  makePoint(right, down, "red", "red");
  makePoint(left, down, "red", "red");
  makePoint(right, up, "red", "red");
  rectangularPoints.push([left, up]);
  rectangularPoints.push([right, down]);
  rectangularPoints.push([left, down]);
  rectangularPoints.push([right, up]);
}
function calculateSlope() {
  if (point1[0] == point2[0]) {
    if (point1[1] < point2[1]) {
      return Number.MAX_SAFE_INTEGER;
    } else {
      return Number.MIN_SAFE_INTEGER;
    }
  }
  return (point2[1] - point1[1]) / (point2[0] - point1[0]);
}
// function for clipping the points
function clipPoint(point, edge) {
  point[0] = parseFloat(point[0]);
  point[1] = parseFloat(point[1]);
  left = parseFloat(left);
  right = parseFloat(right);
  up = parseFloat(up);
  down = parseFloat(down);
  const pointCode = encodePoint(point[0], point[1]);
  const slope = parseFloat(calculateSlope());
  if (edge === "BOTTOM") {
    if (pointCode & BOTTOM) {
      if (slope !== 0) {
        const x = point[0] + (1 / slope) * (down - point[1]);
        const y = down;
        return [x, y];
      }
    }
  } else if (edge === "LEFT") {
    if (pointCode & LEFT) {
      if (
        slope === Number.MAX_SAFE_INTEGER ||
        slope === Number.MIN_SAFE_INTEGER
      ) {
        return [];
      } else {
        const x = left;
        const y = point[1] + slope * (left - point[0]);
        return [x, y];
      }
    }
  } else if (edge === "RIGHT") {
    if (pointCode & RIGHT) {
      if (
        slope === Number.MAX_SAFE_INTEGER ||
        slope === Number.MIN_SAFE_INTEGER
      ) {
        return [];
      } else {
        const x = right;
        const y = point[1] + slope * (right - point[0]);
        return [x, y];
      }
    }
  } else if (edge === "TOP") {
    if (pointCode & TOP) {
      if (slope !== 0) {
        const x = point[0] + (1 / slope) * (up - point[1]);
        const y = up;
        return [x, y];
      }
    }
  }
  return [];
}
function pointBeingClipped() {
  // whether point 1 is being clipped or the point 2
  if (timesNextCalled >= 1 && timesNextCalled <= 8) {
    return "point1";
  } else if (timesNextCalled >= 9 && timesNextCalled <= 16) {
    return "point2";
  } else {
    return null;
  }
}
function clippingEdge() {
  // returns the current edge against which the point is being clipped
  const option = timesNextCalled % 8;
  if (option === 1 || option === 2) {
    return "LEFT";
  } else if (option === 3 || option === 4) {
    return "BOTTOM";
  } else if (option === 5 || option === 6) {
    return "RIGHT";
  } else if (option === 7 || option === 0) {
    return "TOP";
  }
}
function highlightEdge(edge, width, color) {
  // higlight the edge of the boundary
  switch (edge) {
    case "LEFT":
      drawLine(left, 0, left, textHeight, width, color);
      break;
    case "BOTTOM":
      drawLine(MINX - 100, down, MAXX + 100, down, width, color);
      break;
    case "RIGHT":
      drawLine(right, 0, right, textHeight, width, color);
      break;
    case "TOP":
      drawLine(0, up, width, up, width, color);
      break;
    default:
      break;
  }
}
function chooseCanvasMessage() {
  const p1 = firstPoints[firstPoints.length - 1],
    p2 = secondPoints[secondPoints.length - 1];
  const code1 = encodePoint(p1[0], p1[1]);
  const code2 = encodePoint(p2[0], p2[1]);
  if (code1 == 0 && code2 == 0) {
    MESSAGE = "Line is Clipped";
    return;
  } else if (code1 & code2) {
    // both lie in the same region , no intersection with the rectangular grid
    MESSAGE =
      "Line Does Not Intersect With The Clipped Frame !! Line is Clipped .";
    return;
  } else {
    const point_being_clipped = pointBeingClipped();
    const option = timesNextCalled % 8;
    const edge = clippingEdge();
    if (option % 2 === 1) {
      MESSAGE = `Clipping ${point_being_clipped} against ${edge} edge`;
    } else {
      MESSAGE = "";
    }
  }
}
function handleNext() {
  if (timesNextCalled > 16) {
    return;
  }
  const p1 = firstPoints[firstPoints.length - 1],
    p2 = secondPoints[secondPoints.length - 1];
  const code1 = encodePoint(p1[0], p1[1]);
  const code2 = encodePoint(p2[0], p2[1]);
  if (code1 == 0 && code2 == 0) {
    MESSAGE = "Line is Clipped";
    return;
  } else if (code1 & code2) {
    // both lie in the same region , no intersection with the rectangular grid

    MESSAGE =
      "Line Does Not Intersect With The Clipped Frame !! Line is Clipped .";
    return;
  } else {
    const point_being_clipped = pointBeingClipped();
    if (point_being_clipped === "point1") {
      const option = timesNextCalled % 8;
      // at each odd frame highlight the edge being clipped against
      const edge = clippingEdge();
      if (option % 2 === 1) {
        // highlight the edge being clipped against
        clipEdge = edge;
      } else {
        const intersection_point = clipPoint(p1, edge);
        if (intersection_point.length !== 0) {
          firstPoints.push(intersection_point);
          const mapObject = `${intersection_point[0]},${intersection_point[1]}`;
          showPoints.set(mapObject, true);
        } else {
        }
        // unmark the previous highlight
        clipEdge = "";
      }
    } else if (point_being_clipped === "point2") {
      const option = timesNextCalled % 8;
      const edge = clippingEdge();
      if (option % 2 === 1) {
        clipEdge = edge;
      } else {
        const intersection_point = clipPoint(p2, edge);
        if (intersection_point.length !== 0) {
          secondPoints.push(intersection_point);
          const mapObject = `${intersection_point[0]},${intersection_point[1]}`;
          showPoints.set(mapObject, true);
        } else {
        }
        clipEdge = "";
      }
    }
  }
  // clip the first point first
  // next we clip the second point
}
function setParameters() {
  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);
  ctx.scale(scale, scale);
  ctx.fillRect(0, 0, canvas.width, textHeight);

  ctx.fillStyle = canvasTextAreaColor;
  ctx.fillRect(0, textHeight, canvas.width, canvas.height);

  ctx.font = "10px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // get the parameter values from the form
  left = document.getElementById("cnt-top-left-x").value;
  up = document.getElementById("cnt-top-left-y").value;
  right = document.getElementById("cnt-bottom-right-x").value;
  down = document.getElementById("cnt-bottom-right-y").value;
  const x1 = document.getElementById("ln-top-left-x").value;
  const y1 = document.getElementById("ln-top-left-y").value;
  const x2 = document.getElementById("ln-bottom-right-x").value;
  const y2 = document.getElementById("ln-bottom-right-y").value;
  makePoint(x1, y1, "red", "red");
  makePoint(x2, y2, "red", "red");
  point1 = [x1, y1];
  point2 = [x2, y2];
  firstPoints.push(point1);
  secondPoints.push(point2);
  // check if the parameters are valid or not
}
function renderObservations() {
  // render the observations
  clearTable();
  const table = document.getElementById("observations-table");
  for (const [key, value] of pointMap) {
    if (showPoints.get(key)) {
      const coordinate = key.split(",");
      const x = parseFloat(coordinate[0]).toFixed(2);
      const y = parseFloat(coordinate[1]).toFixed(2);
      const row = table.insertRow(-1);
      row.innerHTML = `<td>${value}</td><td>(${x},${y})</td>`;
    }
  }
}
function renderCanvas() {
  ctx.clearRect(0, 0, canvas.width, textHeight);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, textHeight);

  // again draw the grid
  if (clipEdge == "") {
    drawGrid();
  } else if (clipEdge === "LEFT") {
    drawGrid(highlightColor, gridColor, gridColor, gridColor);
  } else if (clipEdge === "RIGHT") {
    drawGrid(gridColor, highlightColor, gridColor, gridColor);
  } else if (clipEdge === "BOTTOM") {
    drawGrid(gridColor, gridColor, highlightColor, gridColor);
  } else if (clipEdge === "TOP") {
    drawGrid(gridColor, gridColor, gridColor, highlightColor);
  }

  // draw the line
  drawLine(point1[0], point1[1], point2[0], point2[1], 2, "grey");
  const activePoint1 = firstPoints[firstPoints.length - 1];
  const activePoint2 = secondPoints[secondPoints.length - 1];
  for (let i = 0; i < firstPoints.length - 1; i++) {
    const point = firstPoints[i];
    if (point.length !== 0) {
      makePoint(point[0], point[1], "grey", "red");
    }
  }
  for (let i = 0; i < secondPoints.length - 1; i++) {
    const point = secondPoints[i];
    if (point.length !== 0) {
      makePoint(point[0], point[1], "grey", "grey");
    }
  }
  makePoint(activePoint1[0], activePoint1[1], "red", "red");
  makePoint(activePoint2[0], activePoint2[1], "red", "red");
  drawLine(
    activePoint1[0],
    activePoint1[1],
    activePoint2[0],
    activePoint2[1],
    2,
    lineColor
  );
  ctx.fillStyle = "black";
  renderObservations();
  chooseCanvasMessage();
  canvasMessage(MESSAGE);
}
// handle the submit button
submitButton.addEventListener("click", function () {
  // set the parameters
  pointMap = new Map();
  timesNextCalled = 0;

  firstPoints = [];
  secondPoints = [];
  MESSAGE = "";
  clipEdge = "";
  point1 = [];
  pointsSoFar = 0;
  point2 = [];
  submit = false;

  // draw the grid
  if (valid === true) {
    setParameters();
    drawGrid("yellow");
    // draw the line between the two points
    drawLine(point1[0], point1[1], point2[0], point2[1], 2, lineColor);
    renderObservations();
    submit = true;
  }
});
resetButton.addEventListener("click", function () {
  // default values for the parameters
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  clearTable();
  pointsSoFar = 0;
  timesNextCalled = 0;
  firstPoints = [];
  secondPoints = [];
  MESSAGE = "";
  clipEdge = "";
  point1 = [];
  point2 = [];
  submit = false;
  showPoints = new Map();
  pointMap = new Map();
});
nextButton.addEventListener("click", function () {
  if (submit && timesNextCalled < 16) {
    if (timesNextCalled < 0) {
      timesNextCalled = 0;
    }
    timesNextCalled++;

    handleNext();
    renderCanvas();
  }
});
previousButton.addEventListener("click", function () {
  if (timesNextCalled >= 0) {
    const point = pointBeingClipped();
    const option = timesNextCalled % 8;
    const edge = clippingEdge();
    timesNextCalled--;
    if (option % 2 === 1) {
      // just chosen a point to render
      clipEdge = edge;
      if (point === "point1" && firstPoints.length > 1) {
        const x = firstPoints[firstPoints.length - 1][0];
        const y = firstPoints[firstPoints.length - 1][1];

        if (edge === "LEFT" && x !== left) {
        } else if (edge === "RIGHT" && x !== right) {
        } else if (edge === "BOTTOM" && y !== down) {
        } else if (edge === "TOP" && y !== up) {
        } else {
          const mapObject = `${x},${y}`;
          showPoints.set(mapObject, false);
          firstPoints.pop();
        }
      } else if (point === "point2" && secondPoints.length > 1) {
        if (secondPoints[secondPoints.length - 1].length === 2) {
          const x = secondPoints[secondPoints.length - 1][0];
          const y = secondPoints[secondPoints.length - 1][1];
          if (edge === "LEFT" && x !== left) {
          } else if (edge === "RIGHT" && x !== right) {
          } else if (edge === "BOTTOM" && y !== down) {
          } else if (edge === "TOP" && y !== up) {
          } else {
            const mapObject = `${x},${y}`;
            showPoints.set(mapObject, false);
            secondPoints.pop();
          }
        }
      }
    } else {
      // highlighted the edge
      clipEdge = "";
    }
    console.log(timesNextCalled, point, edge, clipEdge);

    renderCanvas();
  }
});
