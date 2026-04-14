// Chart.js is loaded as a global via CDN script tag in the HTML.

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
function resetChart(chart, v0, h0, angleRad, g) {
  chart.data.datasets[0].data = [];
  chart.data.datasets[1].data = [];
  const maxRange  = (v0 * v0 / g) * 2;
  const maxHeight = h0 + (v0 * Math.sin(angleRad)) ** 2 / (2 * g);
  chart.options.scales.x.max = Math.ceil(maxRange  * 1.2);
  chart.options.scales.y.max = Math.ceil(maxHeight * 1.3);
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
  chart.update('none');
}
