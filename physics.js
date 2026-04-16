/**
 * Creates a fresh simulation state.
 * @param {number} h0 - Initial launch height in metres.
 */
function createInitialState(h0 = 3) {
  return {
    wx: 0, wy: h0, vx: 0, vy: 0,
    g: 9.81, wind: 0, initH: h0,
    t: 0, maxH: h0, trail: [],
    launched: false, landed: false, landX: null,
  };
}

/**
 * Advances the simulation by one time step.
 * Mutates `state` in place.
 * @param {object} state
 * @param {number} dt - Time delta in seconds.
 * @returns {boolean} True on the frame the projectile first lands.
 */
function updatePhysics(state, dt) {
  state.wx += state.vx * dt;
  state.wy += state.vy * dt;
  state.vx += state.wind * dt * 0.1;
  state.vy -= state.g   * dt;
  state.t  += dt;
  if (state.wy > state.maxH) state.maxH = state.wy;
  state.trail.push({ x: state.wx, y: state.wy });
  if (state.trail.length > 300) state.trail.shift();

  if (state.wy <= 0 && state.t > 0.1) {
    // Interpolate to find x exactly when wy crossed zero, rather than
    // using the post-step wx which overshoots by vx * (dt - t_cross).
    const vyPrev   = state.vy + state.g * dt;   // vy used for position update (before gravity was applied)
    const dtExtra  = state.wy / vyPrev;          // time past landing within this step (> 0: both terms negative)
    state.wx      -= state.vx * dtExtra;
    state.wy       = 0;
    state.landed   = true;
    state.landX    = state.wx;
    return true;
  }
  return false;
}
