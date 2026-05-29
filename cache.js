'use strict';

/* ==========================================================================
   TTS Audio Cache — IndexedDB
   ========================================================================== */

const IDB_NAME  = 'voxflow-tts-cache';
const IDB_STORE = 'audio';
let ttsCacheDbPromise = null;

function openTtsCacheDb() {
  if (ttsCacheDbPromise) return ttsCacheDbPromise;

  ttsCacheDbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore(IDB_STORE);
    req.onsuccess  = (e) => {
      const db = e.target.result;
      db.onversionchange = () => {
        db.close();
        ttsCacheDbPromise = null;
      };
      resolve(db);
    };
    req.onerror    = ()  => reject(req.error);
  }).catch((err) => {
    ttsCacheDbPromise = null;
    throw err;
  });

  return ttsCacheDbPromise;
}

async function getCachedAudio(key) {
  try {
    const db = await openTtsCacheDb();
    return await new Promise((resolve) => {
      const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror   = () => resolve(null);
    });
  } catch { return null; }
}

async function setCachedAudio(key, arrayBuffer) {
  try {
    const db = await openTtsCacheDb();
    await new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(arrayBuffer, key);
      tx.oncomplete = resolve;
      tx.onerror    = resolve; // 실패해도 조용히 무시
    });
  } catch { /* 캐시 저장 실패는 무시 */ }
}

async function makeTtsCacheKey(text, voice, styleHint) {
  const raw = `${TTS_MODEL}||mp3||${voice}||${styleHint}||${text}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function clearTtsCache() {
  try {
    const db = await openTtsCacheDb();
    const count = await new Promise((resolve) => {
      const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => resolve(0);
    });
    await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).clear();
      tx.oncomplete = resolve;
      tx.onerror    = () => reject(tx.error);
    });
    return count;
  } catch { return null; }
}

async function getCacheCount() {
  try {
    const db = await openTtsCacheDb();
    return await new Promise((resolve) => {
      const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => resolve(0);
    });
  } catch { return 0; }
}
