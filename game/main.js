let scene, camera, renderer;
let lastTime = 0;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 10, 25);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
