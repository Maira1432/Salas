const KEY = 'my_reservations_cache';

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
function write(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
}

export function cacheAdd(res) {
  const list = read();
  const id = res.id || res._id;
  const without = list.filter(r => (r.id || r._id) !== id);
  write([res, ...without]);
}

export function cacheRemove(id) {
  write(read().filter(r => (r.id || r._id) !== id));
}

export function cacheList() {
  return read().sort((a,b) => new Date(a.startTime||a.start) - new Date(b.startTime||b.start));
}

export function cacheClear() { write([]); }
