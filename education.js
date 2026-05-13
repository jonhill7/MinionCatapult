// Educational mode state and math utilities.
// Depends on lessons.js being loaded first (LESSONS, FREE_PLAY constants).

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const EduState = {
  mode: 'free',          // 'free' | 'lesson'
  lessonId: null,
  activity: null,        // active activity object from LESSONS
  overlays: {},          // keys: vertex, axisSym, intercepts, targetHeight, discriminant, solutionPoints
  showTargetHeight: false,
  showDiscriminant: false,
  isCircleMode: false,
  targetHeight: 10,      // metres; used in lessons 8-10
  circleH: 3,
  circleK: 2,
  circleR: 5,
  promptIndex: 0,
};

function eduSetActivity(lessonId, activityId) {
  if (lessonId === 0) {
    EduState.mode         = 'free';
    EduState.lessonId     = null;
    EduState.activity     = FREE_PLAY.activities[0];
    EduState.overlays     = {};
    EduState.showTargetHeight  = false;
    EduState.showDiscriminant  = false;
    EduState.isCircleMode = false;
    EduState.promptIndex  = 0;
    return;
  }
  const lesson = LESSONS.find(l => l.id === lessonId);
  if (!lesson) return;
  const activity = lesson.activities.find(a => a.id === activityId);
  if (!activity) return;

  EduState.mode         = 'lesson';
  EduState.lessonId     = lessonId;
  EduState.activity     = activity;
  EduState.overlays     = Object.assign({}, activity.overlays || {});
  EduState.showTargetHeight  = !!activity.showTargetHeight;
  EduState.showDiscriminant  = !!activity.showDiscriminant;
  EduState.isCircleMode = !!activity.isCircleMode;
  EduState.promptIndex  = 0;
}

// ---------------------------------------------------------------------------
// Equation form computation
// ---------------------------------------------------------------------------

// Returns { a, b, c, h, k, R } or null if inputs are invalid.
// a = leading coefficient, b = linear coefficient, c = constant (always 0 for ground launch)
// h = vertex x (axis of symmetry), k = vertex y (max height), R = landing distance
function eduComputeForms(speed, angleRad, gravity) {
  if (!speed || !angleRad || !gravity || speed < 0.1 || gravity < 0.01) return null;
  const vx  = speed * Math.cos(angleRad);
  const vy0 = speed * Math.sin(angleRad);
  if (Math.abs(vx) < 0.01) return null;

  const a = -gravity / (2 * vx * vx);
  const b = vy0 / vx;
  const c = 0;                        // launch from ground
  const h = -b / (2 * a);            // vertex x
  const k = -(b * b) / (4 * a);      // vertex y (max height)
  const R = -b / a;                   // landing x (other x-intercept)
  return { a, b, c, h, k, R };
}

// Discriminant for solving y = targetH: ax²+bx+(c−T)=0 → D = b²−4a(c−T) = b²+4aT (c=0)
function eduDiscriminant(forms, targetH) {
  if (!forms) return null;
  return forms.b * forms.b + 4 * forms.a * targetH;
}

// Real x-values where the parabola equals targetH. Returns [] when imaginary.
function eduSolutionPoints(forms, targetH) {
  if (!forms) return [];
  const D = eduDiscriminant(forms, targetH);
  if (D < 0) return [];
  const sqrtD = Math.sqrt(Math.max(0, D));
  const x1 = (-forms.b + sqrtD) / (2 * forms.a);
  const x2 = (-forms.b - sqrtD) / (2 * forms.a);
  const pts = [];
  if (x1 >= -0.5) pts.push({ x: x1, y: targetH });
  if (Math.abs(x1 - x2) > 0.05 && x2 >= -0.5) pts.push({ x: x2, y: targetH });
  return pts;
}

// ---------------------------------------------------------------------------
// Equation formatting helpers
// ---------------------------------------------------------------------------

function _n(val, decimals) {
  if (val === null || val === undefined || isNaN(val)) return '?';
  return Math.abs(val).toFixed(decimals);
}
function _sign(val) { return val < 0 ? ' − ' : ' + '; }
function _lead(val, decimals) { return (val < 0 ? '−' : '') + _n(val, decimals); }

function eduFormatGeneral(forms) {
  if (!forms) return 'y = ax² + bx + c';
  const { a, b } = forms;
  return `y = ${_lead(a, 4)}x²${_sign(b)}${_n(b, 4)}x`;
}

function eduFormatVertex(forms) {
  if (!forms) return 'y = a(x − h)² + k';
  const { a, h, k } = forms;
  const hSign = h >= 0 ? ' − ' : ' + ';
  const kSign = k >= 0 ? ' + ' : ' − ';
  return `y = ${_lead(a, 4)}(x${hSign}${_n(h, 2)})²${kSign}${_n(k, 2)}`;
}

function eduFormatFactored(forms) {
  if (!forms) return 'y = a(x − p)(x − q)';
  const { a, R } = forms;
  const Rsign = R >= 0 ? ' − ' : ' + ';
  return `y = ${_lead(a, 4)} · x · (x${Rsign}${_n(R, 2)})`;
}

// Returns a descriptor object for displaying the discriminant state.
function eduFormatDiscriminant(forms, targetH) {
  if (!forms) return { label: 'D = ?', detail: '', cssClass: '' };
  const D   = eduDiscriminant(forms, targetH);
  const Dabs = Math.abs(D).toFixed(3);
  if (D > 0.01) {
    const sqrtD = Math.sqrt(D);
    const x1 = (-forms.b + sqrtD) / (2 * forms.a);
    const x2 = (-forms.b - sqrtD) / (2 * forms.a);
    return {
      label:    `D = b² + 4aT = ${D.toFixed(3)} > 0`,
      detail:   `Two real solutions: x₁ = ${x1.toFixed(2)} m,  x₂ = ${x2.toFixed(2)} m`,
      cssClass: 'disc-positive',
    };
  }
  if (D >= -0.01) {
    const x = -forms.b / (2 * forms.a);
    return {
      label:    `D = b² + 4aT ≈ 0`,
      detail:   `One repeated solution: x = ${x.toFixed(2)} m  (tangent at vertex)`,
      cssClass: 'disc-zero',
    };
  }
  const re  = (-forms.b / (2 * forms.a)).toFixed(2);
  const im  = (Math.sqrt(-D) / (2 * Math.abs(forms.a))).toFixed(3);
  return {
    label:    `D = b² + 4aT = −${Dabs} < 0`,
    detail:   `No real solutions — complex: x = ${re} ± ${im}i`,
    cssClass: 'disc-negative',
  };
}

// ---------------------------------------------------------------------------
// Circle mode helpers
// ---------------------------------------------------------------------------

function eduCircleStandard(h, k, r) {
  const hSign = h >= 0 ? ' − ' : ' + ';
  const kSign = k >= 0 ? ' − ' : ' + ';
  return `(x${hSign}${Math.abs(h).toFixed(1)})² + (y${kSign}${Math.abs(k).toFixed(1)})² = ${(r * r).toFixed(1)}`;
}

function eduCircleExpanded(h, k, r) {
  const D = -2 * h, E = -2 * k, F = h * h + k * k - r * r;
  const Dabs = Math.abs(D).toFixed(1), Eabs = Math.abs(E).toFixed(1), Fabs = Math.abs(F).toFixed(1);
  return `x² + y²${_sign(D)}${Dabs}x${_sign(E)}${Eabs}y${_sign(F)}${Fabs} = 0`;
}

// Generate parametric circle points for Chart.js scatter dataset.
function eduCirclePoints(h, k, r, count = 201) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const theta = (2 * Math.PI * i) / (count - 1);
    pts.push({ x: h + r * Math.cos(theta), y: k + r * Math.sin(theta) });
  }
  return pts;
}
