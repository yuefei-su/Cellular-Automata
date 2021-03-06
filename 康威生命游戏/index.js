import { Universe } from "@bezos/wasm-game-of-life";
import { memory } from "@bezos/wasm-game-of-life/wasm_game_of_life_bg";

const CELL_SIZE = 5;
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

const canvas = document.getElementById("game-of-life-canvas");
const playPauseBtn = document.getElementById("play-pause");
const randomInit = document.getElementById("random-init");
const reset = document.getElementById("reset");

const universe = Universe.new();
universe.set_height(64);
universe.set_width(64);
universe.init();
const width = universe.width();
const height = universe.height();
canvas.width = (CELL_SIZE + 1) * width + 1;
canvas.height = (CELL_SIZE + 1) * height + 1;

const ctx = canvas.getContext("2d");

function drawGrid() {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  // Horizontal lines.
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
}

drawGrid();

function getIndex(row, column) {
  return row * width + column;
}

const bitInSet = (n, arr) => {
  const byte = Math.floor(n / 8);
  const mask = 1 << n % 8;
  return (arr[byte] & mask) === mask;
};

function drawCells() {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, (width * height) / 8);
  ctx.beginPath();

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);
      ctx.fillStyle = bitInSet(idx, cells) ? ALIVE_COLOR : DEAD_COLOR;
      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
}

let animationId = null;
function renderLoop() {
  universe.tick();
  drawCells();
  animationId = requestAnimationFrame(renderLoop);
}

// ??????????????????
function isPaused() {
  return animationId === null;
}

function play() {
  playPauseBtn.textContent = "Pause";
  renderLoop();
}

function pause() {
  playPauseBtn.textContent = "Play";
  cancelAnimationFrame(animationId);
  animationId = null;
}

playPauseBtn.addEventListener("click", (event) => {
  if (isPaused()) {
    play();
  } else {
    pause();
  }
});

randomInit.addEventListener("click", (event) => {
  cancelAnimationFrame(animationId);
  animationId = null;
  universe.init();
  renderLoop();
});

reset.addEventListener("click", (event) => {
  cancelAnimationFrame(animationId);
  animationId = null;
  universe.reset();
  drawCells();
});

canvas.addEventListener("click", (event) => {
  let boundingRect = canvas.getBoundingClientRect();

  // ????????????
  let scaleX = canvas.width / boundingRect.width;
  let scaleY = canvas.height / boundingRect.height;

  // ??????????????????canvas????????????
  let canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  let canvasTop = (event.clientY - boundingRect.top) * scaleY;

  // ????????????
  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

  // ???????????????????????????
  universe.toggle_cell(row, col);
  drawCells();
});
