// src/types.ts
var SPINE_POINTS = 20;
var BODY_LENGTH_MULT = 2.4;
var defaultConfig = {
  width: 800,
  height: 600,
  count: 18,
  maxSpeed: 2.2,
  maxForce: 0.05,
  separationRadius: 70,
  alignmentRadius: 100,
  cohesionRadius: 120,
  separationWeight: 2.8,
  alignmentWeight: 1,
  cohesionWeight: 1,
  edgeMargin: 80,
  edgeTurnForce: 0.15,
  wanderStrength: 0.02,
  mouseRadius: 150,
  mouseWeight: 1.5,
  maxTurnRate: 0.045
};

// src/boids.ts
var PATCH_COLORS = [
  "#c85040",
  // hi (red-orange)
  "#e08030",
  // orenji (orange)
  "#cc3333",
  // aka (red)
  "#2c3e50",
  // sumi (ink black)
  "#d4a050",
  // yamabuki (gold)
  "#8c5a3c",
  // chagoi (brown)
  "#b84040",
  // beni (crimson)
  "#404040"
  // shiro-sumi (charcoal)
];
var vec = (x, y) => ({ x, y });
var add = (a, b) => vec(a.x + b.x, a.y + b.y);
var sub = (a, b) => vec(a.x - b.x, a.y - b.y);
var scale = (v, s) => vec(v.x * s, v.y * s);
var mag = (v) => Math.sqrt(v.x * v.x + v.y * v.y);
var normalize = (v) => {
  const m = mag(v);
  return m > 0 ? scale(v, 1 / m) : vec(0, 0);
};
var limit = (v, max) => {
  const m = mag(v);
  return m > max ? scale(normalize(v), max) : v;
};
var randomInRange = (min, max) => Math.random() * (max - min) + min;
var pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
var segLen = (size) => size * BODY_LENGTH_MULT / SPINE_POINTS;
var generatePatches = () => {
  const count = Math.floor(randomInRange(2, 6));
  const patches = [];
  for (let i = 0; i < count; i++) {
    patches.push({
      t: randomInRange(0.05, 0.85),
      offset: randomInRange(-0.6, 0.6),
      rx: randomInRange(0.06, 0.18),
      ry: randomInRange(0.5, 1.4)
    });
  }
  return patches;
};
var createKoi = (width, height) => {
  const angle = Math.random() * Math.PI * 2;
  const speed = randomInRange(0.5, 1.5);
  const pos = vec(randomInRange(50, width - 50), randomInRange(50, height - 50));
  const dir = vec(Math.cos(angle), Math.sin(angle));
  const size = randomInRange(18, 32);
  const sl = segLen(size);
  const spine = Array.from(
    { length: SPINE_POINTS + 1 },
    (_, i) => vec(pos.x - dir.x * sl * i, pos.y - dir.y * sl * i)
  );
  return {
    pos,
    vel: vec(dir.x * speed, dir.y * speed),
    acc: vec(0, 0),
    patchColor: pickRandom(PATCH_COLORS),
    patches: generatePatches(),
    size,
    spine,
    swimPhase: Math.random() * Math.PI * 2,
    orbiting: false
  };
};
var createSchool = (config) => Array.from(
  { length: config.count },
  () => createKoi(config.width, config.height)
);
var distSq = (a, b) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
};
var computeFlockForces = (koi, school, config) => {
  const { separationRadius, alignmentRadius, cohesionRadius, maxSpeed, maxForce } = config;
  const sepR2 = separationRadius * separationRadius;
  const aliR2 = alignmentRadius * alignmentRadius;
  const cohR2 = cohesionRadius * cohesionRadius;
  const maxR2 = Math.max(sepR2, aliR2, cohR2);
  let sepSteer = vec(0, 0);
  let sepCount = 0;
  let aliAvg = vec(0, 0);
  let aliCount = 0;
  let cohCenter = vec(0, 0);
  let cohCount = 0;
  for (const other of school) {
    const d2 = distSq(koi.pos, other.pos);
    if (d2 === 0 || d2 >= maxR2) continue;
    if (d2 < sepR2) {
      const d = Math.sqrt(d2);
      const diff = scale(normalize(sub(koi.pos, other.pos)), 1 / d);
      sepSteer = add(sepSteer, diff);
      sepCount++;
    }
    if (d2 < aliR2) {
      aliAvg = add(aliAvg, other.vel);
      aliCount++;
    }
    if (d2 < cohR2) {
      cohCenter = add(cohCenter, other.pos);
      cohCount++;
    }
  }
  let sep = vec(0, 0);
  if (sepCount > 0) {
    sepSteer = scale(sepSteer, 1 / sepCount);
    sepSteer = scale(normalize(sepSteer), maxSpeed);
    sep = limit(sub(sepSteer, koi.vel), maxForce);
  }
  let ali = vec(0, 0);
  if (aliCount > 0) {
    aliAvg = scale(aliAvg, 1 / aliCount);
    aliAvg = scale(normalize(aliAvg), maxSpeed);
    ali = limit(sub(aliAvg, koi.vel), maxForce);
  }
  let coh = vec(0, 0);
  if (cohCount > 0) {
    cohCenter = scale(cohCenter, 1 / cohCount);
    const desired = scale(normalize(sub(cohCenter, koi.pos)), maxSpeed);
    coh = limit(sub(desired, koi.vel), maxForce);
  }
  return { sep, ali, coh };
};
var avoidEdges = (koi, config) => {
  let steer = vec(0, 0);
  const { edgeMargin: m, edgeTurnForce: f, width: w, height: h } = config;
  if (koi.pos.x < m) steer = add(steer, vec(f, 0));
  if (koi.pos.x > w - m) steer = add(steer, vec(-f, 0));
  if (koi.pos.y < m) steer = add(steer, vec(0, f));
  if (koi.pos.y > h - m) steer = add(steer, vec(0, -f));
  return steer;
};
var wander = (config) => vec(
  (Math.random() - 0.5) * config.wanderStrength,
  (Math.random() - 0.5) * config.wanderStrength
);
var ATTRACT_RADIUS = 300;
var SCATTER_RADIUS = 250;
var ORBIT_ENTER = 80;
var ORBIT_EXIT = 150;
var mouseInteraction = (koi, mouse, config, orbitCount) => {
  if (!mouse) return { force: vec(0, 0), orbiting: false };
  const d2 = distSq(koi.pos, mouse.pos);
  const d = Math.sqrt(d2);
  const orbitGrow = orbitCount * 12;
  const enterR = ORBIT_ENTER + orbitGrow;
  const exitR = ORBIT_EXIT + orbitGrow;
  const attractR = Math.max(ATTRACT_RADIUS, exitR + 80);
  if (mouse.scatter > 0.2) {
    if (d > SCATTER_RADIUS || d === 0)
      return { force: vec(0, 0), orbiting: false };
    const away = normalize(sub(koi.pos, mouse.pos));
    const heading = normalize(koi.vel);
    const strength2 = config.maxSpeed * 3 * mouse.scatter * (1 - d / SCATTER_RADIUS);
    const dot = away.x * heading.x + away.y * heading.y;
    let fleeDir;
    if (dot < 0.2) {
      const cross = heading.x * away.y - heading.y * away.x;
      const side = cross >= 0 ? 1 : -1;
      fleeDir = vec(-heading.y * side, heading.x * side);
    } else {
      fleeDir = away;
    }
    const flee = scale(fleeDir, strength2);
    return {
      force: limit(sub(flee, koi.vel), config.maxForce * 6),
      orbiting: false
    };
  }
  const inOrbit = koi.orbiting ? d < exitR : d < enterR;
  if (d > attractR) return { force: vec(0, 0), orbiting: false };
  const toward = normalize(sub(mouse.pos, koi.pos));
  if (inOrbit) {
    const tangent = vec(-toward.y, toward.x);
    const orbitSpeed = config.maxSpeed * 0.45;
    const steer2 = scale(tangent, orbitSpeed);
    const inward = scale(toward, config.maxSpeed * 0.15 * (d / exitR));
    return {
      force: limit(
        sub(add(steer2, inward), koi.vel),
        config.maxForce * 1.5
      ),
      orbiting: true
    };
  }
  const strength = config.maxSpeed * 0.9 * ((d - exitR) / (attractR - exitR));
  const steer = scale(toward, Math.max(0, strength));
  return {
    force: limit(sub(steer, koi.vel), config.maxForce * 2),
    orbiting: false
  };
};
var updateSpine = (headPos, oldSpine, sl) => {
  const spine = [headPos];
  for (let i = 1; i <= SPINE_POINTS; i++) {
    const prev = spine[i - 1];
    const cur = oldSpine[i] ?? oldSpine[oldSpine.length - 1];
    const d = sub(cur, prev);
    const dm = mag(d);
    spine.push(
      dm > 0 ? add(prev, scale(d, sl / dm)) : vec(prev.x - sl, prev.y)
    );
  }
  return spine;
};
var updateKoi = (koi, school, mouse, config, dt, orbitCount) => {
  const flock = computeFlockForces(koi, school, config);
  const sep = scale(flock.sep, config.separationWeight);
  const ali = scale(flock.ali, config.alignmentWeight);
  const coh = scale(flock.coh, config.cohesionWeight);
  const edge = avoidEdges(koi, config);
  const wan = wander(config);
  const mouseResult = mouseInteraction(koi, mouse, config, orbitCount);
  const mouseForce = scale(mouseResult.force, config.mouseWeight);
  const acc = [sep, ali, coh, edge, wan, mouseForce].reduce(add, vec(0, 0));
  const scatterAmt = mouse?.scatter ?? 0;
  const cruiseMax = config.maxSpeed * 0.6;
  const effectiveMax = scatterAmt > 0.2 ? config.maxSpeed * (1 + scatterAmt * 2.5) : mouseResult.orbiting ? config.maxSpeed : cruiseMax;
  const desiredVel = limit(add(koi.vel, scale(acc, dt)), effectiveMax);
  const isOrbiting = mouseResult.orbiting;
  const turnBoost = isOrbiting ? 2.5 : 1 + scatterAmt * 3;
  const curAngle = Math.atan2(koi.vel.y, koi.vel.x);
  const desiredAngle = Math.atan2(desiredVel.y, desiredVel.x);
  let angleDiff = desiredAngle - curAngle;
  angleDiff = (angleDiff + Math.PI * 3) % (Math.PI * 2) - Math.PI;
  const maxTurn = config.maxTurnRate * dt * turnBoost;
  const clampedAngle = curAngle + Math.max(-maxTurn, Math.min(maxTurn, angleDiff));
  const curSpeed = mag(koi.vel);
  const desiredSpeed = mag(desiredVel);
  const minOrbitSpeed = isOrbiting ? config.maxSpeed * 0.4 : 0;
  const cruiseSpeed = config.maxSpeed * 0.5;
  const belowCruise = curSpeed < cruiseSpeed ? 0.08 : 0;
  const blendRate = desiredSpeed > curSpeed ? 0.06 + scatterAmt * 0.4 + belowCruise + (isOrbiting ? 0.12 : 0) : 0.03;
  const speed = Math.max(
    minOrbitSpeed,
    curSpeed + (desiredSpeed - curSpeed) * blendRate
  );
  const newVel = vec(
    Math.cos(clampedAngle) * speed,
    Math.sin(clampedAngle) * speed
  );
  const newPos = add(koi.pos, scale(newVel, dt));
  const traveled = mag(scale(newVel, dt));
  const bodyLen = koi.size * BODY_LENGTH_MULT;
  const newSwimPhase = koi.swimPhase + traveled * (Math.PI * 2) / bodyLen;
  const speedRatio = speed / config.maxSpeed;
  const wiggleAmp = koi.size * 0.04 * speedRatio;
  const perpX = -Math.sin(clampedAngle);
  const perpY = Math.cos(clampedAngle);
  const headPos = vec(
    newPos.x + perpX * Math.sin(newSwimPhase) * wiggleAmp,
    newPos.y + perpY * Math.sin(newSwimPhase) * wiggleAmp
  );
  const sl = segLen(koi.size);
  const newSpine = updateSpine(headPos, koi.spine, sl);
  return {
    ...koi,
    pos: newPos,
    vel: newVel,
    acc,
    spine: newSpine,
    swimPhase: newSwimPhase,
    orbiting: mouseResult.orbiting
  };
};
var stepSimulation = (school, mouse, config, dt) => {
  const orbitCount = school.filter((k) => k.orbiting).length;
  return school.map(
    (koi) => updateKoi(koi, school, mouse, config, dt, orbitCount)
  );
};

// src/renderer.ts
var perp = (spine, i) => {
  const a = spine[Math.max(0, i - 1)];
  const b = spine[Math.min(spine.length - 1, i + 1)];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: -dy / len, y: dx / len };
};
var tang = (spine, i) => {
  const a = spine[Math.max(0, i - 1)];
  const b = spine[Math.min(spine.length - 1, i + 1)];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
};
var widthAt = (t) => {
  const peak = 0.22;
  if (t < peak) {
    const r = t / peak;
    return 0.3 + 0.7 * Math.sqrt(r);
  }
  return Math.pow(1 - (t - peak) / (1 - peak), 0.6);
};
var buildBodyOutline = (spine, maxHW) => {
  const n = spine.length;
  const left = [];
  const right = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const p = spine[i];
    const pr = perp(spine, i);
    const hw = widthAt(t) * maxHW;
    left.push({ x: p.x + pr.x * hw, y: p.y + pr.y * hw });
    right.push({ x: p.x - pr.x * hw, y: p.y - pr.y * hw });
  }
  const path = new Path2D();
  path.moveTo(left[0].x, left[0].y);
  for (let i = 1; i < n; i++) {
    const p = left[i - 1];
    const c = left[i];
    path.quadraticCurveTo((p.x + c.x) / 2, (p.y + c.y) / 2, c.x, c.y);
  }
  path.lineTo(right[n - 1].x, right[n - 1].y);
  for (let i = n - 2; i >= 0; i--) {
    const p = right[i + 1];
    const c = right[i];
    path.quadraticCurveTo((p.x + c.x) / 2, (p.y + c.y) / 2, c.x, c.y);
  }
  path.closePath();
  return { path, left, right };
};
var drawKoi = (ctx, koi, alpha) => {
  const spine = koi.spine;
  const n = spine.length;
  const s = koi.size;
  const maxHW = s * 0.28;
  ctx.save();
  ctx.globalAlpha = alpha;
  const tailStart = Math.round(n * 0.65);
  const tailSegments = n - tailStart;
  ctx.globalAlpha = alpha * 0.5;
  ctx.fillStyle = koi.patchColor || "#c4a882";
  ctx.beginPath();
  {
    const ribbonLeft = [];
    const ribbonRight = [];
    for (let i = tailStart; i < n; i++) {
      const localT = (i - tailStart) / (tailSegments - 1);
      const p = spine[i];
      const pr = perp(spine, i);
      let curvature = 0;
      if (i > 0 && i < n - 1) {
        const t0 = tang(spine, i - 1);
        const t1 = tang(spine, i);
        curvature = t0.x * t1.y - t0.y * t1.x;
      }
      const ease = localT * localT * (3 - 2 * localT);
      const bodyW = widthAt(i / (n - 1)) * maxHW;
      const ribbonW = bodyW + ease * maxHW * 0.85;
      const absCurv = Math.abs(curvature);
      const collapse = absCurv * s * 2.5 * ease;
      const swell = curvature * s * 0.6 * ease;
      ribbonLeft.push({
        x: p.x + pr.x * Math.max(
          0,
          ribbonW + swell - (curvature > 0 ? 0 : collapse)
        ),
        y: p.y + pr.y * Math.max(
          0,
          ribbonW + swell - (curvature > 0 ? 0 : collapse)
        )
      });
      ribbonRight.push({
        x: p.x - pr.x * Math.max(
          0,
          ribbonW - swell - (curvature > 0 ? collapse : 0)
        ),
        y: p.y - pr.y * Math.max(
          0,
          ribbonW - swell - (curvature > 0 ? collapse : 0)
        )
      });
    }
    const lastT = tang(spine, n - 1);
    const lastP = perp(spine, n - 1);
    const tipLen = s * 0.3;
    const tipW = maxHW * 0.35;
    const endCurv = (() => {
      const t0 = tang(spine, n - 2);
      const t1 = tang(spine, n - 1);
      return (t0.x * t1.y - t0.y * t1.x) * s * 1.8;
    })();
    const tip = {
      x: spine[n - 1].x + lastT.x * tipLen,
      y: spine[n - 1].y + lastT.y * tipLen
    };
    ribbonLeft.push({
      x: tip.x + lastP.x * (tipW + endCurv),
      y: tip.y + lastP.y * (tipW + endCurv)
    });
    ribbonRight.push({
      x: tip.x - lastP.x * (tipW - endCurv),
      y: tip.y - lastP.y * (tipW - endCurv)
    });
    ctx.moveTo(ribbonLeft[0].x, ribbonLeft[0].y);
    for (let i = 1; i < ribbonLeft.length; i++) {
      const prev = ribbonLeft[i - 1];
      const cur = ribbonLeft[i];
      const mx = (prev.x + cur.x) / 2;
      const my = (prev.y + cur.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
    }
    const lastL = ribbonLeft[ribbonLeft.length - 1];
    ctx.lineTo(lastL.x, lastL.y);
    ctx.quadraticCurveTo(
      tip.x,
      tip.y,
      ribbonRight[ribbonRight.length - 1].x,
      ribbonRight[ribbonRight.length - 1].y
    );
    for (let i = ribbonRight.length - 2; i >= 0; i--) {
      const prev = ribbonRight[i + 1];
      const cur = ribbonRight[i];
      const mx = (prev.x + cur.x) / 2;
      const my = (prev.y + cur.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
    }
    ctx.lineTo(ribbonRight[0].x, ribbonRight[0].y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = alpha;
  const body = buildBodyOutline(spine, maxHW);
  const clipBody = buildBodyOutline(spine, maxHW * 0.92);
  ctx.fillStyle = "#d0c0ac";
  ctx.fill(body.path);
  ctx.save();
  ctx.clip(clipBody.path);
  ctx.fillStyle = koi.patchColor;
  for (const patch of koi.patches) {
    const idx = Math.round(patch.t * (n - 1));
    const p = spine[idx];
    const pr = perp(spine, idx);
    const tg = tang(spine, idx);
    const hw = widthAt(patch.t) * maxHW;
    const cx = p.x + pr.x * hw * patch.offset;
    const cy = p.y + pr.y * hw * patch.offset;
    const bodyLen = s * BODY_LENGTH_MULT;
    const rx = patch.rx * bodyLen;
    const ry = patch.ry * maxHW;
    const angle = Math.atan2(tg.y, tg.x);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 0.8;
  ctx.stroke(body.path);
  const finIdx = Math.round((n - 1) * 0.2);
  ctx.globalAlpha = alpha * 0.5;
  ctx.fillStyle = koi.patchColor || "#c4a882";
  for (const side of [1, -1]) {
    const fp = spine[finIdx];
    const fPerp = perp(spine, finIdx);
    const fTang = tang(spine, finIdx);
    const bodyW = widthAt(finIdx / (n - 1)) * maxHW;
    const spread = 0.5 + Math.sin(koi.swimPhase * 2.5 + side * 1.2) * 0.2;
    const finR = s * 0.5;
    let curv = 0;
    if (finIdx > 0 && finIdx < n - 1) {
      const t0 = tang(spine, finIdx - 1);
      const t1 = tang(spine, finIdx);
      curv = t0.x * t1.y - t0.y * t1.x;
    }
    const isInnerSide = side === 1 && curv > 0 || side === -1 && curv < 0;
    const collapseAmt = isInnerSide ? Math.min(1, Math.abs(curv) * 25) : 0;
    const finalR = finR * (1 - collapseAmt * 0.6);
    const px = fp.x + fPerp.x * bodyW * side;
    const py = fp.y + fPerp.y * bodyW * side;
    const baseAngle = Math.atan2(
      fPerp.y * side * 0.5 + fTang.y * 0.85,
      fPerp.x * side * 0.5 + fTang.x * 0.85
    );
    ctx.beginPath();
    ctx.moveTo(px, py);
    const segments = 8;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = baseAngle + (t - 0.5) * spread * 2;
      const r = finalR * (0.85 + 0.15 * Math.sin(t * Math.PI));
      ctx.lineTo(px + Math.cos(angle) * r, py + Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = alpha * 0.4;
  ctx.fillStyle = "#333";
  const eyeIdx = Math.max(1, Math.round((n - 1) * 0.04));
  const ep = spine[eyeIdx];
  const en = perp(spine, eyeIdx);
  const eyeOff = widthAt(eyeIdx / (n - 1)) * maxHW * 0.45;
  const eyeR = s * 0.09;  /* 修正笔误：0.025 时眼睛不可见 */
  ctx.beginPath();
  ctx.arc(ep.x + en.x * eyeOff, ep.y + en.y * eyeOff, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ep.x - en.x * eyeOff, ep.y - en.y * eyeOff, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};
var createRenderer = (canvas, _config, alphaFn) => {
  const ctx = canvas.getContext("2d");
  let currentAlphaFn = alphaFn ?? null;
  const render = (school, _time) => {
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);  /* 清屏：clearRect 清成透明且不残留拖尾（fillRect+透明填充不会清屏） */
    const sorted = [...school].sort((a, b) => a.size - b.size);
    for (const koi of sorted) {
      const alpha = currentAlphaFn ? currentAlphaFn(koi) : 1;
      drawKoi(ctx, koi, alpha);
    }
  };
  const resize = (width, height) => {
    canvas.width = width;
    canvas.height = height;
  };
  const setAlphaFn = (fn) => {
    currentAlphaFn = fn;
  };
  return { render, resize, setAlphaFn };
};

// src/pond.ts
var SCATTER_SPEED_THRESHOLD = 8;
var SCATTER_DECAY = 0.92;
var createKoiPond = (canvas, options = {}) => {
  const {
    count,
    config: configOverrides,
    alphaFn,
    respectReducedMotion = true
  } = options;
  const config = {
    ...defaultConfig,
    width: canvas.clientWidth || canvas.width,
    height: canvas.clientHeight || canvas.height,
    ...count != null ? { count } : {},
    ...configOverrides
  };
  canvas.width = config.width;
  canvas.height = config.height;
  let school = createSchool(config);
  const renderer = createRenderer(canvas, config, alphaFn);
  let mouseState = null;
  let lastMousePos = null;
  let mouseSpeed = 0;
  let scatter = 0;
  const onMouseMove = (e) => {
    const pos = { x: e.clientX, y: e.clientY };
    if (lastMousePos) {
      const dx = pos.x - lastMousePos.x;
      const dy = pos.y - lastMousePos.y;
      const instantSpeed = Math.sqrt(dx * dx + dy * dy);
      mouseSpeed = mouseSpeed * 0.7 + instantSpeed * 0.3;
      if (mouseSpeed > SCATTER_SPEED_THRESHOLD) {
        scatter = Math.min(1, scatter + 0.3);
      }
    }
    lastMousePos = pos;
    mouseState = { pos, speed: mouseSpeed, scatter };
  };
  const onMouseLeave = () => {
    mouseState = null;
    lastMousePos = null;
    mouseSpeed = 0;
  };
  const onClick = () => {
    scatter = 1;
    if (mouseState) mouseState = { ...mouseState, scatter: 1 };
  };
  const onTouchMove = (e) => {
    const touch = e.touches[0];
    if (!touch) return;
    const pos = { x: touch.clientX, y: touch.clientY };
    if (lastMousePos) {
      const dx = pos.x - lastMousePos.x;
      const dy = pos.y - lastMousePos.y;
      const instantSpeed = Math.sqrt(dx * dx + dy * dy);
      mouseSpeed = mouseSpeed * 0.7 + instantSpeed * 0.3;
      if (mouseSpeed > SCATTER_SPEED_THRESHOLD) {
        scatter = Math.min(1, scatter + 0.3);
      }
    }
    lastMousePos = pos;
    mouseState = { pos, speed: mouseSpeed, scatter };
  };
  const onTouchStart = () => {
    scatter = 1;
    if (mouseState) mouseState = { ...mouseState, scatter: 1 };
  };
  const onTouchEnd = () => {
    mouseState = null;
    lastMousePos = null;
    mouseSpeed = 0;
  };
  const onResize = () => {
    config.width = canvas.clientWidth || window.innerWidth;
    config.height = canvas.clientHeight || window.innerHeight;
    renderer.resize(config.width, config.height);
  };
  let rafId = null;
  let lastTime = 0;
  let running = false;
  const tick = (now) => {
    if (!running) return;
    const rawDt = (now - lastTime) / 1e3;
    const dt = Math.min(rawDt, 0.1) * 60;
    lastTime = now;
    scatter *= SCATTER_DECAY;
    if (mouseState) mouseState = { ...mouseState, scatter };
    mouseSpeed *= 0.95;
    school = stepSimulation(school, mouseState, config, dt);
    renderer.render(school, now / 1e3);
    rafId = requestAnimationFrame(tick);
  };
  let listenersAttached = false;
  const attachListeners = () => {
    if (listenersAttached) return;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("click", onClick);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("resize", onResize);
    listenersAttached = true;
  };
  const detachListeners = () => {
    if (!listenersAttached) return;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseleave", onMouseLeave);
    window.removeEventListener("click", onClick);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("resize", onResize);
    listenersAttached = false;
  };
  const start = () => {
    if (respectReducedMotion) {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) {
        renderer.render(school, 0);
        return;
      }
    }
    attachListeners();
    running = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  };
  const stop = () => {
    running = false;
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
  const destroy = () => {
    stop();
    detachListeners();
  };
  return {
    start,
    stop,
    destroy,
    setAlphaFn: (fn) => renderer.setAlphaFn(fn),
    school: () => school,
    renderer
  };
};
export {
  BODY_LENGTH_MULT,
  SPINE_POINTS,
  createKoi,
  createKoiPond,
  createRenderer,
  createSchool,
  defaultConfig,
  stepSimulation,
  updateKoi
};
//# sourceMappingURL=index.js.map