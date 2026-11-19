const CITY_CONFIG = { roads: [-52, 0, 52], blockSize: 36, stride: 52 };

function createCity(scene) {
  // Dark asphalt road network
  const roadMat = new THREE.MeshLambertMaterial({ color: 0x222328 });
  const roadPlane = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), roadMat);
  roadPlane.rotation.x = -Math.PI / 2;
  roadPlane.position.y = 0.01;
  scene.add(roadPlane);

  const colors = [0xee8866, 0x55aacc, 0xddbb55, 0x66bb99, 0xee7799, 0x6688cc, 0xeebb44, 0x8899aa];
  const sideMat = new THREE.MeshLambertMaterial({ color: 0xbbbbbb });
  const bCenters = [-78, -26, 26, 78];

  bCenters.forEach((bx, bi) => {
    bCenters.forEach((bz, bj) => {
      // Sidewalk slab
      const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(38, 0.2, 38), sideMat);
      sidewalk.position.set(bx, 0.1, bz);
      scene.add(sidewalk);

      // Buildings with varied heights and colors
      const offsets = [[-9, -9], [9, -9], [-9, 9], [9, 9]];
      offsets.forEach(([ox, oz], k) => {
        const h = 15 + ((bi * 7 + bj * 11 + k * 13) % 42);
        const col = colors[(bi * 3 + bj * 5 + k) % colors.length];
        const bMat = new THREE.MeshLambertMaterial({ color: col });
        const bld = new THREE.Mesh(new THREE.BoxGeometry(14, h, 14), bMat);
        bld.position.set(bx + ox, h / 2 + 0.2, bz + oz);
        scene.add(bld);
      });
    });
  });
}
