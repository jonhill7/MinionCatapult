// --- Canvas setup ---
const simCanvas = document.getElementById('sim-canvas');
const trajCanvas = document.getElementById('traj-canvas');
const simCtx = simCanvas.getContext('2d');
const trajCtx = trajCanvas.getContext('2d');

// --- Cached DOM references ---
const els = {
  simPanel:   document.getElementById('sim-panel'),
  chartArea:  document.getElementById('chart-area'),
  launchBtn:  document.getElementById('launch-btn'),
  stopBtn:    document.getElementById('stop-btn'),
  resetBtn:   document.getElementById('reset-btn'),
  planet:     document.getElementById('planet'),
  angle:      document.getElementById('angle'),
  speed:      document.getElementById('speed'),
  lblPlanet:  document.getElementById('lbl-planet'),
  lblAngle:   document.getElementById('lbl-angle'),
  lblSpeed:   document.getElementById('lbl-speed'),
  statH:      document.getElementById('stat-h'),
  statV:      document.getElementById('stat-v'),
  statR:      document.getElementById('stat-r'),
  statT:      document.getElementById('stat-t'),
  statMH:     document.getElementById('stat-mh'),
  statS:      document.getElementById('stat-s'),
  formulaBar: document.getElementById('formula-bar'),
  basketDist: document.getElementById('basket-dist'),
  hoopDist:   document.getElementById('hoop-dist'),
  hoopHeight: document.getElementById('hoop-height'),
};

// --- Populate planet select from JSON ---
planets.forEach(p => {
  const opt = document.createElement('option');
  opt.value       = p.g;
  opt.textContent = `${p.name} (${p.g} m/s²)`;
  els.planet.appendChild(opt);
});

// --- Canvas sizing ---
function resizeCanvases() {
  simCanvas.width   = els.simPanel.clientWidth;
  simCanvas.height  = els.simPanel.clientHeight;
  trajCanvas.width  = 0;
  trajCanvas.height = 0;
  trajCanvas.width  = els.chartArea.clientWidth;
  trajCanvas.height = els.chartArea.clientHeight;
}

// --- Stats display ---
function updateStats(state) {
  const speed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
  els.statH.textContent  = Math.max(0, state.wy).toFixed(1) + ' m';
  els.statV.textContent  = speed.toFixed(1)      + ' m/s';
  els.statR.textContent  = state.wx.toFixed(1)   + ' m';
  els.statT.textContent  = state.t.toFixed(2)    + ' s';
  els.statMH.textContent = state.maxH.toFixed(1) + ' m';
}

// --- Animation loop ---
let trajChart  = null;
let animId     = null;
let simState   = null;
let prevTime   = null;
let newtonCtx  = null;

function getNewtonExpr(state) {
  if (!state.launched)  return 'idle';
  if (state.landed)     return 'aha';
  return state.vy > 2 ? 'excited' : 'worried';
}

function redrawNewton(state) {
  if (!newtonCtx) return;
  newtonCtx.clearRect(0, 0, 80, 90);
  drawNewtonMinion(newtonCtx, 40, 62, 18, getNewtonExpr(state));
}

function simulate(timestamp) {
  if (!prevTime) prevTime = timestamp;
  const dt = Math.min((timestamp - prevTime) / 1000, 0.05);
  prevTime = timestamp;

  if (!simState.landed) {
    const prevWx = simState.wx;
    const prevWy = simState.wy;
    const justLanded = updatePhysics(simState, dt);

    if (!simState.hoopPassed && simState.hoopX > 0 && simState.hoopY > 0) {
      if (prevWx < simState.hoopX && simState.wx >= simState.hoopX) {
        const frac    = (simState.hoopX - prevWx) / (simState.wx - prevWx);
        const wyCross = prevWy + frac * (simState.wy - prevWy);
        if (Math.abs(wyCross - simState.hoopY) <= 3) {
          const theoreticalMaxH = (simState.vy0 * simState.vy0) / (2 * simState.g);
          simState.hoopPassed = true;
          simState.hoopPassT  = simState.t;
          simState.hoopAtApex = wyCross >= theoreticalMaxH * 0.85;
        }
      }
    }

    if (justLanded) {
      const CATCH_RADIUS = 3;
      simState.caught = Math.abs(simState.landX - simState.basketX) <= CATCH_RADIUS;
      if (simState.caught) {
        els.statS.textContent = 'caught!';
        els.statS.style.color = '#4CAF50';
      } else {
        els.statS.textContent = 'landed!';
        els.statS.style.color = '#e82a2a';
      }
      els.resetBtn.style.display = 'inline-block';
      els.stopBtn.style.display  = 'none';
    }
  }

  updateStats(simState);
  updateChart(trajChart, simState);
  drawSimFrame(simCtx, simCanvas, simState);
  redrawNewton(simState);

  if (!simState.landed) animId = requestAnimationFrame(simulate);
}

// --- Control event listeners ---
// --- Formula display ---
function formatCoeff(n) {
  return (n >= 0 ? '+' : '−') + ' ' + Math.abs(n).toFixed(4);
}
function updateFormula() {
  const g        = parseFloat(els.planet.value);
  const angleRad = parseFloat(els.angle.value) * Math.PI / 180;
  const v0       = parseFloat(els.speed.value);
  const vx       = v0 * Math.cos(angleRad);
  const vy       = v0 * Math.sin(angleRad);
  const A        = -g / (2 * vx * vx);
  const B        = vy / vx;
  els.formulaBar.textContent =
    `h  =  ${A.toFixed(4)} d²  ${formatCoeff(B)} d`;
}

els.angle.addEventListener('input', e => {
  els.lblAngle.textContent = e.target.value + '°';
  if (simState && !simState.launched) {
    simState.angleRad = parseFloat(e.target.value) * Math.PI / 180;
    drawSimFrame(simCtx, simCanvas, simState);
  }
  updateFormula();
});
els.speed.addEventListener('input', e => {
  els.lblSpeed.textContent = e.target.value + ' m/s';
  if (simState && !simState.launched) {
    simState.speed = parseFloat(e.target.value);
    drawSimFrame(simCtx, simCanvas, simState);
  }
  updateFormula();
});
els.basketDist.addEventListener('change', e => {
  if (simState && !simState.launched) {
    simState.basketX = parseFloat(e.target.value) || 0;
    drawSimFrame(simCtx, simCanvas, simState);
  }
});
els.hoopDist.addEventListener('change', e => {
  if (simState && !simState.launched) {
    simState.hoopX = parseFloat(e.target.value) || 0;
    drawSimFrame(simCtx, simCanvas, simState);
  }
});
els.hoopHeight.addEventListener('change', e => {
  if (simState && !simState.launched) {
    simState.hoopY = parseFloat(e.target.value) || 0;
    drawSimFrame(simCtx, simCanvas, simState);
  }
});
els.planet.addEventListener('change', e => {
  const p = planets[e.target.selectedIndex];
  els.lblPlanet.textContent = p.name;
  if (simState && !simState.launched) {
    simState.theme = p.theme;
    simState.planet = p.name;
    drawSimFrame(simCtx, simCanvas, simState);
  }
  updateFormula();
});

els.launchBtn.addEventListener('click', () => {
  if (animId) cancelAnimationFrame(animId);
  prevTime = null;

  const g        = parseFloat(els.planet.value);
  const angleDeg = parseFloat(els.angle.value);
  const angleRad = angleDeg * Math.PI / 180;
  const v0       = parseFloat(els.speed.value);
  const h0       = 0;
  simState = {
    ...createInitialState(h0),
    vx: v0 * Math.cos(angleRad),
    vy: v0 * Math.sin(angleRad),
    g,
    theme: planets[els.planet.selectedIndex].theme,
    planet: planets[els.planet.selectedIndex].name,
    angleRad,
    launched: true,
    basketX:    parseFloat(els.basketDist.value),
    hoopX:      parseFloat(els.hoopDist.value)   || 0,
    hoopY:      parseFloat(els.hoopHeight.value) || 0,
    vy0:        v0 * Math.sin(angleRad),
    hoopPassed: false,
    hoopPassT:  null,
    hoopAtApex: false,
  };

  resetChart(trajChart, v0, h0, angleRad, g, { basketX: simState.basketX, hoopX: simState.hoopX, hoopY: simState.hoopY });

  els.statS.textContent      = 'flying!';
  els.statS.style.color      = '#4CAF50';
  els.launchBtn.style.display = 'none';
  els.stopBtn.style.display  = 'inline-block';

  redrawNewton(simState);
  animId = requestAnimationFrame(simulate);
});

function doReset() {
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  prevTime = null;
  simState = { ...createInitialState(0), theme: planets[els.planet.selectedIndex].theme, planet: planets[els.planet.selectedIndex].name, angleRad: parseFloat(els.angle.value) * Math.PI / 180, speed: parseFloat(els.speed.value), basketX: parseFloat(els.basketDist.value), hoopX: parseFloat(els.hoopDist.value) || 0, hoopY: parseFloat(els.hoopHeight.value) || 0, hoopPassed: false, hoopPassT: null };
  resetChart(trajChart, parseFloat(els.speed.value), 0,
    parseFloat(els.angle.value) * Math.PI / 180, parseFloat(els.planet.value),
    { basketX: simState.basketX, hoopX: simState.hoopX, hoopY: simState.hoopY });
  els.statS.textContent       = 'ready';
  els.statS.style.color       = '#e86b2a';
  els.launchBtn.style.display  = 'inline-block';
  els.stopBtn.style.display    = 'none';
  els.resetBtn.style.display   = 'none';
  drawSimFrame(simCtx, simCanvas, simState);
  redrawNewton(simState);
}

els.stopBtn.addEventListener('click', doReset);
els.resetBtn.addEventListener('click', doReset);

window.addEventListener('resize', () => {
  resizeCanvases();
  if (trajChart) trajChart.resize();
  if (!simState?.launched) drawSimFrame(simCtx, simCanvas, simState);
});

// --- Panel resize ---
// onStart fires once on mousedown and returns context passed to every onMove call.
// This ensures bounds are captured before any resizing distorts them.
function makeDraggable(el, onStart, onMove) {
  el.addEventListener('mousedown', e => {
    e.preventDefault();
    el.classList.add('dragging');
    const ctx  = onStart(e);
    const move = e => onMove(e, ctx);
    const up   = () => {
      el.classList.remove('dragging');
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup',   up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup',   up);
  });
}

const topEl = document.getElementById('top');
const appEl = document.getElementById('app');

makeDraggable(
  document.getElementById('v-divider'),
  ()         => ({ totalW: topEl.getBoundingClientRect().width, leftEdge: topEl.getBoundingClientRect().left }),
  (e, { totalW, leftEdge }) => {
    const leftW = Math.max(150, Math.min(totalW - 156, e.clientX - leftEdge));
    topEl.style.gridTemplateColumns = `${leftW}px 6px minmax(0, 1fr)`;
    resizeCanvases();
    if (trajChart) trajChart.resize();
    if (simState && !simState.launched) drawSimFrame(simCtx, simCanvas, simState);
  }
);

makeDraggable(
  document.getElementById('h-divider'),
  ()         => ({ appTop: appEl.getBoundingClientRect().top }),
  (e, { appTop }) => {
    const topH = Math.max(150, Math.min(700, e.clientY - appTop));
    topEl.style.height = topH + 'px';
    resizeCanvases();
    if (trajChart) trajChart.resize();
    if (simState && !simState.launched) drawSimFrame(simCtx, simCanvas, simState);
  }
);

// --- Init (rAF ensures layout is complete before reading clientWidth/Height) ---
requestAnimationFrame(() => {
  resizeCanvases();
  trajChart = initChart(trajCtx);
  simState  = { ...createInitialState(0), theme: planets[0].theme, planet: planets[0].name, angleRad: parseFloat(els.angle.value) * Math.PI / 180, speed: parseFloat(els.speed.value), basketX: parseFloat(els.basketDist.value), hoopX: parseFloat(els.hoopDist.value) || 0, hoopY: parseFloat(els.hoopHeight.value) || 0, hoopPassed: false, hoopPassT: null };
  drawSimFrame(simCtx, simCanvas, simState);
  updateFormula();
  newtonCtx = document.getElementById('newton-canvas').getContext('2d');
  redrawNewton(simState);
});
