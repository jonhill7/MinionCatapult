// All canvas drawing. No DOM queries — takes ctx, canvas, and state as arguments.

function worldToScreen(wx, wy, camX, camY, groundY) {
  return { sx: wx * 5 - camX, sy: groundY - camY - wy * 10 };
}

function getExpression(vy, launched, landed) {
  if (landed)    return 'shocked';
  if (!launched) return 'normal';
  return vy < -2 ? 'happy' : 'scared';
}

function drawMinion(ctx, x, y, size, expr, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // body
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fillStyle = '#f5c518';
  ctx.fill();
  ctx.strokeStyle = '#c8a000';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // overalls
  ctx.beginPath();
  ctx.arc(0, size * 0.3, size * 0.7, 0.1, Math.PI - 0.1);
  ctx.fillStyle = '#4466cc';
  ctx.fill();

  // goggle strap
  ctx.beginPath();
  ctx.rect(-size, -size * 0.15, size * 2, size * 0.28);
  ctx.fillStyle = '#333';
  ctx.fill();

  // goggle
  ctx.beginPath();
  ctx.arc(0, -size * 0.05, size * 0.42, 0, Math.PI * 2);
  ctx.fillStyle = '#aaccff';
  ctx.fill();
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // pupil
  let pupilX = 0, pupilY = -size * 0.05;
  if (expr === 'shocked') { pupilX =  size * 0.1;  pupilY = -size * 0.1; }
  if (expr === 'scared')  { pupilX = -size * 0.08; pupilY = 0; }
  ctx.beginPath();
  ctx.arc(pupilX, pupilY, size * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(pupilX + size * 0.06, pupilY - size * 0.06, size * 0.05, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();

  // mouth
  ctx.beginPath();
  if (expr === 'happy') {
    ctx.arc(0, size * 0.38, size * 0.22, 0, Math.PI);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5; ctx.stroke();
  } else if (expr === 'shocked' || expr === 'scared') {
    ctx.arc(0, size * 0.42, size * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#333'; ctx.fill();
  } else {
    ctx.moveTo(-size * 0.18, size * 0.42);
    ctx.lineTo( size * 0.18, size * 0.42);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  // arms flailing
  if (expr === 'shocked' || expr === 'scared') {
    ctx.strokeStyle = '#f5c518'; ctx.lineWidth = size * 0.18; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-size * 0.8, -size * 0.2);
    ctx.lineTo(-size * 0.4,  size * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo( size * 0.8, -size * 0.2);
    ctx.lineTo( size * 0.4,  size * 0.1);
    ctx.stroke();
  }

  ctx.restore();
}

function drawCatapult(ctx, x, y, armAngle) {
  ctx.save();
  ctx.translate(x, y);

  // base
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(-30, -8, 60, 16);
  ctx.fillRect(-25,  8, 50, 10);

  // wheels
  ctx.fillStyle = '#5D3A1A';
  ctx.beginPath(); ctx.arc(-20, 18, 10, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( 20, 18, 10, 0, Math.PI * 2); ctx.fill();

  // pivot
  ctx.beginPath(); ctx.arc(0, -8, 5, 0, Math.PI * 2); ctx.fillStyle = '#666'; ctx.fill();

  // arm + cup
  ctx.save();
  ctx.translate(0, -8);
  ctx.rotate(armAngle);
  ctx.fillStyle = '#6B3A1A';
  ctx.fillRect(-4, -55, 8, 60);
  ctx.beginPath();
  ctx.arc(0, -55, 12, 0, Math.PI);
  ctx.strokeStyle = '#4a2800'; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function drawSkyObjects(ctx, w, h, camX, theme) {
  const scroll = (offset, factor) =>
    ((offset - camX * factor) % (w + 300) + w + 300) % (w + 300) - 100;

  switch (theme.skyObjects) {

    case 'clouds': {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      [0, 180, 360].forEach(o => {
        const cx = scroll(o, 0.2);
        ctx.beginPath(); ctx.arc(cx,      40,  25, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 30, 35,  20, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 55, 40,  22, 0, Math.PI * 2); ctx.fill();
      });
      break;
    }

    case 'dust': {
      // Flat reddish dust wisps drifting slowly
      [0, 220, 440].forEach((o, i) => {
        const cx = scroll(o, 0.15);
        const cy = 52 + i * 18;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(2.8, 0.5);
        ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(140,60,15,0.32)';
        ctx.fill();
        ctx.restore();
      });
      break;
    }

    case 'bands': {
      // Jupiter atmospheric band streaks — fixed, they span the whole sky
      [
        [0.10, 0.08, 'rgba(155, 85, 25, 0.45)'],
        [0.26, 0.06, 'rgba(195,135, 55, 0.35)'],
        [0.40, 0.10, 'rgba(135, 65, 18, 0.42)'],
      ].forEach(([yFrac, hFrac, col]) => {
        ctx.fillStyle = col;
        ctx.fillRect(0, h * yFrac, w, h * hFrac);
      });
      break;
    }

    case 'stars': {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      for (let i = 0; i < 70; i++) {
        const x = (i * 137.508) % w;
        const y = (i * 97.314)  % (h * 0.72);
        ctx.beginPath();
        ctx.arc(x, y, i % 4 === 0 ? 1.5 : 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'venusClouds': {
      // Thick yellowish-orange sulphuric acid clouds
      [0, 170, 340].forEach(o => {
        const cx = scroll(o, 0.1);
        ctx.fillStyle = 'rgba(210,155,40,0.65)';
        ctx.beginPath(); ctx.arc(cx,      35,  30, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 38, 28,  24, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 68, 36,  26, 0, Math.PI * 2); ctx.fill();
      });
      break;
    }

    case 'iceClouds': {
      // Blue-white methane ice wisps
      [0, 200, 400].forEach(o => {
        const cx = scroll(o, 0.25);
        ctx.fillStyle = 'rgba(190,220,255,0.6)';
        ctx.beginPath(); ctx.arc(cx,      42,  22, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 28, 35,  16, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 50, 43,  19, 0, Math.PI * 2); ctx.fill();
      });
      break;
    }

    case 'starsWithMoon': {
      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (let i = 0; i < 70; i++) {
        const x = (i * 137.508) % w;
        const y = (i * 97.314)  % (h * 0.72);
        ctx.beginPath();
        ctx.arc(x, y, i % 4 === 0 ? 1.5 : 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      // Charon — large grey moon fixed in the upper-right sky
      const cx = w * 0.78, cy = h * 0.15;
      ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2);
      ctx.fillStyle   = 'rgba(155,135,125,0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(190,175,165,0.5)';
      ctx.lineWidth   = 1.5;
      ctx.stroke();
      break;
    }
  }
}

function drawBackground(ctx, w, h, camX, camY, groundY, theme) {
  const t = theme || { sky: '#87CEEB', ground: '#4CAF50', soil: '#8B6914', skyObjects: 'clouds' };

  // sky
  ctx.fillStyle = t.sky;
  ctx.fillRect(0, 0, w, h);

  // sky objects
  drawSkyObjects(ctx, w, h, camX, t);

  // ground surface + soil
  const screenGroundY = groundY - camY;
  ctx.fillStyle = t.ground;
  ctx.fillRect(0, screenGroundY,      w, 18);
  ctx.fillStyle = t.soil;
  ctx.fillRect(0, screenGroundY + 18, w, h - screenGroundY - 18);

  // distance markers
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.font = '11px sans-serif';
  for (let d = 0; d < 2000; d += 20) {
    const sx = d * 5 - camX;
    if (sx > -10 && sx < w + 10) {
      ctx.fillRect(sx, screenGroundY, 2, 8);
      if (d % 40 === 0) ctx.fillText(d + 'm', sx - 10, screenGroundY + 20);
    }
  }
}

function drawLaunchArrow(ctx, x, y, angleRad) {
  const dx = Math.cos(angleRad);
  const dy = -Math.sin(angleRad);   // screen Y is flipped

  const x1 = x + dx * 22,  y1 = y + dy * 22;   // start outside minion radius
  const x2 = x + dx * 75,  y2 = y + dy * 75;   // tip

  const headLen = 11;
  const headSpread = Math.PI / 6;
  const shaftAngle = Math.atan2(y2 - y1, x2 - x1);

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur  = 3;

  // dashed shaft
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = 'rgba(255,255,255,0.88)';
  ctx.lineWidth   = 2;
  ctx.setLineDash([5, 3]);
  ctx.stroke();
  ctx.setLineDash([]);

  // arrowhead
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(shaftAngle - headSpread),
             y2 - headLen * Math.sin(shaftAngle - headSpread));
  ctx.lineTo(x2 - headLen * Math.cos(shaftAngle + headSpread),
             y2 - headLen * Math.sin(shaftAngle + headSpread));
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.fill();

  // angle label just past the tip
  const angleDeg = Math.round(angleRad * 180 / Math.PI);
  ctx.font         = 'bold 12px sans-serif';
  ctx.fillStyle    = 'rgba(255,255,255,0.95)';
  ctx.textBaseline = 'middle';
  ctx.textAlign    = dx >= 0 ? 'left' : 'right';
  ctx.fillText(angleDeg + '°', x2 + dx * 8, y2 + dy * 8);

  ctx.restore();
}

/**
 * Renders a complete simulation frame onto the given canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {object} state
 */
function drawSimFrame(ctx, canvas, state) {
  const w = canvas.width, h = canvas.height;
  const groundY = h * 0.75;
  const s = state;
  const camX = s.launched ? Math.max(0, s.wx * 5 - w / 2) : 0;
  const camY = s.launched ? Math.min(0, -(Math.max(0, s.wy * 10 - h * 0.4))) : 0;

  drawBackground(ctx, w, h, camX, camY, groundY, s.theme);

  // catapult
  const catPos   = worldToScreen(0, s.initH, camX, camY, groundY);
  const armAngle = s.launched ? -Math.PI * 0.9 : -Math.PI * 0.15;
  drawCatapult(ctx, catPos.sx, catPos.sy, armAngle);

  // launch angle arrow (idle only)
  if (!s.launched && s.angleRad != null) {
    drawLaunchArrow(ctx, catPos.sx, catPos.sy, s.angleRad);
  }

  // trajectory trail
  if (s.trail.length > 1) {
    ctx.beginPath();
    s.trail.forEach((pt, i) => {
      const sp = worldToScreen(pt.x, pt.y, camX, camY, groundY);
      if (i === 0) ctx.moveTo(sp.sx, sp.sy);
      else         ctx.lineTo(sp.sx, sp.sy);
    });
    ctx.strokeStyle = 'rgba(232,107,42,0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // landing marker
  if (s.landed && s.landX !== null) {
    const lp = worldToScreen(s.landX, 0, camX, camY, groundY);
    ctx.fillStyle = '#e82a2a';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('X', lp.sx - 6, lp.sy + 5);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.font = '11px sans-serif';
    ctx.fillText(s.landX.toFixed(1) + 'm', lp.sx - 15, lp.sy + 20);
  }

  // minion
  if (s.launched || !s.landed) {
    const mp       = worldToScreen(s.wx, s.wy, camX, camY, groundY);
    const velAngle = s.launched ? Math.atan2(-s.vy, s.vx) : -Math.PI / 4;
    const expr     = getExpression(s.vy, s.launched, s.landed);
    drawMinion(ctx, mp.sx, mp.sy, 18, expr, s.launched ? velAngle * 0.3 : 0);
  }

  // speed bar
  if (s.launched && !s.landed) {
    const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 10, 130, 20);
    ctx.fillStyle = '#f5c518';
    ctx.fillRect(10, 10, Math.min(130, speed * 2), 20);
    ctx.fillStyle = 'white';
    ctx.font = '11px sans-serif';
    ctx.fillText('speed: ' + speed.toFixed(1) + ' m/s', 14, 24);
  }
}
