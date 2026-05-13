// Chart.js is loaded as a global via CDN script tag in the HTML.

function _drawChartBasket(ctx, cx, groundY, caught) {
  const bw = 9, bh = 11;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - bw * 0.7, groundY);
  ctx.lineTo(cx + bw * 0.7, groundY);
  ctx.lineTo(cx + bw,       groundY - bh);
  ctx.lineTo(cx - bw,       groundY - bh);
  ctx.closePath();
  ctx.fillStyle   = caught ? 'rgba(255,215,50,0.9)' : 'rgba(175,105,35,0.85)';
  ctx.fill();
  ctx.strokeStyle = caught ? '#aa7700' : '#6a3808';
  ctx.lineWidth   = 1;
  ctx.stroke();
  // two weave lines
  ctx.strokeStyle = caught ? 'rgba(160,100,0,0.5)' : 'rgba(90,45,8,0.4)';
  [0.35, 0.65].forEach(f => {
    const ly = groundY - bh * f;
    const lw = bw * 0.7 + bw * 0.3 * (1 - f);
    ctx.beginPath(); ctx.moveTo(cx - lw, ly); ctx.lineTo(cx + lw, ly); ctx.stroke();
  });
  ctx.restore();
}

function _drawChartHoop(ctx, cx, cy, passed, atApex) {
  const r = 7;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = !passed ? '#ff6600' : atApex ? '#ffcc00' : '#ff8c00';
  ctx.lineWidth   = 2.5;
  ctx.stroke();
  ctx.restore();
}

// --- Educational overlay plugin -------------------------------------------

const _eduPlugin = {
  id: 'edu',
  afterDraw(chart) {
    const forms    = chart._eduForms;
    const overlays = chart._eduOverlays || {};
    const targetH  = chart._eduTargetH;
    const solPts   = chart._eduSolutionPts || [];
    if (!forms && !targetH) return;

    const { ctx: c, scales: { x: xs, y: ys }, chartArea: ca } = chart;

    // Helper: pixel coords from world coords
    const px = (wx) => xs.getPixelForValue(wx);
    const py = (wy) => ys.getPixelForValue(wy);
    const inChart = (screenX) => screenX >= ca.left - 2 && screenX <= ca.right + 2;

    c.save();
    c.font = '11px sans-serif';

    // Axis of symmetry -------------------------------------------------------
    if (forms && overlays.axisSym) {
      const ax = px(forms.h);
      if (inChart(ax)) {
        c.setLineDash([5, 3]);
        c.strokeStyle = 'rgba(80, 120, 255, 0.7)';
        c.lineWidth   = 1.5;
        c.beginPath();
        c.moveTo(ax, ca.top);
        c.lineTo(ax, ca.bottom);
        c.stroke();
        c.setLineDash([]);
        c.fillStyle = 'rgba(80, 120, 255, 0.85)';
        c.fillText(`x = ${forms.h.toFixed(1)}`, ax + 4, ca.top + 14);
      }
    }

    // Target height line -----------------------------------------------------
    if (targetH !== null && targetH !== undefined && overlays.targetHeight) {
      const ty = py(targetH);
      if (ty >= ca.top - 2 && ty <= ca.bottom + 2) {
        c.setLineDash([8, 4]);
        c.strokeStyle = 'rgba(220, 80, 20, 0.8)';
        c.lineWidth   = 1.5;
        c.beginPath();
        c.moveTo(ca.left, ty);
        c.lineTo(ca.right, ty);
        c.stroke();
        c.setLineDash([]);
        c.fillStyle = 'rgba(220, 80, 20, 0.9)';
        const label = `y = ${targetH} m`;
        const lw = c.measureText(label).width;
        c.fillText(label, ca.right - lw - 4, ty - 4);
      }
    }

    // X-intercepts -----------------------------------------------------------
    if (forms && overlays.intercepts) {
      [[0, '0'], [forms.R, forms.R.toFixed(1)]].forEach(([wx, label]) => {
        const spx = px(wx), spy = py(0);
        c.beginPath();
        c.arc(spx, spy, 5, 0, Math.PI * 2);
        c.fillStyle = '#3abf6e';
        c.fill();
        c.strokeStyle = '#1a8040';
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = '#1a8040';
        c.fillText(`x=${label}`, spx + 7, spy - 5);
      });
    }

    // Solution points (where parabola meets target height) -------------------
    if (overlays.solutionPoints && solPts.length > 0) {
      solPts.forEach(pt => {
        const spx = px(pt.x), spy = py(pt.y);
        if (!inChart(spx)) return;
        c.beginPath();
        c.arc(spx, spy, 5, 0, Math.PI * 2);
        c.fillStyle = '#e86b2a';
        c.fill();
        c.strokeStyle = '#9a3800';
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = '#9a3800';
        c.fillText(`x=${pt.x.toFixed(1)}`, spx + 7, spy - 5);
      });
    }

    // Vertex dot (drawn last so it sits on top of axis line) ----------------
    if (forms && overlays.vertex) {
      const vx = px(forms.h), vy = py(forms.k);
      c.beginPath();
      c.arc(vx, vy, 7, 0, Math.PI * 2);
      c.fillStyle = '#f5c518';
      c.fill();
      c.strokeStyle = '#a07800';
      c.lineWidth   = 1.5;
      c.stroke();
      c.fillStyle   = '#7a5000';
      c.font        = 'bold 11px sans-serif';
      c.fillText(`(${forms.h.toFixed(1)}, ${forms.k.toFixed(1)})`, vx + 10, vy - 5);
      c.font = '11px sans-serif';
    }

    // Circle mode: center dot -----------------------------------------------
    if (chart._circleMode && chart._circleCenterPx) {
      const [chx, cky] = chart._circleCenterPx;
      c.beginPath();
      c.arc(chx, cky, 5, 0, Math.PI * 2);
      c.fillStyle = '#e86b2a';
      c.fill();
      c.strokeStyle = '#a04000';
      c.lineWidth   = 1;
      c.stroke();
      c.fillStyle = '#a04000';
      c.font = 'bold 11px sans-serif';
      const ch = chart._circleParams?.h ?? 0, ck = chart._circleParams?.k ?? 0;
      c.fillText(`center (${ch.toFixed(1)}, ${ck.toFixed(1)})`, chx + 8, cky - 5);
      c.font = '11px sans-serif';
    }

    c.restore();
  },

  // Cache pixel coords for circle center (scales may not be ready in afterDraw start)
  afterUpdate(chart) {
    if (!chart._circleMode || !chart._circleParams) return;
    const { x: xs, y: ys } = chart.scales;
    if (!xs || !ys) return;
    const { h, k } = chart._circleParams;
    chart._circleCenterPx = [xs.getPixelForValue(h), ys.getPixelForValue(k)];
  },
};

// --- Markers plugin (basket + hoop) ----------------------------------------

const _markersPlugin = {
  id: 'markers',
  afterDraw(chart) {
    const { ctx: c, scales: { x: xs, y: ys } } = chart;
    if (chart._basketX) {
      _drawChartBasket(c, xs.getPixelForValue(chart._basketX),
                          ys.getPixelForValue(0), !!chart._caught);
    }
    if (chart._hoopX && chart._hoopY) {
      _drawChartHoop(c, xs.getPixelForValue(chart._hoopX),
                        ys.getPixelForValue(chart._hoopY),
                        !!chart._hoopPassed, !!chart._hoopAtApex);
    }
  },
};

/**
 * Creates and returns a new trajectory chart bound to the given canvas context.
 */
function initChart(ctx) {
  return new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'trajectory',
          data: [],
          showLine: true,
          borderColor: '#e86b2a',
          backgroundColor: 'rgba(232,107,42,0.15)',
          pointRadius: 0,
          borderWidth: 2,
          fill: true,
          tension: 0.3,
        },
        {
          label: 'minion position',
          data: [],
          pointRadius: 8,
          pointBackgroundColor: '#f5c518',
          pointBorderColor: '#333',
          pointBorderWidth: 2,
          showLine: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: 'distance (m)', font: { size: 11 }, color: '#888' }, ticks: { font: { size: 10 } } },
        y: { title: { display: true, text: 'height (m)',   font: { size: 11 }, color: '#888' }, min: 0, ticks: { font: { size: 10 } } },
      },
    },
    plugins: [_markersPlugin, _eduPlugin],
  });
}

/**
 * Clears trajectory data and rescales axes for a new launch.
 */
function resetChart(chart, v0, h0, angleRad, g, markers) {
  chart.data.datasets[0].data = [];
  chart.data.datasets[1].data = [];
  chart._circleMode = false;
  const maxRange  = (v0 * v0 / g) * Math.sin(2 * angleRad);
  const maxHeight = h0 + (v0 * Math.sin(angleRad)) ** 2 / (2 * g);
  chart.options.scales.x.min = undefined;
  chart.options.scales.x.max = Math.ceil(maxRange * 1.2 / 10) * 10;
  chart.options.scales.y.min = 0;
  chart.options.scales.y.max = Math.ceil(maxHeight * (2 - angleRad * 4 / 6.28));
  chart._basketX    = markers ? markers.basketX || null : null;
  chart._hoopX      = markers ? markers.hoopX   || null : null;
  chart._hoopY      = markers ? markers.hoopY   || null : null;
  chart._caught     = false;
  chart._hoopPassed = false;
  chart._hoopAtApex = false;
  chart.update('none');
}

/**
 * Appends the current projectile position to the trajectory chart.
 */
function updateChart(chart, state) {
  if (chart._circleMode) return;
  const pt = { x: parseFloat(state.wx.toFixed(2)), y: parseFloat(Math.max(0, state.wy).toFixed(2)) };
  chart.data.datasets[0].data.push(pt);
  chart.data.datasets[1].data = [pt];
  chart._caught     = state.caught;
  chart._hoopPassed = state.hoopPassed;
  chart._hoopAtApex = state.hoopAtApex;
  chart.update('none');
}

/**
 * Pushes edu overlay data to the chart so the _eduPlugin can draw it.
 * Call this each frame (or whenever edu state changes) from app.js.
 */
function setEduOverlays(chart, forms, overlays, targetH, solutionPts) {
  chart._eduForms       = forms;
  chart._eduOverlays    = overlays;
  chart._eduTargetH     = targetH;
  chart._eduSolutionPts = solutionPts;
}

/**
 * Switches the chart to circle display mode (lesson 7).
 * Replaces trajectory dataset with parametric circle points.
 */
function setCircleChart(chart, h, k, r) {
  const pts = eduCirclePoints(h, k, r);
  chart.data.datasets[0].data = pts;
  chart.data.datasets[1].data = [];
  chart._circleMode   = true;
  chart._circleParams = { h, k, r };
  chart._basketX      = null;
  chart._hoopX        = null;

  // Equal-scale axes centered on the circle
  const pad = r * 1.5;
  chart.options.scales.x.min = h - pad;
  chart.options.scales.x.max = h + pad;
  chart.options.scales.y.min = k - pad;
  chart.options.scales.y.max = k + pad;
  chart.options.scales.x.title.text = 'x';
  chart.options.scales.y.title.text = 'y';
  chart.update('none');
}

/**
 * Restores chart axes/labels after leaving circle mode.
 */
function exitCircleChart(chart) {
  chart._circleMode   = false;
  chart._circleParams = null;
  chart.options.scales.x.title.text = 'distance (m)';
  chart.options.scales.y.title.text = 'height (m)';
}
