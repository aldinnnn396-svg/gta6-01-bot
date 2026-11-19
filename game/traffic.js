const trafficData = { cars: [], pedestrians: [] };

function createTraffic(scene) {
  const carColors = [0xf1c40f, 0x3498db, 0xe67e22, 0xbdc3c7];
  const routes = [
    [[-52, -52], [52, -52], [52, 52], [-52, 52]],
    [[52, 52], [-52, 52], [-52, -52], [52, -52]],
    [[0, -52], [52, -52], [52, 0], [0, 0]],
    [[-52, 0], [0, 0], [0, 52], [-52, 52]]
  ];

  routes.forEach((route, i) => {
    const grp = new THREE.Group();
    const b = new THREE.Mesh(new THREE.BoxGeometry(2, 0.7, 4), new THREE.MeshLambertMaterial({ color: carColors[i] }));
    b.position.y = 0.45; grp.add(b);
    const r = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 2), new THREE.MeshLambertMaterial({ color: 0x222222 }));
    r.position.set(0, 1.0, -0.2); grp.add(r);
    grp.position.set(route[0][0], 0, route[0][1]);
    scene.add(grp);
    trafficData.cars.push({ mesh: grp, route, targetIdx: 1, speed: 12 + i * 2 });
  });

  const pRoutes = [
    [[-78, -40], [-78, -14]], [[-26, -40], [-26, -14]],
    [[26, 14], [26, 40]], [[78, 14], [78, 40]],
    [[-40, 26], [-14, 26]], [[14, -26], [40, -26]]
  ];
  const pColors = [0xffffff, 0x2ecc71, 0x9b59b6, 0xe74c3c, 0x1abc9c, 0xf39c12];

  pRoutes.forEach(([pA, pB], i) => {
    const pGrp = new THREE.Group();
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.1, 0.4), new THREE.MeshLambertMaterial({ color: pColors[i] }));
    b.position.y = 0.55; pGrp.add(b);
    const h = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshLambertMaterial({ color: 0xffccaa }));
    h.position.y = 1.3; pGrp.add(h);
    pGrp.position.set(pA[0], 0.2, pA[1]);
    scene.add(pGrp);
    trafficData.pedestrians.push({ mesh: pGrp, pA, pB, forward: true, speed: 3.2 });
  });
}

function updateTraffic(dt) {
  trafficData.cars.forEach(car => {
    const target = car.route[car.targetIdx];
    const dx = target[0] - car.mesh.position.x;
    const dz = target[1] - car.mesh.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 1.5) {
      car.targetIdx = (car.targetIdx + 1) % car.route.length;
    } else {
      car.mesh.rotation.y = Math.atan2(dx, dz);
      car.mesh.position.x += (dx / dist) * car.speed * dt;
      car.mesh.position.z += (dz / dist) * car.speed * dt;
    }
  });

  trafficData.pedestrians.forEach(ped => {
    const target = ped.forward ? ped.pB : ped.pA;
    const dx = target[0] - ped.mesh.position.x;
    const dz = target[1] - ped.mesh.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.6) {
      ped.forward = !ped.forward;
    } else {
      ped.mesh.rotation.y = Math.atan2(dx, dz);
      ped.mesh.position.x += (dx / dist) * ped.speed * dt;
      ped.mesh.position.z += (dz / dist) * ped.speed * dt;
      ped.mesh.position.y = 0.2 + Math.abs(Math.sin(Date.now() * 0.008)) * 0.08;
    }
  });
}
