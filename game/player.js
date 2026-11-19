const playerState = {
  inCar: true,
  speed: 0,
  carHeading: 0,
  charHeading: 0,
  keys: {},
  car: null,
  char: null
};

function _mkBox(w, h, d, color, opts) {
  const mat = new THREE.MeshStandardMaterial(
    Object.assign({ color: color, roughness: 0.6, metalness: 0.1 }, opts || {})
  );
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function _buildPlayerCar() {
  const g = new THREE.Group();
  const body = _mkBox(2.1, 0.65, 4.4, 0xd4382c, { metalness: 0.4, roughness: 0.35 });
  body.position.y = 0.55;
  g.add(body);
  const cabin = _mkBox(1.75, 0.55, 2.2, 0x16202a, { metalness: 0.7, roughness: 0.15 });
  cabin.position.set(0, 1.12, -0.15);
  g.add(cabin);
  const hl1 = _mkBox(0.36, 0.16, 0.1, 0xffffff, { emissive: 0xffffdd, emissiveIntensity: 0.9 });
  hl1.position.set(-0.68, 0.58, 2.21);
  const hl2 = hl1.clone();
  hl2.position.x = 0.68;
  g.add(hl1, hl2);
  const tl1 = _mkBox(0.38, 0.16, 0.1, 0xff2222, { emissive: 0xff1111, emissiveIntensity: 0.8 });
  tl1.position.set(-0.68, 0.58, -2.21);
  const tl2 = tl1.clone();
  tl2.position.x = 0.68;
  g.add(tl1, tl2);
  const mL = _mkBox(0.22, 0.14, 0.16, 0x222222);
  mL.position.set(-1.12, 0.92, 0.55);
  const mR = mL.clone();
  mR.position.x = 1.12;
  g.add(mL, mR);
  const wGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 14);
  wGeo.rotateZ(Math.PI / 2);
  const wMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.85 });
  const wheels = [];
  [[-1.05, 0.38, 1.35], [1.05, 0.38, 1.35], [-1.05, 0.38, -1.35], [1.05, 0.38, -1.35]].forEach(p => {
    const w = new THREE.Mesh(wGeo, wMat);
    w.position.set(p[0], p[1], p[2]);
    w.castShadow = true;
    w.receiveShadow = true;
    g.add(w);
    wheels.push(w);
  });
  g.userData.wheels = wheels;
  return g;
}

function _buildPlayerChar() {
  const g = new THREE.Group();
  const torso = _mkBox(0.54, 0.72, 0.3, 0x2b6cb0);
  torso.position.y = 1.1;
  g.add(torso);
  const head = _mkBox(0.34, 0.34, 0.34, 0xe8be9e);
  head.position.y = 1.66;
  g.add(head);
  const hair = _mkBox(0.36, 0.13, 0.36, 0x231a14);
  hair.position.y = 1.82;
  g.add(hair);
  const legL = new THREE.Group();
  legL.position.set(-0.14, 0.74, 0);
  const legLM = _mkBox(0.22, 0.64, 0.24, 0x1e2430);
  legLM.position.y = -0.32;
  const shoeL = _mkBox(0.23, 0.12, 0.32, 0x111111);
  shoeL.position.set(0, -0.68, 0.04);
  legL.add(legLM, shoeL);
  const legR = legL.clone();
  legR.position.x = 0.14;
  g.add(legL, legR);
  const armL = new THREE.Group();
  armL.position.set(-0.37, 1.42, 0);
  const armLM = _mkBox(0.18, 0.62, 0.2, 0x2b6cb0);
  armLM.position.y = -0.31;
  armL.add(armLM);
  const armR = armL.clone();
  armR.position.x = 0.37;
  g.add(armL, armR);
  g.userData = { legL: legL, legR: legR, armL: armL, armR: armR, phase: 0 };
  return g;
}

function createPlayer(scene) {
  playerState.car = _buildPlayerCar();
  playerState.car.position.set(0, 0, 10);
  scene.add(playerState.car);
  playerState.char = _buildPlayerChar();
  playerState.char.position.set(3, 0, 10);
  playerState.char.visible = !playerState.inCar;
  scene.add(playerState.char);
  window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    playerState.keys[k] = true;
    playerState.keys[e.code] = true;
    if ((k === 'e' || e.code === 'KeyE') && !e.repeat) togglePlayerMode();
  });
  window.addEventListener('keyup', e => {
    playerState.keys[e.key.toLowerCase()] = false;
    playerState.keys[e.code] = false;
  });
}

function togglePlayerMode() {
  playerState.inCar = !playerState.inCar;
  playerState.speed = 0;
  if (!playerState.car || !playerState.char) return;
  if (playerState.inCar) {
    playerState.char.visible = false;
  } else {
    const h = playerState.carHeading;
    playerState.char.position.set(
      playerState.car.position.x + Math.cos(h) * 2.2,
      0,
      playerState.car.position.z - Math.sin(h) * 2.2
    );
    playerState.charHeading = h;
    playerState.char.rotation.y = h;
    playerState.char.visible = true;
  }
}

function updatePlayer(a, b) {
  let dt = typeof a === 'number' ? a : (typeof b === 'number' ? b : 0.016);
  const cam = (a && a.isCamera) ? a : ((b && b.isCamera) ? b : (typeof camera !== 'undefined' ? camera : null));
  if (dt > 0.1) dt = 0.016;
  const k = playerState.keys;
  const fwd = (k.w || k.KeyW || k.ArrowUp) ? 1 : ((k.s || k.KeyS || k.ArrowDown) ? -1 : 0);
  const turn = (k.a || k.KeyA || k.ArrowLeft) ? 1 : ((k.d || k.KeyD || k.ArrowRight) ? -1 : 0);
  if (playerState.inCar && playerState.car) {
    if (fwd !== 0) playerState.speed += fwd * 28 * dt;
    else playerState.speed *= Math.pow(0.25, dt);
    playerState.speed = Math.max(-14, Math.min(34, playerState.speed));
    if (Math.abs(playerState.speed) > 0.3) {
      playerState.carHeading += turn * 2.2 * dt * (playerState.speed >= 0 ? 1 : -1);
    }
    const h = playerState.carHeading;
    playerState.car.position.x += Math.sin(h) * playerState.speed * dt;
    playerState.car.position.z += Math.cos(h) * playerState.speed * dt;
    playerState.car.rotation.y = h;
    (playerState.car.userData.wheels || []).forEach(w => { w.rotation.x += playerState.speed * dt * 2.2; });
    if (cam) {
      cam.position.set(
        playerState.car.position.x - Math.sin(h) * 9,
        playerState.car.position.y + 4.5,
        playerState.car.position.z - Math.cos(h) * 9
      );
      cam.lookAt(playerState.car.position.x, playerState.car.position.y + 1.2, playerState.car.position.z);
    }
  } else if (playerState.char) {
    playerState.charHeading += turn * 2.8 * dt;
    const h = playerState.charHeading;
    const walkSpd = fwd * 7.5;
    playerState.speed = walkSpd;
    playerState.char.position.x += Math.sin(h) * walkSpd * dt;
    playerState.char.position.z += Math.cos(h) * walkSpd * dt;
    playerState.char.rotation.y = h;
    const u = playerState.char.userData;
    if (fwd !== 0) {
      u.phase += dt * 10;
      const s = Math.sin(u.phase) * 0.65;
      u.legL.rotation.x = s; u.legR.rotation.x = -s;
      u.armL.rotation.x = -s * 0.8; u.armR.rotation.x = s * 0.8;
    } else {
      u.legL.rotation.x = 0; u.legR.rotation.x = 0;
      u.armL.rotation.x = 0; u.armR.rotation.x = 0;
    }
    if (cam) {
      cam.position.set(
        playerState.char.position.x - Math.sin(h) * 5.5,
        playerState.char.position.y + 3.2,
        playerState.char.position.z - Math.cos(h) * 5.5
      );
      cam.lookAt(playerState.char.position.x, playerState.char.position.y + 1.2, playerState.char.position.z);
    }
  }
}
