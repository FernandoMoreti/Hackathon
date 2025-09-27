// utils/text.js
function normalize(str = '') {
  return String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/\s+/g, ' ');
}

function genProtocol(prefix = 'PRT') {
  const dt = new Date();
  const stamp = dt.toISOString().replace(/[-:.TZ]/g, '').slice(0,14);
  const rnd = Math.floor(100 + Math.random()*900);
  return `${prefix}-${stamp}-${rnd}`;
}

module.exports = { normalize, genProtocol };