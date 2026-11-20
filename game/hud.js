const hudState = {
  wanted: 0,
  objective: 'Objective: Drive to the Palm Point Beacon'
};
window.hudState = hudState;

function updateHUD(playerPos, heading, speed, markerPos) {
  const w = Math.max(0, Math.min(5, Math.floor(hudState.wanted || 0)));
  const wantedEl = document.getElementById('wanted');
  if (wantedEl) wantedEl.textContent = '★'.repeat(w) + '☆'.repeat(5 - w);

  const kmh = Math.round(Math.abs(speed || 0) * 3.6);
  const speedEl = document.getElementById('speed');
  if (speedEl) speedEl.textContent = kmh + ' KM/H';

  const objEl = document.getElementById('objective');
  if (objEl) objEl.textContent = hudState.objective || '';

  const canvas = document.getElementById('minimap');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = 80;
  const cy = 80;
  const scale = 0.55;

  ctx.fillStyle = '#141824';
  ctx.fillRect(0, 0, 160, 160);
  // Downtown centre blocks shaded darker
  ctx.fillStyle = '#0b0d14';
  const dtMin = cx + (-48) * scale;
  const dtSize = 96 * scale;
  ctx.fillRect(dtMin, dtMin, dtSize, dtSize);

  // Beach edge sand tint on east (+x)
  ctx.fillStyle = 'rgba(212, 183, 110, 0.55)';
  const beachX = cx + 84 * scale;
  ctx.fillRect(beachX, 0, 160 - beachX, 160);

  // Road lines at -52, 0, 52
  ctx.strokeStyle = '#3d4456';
  ctx.lineWidth = 4;
  [-52, 0, 52].forEach(r => {
    const pos = cx + r * scale;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, 160);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(160, pos);
    ctx.stroke();
  });

  // Police station blue shield dot at (-78, -78)
  const psX = cx + (-78) * scale;
  const psY = cy + (-78) * scale;
  ctx.fillStyle = '#2563eb';
  ctx.beginPath();
  ctx.arc(psX, psY, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Traffic cars, police cars, and helicopter
  if (typeof trafficData !== 'undefined' && trafficData.cars) {
    trafficData.cars.forEach(c => {
      if (!c.mesh || c.mesh.visible === false) return;
      const mx = cx + c.mesh.position.x * scale;
      const my = cy + c.mesh.position.z * scale;
      if (c.isPolice || c.isHeli) {
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(mx, my, c.isHeli ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(mx - 1.5, my - 1.5, 3, 3);
      }
    });
  }
  // Mission marker cyan dot + stage number
  const done = window.missionState && window.missionState.completed;
  if (markerPos && !done) {
    const mx = cx + markerPos.x * scale;
    const my = cy + markerPos.z * scale;
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
    ctx.fill();
    const stg = (window.missionState && window.missionState.currentStage !== undefined)
      ? (window.missionState.currentStage + 1) : 1;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(stg), mx, my - 6);
  }

  // Player red arrow
  if (playerPos) {
    const px = cx + playerPos.x * scale;
    const py = cy + playerPos.z * scale;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-(heading || 0));
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4.5, 5);
    ctx.lineTo(0, 2.5);
    ctx.lineTo(-4.5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
