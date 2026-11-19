// game/world.js - World environment creation

function createSunsetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 512, 0, 0);
  grad.addColorStop(0, '#ff4500');   // Deep orange-red at bottom
  grad.addColorStop(0.2, '#ff8c00'); // Warm orange near horizon
  grad.addColorStop(0.45, '#ffd700');// Golden yellow
  grad.addColorStop(0.7, '#4682b4'); // Steel blue
  grad.addColorStop(1.0, '#101b42'); // Deep blue top
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createSeaTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
  grad.addColorStop(0, '#0099bb');   // Shallow tropical blue
  grad.addColorStop(0.4, '#005588'); // Mid blue
  grad.addColorStop(1.0, '#001a33'); // Deep ocean blue
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createIslandTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  // Base island grass / terrain
  ctx.fillStyle = '#3a6628';
  ctx.fillRect(0, 0, 512, 512);
  // Ring gradient for sandy shore
  const grad = ctx.createRadialGradient(256, 256, 170, 256, 256, 250);
  grad.addColorStop(0, 'rgba(58, 102, 40, 0)');
  grad.addColorStop(0.6, '#e0c98b'); // Pale sand
  grad.addColorStop(1.0, '#d4b76e'); // Sandy beach edge
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createWorld(scene) {
  // Ambient Light
  const ambientLight = new THREE.AmbientLight(0xffd1a4, 0.65);
  scene.add(ambientLight);

  // Directional Sun Light
  const sunLight = new THREE.DirectionalLight(0xfffaed, 1.25);
  sunLight.position.set(140, 220, 110);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 1000;
  const d = 260;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  // Sky Dome
  const skyGeo = new THREE.SphereGeometry(750, 32, 16);
  const skyMat = new THREE.MeshBasicMaterial({
    map: createSunsetTexture(),
    side: THREE.BackSide
  });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  skyDome.castShadow = true;
  skyDome.receiveShadow = true;
  scene.add(skyDome);

  // Bright Sun Disc
  const sunDiscGeo = new THREE.SphereGeometry(18, 16, 16);
  const sunDiscMat = new THREE.MeshBasicMaterial({
    color: 0xffffff
  });
  const sunDisc = new THREE.Mesh(sunDiscGeo, sunDiscMat);
  sunDisc.position.set(140, 220, 110);
  sunDisc.castShadow = true;
  sunDisc.receiveShadow = true;
  scene.add(sunDisc);

  // Soft White Cloud Blobs
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85
  });
  const cloudPositions = [
    [-120, 180, -200], [180, 210, -150], [-250, 190, 80],
    [90, 230, 220], [-80, 200, 250], [220, 175, 100]
  ];
  cloudPositions.forEach(pos => {
    const cloudGroup = new THREE.Group();
    cloudGroup.position.set(pos[0], pos[1], pos[2]);
    for (let i = 0; i < 5; i++) {
      const blobGeo = new THREE.SphereGeometry(15 + Math.random() * 12, 8, 8);
      const blob = new THREE.Mesh(blobGeo, cloudMat);
      blob.position.set(
        (Math.random() - 0.5) * 35,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 25
      );
      blob.castShadow = true;
      blob.receiveShadow = true;
      cloudGroup.add(blob);
    }
    scene.add(cloudGroup);
  });

  // Sea Plane (1600 wide at height -0.4)
  const seaGeo = new THREE.PlaneGeometry(1600, 1600);
  const seaMat = new THREE.MeshStandardMaterial({
    map: createSeaTexture(),
    roughness: 0.2,
    metalness: 0.6
  });
  const seaPlane = new THREE.Mesh(seaGeo, seaMat);
  seaPlane.rotation.x = -Math.PI / 2;
  seaPlane.position.y = -0.4;
  seaPlane.castShadow = true;
  seaPlane.receiveShadow = true;
  scene.add(seaPlane);

  // Pale Sand Ring between Sea and Island Edge + Island Ground Plane (420 wide at height -0.05)
  // Sand Ring Plane
  const sandRingGeo = new THREE.PlaneGeometry(435, 435);
  const sandRingMat = new THREE.MeshStandardMaterial({
    color: 0xebd99f,
    roughness: 0.9,
    metalness: 0.1
  });
  const sandRing = new THREE.Mesh(sandRingGeo, sandRingMat);
  sandRing.rotation.x = -Math.PI / 2;
  sandRing.position.y = -0.06;
  sandRing.castShadow = true;
  sandRing.receiveShadow = true;
  scene.add(sandRing);

  // Main Island Ground Plane (420 wide at height -0.05)
  const islandGeo = new THREE.PlaneGeometry(420, 420);
  const islandMat = new THREE.MeshStandardMaterial({
    map: createIslandTexture(),
    roughness: 0.8,
    metalness: 0.1
  });
  const islandPlane = new THREE.Mesh(islandGeo, islandMat);
  islandPlane.rotation.x = -Math.PI / 2;
  islandPlane.position.y = -0.05;
  islandPlane.castShadow = true;
  islandPlane.receiveShadow = true;
  scene.add(islandPlane);
}

if (typeof window !== 'undefined') {
  window.createWorld = createWorld;
}
