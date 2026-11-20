const MISSION_STAGES = [
  { pos: new THREE.Vector3(52, 1, 52), objective: 'Stage 1/3: Drive to the Palm Point Beacon' },
  { pos: new THREE.Vector3(-52, 1, -52), objective: 'Stage 2/3: Pick up the package at Northside' },
  { pos: new THREE.Vector3(-52, 1, 52), objective: 'Stage 3/3: Deliver the package to Westside' }
];

const missionState = {
  markerPos: MISSION_STAGES[0].pos.clone(),
  completed: false,
  currentStage: 0,
  markerMesh: null,
  ringMesh: null
};
window.missionState = missionState;
function initMission(scene) {
  const grp = new THREE.Group();
  const cylGeo = new THREE.CylinderGeometry(2.2, 2.2, 14, 16, 1, true);
  const cylMat = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: true,
    transparent: true,
    opacity: 0.65
  });
  const cyl = new THREE.Mesh(cylGeo, cylMat);
  cyl.position.y = 6;
  grp.add(cyl);

  const ringGeo = new THREE.TorusGeometry(2.8, 0.25, 10, 28);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  grp.add(ring);

  grp.position.copy(missionState.markerPos);
  scene.add(grp);
  missionState.markerMesh = grp;
  missionState.ringMesh = ring;
  let saved = null;
  try {
    saved = localStorage.getItem('palma_bay_save');
  } catch (e) {}
  if (saved) {
    missionState.completed = true;
    grp.visible = false;
    const banner = document.getElementById('mission-complete');
    if (banner) banner.style.display = 'block';
    if (window.hudState) window.hudState.objective = 'Mission Complete! Free roam unlocked.';
  } else {
    missionState.currentStage = 0;
    missionState.markerPos.copy(MISSION_STAGES[0].pos);
    grp.position.copy(missionState.markerPos);
    if (window.hudState) window.hudState.objective = MISSION_STAGES[0].objective;
  }
}
function updateMission(dt, playerPos) {
  if (missionState.ringMesh) missionState.ringMesh.rotation.z += 2.5 * dt;
  if (missionState.completed) {
    if (missionState.markerMesh) missionState.markerMesh.visible = false;
    return;
  }
  if (playerPos && playerPos.distanceTo(missionState.markerPos) < 5.5) {
    missionState.currentStage++;
    if (missionState.currentStage < MISSION_STAGES.length) {
      const stg = MISSION_STAGES[missionState.currentStage];
      missionState.markerPos.copy(stg.pos);
      if (missionState.markerMesh) missionState.markerMesh.position.copy(stg.pos);
      if (window.hudState) window.hudState.objective = stg.objective;
    } else {
      missionState.completed = true;
      if (missionState.markerMesh) missionState.markerMesh.visible = false;
      const banner = document.getElementById('mission-complete');
      if (banner) banner.style.display = 'block';
      if (window.hudState) window.hudState.objective = 'Mission Complete! Free roam unlocked.';
      try { localStorage.setItem('palma_bay_save', JSON.stringify({ completed: true })); } catch (e) {}
    }
  }
}
