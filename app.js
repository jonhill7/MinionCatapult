// --- Canvas setup ---
const simCanvas = document.getElementById('sim-canvas');
const trajCanvas = document.getElementById('traj-canvas');
const simCtx = simCanvas.getContext('2d');
const trajCtx = trajCanvas.getContext('2d');

// --- Cached DOM references ---
const els = {
  simPanel:       document.getElementById('sim-panel'),
  chartArea:      document.getElementById('chart-area'),
  launchBtn:      document.getElementById('launch-btn'),
  stopBtn:        document.getElementById('stop-btn'),
  resetBtn:       document.getElementById('reset-btn'),
  planet:         document.getElementById('planet'),
  angle:          document.getElementById('angle'),
  speed:          document.getElementById('speed'),
  lblPlanet:      document.getElementById('lbl-planet'),
  lblAngle:       document.getElementById('lbl-angle'),
  lblSpeed:       document.getElementById('lbl-speed'),
  statH:          document.getElementById('stat-h'),
  statV:          document.getElementById('stat-v'),
  statR:          document.getElementById('stat-r'),
  statT:          document.getElementById('stat-t'),
  statMH:         document.getElementById('stat-mh'),
  statS:          document.getElementById('stat-s'),
  basketDist:     document.getElementById('basket-dist'),
  hoopDist:       document.getElementById('hoop-dist'),
  hoopHeight:     document.getElementById('hoop-height'),
  // Educational UI
  navModeLabel:   document.getElementById('nav-mode-label'),
  menuBtn:        document.getElementById('menu-btn'),
  sidebar:        document.getElementById('lesson-sidebar'),
  sidebarContent: document.getElementById('sidebar-content'),
  backdrop:       document.getElementById('sidebar-backdrop'),
  closeSidebar:   document.getElementById('close-sidebar'),
  // Info area tabs
  infoTabs:       document.querySelectorAll('.info-tab'),
  panelEq:        document.getElementById('panel-equations'),
  panelStats:     document.getElementById('panel-stats'),
  panelLesson:    document.getElementById('panel-lesson'),
  lessonTabBtn:   document.getElementById('lesson-tab-btn'),
  // Equation form elements
  eqGeneral:      document.getElementById('eq-general-val'),
  eqVertex:       document.getElementById('eq-vertex-val'),
  eqFactored:     document.getElementById('eq-factored-val'),
  eqCircleStd:    document.getElementById('eq-circle-std-val'),
  eqCircleExp:    document.getElementById('eq-circle-exp-val'),
  eqRowCircleStd: document.getElementById('eq-row-circle-std'),
  eqRowCircleExp: document.getElementById('eq-row-circle-exp'),
  eqSummary:      document.getElementById('eq-summary'),
  eqVertexCoords: document.getElementById('eq-vertex-coords'),
  eqAxisSym:      document.getElementById('eq-axis-sym'),
  eqRange:        document.getElementById('eq-range'),
  // Target height
  targetHGroup:   document.getElementById('target-h-group'),
  targetH:        document.getElementById('target-h'),
  lblTargetH:     document.getElementById('lbl-target-h'),
  // Discriminant
  discPanel:      document.getElementById('disc-panel'),
  discLabel:      document.getElementById('disc-label'),
  discDetail:     document.getElementById('disc-detail'),
  // Circle controls
  circleControls: document.getElementById('circle-controls'),
  circleH:        document.getElementById('circle-h'),
  circleK:        document.getElementById('circle-k'),
  circleR:        document.getElementById('circle-r'),
  lblCircleH:     document.getElementById('lbl-circle-h'),
  lblCircleK:     document.getElementById('lbl-circle-k'),
  lblCircleR:     document.getElementById('lbl-circle-r'),
  // Lesson prompts
  promptText:     document.getElementById('prompt-text'),
  promptCounter:  document.getElementById('prompt-counter'),
  prevPrompt:     document.getElementById('prev-prompt'),
  nextPrompt:     document.getElementById('next-prompt'),
  promptNav:      document.getElementById('prompt-nav'),
  // Lesson section (bottom panel right)
  lessonSection:        document.getElementById('lesson-section'),
  lessonSectionTitle:   document.getElementById('lesson-section-title'),
  lessonSectionBadge:   document.getElementById('lesson-section-badge'),
  lessonSectionDesc:    document.getElementById('lesson-section-desc'),
  lessonTargetsList:    document.getElementById('lesson-targets-list'),
  lessonPlanContent:    document.getElementById('lesson-plan-content'),
  lessonDiscList:       document.getElementById('lesson-discussion-list'),
  lessonDiscDetails:    document.getElementById('lesson-discussion-details'),
};

// --- Populate planet select ---
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

// ---------------------------------------------------------------------------
// Educational equation display
// ---------------------------------------------------------------------------

function getCurrentForms() {
  const speed    = parseFloat(els.speed.value);
  const angleRad = parseFloat(els.angle.value) * Math.PI / 180;
  const gravity  = parseFloat(els.planet.value);
  return eduComputeForms(speed, angleRad, gravity);
}

function updateEquations() {
  const forms = getCurrentForms();

  if (EduState.isCircleMode) {
    // Show circle equations instead of parabola forms
    els.eqGeneral.closest('.eq-row').classList.add('hidden');
    els.eqVertex.closest('.eq-row').classList.add('hidden');
    els.eqFactored.closest('.eq-row').classList.add('hidden');
    els.eqRowCircleStd.classList.remove('hidden');
    els.eqRowCircleExp.classList.remove('hidden');
    els.eqSummary.classList.add('hidden');
    const h = EduState.circleH, k = EduState.circleK, r = EduState.circleR;
    els.eqCircleStd.textContent = eduCircleStandard(h, k, r);
    els.eqCircleExp.textContent = eduCircleExpanded(h, k, r);
    return;
  }

  // Parabola equation rows
  els.eqGeneral.closest('.eq-row').classList.remove('hidden');
  els.eqVertex.closest('.eq-row').classList.remove('hidden');
  els.eqFactored.closest('.eq-row').classList.remove('hidden');
  els.eqRowCircleStd.classList.add('hidden');
  els.eqRowCircleExp.classList.add('hidden');

  els.eqGeneral.textContent = eduFormatGeneral(forms);
  els.eqVertex.textContent  = eduFormatVertex(forms);
  els.eqFactored.textContent = eduFormatFactored(forms);

  if (forms) {
    els.eqSummary.classList.remove('hidden');
    els.eqVertexCoords.textContent = `vertex: (${forms.h.toFixed(2)}, ${forms.k.toFixed(2)})`;
    els.eqAxisSym.textContent      = `axis: x = ${forms.h.toFixed(2)}`;
    els.eqRange.textContent        = `range: ${forms.R.toFixed(2)} m`;
  } else {
    els.eqSummary.classList.add('hidden');
  }

  // Highlight equation forms that the current activity emphasizes
  const highlighted = EduState.activity ? (EduState.activity.equationForms || []) : ['general'];
  [['general', els.eqGeneral], ['vertex', els.eqVertex], ['factored', els.eqFactored]].forEach(([key, el]) => {
    el.classList.toggle('highlighted', highlighted.includes(key));
  });

  // Update discriminant display if needed
  updateDiscriminant(forms);

  // Push overlay data to chart plugin
  if (trajChart) {
    const overlays = EduState.overlays || {};
    const targetH  = EduState.showTargetHeight ? EduState.targetHeight : null;
    const solPts   = (EduState.showTargetHeight && overlays.solutionPoints && forms)
      ? eduSolutionPoints(forms, EduState.targetHeight)
      : [];
    setEduOverlays(trajChart, forms, overlays, targetH, solPts);
  }
}

function updateDiscriminant(forms) {
  if (!EduState.showDiscriminant) {
    els.discPanel.style.display = 'none';
    return;
  }
  els.discPanel.style.display = '';
  const info = eduFormatDiscriminant(forms, EduState.targetHeight);
  els.discLabel.textContent  = info.label;
  els.discDetail.textContent = info.detail;
  // Update CSS class for colour coding
  els.discPanel.className = info.cssClass;
}

// ---------------------------------------------------------------------------
// Animation loop
// ---------------------------------------------------------------------------

let trajChart  = null;
let animId     = null;
let simState   = null;
let prevTime   = null;
let newtonCtx  = null;

function getNewtonExpr(state) {
  if (!state.launched) return 'idle';
  if (state.landed)    return 'aha';
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
  updateEquations();
  drawSimFrame(simCtx, simCanvas, simState);
  redrawNewton(simState);

  if (!simState.landed) animId = requestAnimationFrame(simulate);
}

// --- Control event listeners ---
els.angle.addEventListener('input', e => {
  els.lblAngle.textContent = e.target.value + '°';
  if (simState && !simState.launched) {
    simState.angleRad = parseFloat(e.target.value) * Math.PI / 180;
    drawSimFrame(simCtx, simCanvas, simState);
  }
  updateEquations();
});
els.speed.addEventListener('input', e => {
  els.lblSpeed.textContent = e.target.value + ' m/s';
  if (simState && !simState.launched) {
    simState.speed = parseFloat(e.target.value);
    drawSimFrame(simCtx, simCanvas, simState);
  }
  updateEquations();
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
    simState.theme  = p.theme;
    simState.planet = p.name;
    drawSimFrame(simCtx, simCanvas, simState);
  }
  updateEquations();
});

// Target height slider
els.targetH.addEventListener('input', e => {
  EduState.targetHeight = parseFloat(e.target.value);
  els.lblTargetH.textContent = EduState.targetHeight + ' m';
  updateEquations();
  if (trajChart) trajChart.update('none');
});

// Circle sliders
function updateCircle() {
  EduState.circleH = parseFloat(els.circleH.value);
  EduState.circleK = parseFloat(els.circleK.value);
  EduState.circleR = parseFloat(els.circleR.value);
  els.lblCircleH.textContent = EduState.circleH.toFixed(1);
  els.lblCircleK.textContent = EduState.circleK.toFixed(1);
  els.lblCircleR.textContent = EduState.circleR.toFixed(1);
  updateEquations();
  if (trajChart) setCircleChart(trajChart, EduState.circleH, EduState.circleK, EduState.circleR);
}
els.circleH.addEventListener('input', updateCircle);
els.circleK.addEventListener('input', updateCircle);
els.circleR.addEventListener('input', updateCircle);

// Launch button
els.launchBtn.addEventListener('click', () => {
  if (EduState.isCircleMode) return; // no launch in circle mode
  if (animId) cancelAnimationFrame(animId);
  prevTime = null;

  const g        = parseFloat(els.planet.value);
  const angleDeg = parseFloat(els.angle.value);
  const angleRad = angleDeg * Math.PI / 180;
  const v0       = parseFloat(els.speed.value);
  const h0       = 0;
  simState = {
    ...createInitialState(h0),
    vx:      v0 * Math.cos(angleRad),
    vy:      v0 * Math.sin(angleRad),
    g,
    theme:   planets[els.planet.selectedIndex].theme,
    planet:  planets[els.planet.selectedIndex].name,
    angleRad,
    launched: true,
    basketX:  parseFloat(els.basketDist.value),
    hoopX:    parseFloat(els.hoopDist.value)   || 0,
    hoopY:    parseFloat(els.hoopHeight.value) || 0,
    vy0:      v0 * Math.sin(angleRad),
    hoopPassed: false,
    hoopPassT:  null,
    hoopAtApex: false,
  };

  resetChart(trajChart, v0, h0, angleRad, g, { basketX: simState.basketX, hoopX: simState.hoopX, hoopY: simState.hoopY });

  els.statS.textContent       = 'flying!';
  els.statS.style.color       = '#4CAF50';
  els.launchBtn.style.display  = 'none';
  els.stopBtn.style.display   = 'inline-block';

  redrawNewton(simState);
  animId = requestAnimationFrame(simulate);
});

function doReset() {
  if (animId) { cancelAnimationFrame(animId); animId = null; }
  prevTime = null;
  const g = parseFloat(els.planet.value);
  simState = {
    ...createInitialState(0),
    theme:   planets[els.planet.selectedIndex].theme,
    planet:  planets[els.planet.selectedIndex].name,
    angleRad: parseFloat(els.angle.value) * Math.PI / 180,
    speed:    parseFloat(els.speed.value),
    basketX:  parseFloat(els.basketDist.value),
    hoopX:    parseFloat(els.hoopDist.value)   || 0,
    hoopY:    parseFloat(els.hoopHeight.value) || 0,
    hoopPassed: false,
    hoopPassT: null,
    g,
  };

  if (EduState.isCircleMode) {
    setCircleChart(trajChart, EduState.circleH, EduState.circleK, EduState.circleR);
  } else {
    resetChart(trajChart, parseFloat(els.speed.value), 0,
      parseFloat(els.angle.value) * Math.PI / 180, g,
      { basketX: simState.basketX, hoopX: simState.hoopX, hoopY: simState.hoopY });
  }

  els.statS.textContent        = 'ready';
  els.statS.style.color        = '#e86b2a';
  els.launchBtn.style.display  = 'inline-block';
  els.stopBtn.style.display    = 'none';
  els.resetBtn.style.display   = 'none';
  drawSimFrame(simCtx, simCanvas, simState);
  redrawNewton(simState);
  updateEquations();
}

els.stopBtn.addEventListener('click', doReset);
els.resetBtn.addEventListener('click', doReset);

window.addEventListener('resize', () => {
  resizeCanvases();
  if (trajChart) trajChart.resize();
  if (!simState?.launched) drawSimFrame(simCtx, simCanvas, simState);
});

// --- Panel resize ---
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

// ---------------------------------------------------------------------------
// Info area tab switching
// ---------------------------------------------------------------------------

function switchInfoTab(panelId) {
  els.infoTabs.forEach(btn => {
    const active = btn.dataset.panel === panelId;
    btn.classList.toggle('active', active);
  });
  [els.panelEq, els.panelStats, els.panelLesson].forEach(p => p.classList.remove('active'));
  const target = document.getElementById('panel-' + panelId);
  if (target) target.classList.add('active');
}

els.infoTabs.forEach(btn => {
  btn.addEventListener('click', () => switchInfoTab(btn.dataset.panel));
});

// ---------------------------------------------------------------------------
// Prompt navigation (lesson info panel)
// ---------------------------------------------------------------------------

function showPrompt(index) {
  const prompts = EduState.activity ? (EduState.activity.prompts || []) : [];
  if (!prompts.length) return;
  const clamped = Math.max(0, Math.min(index, prompts.length - 1));
  EduState.promptIndex = clamped;
  els.promptText.textContent    = prompts[clamped];
  els.promptCounter.textContent = `${clamped + 1} / ${prompts.length}`;
  els.prevPrompt.disabled       = clamped === 0;
  els.nextPrompt.disabled       = clamped === prompts.length - 1;
}

els.prevPrompt.addEventListener('click', () => showPrompt(EduState.promptIndex - 1));
els.nextPrompt.addEventListener('click', () => showPrompt(EduState.promptIndex + 1));

// ---------------------------------------------------------------------------
// Sidebar open / close
// ---------------------------------------------------------------------------

function openSidebar()  { els.sidebar.classList.add('open'); els.backdrop.classList.add('visible'); }
function closeSidebar() { els.sidebar.classList.remove('open'); els.backdrop.classList.remove('visible'); }

els.menuBtn.addEventListener('click', openSidebar);
els.closeSidebar.addEventListener('click', closeSidebar);
els.backdrop.addEventListener('click', closeSidebar);

// ---------------------------------------------------------------------------
// Activity selection
// ---------------------------------------------------------------------------

function selectActivity(lessonId, activityId) {
  eduSetActivity(lessonId, activityId);
  closeSidebar();
  highlightSidebarActive(lessonId, activityId);
  applyActivityUI();
  doReset();
}

function applyActivityUI() {
  const act = EduState.activity;
  const lessonId = EduState.lessonId;

  // Nav bar label
  if (EduState.mode === 'free') {
    els.navModeLabel.textContent = 'Free Play';
  } else {
    const lesson = LESSONS.find(l => l.id === lessonId);
    els.navModeLabel.textContent = `L${lessonId}: ${lesson.title} — ${act.title}`;
  }

  // Target height control
  const showTH = EduState.showTargetHeight;
  els.targetHGroup.style.display = showTH ? '' : 'none';
  if (showTH) {
    const maxTH = Math.ceil(getCurrentForms()?.k * 1.8 + 5 || 50);
    els.targetH.max = maxTH;
    if (EduState.targetHeight > maxTH) EduState.targetHeight = Math.round(maxTH * 0.7);
    els.targetH.value = EduState.targetHeight;
    els.lblTargetH.textContent = EduState.targetHeight + ' m';
  }

  // Circle controls
  const isCircle = EduState.isCircleMode;
  els.circleControls.style.display = isCircle ? '' : 'none';
  els.launchBtn.style.display      = isCircle ? 'none' : '';
  els.simPanel.classList.toggle('circle-mode', isCircle);

  // Lesson prompts tab
  const hasPrompts = act && act.prompts && act.prompts.length > 0;
  els.lessonTabBtn.classList.toggle('hidden', !hasPrompts);
  if (hasPrompts) {
    showPrompt(0);
    // Auto-switch to lesson tab if in lesson mode
    if (EduState.mode === 'lesson') switchInfoTab('lesson');
  } else if (EduState.mode === 'free') {
    switchInfoTab('equations');
  }

  // Bottom panel lesson section
  if (EduState.mode === 'lesson' && act) {
    const lesson = LESSONS.find(l => l.id === lessonId);
    els.lessonSection.style.display = '';

    // Title + badge
    els.lessonSectionTitle.textContent = `L${lessonId}: ${lesson.title} — ${act.title}`;
    if (act.badge) {
      els.lessonSectionBadge.textContent = act.badge;
      els.lessonSectionBadge.className   = `activity-badge badge-${act.badge.toLowerCase()}`;
    } else {
      els.lessonSectionBadge.textContent = '';
      els.lessonSectionBadge.className   = 'activity-badge';
    }
    els.lessonSectionDesc.textContent = act.desc || '';

    // Learning targets
    els.lessonTargetsList.innerHTML = lesson.targets
      .map(t => `<li>${t}</li>`).join('');

    // Teacher notes (overview + bullet points)
    const plan = lesson.plan;
    let planHTML = `<p>${plan.overview}</p>`;
    if (plan.teacherNotes && plan.teacherNotes.length) {
      planHTML += '<ul>' + plan.teacherNotes.map(n => `<li>${n}</li>`).join('') + '</ul>';
    }
    if (plan.homework) {
      planHTML += `<p><strong>Homework:</strong> ${plan.homework}</p>`;
    }
    els.lessonPlanContent.innerHTML = planHTML;

    // Discussion questions
    if (plan.discussion && plan.discussion.length) {
      els.lessonDiscDetails.style.display = '';
      els.lessonDiscList.innerHTML = plan.discussion.map(q => `<li>${q}</li>`).join('');
    } else {
      els.lessonDiscDetails.style.display = 'none';
    }

    // Apply homework defaults if the activity specifies them
    if (act.defaultAngle) {
      els.angle.value = act.defaultAngle;
      els.lblAngle.textContent = act.defaultAngle + '°';
    }
    if (act.defaultSpeed) {
      els.speed.value = act.defaultSpeed;
      els.lblSpeed.textContent = act.defaultSpeed + ' m/s';
    }
    if (act.defaultPlanet) {
      const idx = planets.findIndex(p => p.name === act.defaultPlanet);
      if (idx >= 0) {
        els.planet.selectedIndex = idx;
        els.lblPlanet.textContent = planets[idx].name;
      }
    }
  } else {
    els.lessonSection.style.display = 'none';
  }
}

// ---------------------------------------------------------------------------
// Sidebar rendering
// ---------------------------------------------------------------------------

function buildSidebar() {
  let html = '';

  // Free play button
  html += `<button class="sidebar-free-play ${EduState.mode === 'free' ? 'active' : ''}"
            data-lid="0" data-aid="free">
            Free Play
           </button>`;

  // Lesson groups
  LESSONS.forEach(lesson => {
    const isOpen = EduState.lessonId === lesson.id;
    html += `<div class="sidebar-lesson-group">
      <div class="sidebar-lesson-header ${isOpen ? 'expanded' : ''}" data-lid="${lesson.id}">
        <span class="lesson-num">L${lesson.id}</span>
        <span class="lesson-title-text">${lesson.title}</span>
        <span class="expand-arrow">▸</span>
      </div>
      <div class="sidebar-activities ${isOpen ? 'open' : ''}">`;

    lesson.activities.forEach(act => {
      const isActive = EduState.lessonId === lesson.id && EduState.activity?.id === act.id;
      const badgeHtml = act.badge
        ? `<span class="activity-badge badge-${act.badge.toLowerCase()}">${act.badge}</span>` : '';
      html += `<button class="sidebar-activity-btn ${isActive ? 'active' : ''}"
                data-lid="${lesson.id}" data-aid="${act.id}">
                ${badgeHtml}${act.title}
               </button>`;
    });

    html += `</div></div>`;
  });

  els.sidebarContent.innerHTML = html;

  // Lesson header expand/collapse
  els.sidebarContent.querySelectorAll('.sidebar-lesson-header').forEach(h => {
    h.addEventListener('click', () => {
      const acts = h.nextElementSibling;
      const open = acts.classList.toggle('open');
      h.classList.toggle('expanded', open);
    });
  });

  // Activity and free-play button clicks
  els.sidebarContent.querySelectorAll('[data-lid][data-aid]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lid = parseInt(btn.dataset.lid);
      const aid = btn.dataset.aid;
      selectActivity(lid, aid);
    });
  });
}

function highlightSidebarActive(lessonId, activityId) {
  els.sidebarContent.querySelectorAll('.sidebar-activity-btn, .sidebar-free-play').forEach(b => {
    const match = parseInt(b.dataset.lid) === lessonId && b.dataset.aid === activityId;
    b.classList.toggle('active', match);
  });
  // Expand the active lesson group
  els.sidebarContent.querySelectorAll('.sidebar-lesson-header').forEach(h => {
    if (parseInt(h.dataset.lid) === lessonId) {
      h.classList.add('expanded');
      h.nextElementSibling.classList.add('open');
    }
  });
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

requestAnimationFrame(() => {
  resizeCanvases();
  trajChart = initChart(trajCtx);

  const g = parseFloat(els.planet.value);
  simState = {
    ...createInitialState(0),
    theme:   planets[0].theme,
    planet:  planets[0].name,
    angleRad: parseFloat(els.angle.value) * Math.PI / 180,
    speed:    parseFloat(els.speed.value),
    basketX:  parseFloat(els.basketDist.value),
    hoopX:    parseFloat(els.hoopDist.value)   || 0,
    hoopY:    parseFloat(els.hoopHeight.value) || 0,
    hoopPassed: false,
    hoopPassT: null,
    g,
  };

  drawSimFrame(simCtx, simCanvas, simState);
  newtonCtx = document.getElementById('newton-canvas').getContext('2d');
  redrawNewton(simState);

  // Start with Free Play mode
  eduSetActivity(0, 'free');
  buildSidebar();
  applyActivityUI();
  switchInfoTab('equations');
  updateEquations();
});
