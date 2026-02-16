
// tutorial https://www.youtube.com/watch?v=qjWkNZ0SXfo

const BG = "black"
const FG = "white"

const size =  window.outerWidth * 0.9
render.width = size
render.height = size
render.style.width  = size + 'px'
render.style.height = size + 'px'

const ctx = render.getContext("2d")

function clear() {
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, render.width, render.height)
}

function point({ x, y }) {
  const s = 20;
  ctx.fillStyle = FG
  ctx.fillRect(x - s / 2, y - s / 2, s, s)
}

function screen(p) {
  // -1..1 => 0..2 => 0..1 => 0..w
  return {
    x: (p.x + 1) / 2 * render.width,
    y: (1 - (p.y + 1) / 2) * render.height,
  }
}

function project({ x, y, z }) {
  return {
    x: x / z,
    y: y / z,
  }
}


let vs = []
let faces = []

function rotate_xz({ x, y, z }, angle) {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return {
    x: x * c - z * s,
    y,
    z: x * s + z * c,
  };
}


function translate_z({ x, y, z }, dz) {
  return { x, y, z: z + dz }
}

const FPS = 60;
let angle = 0;
let dz = 4; // z offset
let targetDz = 3;

function line(p1, p2) {
  ctx.strokeStyle = FG;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.stroke()
}

function frame() {
  const dt = 1 / FPS; // delta time
  //dz += 1 * dt;
  
  angle += Math.PI * dt;
  clear()

  for (const f of faces) {
    for (let i = 0; i < f.length; ++i) {
      const a = vs[f[i]];
      const b = vs[f[(i + 1) % f.length]]
      line(
        screen(project(translate_z(rotate_xz(a, angle), dz))),
        screen(project(translate_z(rotate_xz(b, angle), dz))),
      )
    }
  }

  requestAnimationFrame(frame)
}

const app = Elm.Main.init({ node: document.getElementById("dummy") });

function preventDefaults(e) {
  e.preventDefault()
  e.stopPropagation()
}

["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
  render.addEventListener(eventName, preventDefaults, false)
})

// drag & drop .stl
render.addEventListener("drop",(e) => {
  const file = e.dataTransfer.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const stlData = e.target.result
    app.ports.loadStl.send(stlData)
  }

  reader.readAsText(file)
})

// subscribe to Elm parse completion
app.ports.sendMesh.subscribe((mesh) => {
  console.log("Parsed mesh from Elm:", mesh);

  console.log("Vertices:", mesh.vertices);
  console.log("Faces:", mesh.faces);

  vs = mesh.vertices;
  faces = mesh.faces;

  frame()
});











































