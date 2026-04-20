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
 * @param {CanvasRenderingContext2D} ctx
 * @returns {Chart}
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
    plugins: [_markersPlugin],
  });
}

/**
 * Clears trajectory data and rescales axes for a new launch.
 * @param {Chart} chart
 * @param {number} v0       - Launch speed (m/s)
 * @param {number} h0       - Initial height (m)
 * @param {number} angleRad - Launch angle (radians)
 * @param {number} g        - Gravitational acceleration (m/s²)
 */
function resetChart(chart, v0, h0, angleRad, g, markers) {
  chart.data.datasets[0].data = [];
  chart.data.datasets[1].data = [];
  const maxRange  = (v0 * v0 / g) * Math.sin(2*angleRad);
  const maxHeight = h0 + (v0 * Math.sin(angleRad)) ** 2 / (2 * g);
  chart.options.scales.x.max = Math.ceil(maxRange*1.2  / 10)*10;
  chart.options.scales.y.max = Math.ceil(maxHeight * (2 - angleRad*4/6.28));
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
 * @param {Chart} chart
 * @param {object} state
 */
function updateChart(chart, state) {
  const pt = { x: parseFloat(state.wx.toFixed(2)), y: parseFloat(Math.max(0, state.wy).toFixed(2)) };
  chart.data.datasets[0].data.push(pt);
  chart.data.datasets[1].data = [pt];
  chart._caught     = state.caught;
  chart._hoopPassed = state.hoopPassed;
  chart._hoopAtApex = state.hoopAtApex;
  chart.update('none');
}
