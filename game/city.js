// game/city.js - City structure and generation

const CITY_CONFIG = {
  roadLines: [-52, 0, 52],
  blockSize: 36,
  stride: 52
};

function createWindowTexture(baseColor, windowLitColor, isGlass) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 128, 256);

  const cols = 4;
  const rows = 10;
  const padX = 10;
  const padY = 12;
  const wWidth = (128 - padX * (cols + 1)) / cols;
  const wHeight = (256 - padY * (rows + 1)) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = padX + c * (wWidth + padX);
      const y = padY + r * (wHeight + padY);
      const isLit = isGlass ? (Math.random() > 0.3) : (Math.random() > 0.5);
      ctx.fillStyle = isLit ? windowLitColor : (isGlass ? '#112233' : '#1a1a1a');
      ctx.fillRect(x, y, wWidth, wHeight);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function createPoliceSignTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#002288';
  ctx.fillRect(0, 0, 256, 64);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 248, 56);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('POLICE', 128, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createPalmTree() {
  const palmGroup = new THREE.Group();
  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.45, 7, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.9 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 3.5;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  palmGroup.add(trunk);

  // Fronds (crossed planes)
  const frondMat = new THREE.MeshStandardMaterial({
    color: 0x2e8b57,
    side: THREE.DoubleSide,
    roughness: 0.6
  });
  for (let i = 0; i < 4; i++) {
    const frondGeo = new THREE.PlaneGeometry(6, 2);
    const frond = new THREE.Mesh(frondGeo, frondMat);
    frond.position.set(0, 7, 0);
    frond.rotation.y = (i * Math.PI) / 4;
    frond.rotation.x = 0.3;
    frond.castShadow = true;
    frond.receiveShadow = true;
    palmGroup.add(frond);
  }
  return palmGroup;
}

function createStreetLamp() {
  const lampGroup = new THREE.Group();
  const poleGeo = new THREE.CylinderGeometry(0.12, 0.15, 6, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.y = 3;
  pole.castShadow = true;
  pole.receiveShadow = true;
  lampGroup.add(pole);

  const headGeo = new THREE.SphereGeometry(0.4, 8, 8);
  const headMat = new THREE.MeshBasicMaterial({ color: 0xfffaed });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.set(0.4, 5.8, 0);
  head.castShadow = true;
  head.receiveShadow = true;
  lampGroup.add(head);

  return lampGroup;
}

function createPoliceCar() {
  const car = new THREE.Group();
  // Body
  const bodyGeo = new THREE.BoxGeometry(2.2, 1.0, 4.2);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.7;
  body.castShadow = true;
  body.receiveShadow = true;
  car.add(body);

  // Blue Doors / Stripe
  const stripeGeo = new THREE.BoxGeometry(2.22, 0.4, 2.5);
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0x0033aa });
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.position.y = 0.6;
  stripe.castShadow = true;
  stripe.receiveShadow = true;
  car.add(stripe);

  // Cabin
  const cabGeo = new THREE.BoxGeometry(1.9, 0.7, 2.0);
  const cabMat = new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.2 });
  const cab = new THREE.Mesh(cabGeo, cabMat);
  cab.position.set(0, 1.45, -0.2);
  cab.castShadow = true;
  cab.receiveShadow = true;
  car.add(cab);

  // Lightbar
  const lightGeo = new THREE.BoxGeometry(1.2, 0.2, 0.4);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const lightbar = new THREE.Mesh(lightGeo, lightMat);
  lightbar.position.set(0, 1.9, -0.2);
  lightbar.castShadow = true;
  lightbar.receiveShadow = true;
  car.add(lightbar);

  return car;
}

function createRoadNetwork(scene) {
  // Main Road Asphalt Plane (240 wide at height 0.01)
  const roadGeo = new THREE.PlaneGeometry(240, 240);
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x1c1c20,
    roughness: 0.9,
    metalness: 0.1
  });
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.position.y = 0.01;
  roadMesh.castShadow = true;
  roadMesh.receiveShadow = true;
  scene.add(roadMesh);

  // Dashed white center lines & crosswalks
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const roadLines = CITY_CONFIG.roadLines;

  roadLines.forEach(coord => {
    // X-dir road dashed line
    for (let z = -110; z <= 110; z += 6) {
      if (roadLines.some(rc => Math.abs(z - rc) < 8)) continue; // skip intersections
      const lineGeo = new THREE.PlaneGeometry(3, 0.3);
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(z, 0.02, coord);
      line.castShadow = true;
      line.receiveShadow = true;
      scene.add(line);
    }

    // Z-dir road dashed line
    for (let x = -110; x <= 110; x += 6) {
      if (roadLines.some(rc => Math.abs(x - rc) < 8)) continue;
      const lineGeo = new THREE.PlaneGeometry(0.3, 3);
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(coord, 0.02, x);
      line.castShadow = true;
      line.receiveShadow = true;
      scene.add(line);
    }
  });

  // Crosswalk stripes at intersections
  roadLines.forEach(rx => {
    roadLines.forEach(rz => {
      // 4 crosswalks around each intersection
      const offsets = [
        { x: rx + 6, z: rz, rot: 0 },
        { x: rx - 6, z: rz, rot: 0 },
        { x: rx, z: rz + 6, rot: Math.PI / 2 },
        { x: rx, z: rz - 6, rot: Math.PI / 2 }
      ];
      offsets.forEach(off => {
        for (let s = -3; s <= 3; s += 1.2) {
          const stripeGeo = new THREE.PlaneGeometry(0.6, 4);
          const stripe = new THREE.Mesh(stripeGeo, lineMat);
          stripe.rotation.x = -Math.PI / 2;
          stripe.rotation.z = off.rot;
          const dx = off.rot === 0 ? 0 : s;
          const dz = off.rot === 0 ? s : 0;
          stripe.position.set(off.x + dx, 0.02, off.z + dz);
          stripe.castShadow = true;
          stripe.receiveShadow = true;
          scene.add(stripe);
        }
      });
    });
  });
}

function createSidewalksAndDetails(scene) {
  const blockCenters = [-78, -26, 26, 78];
  const bSize = CITY_CONFIG.blockSize; // 36

  const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.7 });
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.9 });

  blockCenters.forEach(bx => {
    blockCenters.forEach(bz => {
      // Sidewalk mesh for each block
      const swGeo = new THREE.BoxGeometry(bSize, 0.15, bSize);
      const swMesh = new THREE.Mesh(swGeo, sidewalkMat);
      swMesh.position.set(bx, 0.075, bz);
      swMesh.castShadow = true;
      swMesh.receiveShadow = true;
      scene.add(swMesh);

      // Curb border around sidewalk
      const curbGeo = new THREE.BoxGeometry(bSize + 0.6, 0.2, bSize + 0.6);
      const curbMesh = new THREE.Mesh(curbGeo, curbMat);
      curbMesh.position.set(bx, 0.05, bz);
      curbMesh.castShadow = true;
      curbMesh.receiveShadow = true;
      scene.add(curbMesh);

      // Street lamps at 4 block corners
      const corners = [
        [bx - bSize / 2 - 1, bz - bSize / 2 - 1],
        [bx + bSize / 2 + 1, bz - bSize / 2 - 1],
        [bx - bSize / 2 - 1, bz + bSize / 2 + 1],
        [bx + bSize / 2 + 1, bz + bSize / 2 + 1]
      ];
      corners.forEach(c => {
        const lamp = createStreetLamp();
        lamp.position.set(c[0], 0, c[1]);
        scene.add(lamp);
      });
    });
  });

  // Palm trees along roads
  const palmCoords = [-65, -39, -13, 13, 39, 65];
  CITY_CONFIG.roadLines.forEach(rl => {
    palmCoords.forEach(c => {
      const palm1 = createPalmTree();
      palm1.position.set(rl + 4, 0, c);
      scene.add(palm1);

      const palm2 = createPalmTree();
      palm2.position.set(c, 0, rl - 4);
      scene.add(palm2);
    });
  });
}

function createBuildingsAndDistricts(scene) {
  const blockCenters = [-78, -26, 26, 78];
  const roofColors = [0x333333, 0x444455, 0x553333, 0x224433, 0x555555];

  blockCenters.forEach(bx => {
    blockCenters.forEach(bz => {
      const isPoliceBlock = (bx === -78 && bz === -78);
      const isDowntown = (Math.abs(bx) <= 26 && Math.abs(bz) <= 26);
      const isBeachfront = (bx === 78);

      if (isPoliceBlock) {
        buildPoliceStation(scene, bx, bz);
        return;
      }

      // Populate 6 to 8 buildings per block
      const numBuildings = isDowntown ? 8 : (isBeachfront ? 6 : 7);
      const offsets = [
        [-9, -9], [9, -9], [-9, 9], [9, 9],
        [0, -11], [0, 11], [-11, 0], [11, 0]
      ];

      for (let i = 0; i < numBuildings; i++) {
        const off = offsets[i];
        let height, width, depth, baseColor, winColor, isGlass;

        if (isDowntown) {
          // Downtown tall towers
          height = 35 + (i * 7) % 35;
          width = 7 + (i % 3) * 2;
          depth = 7 + ((i + 1) % 3) * 2;
          baseColor = '#1e293b';
          winColor = '#fbbf24';
          isGlass = true;
        } else if (isBeachfront) {
          // Low beachfront buildings
          height = 6 + (i % 4) * 2;
          width = 8;
          depth = 8;
          baseColor = '#fef3c7';
          winColor = '#f59e0b';
          isGlass = false;
        } else {
          // Residential outer blocks
          height = 10 + (i % 5) * 3;
          width = 7.5;
          depth = 7.5;
          baseColor = '#374151';
          winColor = '#fde047';
          isGlass = false;
        }

        const bGeo = new THREE.BoxGeometry(width, height, depth);
        const tex = createWindowTexture(baseColor, winColor, isGlass);
        tex.repeat.set(1, height / 10);
        const bMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: isGlass ? 0.2 : 0.7,
          metalness: isGlass ? 0.5 : 0.1
        });

        const building = new THREE.Mesh(bGeo, bMat);
        const px = bx + off[0];
        const pz = bz + off[1];
        building.position.set(px, height / 2 + 0.15, pz);
        building.castShadow = true;
        building.receiveShadow = true;
        scene.add(building);

        // Rooftop Box
        const roofBoxGeo = new THREE.BoxGeometry(width * 0.4, 1.8, depth * 0.4);
        const rColor = roofColors[i % roofColors.length];
        const roofBoxMat = new THREE.MeshStandardMaterial({ color: rColor, roughness: 0.8 });
        const roofBox = new THREE.Mesh(roofBoxGeo, roofBoxMat);
        roofBox.position.set(px, height + 1.05, pz);
        roofBox.castShadow = true;
        roofBox.receiveShadow = true;
        scene.add(roofBox);
      }
    });
  });
}

function buildPoliceStation(scene, bx, bz) {
  // Main Police Station Building
  const height = 18;
  const width = 24;
  const depth = 22;
  const psGeo = new THREE.BoxGeometry(width, height, depth);
  const tex = createWindowTexture('#1e293b', '#60a5fa', false);
  const psMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 });
  const policeStation = new THREE.Mesh(psGeo, psMat);
  policeStation.position.set(bx, height / 2 + 0.15, bz - 2);
  policeStation.castShadow = true;
  policeStation.receiveShadow = true;
  scene.add(policeStation);

  // Rooftop Box
  const roofGeo = new THREE.BoxGeometry(8, 2, 8);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  const roofBox = new THREE.Mesh(roofGeo, roofMat);
  roofBox.position.set(bx, height + 1.15, bz - 2);
  roofBox.castShadow = true;
  roofBox.receiveShadow = true;
  scene.add(roofBox);

  // Blue POLICE Sign
  const signGeo = new THREE.BoxGeometry(14, 3.5, 0.6);
  const signTex = createPoliceSignTexture();
  const signMat = new THREE.MeshStandardMaterial({ map: signTex });
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(bx, height - 2, bz + 9.2);
  sign.castShadow = true;
  sign.receiveShadow = true;
  scene.add(sign);

  // Flag Pole with waving flag
  const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 12, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(bx - 9, 6, bz + 11);
  pole.castShadow = true;
  pole.receiveShadow = true;
  scene.add(pole);

  const flagGeo = new THREE.PlaneGeometry(3, 2);
  const flagMat = new THREE.MeshStandardMaterial({ color: 0x0044cc, side: THREE.DoubleSide });
  const flag = new THREE.Mesh(flagGeo, flagMat);
  flag.position.set(bx - 7.4, 10.5, bz + 11);
  flag.castShadow = true;
  flag.receiveShadow = true;
  scene.add(flag);

  // Two Police Cars parked in front
  const car1 = createPoliceCar();
  car1.position.set(bx - 5, 0, bz + 11);
  car1.rotation.y = Math.PI / 2;
  scene.add(car1);

  const car2 = createPoliceCar();
  car2.position.set(bx + 5, 0, bz + 11);
  car2.rotation.y = Math.PI / 2;
  scene.add(car2);
}

function createCity(scene) {
  createRoadNetwork(scene);
  createSidewalksAndDetails(scene);
  createBuildingsAndDistricts(scene);
}

if (typeof window !== 'undefined') {
  window.CITY_CONFIG = CITY_CONFIG;
  window.createCity = createCity;
}
