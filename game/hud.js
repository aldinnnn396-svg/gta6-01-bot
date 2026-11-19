const hudState = { wanted: 1, objective: 'Objective: Drive to the Palm Point Beacon' };

function updateHUD(playerPos, playerHeading, speed, markerPos) {
  const spdElem = document.getElementById('speed');
  if (spdElem) spdElem.textContent = Math.round(Math.abs(speed) * 3.6) + ' KM/H';

  const wtdElem = document.getElementById('wanted');
  if (wtdElem) wtdElem.textContent = '★'.repeat(hudState.wanted) + '☆'.repeat(5 - hudState.wanted);

  const objElem = document.getElementById('objective');
  if (objElem) objElem.textContent = hudState.objective;

  const cvs = document.getElementById('minimap');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  const cx = 80, cy = 80, s = 0.55;

  ctx.fillStyle = '#101c26';
  ctx.fillRect(0, 0, 160, 160);

  ctx.strokeStyle = '#3a4454';
  ctx.lineWidth = 6;
  [-52, 0, 52].forEach(coord => {
    const rx = cx + (coord - playerPos.x) * s;
    ctx.beginPath(); ctx.moveTo(rx, 0); ctx.lineTo(rx, 160); ctx.stroke();
    const ry = cy + (coord - playerPos.z) * s;
    ctx.beginPath(); ctx.moveTo(0, ry); ctx.lineTo(160, ry); ctx.stroke();
  });

  if (typeof trafficData !== 'undefined') {
    ctx.fillStyle = '#f1c40f';
    trafficData.cars.forEach(c => {
      const tx = cx + (c.mesh.position.x - playerPos.x) * s;
      const ty = cy + (c.mesh.position.z - playerPos.z) * s;
      ctx.fillRect(tx - 2, ty - 2, 4, 4);
    });
  }

  if (markerPos) {
    const mx = cx + (markerPos.x - playerPos.x) * s;
    const my = cy + (markerPos.z - playerPos.z) * s;
    ctx.fillStyle = '#00ffff';
    ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2); ctx.fill();
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-playerHeading);
  ctx.fillStyle = '#ff2a48';
  ctx.beginPath();
  ctx.moveTo(0, -7); ctx.lineTo(4, 5); ctx.lineTo(-4, 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
