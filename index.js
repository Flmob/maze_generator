const canvas1 = document.getElementById("canvas1");
const ctx1 = canvas1.getContext("2d");
const canvas2 = document.getElementById("canvas2");
const ctx2 = canvas2.getContext("2d");

const hValue = document.getElementById("h");
const wValue = document.getElementById("w");
const scaleValue = document.getElementById("scale");

const btn = document.getElementById("btn");
const btn1 = document.getElementById("btn1");
const btn2 = document.getElementById("btn2");

const bar = document.getElementById("myBar");
let bWidth = 1;

const WALL = 1;
const EMPTY = 2;
const ROAD = 3;
const TEST = 4;
const ERROR = 5;

let SCALE = 5;
let DIST = 2;
let w = 49;
let h = 49;

let tick = 20;
let resume = false;

btn.onclick = function () {
  startMazeGeneration(0);
};
btn1.onclick = function () {
  startMazeGeneration(tick);
};
btn2.onclick = function () {
  resume = false;
};

function cell(X, Y) {
  this.x = X;
  this.y = Y;

  this.set = function (_x, _y) {
    this.x = _x;
    this.y = _y;
  };
}

const initiateField = (w, h) => {
  const mass = new Array(w);

  for (let i = 0; i < w; i++) {
    mass[i] = new Array(h);
    for (let j = 0; j < h; j++) {
      if (
        i % 2 !== 0 &&
        j % 2 !== 0 && // if cell is even on x and y
        j < h - 1 &&
        i < w - 1
      )
        // and it is inside of a maze
        mass[i][j] = EMPTY; // then it is a cell
      else mass[i][j] = WALL; // otherwise it is a wall
    }
  }

  return mass;
};

const startMazeGeneration = (tick) => {
  if (!resume) {
    SCALE = parseFloat(scaleValue.value);
    SCALE = SCALE < 2 ? 2 : SCALE;

    w = getNormNum(wValue.value);
    h = getNormNum(hValue.value);

    let mass = initiateField(w, h);
    draw(mass, SCALE, ctx1);
    draw(mass, SCALE, ctx2);
    tMazeGeneration(mass, tick);
  }
};

const countEmpty = (field) => {
  let res = 0;

  for (let i = 0; i < field.length; i++) {
    for (let j = 0; j < field[i].length; j++) {
      if (field[i][j] == EMPTY) res++;
    }
  }

  return res;
};

const tMazeGeneration = (mass, tick) => {
  let startCell = new cell(1, 1);
  mass[startCell.x][startCell.y] = ROAD;
  let currCell = startCell;
  let nearCell;
  let stack = [];
  let sEmpties;
  let empties = (sEmpties = countEmpty(mass));

  resume = true;

  mass[0][1] = ROAD;
  mass[mass.length - 1][mass[0].length - 2] = ROAD;

  tStep(mass, currCell, nearCell, stack, empties, sEmpties, tick);

  function tStep(mass, cCell, nCell, stack, empties, sEmpties, tick) {
    setTimeout(function () {
      let nears = getNear(mass, cCell, DIST, EMPTY);
      if (nears.length > 0) {
        let randN = getRandomInt(0, nears.length - 1);
        nCell = nears[randN];
        mass[nCell.x][nCell.y] = ROAD;
        removeWall(mass, cCell, nCell);
        stack.push(cCell);
        cCell = nCell;
        empties--;
      } else if (stack.length > 0) {
        cCell = stack.pop();
      } else {
        console.log("Error!");
      }

      if (tick !== 0) {
        mass[cCell.x][cCell.y] = TEST;
        draw(mass, SCALE, ctx1);
        mass[cCell.x][cCell.y] = ROAD;
      }

      if (empties > 0 && resume) {
        barControl(sEmpties, empties);
        tStep(mass, cCell, nCell, stack, empties, sEmpties, tick);
      } else {
        draw(mass, SCALE, ctx1);
        let mass1 = mass;
        findWays(mass1, w, h);
        draw(mass1, SCALE, ctx2);
        resume = false;
      }
    }, tick);
  }
};

function removeWall(mass, cell1, cell2) {
  let difX = cell2.x - cell1.x;
  let difY = cell2.y - cell1.y;

  let addX = difX !== 0 ? difX / Math.abs(difX) : 0;
  let addY = difY !== 0 ? difY / Math.abs(difY) : 0;

  mass[cell1.x + addX][cell1.y + addY] = ROAD;
}

function getNear(mass, cel, dist, value) {
  let x = cel.x;
  let y = cel.y;

  let up = new cell(x, y - dist);
  let rt = new cell(x + dist, y);
  let dw = new cell(x, y + dist);
  let lt = new cell(x - dist, y);
  let cells = [up, rt, dw, lt];

  let res = [];

  for (let i = 0; i < 4; i++) {
    if (
      cells[i].x > 0 &&
      cells[i].x < mass.length &&
      cells[i].y > 0 &&
      cells[i].y < mass[0].length
    ) {
      if (mass[cells[i].x][cells[i].y] === value) {
        res.push(cells[i]);
      }
    }
  }

  return res;
}

function draw(mass, scale, ctx) {
  ctx.canvas.width = mass.length * SCALE;
  ctx.canvas.height = mass[0].length * SCALE;

  for (let i = 0; i < mass.length; i++) {
    for (let j = 0; j < mass[i].length; j++) {
      if (mass[i][j] == WALL) {
        ctx.fillStyle = "rgb(0, 0, 0)"; // black wall
      } else if (mass[i][j] == EMPTY) {
        ctx.fillStyle = "rgb(255, 255, 255)"; // white empty cell
      } else if (mass[i][j] == ROAD) {
        ctx.fillStyle = "rgb(24, 207, 58)"; // green road
      } else if (mass[i][j] == TEST) {
        ctx.fillStyle = "rgb(66, 0, 255)"; // test blue cell
      } else {
        ctx.fillStyle = "rgb(241, 12, 12)"; // red error
      }
      ctx.fillRect(i * scale, j * scale, scale, scale);
    }
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getNormNum(num) {
  num = +num % 2 === 0 ? +num + 1 : +num;
  num = +num < 0 ? +num * -1 : +num;
  num = +num <= 2 ? 3 : +num;

  return num;
}

function barControl(start, curr) {
  bWidth = ((curr - start) / start) * -100;
  bar.style.width = Math.ceil(bWidth) + "%";
}

////////////////////////////////////////////////////////////////////////////

function findWays(mass, width, height) {
  for (let i = 1; i < width - 1; i++) {
    for (let j = 1; j < height - 1; j++) {
      setErrBlock(mass, i, j);
    }
  }
}

function setErrBlock(mass, x, y) {
  let k = 0;

  if (mass[x][y] == ROAD) {
    if (mass[x - 1][y] != ROAD) k++;
    if (mass[x][y - 1] != ROAD) k++;
    if (mass[x + 1][y] != ROAD) k++;
    if (mass[x][y + 1] != ROAD) k++;
  }

  if (k == 4) mass[x][y] = ERROR;
  if (k == 3) {
    mass[x][y] = ERROR;
    if (mass[x - 1][y] == ROAD) setErrBlock(mass, x - 1, y);
    if (mass[x][y - 1] == ROAD) setErrBlock(mass, x, y - 1);
    if (mass[x + 1][y] == ROAD) setErrBlock(mass, x + 1, y);
    if (mass[x][y + 1] == ROAD) setErrBlock(mass, x, y + 1);
  }
}
