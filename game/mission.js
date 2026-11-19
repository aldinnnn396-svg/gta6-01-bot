const missionState = {
  markerPos: new THREE.Vector3(52, 1, 52),
  completed: false,
  markerMesh: null,
  ringMesh: null
};

function initMission(scene) {
  try {
    const raw = localStorage.getItem('palma_bay_save');
    if (raw && JSON.parse(raw).completed) {
      missionState.completed = true;
      hudState.objective = 'Mission Complete! Free roam unlocked.';
    }
  } catch (e) {}

  const grp = new THREE.Group();
  const cyl = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.2, 5, 16, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.8 })
  );
  cyl.position.y = 2.5; grp.add(cyl);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.4, 0.2, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0x00ffff })
  );
  ring.rotation.x = Math.PI / 2; ring.position.y = 2.5; grp.add(ring);

  grp.position.copy(missionState.markerPos);
  if (missionState.completed) grp.visible = false;
  scene.add(grp);

  missionState.markerMesh = grp;
  missionState.ringMesh = ring;
}

function updateMission(dt, playerPos) {
  if (missionState.completed) return;
  if (missionState.ringMesh) missionState.ringMesh.rotation.z += 2.5 * dt;

  if (playerPos.distanceTo(missionState.markerPos) < 5.5) {
    missionState.completed = true;
    if (missionState.markerMesh) missionState.markerMesh.visible = false;
    hudState.objective = 'Mission Complete! Free roam unlocked.';
    const banner = document.getElementById('mission-complete');
    if (banner) banner.style.display = 'block';

    try {
      localStorage.setItem('palma_bay_save', JSON.stringify({ completed: true, time: Date.now() }));
    } catch (e) {}
  }
}
