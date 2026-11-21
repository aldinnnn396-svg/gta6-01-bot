let scene, camera, renderer;
let lastTime = 0;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 10, 25);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  createWorld(scene);
  createCity(scene);
  createPlayer(scene);
  createTraffic(scene);
  initMission(scene);

  window.addEventListener('resize', onWindowResize);

  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      document.getElementById('start-screen').style.display = 'none';
      document.getElementById('hud').style.display = 'block';
      lastTime = performance.now();
      requestAnimationFrame(gameLoop);
    });
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function gameLoop(time) {
  requestAnimationFrame(gameLoop);
  const dt = Math.min((time - lastTime) / 1000, 0.1);
  lastTime = time;

  updatePlayer(dt, camera);
  updateTraffic(dt);

  const activePos = playerState.inCar ? playerState.car.position : playerState.char.position;
  const activeHeading = playerState.inCar ? playerState.carHeading : playerState.charHeading;
  const activeSpeed = playerState.inCar ? playerState.speed : 0;

  updateMission(dt, activePos);
  updateHUD(activePos, activeHeading, activeSpeed, missionState.markerPos);

  renderer.render(scene, camera);
}

window.addEventListener('DOMContentLoaded', init);

window._stagingCamFn = null;
window._stagingSpeed = undefined;

function applyStageChase() {
  hudState.wanted = 5;
  playerState.car.position.set(0, 0, -25);
  playerState.carHeading = 0;
  window._stagingCamFn = (c) => {
    c.position.set(playerState.car.position.x, playerState.car.position.y + 4.2, playerState.car.position.z - 8.5);
    c.lookAt(playerState.car.position.x, playerState.car.position.y + 1.2, playerState.car.position.z + 15);
  };
  return 24;
}

function applyStageStreet() {
  hudState.wanted = 1;
  togglePlayerMode();
  playerState.char.position.set(26, 0, 22);
  playerState.charHeading = 0;
  playerState.car.position.set(20, 0, 18);
  if (trafficData.pedestrians[2]) trafficData.pedestrians[2].mesh.position.set(26, 0.2, 28);
  if (trafficData.pedestrians[3]) trafficData.pedestrians[3].mesh.position.set(27.5, 0.2, 33);
  window._stagingCamFn = (c) => {
    c.position.set(playerState.char.position.x, playerState.char.position.y + 2.6, playerState.char.position.z - 5.5);
    c.lookAt(playerState.char.position.x, playerState.char.position.y + 1.2, playerState.char.position.z + 10);
  };
  return 0;
}

function applyStageMission() {
  hudState.wanted = 1;
  playerState.car.position.set(52, 0, 32);
  playerState.carHeading = 0;
  window._stagingCamFn = (c) => {
    c.position.set(52, 4.2, 23);
    c.lookAt(52, 2.5, 52);
  };
  return 0;
}

function applyStageDrive() {
  hudState.wanted = 2;
  playerState.car.position.set(0, 0, -25);
  playerState.carHeading = 0;
  if (trafficData.cars[0]) {
    trafficData.cars[0].mesh.position.set(0, 0, -5);
    trafficData.cars[0].mesh.rotation.y = 0;
    trafficData.cars[0].speed = 18;
  }
  window._stagingCamFn = (c) => {
    c.position.set(playerState.car.position.x, playerState.car.position.y + 4.2, playerState.car.position.z - 8.5);
    c.lookAt(playerState.car.position.x, playerState.car.position.y + 1.2, playerState.car.position.z + 15);
  };
  return 20;
}

function dispatchStage(stage, p) {
  try { localStorage.clear(); } catch (e) {}
  missionState.completed = false;
  if (missionState.markerMesh) missionState.markerMesh.visible = true;
  hudState.objective = 'Objective: Drive to the Palm Point Beacon';
  let s = (typeof stage === 'string' && stage !== 'true' && stage !== '1') ? stage : 'chase';
  let spd = 0;
  if (s === 'street') spd = applyStageStreet();
  else if (s === 'mission') spd = applyStageMission();
  else if (s === 'drive') spd = applyStageDrive();
  else spd = applyStageChase();
  if (p.get('speed')) spd = parseFloat(p.get('speed'));
  if (p.get('wanted')) hudState.wanted = parseInt(p.get('wanted'), 10);
  window._stagingSpeed = spd;
}

(function() {
  const p = new URLSearchParams(window.location.search);
  const stg = p.get('stage') || p.get('staging') || p.get('view') || (p.has('staging') ? 'chase' : (p.has('stage') ? 'chase' : null));
  if (!stg) return;
  const run = () => {
    const b = document.getElementById('start-btn');
    if (b) b.click();
    dispatchStage(stg, p);
  };
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  const up = updatePlayer;
  updatePlayer = function(dt, c) {
    if (window._stagingSpeed !== undefined) playerState.speed = window._stagingSpeed;
    up(dt, c);
    if (window._stagingSpeed !== undefined) playerState.speed = window._stagingSpeed;
    if (window._stagingCamFn) window._stagingCamFn(c);
  };
})();
