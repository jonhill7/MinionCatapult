// All canvas drawing. No DOM queries — takes ctx, canvas, and state as arguments.

function worldToScreen(wx, wy, camX, camY, groundY, scale) {
  return { sx: wx * scale - camX, sy: groundY - camY - wy * 10 };
}

function getExpression(vy, launched, landed) {
  if (landed)    return 'shocked';
  if (!launched) return 'normal';
  return vy < -2 ? 'happy' : 'scared';
}

function drawMinion(ctx, x, y, size, expr, angle, spaceSuit) {
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

  if (spaceSuit) {
    // transparent circular dome around the minion
    const domeR = size * 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, domeR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(180, 220, 255, 0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(160, 210, 255, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // shine highlight
    ctx.beginPath();
    ctx.arc(-domeR * 0.35, -domeR * 0.45, domeR * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fill();
  }

  ctx.restore();
}

// expr: 'idle' | 'excited' | 'worried' | 'aha'
function drawNewtonMinion(ctx, x, y, size, expr = 'idle') {
  ctx.save();
  ctx.translate(x, y);

  // wig back layer (side curls + top mass, drawn before body)
  ctx.fillStyle = '#ece6db';
  ctx.beginPath();
  ctx.ellipse(-size * 0.92, size * 0.05, size * 0.3, size * 0.55, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.92, size * 0.05, size * 0.3, size * 0.55, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -size * 0.5, size * 0.92, Math.PI, 0);
  ctx.fill();

  // body
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fillStyle = '#f5c518';
  ctx.fill();
  ctx.strokeStyle = '#c8a000';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // dark coat (instead of overalls)
  ctx.beginPath();
  ctx.arc(0, size * 0.3, size * 0.7, 0.1, Math.PI - 0.1);
  ctx.fillStyle = '#4466cc';
  ctx.fill();

  // wig front (sits over the top portion of the face)
  ctx.fillStyle = '#ece6db';
  ctx.beginPath();
  ctx.arc(0, -size * 0.32, size * 0.8, Math.PI, 0);
  ctx.fill();
  // curl texture lines
  ctx.strokeStyle = '#cec8bc';
  ctx.lineWidth = 1;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.arc(i * size * 0.28, -size * 0.46, size * 0.16, 0.1, Math.PI - 0.1);
    ctx.stroke();
  }

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

  // pupil — position and size vary by expression
  let px = size * 0.04, py = -size * 0.1, pr = size * 0.18;
  if (expr === 'excited') { px =  size * 0.04; py = -size * 0.16; pr = size * 0.21; }
  if (expr === 'worried')  { px = -size * 0.06; py = -size * 0.02; pr = size * 0.16; }
  if (expr === 'aha')      { px =  size * 0.08; py = -size * 0.14; pr = size * 0.22; }
  ctx.beginPath();
  ctx.arc(px, py, pr, 0, Math.PI * 2);
  ctx.fillStyle = '#111';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(px + size * 0.06, py - size * 0.06, size * 0.05, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();

  // mouth — shape varies by expression
  ctx.beginPath();
  if (expr === 'excited') {
    // medium smile
    ctx.arc(0, size * 0.32, size * 0.22, 0.08, Math.PI - 0.08);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.stroke();
  } else if (expr === 'worried') {
    // frown: center sits below the arc so it curves upward on screen
    ctx.arc(0, size * 0.50, size * 0.18, Math.PI, 0);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.stroke();
  } else if (expr === 'aha') {
    // huge eureka grin
    ctx.arc(0, size * 0.27, size * 0.28, 0.02, Math.PI - 0.02);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2.5; ctx.stroke();
  } else {
    // idle: small knowing smile
    ctx.arc(0, size * 0.38, size * 0.15, 0.1, Math.PI - 0.1);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  // apple — lower right corner of canvas
  const ax = size * 1.35, ay = size * 0.95;
  const ar = size * 0.6;
  ctx.beginPath();
  ctx.arc(ax, ay, ar, 0, Math.PI * 2);
  ctx.fillStyle = '#dd2222';
  ctx.fill();
  ctx.strokeStyle = '#aa1111';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // highlight
  ctx.beginPath();
  ctx.arc(ax - ar * 0.3, ay - ar * 0.35, ar * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fill();
  // stem
  ctx.beginPath();
  ctx.moveTo(ax, ay - ar);
  ctx.quadraticCurveTo(ax + ar * 0.35, ay - ar * 1.5, ax + ar * 0.1, ay - ar * 1.65);
  ctx.strokeStyle = '#553300';
  ctx.lineWidth = 2;
  ctx.stroke();
  // leaf
  ctx.beginPath();
  ctx.ellipse(ax + ar * 0.45, ay - ar * 1.35, ar * 0.32, ar * 0.16, 0.7, 0, Math.PI * 2);
  ctx.fillStyle = '#339933';
  ctx.fill();

  ctx.restore();
}

function drawBasket(ctx, sx, screenGroundY, pxHalfW, caught) {
  const bw = pxHalfW;
  const bh = Math.max(bw * 0.75, 14);
  const top = screenGroundY - bh;

  // body trapezoid (wider at top, narrower at bottom)
  ctx.beginPath();
  ctx.moveTo(sx - bw * 0.78, screenGroundY);
  ctx.lineTo(sx + bw * 0.78, screenGroundY);
  ctx.lineTo(sx + bw,        top);
  ctx.lineTo(sx - bw,        top);
  ctx.closePath();
  ctx.fillStyle = caught ? 'rgba(255,215,50,0.92)' : 'rgba(175,105,35,0.88)';
  ctx.fill();
  ctx.strokeStyle = caught ? '#aa7700' : '#6a3808';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // weave lines
  ctx.lineWidth = 1;
  ctx.strokeStyle = caught ? 'rgba(160,100,0,0.55)' : 'rgba(90,45,8,0.45)';
  for (let i = 1; i <= 3; i++) {
    const frac = i / 4;
    const ly  = top + bh * frac;
    const lw  = bw * 0.78 + bw * (1 - 0.78) * (1 - frac);
    ctx.beginPath(); ctx.moveTo(sx - lw, ly); ctx.lineTo(sx + lw, ly); ctx.stroke();
  }

  // oval rim
  ctx.beginPath();
  ctx.ellipse(sx, top, bw, bw * 0.22, 0, 0, Math.PI * 2);
  ctx.fillStyle = caught ? 'rgba(220,165,30,0.95)' : 'rgba(130,75,18,0.95)';
  ctx.fill();
  ctx.strokeStyle = caught ? '#996600' : '#4e2a04';
  ctx.lineWidth = 1.5;
  ctx.stroke();

}

function drawCelebration(ctx, sx, screenGroundY, bw) {
  const colors = ['#f5c518', '#e82a2a', '#4CAF50', '#2196F3', '#FF9800', '#e040fb'];
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    const dist  = bw + 18 + (i % 3) * 14;
    const px    = sx + Math.cos(angle) * dist;
    const py    = screenGroundY - bw * 0.75 + Math.sin(angle) * dist * 0.5;
    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
  }

  const ty = screenGroundY - bw * 0.75 - 28;
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.strokeText('CAUGHT!', sx, ty);
  ctx.fillStyle = '#f5c518';
  ctx.fillText('CAUGHT!', sx, ty);
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

function drawSkyObjects(ctx, w, h, camX, camY, theme) {
  // hScroll: horizontal parallax wrap (same as before)
  const hScroll = (offset, factor) =>
    ((offset - camX * factor) % (w + 300) + w + 300) % (w + 300) - 100;
  // vShift: vertical parallax — camY ≤ 0, so -camY ≥ 0; distant objects drift
  // down more slowly than the ground does as the camera rises.
  const vShift = factor => -camY * factor;

  switch (theme.skyObjects) {

    case 'clouds': {
      const vy = vShift(0.12);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      [0, 180, 360].forEach(o => {
        const cx = hScroll(o, 0.2);
        const cy = 40 + vy;
        ctx.beginPath(); ctx.arc(cx,      cy,      25, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 30, cy -  5, 20, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 55, cy,      22, 0, Math.PI * 2); ctx.fill();
      });
      break;
    }

    case 'dust': {
      // Low-altitude wisps — more vertical shift than high clouds
      [0, 220, 440].forEach((o, i) => {
        const cx = hScroll(o, 0.15);
        const cy = 52 + i * 18 + vShift(0.08);
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
      // Jupiter atmospheric bands — full-width stripes that shift down slowly
      const vy = vShift(0.05);
      [
        [0.10, 0.08, 'rgba(155, 85, 25, 0.45)'],
        [0.26, 0.06, 'rgba(195,135, 55, 0.35)'],
        [0.40, 0.10, 'rgba(135, 65, 18, 0.42)'],
      ].forEach(([yFrac, hFrac, col]) => {
        ctx.fillStyle = col;
        ctx.fillRect(0, h * yFrac + vy, w, h * hFrac);
      });
      break;
    }

    case 'stars': {
      const skyH = h * 0.72;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      for (let i = 0; i < 130; i++) {
        const hx    = Math.abs((Math.sin(i * 127.1 + 0.1) * 43758.5453) % 1);
        const hy    = Math.abs((Math.sin(i * 311.7 + 0.2) * 43758.5453) % 1);
        const hs    = Math.abs((Math.sin(i * 743.3 + 0.3) * 43758.5453) % 1);
        const baseX = hx * w;
        const baseY = hy * skyH;
        const x     = ((baseX - camX * 0.05) % w    + w)    % w;
        const y     = ((baseY - camY * 0.03) % skyH + skyH) % skyH;
        const r     = hs < 0.10 ? 1.6 : hs < 0.35 ? 1.0 : 0.65;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'venusClouds': {
      const vy = vShift(0.12);
      [0, 170, 340].forEach(o => {
        const cx = hScroll(o, 0.1);
        const cy = 35 + vy;
        ctx.fillStyle = 'rgba(210,155,40,0.65)';
        ctx.beginPath(); ctx.arc(cx,      cy,      30, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 38, cy -  7, 24, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 68, cy +  1, 26, 0, Math.PI * 2); ctx.fill();
      });
      break;
    }

    case 'iceClouds': {
      const vy = vShift(0.10);
      [0, 200, 400].forEach(o => {
        const cx = hScroll(o, 0.25);
        const cy = 42 + vy;
        ctx.fillStyle = 'rgba(190,220,255,0.6)';
        ctx.beginPath(); ctx.arc(cx,      cy,      22, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 28, cy -  7, 16, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 50, cy +  1, 19, 0, Math.PI * 2); ctx.fill();
      });
      break;
    }

    case 'starsWithMoon': {
      const skyH = h * 0.72;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (let i = 0; i < 130; i++) {
        const hx    = Math.abs((Math.sin(i * 127.1 + 0.1) * 43758.5453) % 1);
        const hy    = Math.abs((Math.sin(i * 311.7 + 0.2) * 43758.5453) % 1);
        const hs    = Math.abs((Math.sin(i * 743.3 + 0.3) * 43758.5453) % 1);
        const baseX = hx * w;
        const baseY = hy * skyH;
        const x     = ((baseX - camX * 0.05) % w    + w)    % w;
        const y     = ((baseY - camY * 0.03) % skyH + skyH) % skyH;
        const r     = hs < 0.10 ? 1.6 : hs < 0.35 ? 1.0 : 0.65;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Charon — tidally locked, stationary in Pluto's sky
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

function drawBackground(ctx, w, h, camX, camY, groundY, theme, scale) {
  const t = theme || { sky: '#87CEEB', ground: '#4CAF50', soil: '#8B6914', skyObjects: 'clouds' };

  // sky
  ctx.fillStyle = t.sky;
  ctx.fillRect(0, 0, w, h);

  // sky objects
  drawSkyObjects(ctx, w, h, camX, camY, t);

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
    const sx = d * scale - camX;
    if (sx > -10 && sx < w + 10) {
      ctx.fillRect(sx, screenGroundY, 2, 8);
      if (d % 40 === 0) ctx.fillText(d + 'm', sx - 10, screenGroundY + 20);
    }
  }
}

function drawLaunchArrow(ctx, x, y, angleRad, speed) {
  const dx = Math.cos(angleRad);
  const dy = -Math.sin(angleRad);   // screen Y is flipped

  const tipDist = Math.min(30 + (speed || 25) * 1.8, 130);
  const x1 = x + dx * 22,  y1 = y + dy * 22;   // start outside minion radius
  const x2 = x + dx * tipDist,  y2 = y + dy * tipDist;   // tip

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

function drawHoopBack(ctx, sx, sy, pxR, screenGroundY, passed) {
  const strokeW = Math.max(5, pxR * 0.16);

  // support pole
  ctx.beginPath();
  ctx.moveTo(sx, screenGroundY);
  ctx.lineTo(sx, sy + pxR);
  ctx.strokeStyle = passed ? '#886600' : '#777';
  ctx.lineWidth = Math.max(3, strokeW * 0.5);
  ctx.stroke();

  // back (top) arc — dimmer to suggest depth
  ctx.beginPath();
  ctx.arc(sx, sy, pxR, Math.PI, 0);
  ctx.strokeStyle = passed ? 'rgba(170,120,0,0.65)' : 'rgba(150,60,10,0.65)';
  ctx.lineWidth = strokeW;
  ctx.stroke();
}

function drawHoopFront(ctx, sx, sy, pxR, passed, animT, atApex) {
  const strokeW = Math.max(5, pxR * 0.16);

  // front (bottom) arc
  ctx.beginPath();
  ctx.arc(sx, sy, pxR, 0, Math.PI);
  ctx.strokeStyle = !passed ? '#ff6600' : atApex ? '#ffcc00' : '#ff8c00';
  ctx.lineWidth = strokeW;
  ctx.stroke();

  if (animT < 0) return;

  if (atApex) {
    // full celebration — gold
    [0, 0.22, 0.44].forEach(offset => {
      const t = animT - offset;
      if (t >= 0 && t < 0.75) {
        const prog  = t / 0.75;
        ctx.beginPath();
        ctx.arc(sx, sy, pxR * (1 + prog * 1.8), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,215,0,${(1 - prog) * 0.9})`;
        ctx.lineWidth = Math.max(3, strokeW * 0.7);
        ctx.stroke();
      }
    });

    if (animT < 0.55) {
      const alpha  = 1 - animT / 0.55;
      const colors = ['#f5c518','#e82a2a','#4CAF50','#2196F3','#FF9800','#e040fb'];
      ctx.save();
      ctx.globalAlpha = alpha;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const dist  = pxR * (0.4 + animT * 4.5);
        ctx.beginPath();
        ctx.arc(sx + Math.cos(angle) * dist, sy + Math.sin(angle) * dist, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
      }
      ctx.restore();
    }

    if (animT < 1.1) {
      const prog  = Math.max(0, animT - 0.05);
      const alpha = prog < 0.3 ? prog / 0.3 : Math.max(0, 1 - (prog - 0.3) / 0.7);
      const textY = sy - pxR - 12 - animT * 25;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `bold ${Math.max(20, Math.round(pxR * 0.9))}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.strokeText('NICE!', sx, textY);
      ctx.fillStyle = '#f5c518';
      ctx.fillText('NICE!', sx, textY);
      ctx.restore();
    }

  } else {
    // toned-down — orange, two rings, no text
    [0, 0.28].forEach(offset => {
      const t = animT - offset;
      if (t >= 0 && t < 0.65) {
        const prog  = t / 0.65;
        ctx.beginPath();
        ctx.arc(sx, sy, pxR * (1 + prog * 1.2), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,140,0,${(1 - prog) * 0.7})`;
        ctx.lineWidth = Math.max(2, strokeW * 0.5);
        ctx.stroke();
      }
    });

    if (animT < 0.45) {
      const alpha = 1 - animT / 0.45;
      ctx.save();
      ctx.globalAlpha = alpha;
      for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2;
        const dist  = pxR * (0.4 + animT * 3.5);
        ctx.beginPath();
        ctx.arc(sx + Math.cos(angle) * dist, sy + Math.sin(angle) * dist, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ff8c00';
        ctx.fill();
      }
      ctx.restore();
    }
  }
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
  const scale = w / 50;
  const s = state;
  const camX = s.wx * scale - w / 2;
  const camY = s.launched ? Math.min(0, -(Math.max(0, s.wy * 10 - h * 0.4))) : 0;

  drawBackground(ctx, w, h, camX, camY, groundY, s.theme, scale);

  // catapult
  const catPos   = worldToScreen(0, s.initH, camX, camY, groundY, scale);
  const armAngle = s.launched ? -Math.PI * 0.9 : -Math.PI * 0.15;
  drawCatapult(ctx, catPos.sx, catPos.sy, armAngle);

  // launch angle arrow (idle only)
  if (!s.launched && s.angleRad != null) {
    drawLaunchArrow(ctx, catPos.sx, catPos.sy, s.angleRad, s.speed);
  }

  // trajectory trail
  if (s.trail.length > 1) {
    ctx.beginPath();
    s.trail.forEach((pt, i) => {
      const sp = worldToScreen(pt.x, pt.y, camX, camY, groundY, scale);
      if (i === 0) ctx.moveTo(sp.sx, sp.sy);
      else         ctx.lineTo(sp.sx, sp.sy);
    });
    ctx.strokeStyle = 'rgba(232,107,42,0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // hoop — back half drawn here so minion passes in front of it
  const HOOP_RADIUS = 3; // world metres
  let hoopSx = null, hoopSy = null, hoopPxR = 0;
  if (s.hoopX > 0 && s.hoopY > 0) {
    const hp = worldToScreen(s.hoopX, s.hoopY, camX, camY, groundY, scale);
    hoopSx = hp.sx; hoopSy = hp.sy;
    hoopPxR = HOOP_RADIUS * scale;
    drawHoopBack(ctx, hoopSx, hoopSy, hoopPxR, groundY - camY, !!s.hoopPassed);
  }

  // basket
  const CATCH_RADIUS = 3; // world metres
  if (s.basketX) {
    const bp         = worldToScreen(s.basketX, 0, camX, camY, groundY, scale);
    const pxHalfW    = CATCH_RADIUS * scale;
    const screenGndY = groundY - camY + 18;
    drawBasket(ctx, bp.sx, screenGndY, pxHalfW, !!s.caught);
    if (s.caught) drawCelebration(ctx, bp.sx, screenGndY, pxHalfW);
  }

  // landing marker
  if (s.landed && s.landX !== null) {
    const lp = worldToScreen(s.landX, 0, camX, camY, groundY, scale);
    ctx.fillStyle = '#e82a2a';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('X', lp.sx - 6, lp.sy + 5);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.font = '11px sans-serif';
    ctx.fillText(s.landX.toFixed(1) + 'm', lp.sx - 15, lp.sy + 20);
  }

  // minion
  if (s.launched || !s.landed) {
    const mp       = worldToScreen(s.wx, s.wy, camX, camY, groundY, scale);
    const velAngle = s.launched ? Math.atan2(-s.vy, s.vx) : -Math.PI / 4;
    const expr     = getExpression(s.vy, s.launched, s.landed);
    drawMinion(ctx, mp.sx, mp.sy, 18, expr, s.launched ? velAngle * 0.3 : 0, s.planet !== 'Earth');
  }

  // hoop — front half drawn after minion so it overlaps (3D through-ring feel)
  if (hoopSx !== null) {
    const animT = s.hoopPassed ? s.t - s.hoopPassT : -1;
    drawHoopFront(ctx, hoopSx, hoopSy, hoopPxR, !!s.hoopPassed, animT, !!s.hoopAtApex);
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
