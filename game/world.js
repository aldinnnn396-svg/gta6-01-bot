function createWorld(scene) {
  // Sky dome with radius 750 (camera far plane is 1000)
  const skyGeo = new THREE.SphereGeometry(750, 32, 16);
  const skyMat = new THREE.MeshBasicMaterial({ color: 0x5cb8ff, side: THREE.BackSide });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skyDome);

  // Sunlight and warm ambient light
  const sun = new THREE.DirectionalLight(0xfffaee, 1.25);
  sun.position.set(140, 220, 110);
  scene.add(sun);
  const ambient = new THREE.AmbientLight(0xffeedd, 0.6);
  scene.add(ambient);

  // Sea plane surrounding island
  const seaGeo = new THREE.PlaneGeometry(1600, 1600);
  const seaMat = new THREE.MeshLambertMaterial({ color: 0x0a6b99 });
  const sea = new THREE.Mesh(seaGeo, seaMat);
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -0.4;
  scene.add(sea);

  // Island ground plane
  const groundGeo = new THREE.PlaneGeometry(420, 420);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x447744 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  scene.add(ground);
}
