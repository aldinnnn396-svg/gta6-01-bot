const playerState = {
  inCar: true,
  speed: 0,
  carHeading: 0,
  charHeading: 0,
  keys: {},
  car: null,
  char: null
};

function createPlayer(scene) {
  // Car mesh: body and roof
  const carGroup = new THREE.Group();
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0xff2a48 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 4.4), bodyMat);
  body.position.y = 0.5;
  carGroup.add(body);

  const roofMat = new THREE.MeshLambertMaterial({ color: 0x22262a });
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.65, 2.2), roofMat);
  roof.position.set(0, 1.15, -0.2);
  carGroup.add(roof);

  carGroup.position.set(0, 0, 10);
  scene.add(carGroup);
  playerState.car = carGroup;

  // Character mesh: torso and head
  const charGroup = new THREE.Group();
  const cMat = new THREE.MeshLambertMaterial({ color: 0x1e88e5 });
  const cBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.5), cMat);
  cBody.position.y = 0.6;
  charGroup.add(cBody);

  const hMat = new THREE.MeshLambertMaterial({ color: 0xffccaa });
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), hMat);
  head.position.y = 1.45;
  charGroup.add(head);

  charGroup.position.set(3, 0, 10);
  charGroup.visible = false;
  scene.add(charGroup);
  playerState.char = charGroup;

  window.addEventListener('keydown', e => {
    playerState.keys[e.code] = true;
    if (e.code === 'KeyE') togglePlayerMode();
  });
  window.addEventListener('keyup', e => { playerState.keys[e.code] = false; });
}

function togglePlayerMode() {
  if (playerState.inCar) {
    playerState.inCar = false;
    playerState.char.position.copy(playerState.car.position);
    playerState.char.position.x += Math.cos(playerState.carHeading) * 2.5;
    playerState.char.position.z -= Math.sin(playerState.carHeading) * 2.5;
    playerState.charHeading = playerState.carHeading;
    playerState.char.visible = true;
  } else {
    if (playerState.char.position.distanceTo(playerState.car.position) < 5.0) {
      playerState.inCar = true;
      playerState.char.visible = false;
    }
  }
}

function updatePlayer(dt, camera) {
  const k = playerState.keys;
  if (playerState.inCar) {
    if (k['KeyW']) playerState.speed += 24 * dt;
    if (k['KeyS']) playerState.speed -= 26 * dt;
    playerState.speed *= Math.pow(0.97, dt * 60);

    const sDir = Math.abs(playerState.speed) > 0.4 ? Math.sign(playerState.speed) : 0;
    if (k['KeyA']) playerState.carHeading += 2.2 * dt * sDir;
    if (k['KeyD']) playerState.carHeading -= 2.2 * dt * sDir;

    playerState.car.position.x += Math.sin(playerState.carHeading) * playerState.speed * dt;
    playerState.car.position.z += Math.cos(playerState.carHeading) * playerState.speed * dt;
    playerState.car.rotation.y = playerState.carHeading;

    const offset = new THREE.Vector3(-Math.sin(playerState.carHeading)*9, 4.5, -Math.cos(playerState.carHeading)*9);
    camera.position.lerp(playerState.car.position.clone().add(offset), dt * 6);
    camera.lookAt(playerState.car.position.x, playerState.car.position.y + 1.2, playerState.car.position.z);
  } else {
    const wSpeed = 9;
    if (k['KeyA']) playerState.charHeading += 3.2 * dt;
    if (k['KeyD']) playerState.charHeading -= 3.2 * dt;
    if (k['KeyW']) {
      playerState.char.position.x += Math.sin(playerState.charHeading) * wSpeed * dt;
      playerState.char.position.z += Math.cos(playerState.charHeading) * wSpeed * dt;
    }
    if (k['KeyS']) {
      playerState.char.position.x -= Math.sin(playerState.charHeading) * wSpeed * dt;
      playerState.char.position.z -= Math.cos(playerState.charHeading) * wSpeed * dt;
    }
    playerState.char.rotation.y = playerState.charHeading;

    const offset = new THREE.Vector3(-Math.sin(playerState.charHeading)*5.5, 3.2, -Math.cos(playerState.charHeading)*5.5);
    camera.position.lerp(playerState.char.position.clone().add(offset), dt * 7);
    camera.lookAt(playerState.char.position.x, playerState.char.position.y + 1.2, playerState.char.position.z);
  }
}
