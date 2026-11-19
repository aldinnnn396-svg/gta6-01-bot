const trafficData = { cars: [], pedestrians: [] };
let policeCars = [];
let policeHeli = null;
let lightTimer = 0;

function addShadow(m) {
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function makeWheel(x, z) {
  const geo = new THREE.CylinderGeometry(0.36, 0.36, 0.24, 12);
  geo.rotateZ(Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
  const w = addShadow(new THREE.Mesh(geo, mat));
  w.position.set(x, 0.36, z);
  return w;
}

function buildCarMesh(color, isPolice) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: isPolice ? 0xf5f7fa : color, roughness: 0.4 });
  const body = addShadow(new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.72, 4.2), bodyMat));
  body.position.y = 0.68;
  g.add(body);
  const cabMat = new THREE.MeshStandardMaterial({ color: isPolice ? 0xffffff : color, roughness: 0.35 });
  const cab = addShadow(new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.6, 2.1), cabMat));
  cab.position.set(0, 1.3, -0.15);
  g.add(cab);
  const glass = addShadow(new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.45, 1.9), new THREE.MeshStandardMaterial({ color: 0x1e2b38, roughness: 0.2 })));
  glass.position.set(0, 1.32, -0.15);
  g.add(glass);
  [-0.95, 0.95].forEach(wx => { [1.3, -1.3].forEach(wz => g.add(makeWheel(wx, wz))); });
  let redBar = null, blueBar = null;
  if (isPolice) {
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x111418, roughness: 0.5 });
    [-1.01, 1.01].forEach(dx => {
      const door = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.58, 1.55), doorMat));
      door.position.set(dx, 0.72, -0.05);
      g.add(door);
    });
    redBar = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.28), new THREE.MeshStandardMaterial({ color: 0xff1e1e, emissive: 0xff0000, emissiveIntensity: 1.2 })));
    redBar.position.set(-0.3, 1.68, -0.15);
    blueBar = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.28), new THREE.MeshStandardMaterial({ color: 0x1e6eff, emissive: 0x0044ff, emissiveIntensity: 0.2 })));
    blueBar.position.set(0.3, 1.68, -0.15);
    g.add(redBar, blueBar);
  }
  return { mesh: g, redBar, blueBar };
}

function buildHeliMesh() {
  const g = new THREE.Group();
  const body = addShadow(new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.5, 4.4), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })));
  g.add(body);
  const tail = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 4.0), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 })));
  tail.position.set(0, 0.2, -3.8);
  g.add(tail);
  const rotor = addShadow(new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.1, 0.35), new THREE.MeshStandardMaterial({ color: 0x0f172a })));
  rotor.position.set(0, 1.05, 0);
  g.add(rotor);
  const cone = addShadow(new THREE.Mesh(new THREE.ConeGeometry(4.5, 22, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff3b0, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false })));
  cone.position.set(0, -11.5, 1.5);
  g.add(cone);
  return { mesh: g, rotor };
}

function buildPedMesh(shirtColor, hScale) {
  const g = new THREE.Group();
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xe0ac69, roughness: 0.7 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.7 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.8 });
  const torso = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.56, 0.24), shirtMat));
  torso.position.y = 1.04;
  const head = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.26), skinMat));
  head.position.y = 1.48;
  const lArm = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.14), shirtMat));
  lArm.position.set(-0.32, 1.02, 0);
  const rArm = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.14), shirtMat));
  rArm.position.set(0.32, 1.02, 0);
  const lLeg = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.16), pantsMat));
  lLeg.position.set(-0.12, 0.45, 0);
  const rLeg = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.16), pantsMat));
  rLeg.position.set(0.12, 0.45, 0);
  g.add(torso, head, lArm, rArm, lLeg, rLeg);
  g.scale.setScalar(hScale);
  return { mesh: g, lArm, rArm, lLeg, rLeg };
}

function createTraffic(scene) {
  trafficData.cars = [];
  trafficData.pedestrians = [];
  policeCars = [];
  const routes = [
    { color: 0xe74c3c, speed: 14, pts: [[0, -52], [0, 52], [52, 52], [52, -52]] },
    { color: 0x3498db, speed: 17, pts: [[-52, -52], [-52, 52], [0, 52], [0, -52]] },
    { color: 0xf39c12, speed: 12, pts: [[52, 0], [0, 0], [0, 52], [52, 52]] },
    { color: 0x2ecc71, speed: 19, pts: [[-52, 0], [52, 0], [52, -52], [-52, -52]] }
  ];
  routes.forEach(r => {
    const built = buildCarMesh(r.color, false);
    built.mesh.position.set(r.pts[0][0], 0, r.pts[0][1]);
    scene.add(built.mesh);
    trafficData.cars.push({ mesh: built.mesh, speed: r.speed, pts: r.pts, idx: 1 });
  });
  for (let i = 0; i < 2; i++) {
    const p = buildCarMesh(0xffffff, true);
    p.mesh.visible = false;
    p.mesh.position.set(i === 0 ? -52 : 52, 0, -52);
    scene.add(p.mesh);
    const obj = { mesh: p.mesh, redBar: p.redBar, blueBar: p.blueBar, speed: 24, isPolice: true };
    policeCars.push(obj);
    trafficData.cars.push(obj);
  }
  const h = buildHeliMesh();
  h.mesh.visible = false;
  h.mesh.position.set(0, 24, 0);
  scene.add(h.mesh);
  policeHeli = { mesh: h.mesh, rotor: h.rotor, angle: 0, isHeli: true };
  trafficData.cars.push(policeHeli);

  const shirts = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0xa29bfe, 0xfd79a8, 0x55efc4, 0xfab1a0];
  const roads = [-52, 0, 52];
  for (let i = 0; i < 14; i++) {
    const ped = buildPedMesh(shirts[i % shirts.length], 0.9 + (i % 5) * 0.06);
    const axis = i % 2 === 0 ? 'z' : 'x';
    const lane = roads[i % 3] + (i % 4 < 2 ? 7 : -7);
    const pos = -70 + (i * 11) % 140;
    ped.mesh.position.set(axis === 'z' ? lane : pos, 0, axis === 'z' ? pos : lane);
    scene.add(ped.mesh);
    trafficData.pedestrians.push({ ...ped, axis, dir: i % 2 === 0 ? 1 : -1, speed: 1.8 + (i % 3) * 0.4, phase: i * 0.7 });
  }
}

function updateTraffic(dt) {
  trafficData.cars.forEach(c => {
    if (c.isPolice || c.isHeli || !c.pts) return;
    const tgt = c.pts[c.idx];
    const dx = tgt[0] - c.mesh.position.x, dz = tgt[1] - c.mesh.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 1.0) { c.idx = (c.idx + 1) % c.pts.length; return; }
    c.mesh.position.x += (dx / dist) * c.speed * dt;
    c.mesh.position.z += (dz / dist) * c.speed * dt;
    c.mesh.rotation.y = Math.atan2(dx, dz);
  });
  trafficData.pedestrians.forEach(p => {
    p.phase += dt * p.speed * 3.2;
    p.mesh.position[p.axis] += p.dir * p.speed * dt;
    if (p.mesh.position[p.axis] > 80 || p.mesh.position[p.axis] < -80) p.dir *= -1;
    p.mesh.rotation.y = p.axis === 'z' ? (p.dir > 0 ? 0 : Math.PI) : (p.dir > 0 ? Math.PI / 2 : -Math.PI / 2);
    p.mesh.position.y = Math.abs(Math.sin(p.phase)) * 0.06;
    const swing = Math.sin(p.phase) * 0.6;
    p.lArm.rotation.x = swing; p.rArm.rotation.x = -swing;
    p.lLeg.rotation.x = -swing; p.rLeg.rotation.x = swing;
  });
  const target = playerState.inCar ? playerState.car.position : playerState.char.position;
  lightTimer += dt;
  const flash = Math.floor(lightTimer * 6) % 2 === 0;
  policeCars.forEach((p, idx) => {
    p.mesh.visible = hudState.wanted >= 3;
    if (!p.mesh.visible) return;
    p.redBar.material.emissiveIntensity = flash ? 1.5 : 0.1;
    p.blueBar.material.emissiveIntensity = flash ? 0.1 : 1.5;
    const dx = target.x + (idx === 0 ? -4 : 4) - p.mesh.position.x;
    const dz = target.z + (idx === 0 ? -6 : 6) - p.mesh.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist > 3.5) {
      p.mesh.position.x += (dx / dist) * p.speed * dt;
      p.mesh.position.z += (dz / dist) * p.speed * dt;
      p.mesh.rotation.y = Math.atan2(dx, dz);
    }
  });
  if (policeHeli) {
    policeHeli.mesh.visible = hudState.wanted >= 4;
    if (policeHeli.mesh.visible) {
      policeHeli.angle += dt * 0.7;
      policeHeli.rotor.rotation.y += dt * 18;
      policeHeli.mesh.position.set(target.x + Math.cos(policeHeli.angle) * 18, 24, target.z + Math.sin(policeHeli.angle) * 18);
      policeHeli.mesh.lookAt(target.x, 0, target.z);
    }
  }
}
