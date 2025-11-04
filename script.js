/***** Adafruit IO *****/
const username  = "pantheon";
const activeKey = "aio_JJeA690ij8o4K6BvfzTa3xIaTbzj"; 
const IO = new AdafruitIO(username, activeKey);
const FEED_KEY = "joystick";

/***** game *****/
const base = 50;
let canvasSize = 600;
let playerPosX = canvasSize / 2;
let playerPosY = canvasSize / 2;
let playerImage = null;


const ADC_MAX  = 4095;     
const CENTER_X = 2048;
const CENTER_Y = 2048;
const DEADZONE = 220;      


let nX = 0, nY = 0;
let vx = 0, vy = 0;

function parseJoystickPayload(text) {
  if (!text) return null;
  let s = String(text).trim();
  if (s.startsWith("[") && s.endsWith("]")) s = s.slice(1, -1);
  const parts = s.split(",").map(p => p.trim());
  if (parts.length < 3) return null;

  const x = Number(parts[0]);
  const y = Number(parts[1]);
  const b = parts[2];
  const btn = (b === "1") || (String(b).toLowerCase() === "true");
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { x, y, btn };
}

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
function axisNorm(raw, center) {
  let d = raw - center;
  if (Math.abs(d) < DEADZONE) return 0;
  const span = (ADC_MAX / 2) - DEADZONE;
  let n = d / span;             
  return clamp(n, -1, 1);
}


const POLL_MS = 2000;
setInterval(() => {
  IO.getData(FEED_KEY, (data) => {
    const latest = data && data.json && data.json[0] && data.json[0].value;
    const parsed = parseJoystickPayload(latest);
    if (!parsed) {
      console.warn("[joystick] payload inválido:", latest);
      return;
    }


    let nx = axisNorm(parsed.x, CENTER_X);
    let ny = axisNorm(parsed.y, CENTER_Y);

  

    nX = nx;
    nY = ny;

 
    console.log(`[joystick] raw="${latest}" -> x:${parsed.x} y:${parsed.y} btn:${parsed.btn} | norm= ${nx.toFixed(2)}, ${ny.toFixed(2)}`);
  });
}, POLL_MS);

/***** p5.js *****/
function preload() {
  
  playerImage = loadImage("/img/resetti.png",
    () => console.log("[p5] Imagen cargada"),
    (e) => console.warn("[p5] No se cargó la imagen, uso rect:", e)
  );
}

function setup() {
  const myCanvas = createCanvas(canvasSize, canvasSize);
  myCanvas.parent("canvasPos");
  imageMode(CENTER);
  frameRate(60);
}

function draw() {
  background(20);

  
  const MAX_SPEED = 160;
  const ALPHA = 0.22;
  const dt = deltaTime / 1000;

  const targetVx = nX * MAX_SPEED;
  const targetVy = nY * MAX_SPEED;

  vx = vx + ALPHA * (targetVx - vx);
  vy = vy + ALPHA * (targetVy - vy);

  playerPosX += vx * dt;
  playerPosY += vy * dt;


   if (playerPosX > canvasSize) playerPosX = 0;
   if (playerPosX < 0)          playerPosX = canvasSize;
   if (playerPosY > canvasSize) playerPosY = 0;
   if (playerPosY < 0)          playerPosY = canvasSize;


   if (playerImage) image(playerImage, playerPosX, playerPosY, base, base);
   else { fill("#FF0000"); rect(playerPosX - base/2, playerPosY - base/2, base, base); }
}


window.addEventListener("keydown", (e) => {
  const STEP = 12;
  if (["ArrowLeft","a","A"].includes(e.key))  playerPosX -= STEP;
  if (["ArrowRight","d","D"].includes(e.key)) playerPosX += STEP;
  if (["ArrowUp","w","W"].includes(e.key))    playerPosY -= STEP;
  if (["ArrowDown","s","S"].includes(e.key))  playerPosY += STEP;
});
