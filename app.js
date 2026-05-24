'use strict';

(function () {
  const fence = String.fromCharCode(96, 96, 96);
  const iconPaths = {
    'waves': '<path d="M2 12c3-5 5 5 8 0s5-5 8 0 5 5 8 0"/><path d="M2 6c3-5 5 5 8 0s5-5 8 0 5 5 8 0"/><path d="M2 18c3-5 5 5 8 0s5-5 8 0 5 5 8 0"/>',
    'key-round': '<path d="M2 18l6-6"/><circle cx="14" cy="10" r="6"/><path d="M8 18l3 3"/><path d="M11 15l3 3"/>',
    'lock': '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/><path d="M8 9h2"/>',
    'align-left': '<path d="M3 6h18"/><path d="M3 12h14"/><path d="M3 18h18"/>',
    'cloud-upload': '<path d="M12 13v8"/><path d="M8 17l4-4 4 4"/><path d="M20 16.6A5 5 0 0 0 18 7h-1.3A8 8 0 1 0 4 15.3"/>',
    'file-check': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15l2 2 4-4"/>',
    'trash-2': '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    'sparkles': '<path d="M12 3l1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
    'gauge': '<path d="M4 14a8 8 0 1 1 16 0"/><path d="M12 14l4-4"/><path d="M5 19h14"/>',
    'skip-back': '<path d="M19 20L9 12l10-8v16z"/><path d="M5 19V5"/>',
    'play': '<path d="M8 5v14l11-7z"/>',
    'pause': '<path d="M8 5h4v14H8z"/><path d="M16 5h4v14h-4z"/>',
    'skip-forward': '<path d="M5 4l10 8-10 8V4z"/><path d="M19 5v14"/>',
    'square': '<rect x="6" y="6" width="12" height="12" rx="1"/>',
    'volume-2': '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/>',
    'book-open': '<path d="M2 4h7a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 4h-7a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h8z"/>',
    'list-music': '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><path d="M3 6h4"/><path d="M3 10h4"/>',
    'loader-2': '<path d="M21 12a9 9 0 1 1-6.2-8.6"/>',
    'alert-circle': '<circle cx="12" cy="12" r="10"/><path d="M12 8v5"/><path d="M12 16h.01"/>',
    'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    'repeat': '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    'clipboard': '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6"/><path d="M9 16h6"/>',
    'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  };

  function copyInlineStyles(source, target) {
    const style = source.getAttribute('style');
    if (style) target.setAttribute('style', style);
    target.className.baseVal = source.className || '';
  }

  window.lucide = {
    createIcons() {
      document.querySelectorAll('i[data-lucide]').forEach((node) => {
        const name = node.getAttribute('data-lucide');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.setAttribute('aria-hidden', 'true');
        svg.innerHTML = iconPaths[name] || '<circle cx="12" cy="12" r="9"/>';
        copyInlineStyles(node, svg);
        node.replaceWith(svg);
      });
    }
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function inlineMarkdown(value) {
    return escapeHtml(value)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\x60([^\x60]+)\x60/g, '<code>$1</code>');
  }

  function flushList(state, out) {
    if (state.listItems.length) {
      out.push('<ul>' + state.listItems.map((item) => '<li>' + inlineMarkdown(item) + '</li>').join('') + '</ul>');
      state.listItems = [];
    }
  }

  function parseBasicMarkdown(markdown) {
    const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    const state = { listItems: [], paragraph: [], code: [], inCode: false };

    function flushParagraph() {
      if (state.paragraph.length) {
        out.push('<p>' + inlineMarkdown(state.paragraph.join(' ')) + '</p>');
        state.paragraph = [];
      }
    }

    for (const rawLine of lines) {
      const line = rawLine.replace(/\s+$/g, '');
      if (line.trim().startsWith(fence)) {
        flushParagraph();
        flushList(state, out);
        if (state.inCode) {
          out.push('<pre><code>' + escapeHtml(state.code.join('\n')) + '</code></pre>');
          state.code = [];
          state.inCode = false;
        } else {
          state.inCode = true;
        }
        continue;
      }

      if (state.inCode) {
        state.code.push(rawLine);
        continue;
      }

      if (!line.trim()) {
        flushParagraph();
        flushList(state, out);
        continue;
      }

      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        flushParagraph();
        flushList(state, out);
        const level = heading[1].length;
        out.push('<h' + level + '>' + inlineMarkdown(heading[2]) + '</h' + level + '>');
        continue;
      }

      const listItem = line.match(/^\s*[-*+]\s+(.+)$/);
      if (listItem) {
        flushParagraph();
        state.listItems.push(listItem[1]);
        continue;
      }

      const quote = line.match(/^>\s?(.+)$/);
      if (quote) {
        flushParagraph();
        flushList(state, out);
        out.push('<blockquote><p>' + inlineMarkdown(quote[1]) + '</p></blockquote>');
        continue;
      }

      flushList(state, out);
      state.paragraph.push(line.trim());
    }

    if (state.inCode) {
      out.push('<pre><code>' + escapeHtml(state.code.join('\n')) + '</code></pre>');
    }
    flushParagraph();
    flushList(state, out);
    return out.join('\n');
  }

  window.marked = { parse: parseBasicMarkdown };
})();

/**
 * ==========================================================================
 * VoxFlow - OpenAI API Client Module
 * ==========================================================================
 */

const TTS_MODEL = 'gpt-4o-mini-tts';
const STRUCT_MODEL = 'gpt-5.4-mini';
const TTS_MAX_RETRIES = 2;
const STRUCT_MAX_RETRIES = 3;
const MAX_TTS_CHARS = 500;

/* ==========================================================================
   TTS Audio Cache — IndexedDB
   ========================================================================== */

const IDB_NAME  = 'voxflow-tts-cache';
const IDB_STORE = 'audio';

function openTtsCacheDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore(IDB_STORE);
    req.onsuccess  = (e) => resolve(e.target.result);
    req.onerror    = ()  => reject(req.error);
  });
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


const STYLE_PRESETS = {
  '기본':     '',
  '브리핑':   '핵심만 간결하고 명확하게 전달하는 전문적인 브리핑 톤으로 읽어줘. 군더더기 없이.',
  '강의':     '학생을 가르치는 교수처럼 친절하고 설명적인 강의 톤으로 읽어줘. 중요한 부분은 천천히.',
  '오디오북': '오디오북 전문 낭독자처럼 감정을 담아 자연스럽고 몰입감 있게 읽어줘.',
  '차분':     '차분하고 안정감 있는 목소리로, 여유 있는 속도로 읽어줘.',
  '속독':     '또렷하고 압축적인 리듬으로, 군더더기 없이 정보 전달에 집중해서 읽어줘.',
};

const STRUCT_STYLE_HINTS = {
  '기본':     '',
  '브리핑':   '핵심 내용만 추려 간결하게 작성한다. 부연 설명은 최소화하고 문장은 짧게 끊는다.',
  '강의':     '개념을 단계적으로 풀어 설명한다. 중요한 내용은 강조 문장을 추가하거나 반복해 청취 이해도를 높인다.',
  '오디오북': '자연스러운 이야기 흐름으로 작성한다. 장면·주제 전환은 부드럽게 연결하고 감정 표현을 살린다.',
  '차분':     '여유 있는 속도감을 위해 문장을 길게 이어 쓴다. 쉼표와 접속어를 활용해 흐름을 늦춘다.',
  '속독':     '문장을 최대한 압축한다. 불필요한 수식어·중복 표현을 제거하고 핵심만 남긴다.',
};

const ENGLISH_PRONUNCIATION_OVERRIDES = {
  call: '콜',
  calls: '콜',
  callback: '콜백',
  callbacks: '콜백',
  bid: '비드',
  bids: '비드',
  bidding: '비딩',
  bidder: '비더',
  bidders: '비더',
  cache: '캐시',
  cached: '캐시된',
  caching: '캐싱',
  token: '토큰',
  tokens: '토큰',
  prompt: '프롬프트',
  prompts: '프롬프트',
  model: '모델',
  models: '모델',
  stream: '스트림',
  streaming: '스트리밍',
  batch: '배치',
  branch: '브랜치',
  commit: '커밋',
  push: '푸시'
};

const ACRONYM_LETTER_PRONUNCIATIONS = {
  A: '에이',
  B: '비',
  C: '씨',
  D: '디',
  E: '이',
  F: '에프',
  G: '지',
  H: '에이치',
  I: '아이',
  J: '제이',
  K: '케이',
  L: '엘',
  M: '엠',
  N: '엔',
  O: '오',
  P: '피',
  Q: '큐',
  R: '알',
  S: '에스',
  T: '티',
  U: '유',
  V: '브이',
  W: '더블유',
  X: '엑스',
  Y: '와이',
  Z: '제트'
};

const DIGIT_PRONUNCIATIONS = {
  '0': '공',
  '1': '일',
  '2': '이',
  '3': '삼',
  '4': '사',
  '5': '오',
  '6': '육',
  '7': '칠',
  '8': '팔',
  '9': '구'
};

const KOREAN_SMALL_NUMBER_VALUES = {
  공: '0',
  영: '0',
  일: '1',
  한: '1',
  하나: '1',
  이: '2',
  두: '2',
  둘: '2',
  삼: '3',
  세: '3',
  셋: '3',
  사: '4',
  네: '4',
  넷: '4',
  오: '5',
  다섯: '5',
  육: '6',
  여섯: '6',
  칠: '7',
  일곱: '7',
  팔: '8',
  여덟: '8',
  구: '9',
  아홉: '9',
  십: '10',
  열: '10'
};

const SOURCE_NUMBER_UNITS = '년|개월|월|일|회|건|개|명|차|단계|번|분|초|시간|원|달러|퍼센트';

const NATIVE_KOREAN_COUNTER_ONES = {
  1: '한',
  2: '두',
  3: '세',
  4: '네',
  5: '다섯',
  6: '여섯',
  7: '일곱',
  8: '여덟',
  9: '아홉'
};

const NATIVE_KOREAN_COUNTER_TENS = {
  1: '열',
  2: '스물',
  3: '서른',
  4: '마흔',
  5: '쉰',
  6: '예순',
  7: '일흔',
  8: '여든',
  9: '아흔'
};

const NATIVE_KOREAN_COUNTER_TENS_EXACT = {
  2: '스무'
};

function getNativeKoreanCounterNumber(value) {
  const n = Number.parseInt(value, 10);
  if (!Number.isInteger(n) || n < 1 || n > 99) return '';
  if (n < 10) return NATIVE_KOREAN_COUNTER_ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  if (ones === 0) return NATIVE_KOREAN_COUNTER_TENS_EXACT[tens] || NATIVE_KOREAN_COUNTER_TENS[tens];
  return `${NATIVE_KOREAN_COUNTER_TENS[tens]}${NATIVE_KOREAN_COUNTER_ONES[ones]}`;
}

const SINO_KOREAN_NUMBER_ONES = {
  1: '일',
  2: '이',
  3: '삼',
  4: '사',
  5: '오',
  6: '육',
  7: '칠',
  8: '팔',
  9: '구'
};

function getSinoKoreanNumber(value) {
  const n = Number.parseInt(value, 10);
  if (!Number.isInteger(n) || n < 1 || n > 99) return '';
  if (n < 10) return SINO_KOREAN_NUMBER_ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${tens > 1 ? SINO_KOREAN_NUMBER_ONES[tens] : ''}십${ones ? SINO_KOREAN_NUMBER_ONES[ones] : ''}`;
}

const LECTURE_WEEK_WORD_TO_NUMBER = new Map([
  ['첫', '1'],
  ...Array.from({ length: 99 }, (_, index) => {
    const value = String(index + 1);
    return [
      [getNativeKoreanCounterNumber(value), value],
      [getSinoKoreanNumber(value), value]
    ];
  }).flat()
]);

const LECTURE_WEEK_WORD_PATTERN = [...LECTURE_WEEK_WORD_TO_NUMBER.keys()]
  .filter(Boolean)
  .sort((a, b) => b.length - a.length)
  .join('|');

const ANSWER_CHOICE_PRONUNCIATION_TO_LETTER = new Map(
  Object.entries(ACRONYM_LETTER_PRONUNCIATIONS).map(([letter, pronunciation]) => [pronunciation, letter])
);

const ANSWER_CHOICE_PRONUNCIATION_PATTERN = [...ANSWER_CHOICE_PRONUNCIATION_TO_LETTER.keys()]
  .sort((a, b) => b.length - a.length)
  .join('|');

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fallbackCopyText(text) {
  let copied = false;
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    copied = document.execCommand('copy');
    document.body.removeChild(ta);
  } catch { /* fall through */ }

  if (copied) {
    showNotification('대본이 클립보드에 복사되었습니다.', 'success');
  } else {
    const title = (state.currentFile?.name?.replace(/\.[^.]+$/, '') || 'voxflow-script').replace(/[^\w가-힣]/g, '_');
    downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), `${title}.txt`);
    showNotification('클립보드 접근 불가 — 텍스트 파일로 저장했습니다.', 'success');
  }
}

async function exportFullAudio(onProgress) {
  if (!queue.segments.length) {
    showNotification('내보낼 오디오가 없습니다.', 'warning');
    return false;
  }
  if (!state.apiKey) {
    showNotification('오디오 생성에 API Key가 필요합니다.', 'error');
    return false;
  }

  const mp3Buffers = [];
  const total = queue.segments.length;

  for (let i = 0; i < total; i++) {
    const seg = queue.segments[i];
    onProgress?.(i, total);

    const narrationText = seg.ttsText || getNarrationText(seg.text);
    const cleanText = getNarrationText(narrationText);
    const cacheKey  = await makeTtsCacheKey(cleanText, state.voice, state.styleHint);
    let arrayBuffer = await getCachedAudio(cacheKey);
    if (!arrayBuffer) {
      const result = await generateSpeech(narrationText, {
        apiKey: state.apiKey,
        voice: state.voice,
        styleHint: state.styleHint
      });
      arrayBuffer = result.arrayBuffer;
    }
    mp3Buffers.push(arrayBuffer);
  }

  const totalBytes = mp3Buffers.reduce((sum, b) => sum + b.byteLength, 0);
  const merged = new Uint8Array(totalBytes);
  let offset = 0;
  for (const buf of mp3Buffers) {
    merged.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }

  const title = (state.currentFile?.name?.replace(/\.[^.]+$/, '') || 'voxflow').replace(/[^\w가-힣]/g, '_');
  downloadBlob(new Blob([merged], { type: 'audio/mpeg' }), `${title}.mp3`);
  return true;
}

function updateRepeatButton() {
  const mode  = queue.repeatMode;
  const label = { none: '반복 없음', all: '전체 반복', one: '현재 청크 반복' }[mode];
  const badge = { none: '', all: '∞', one: '1' }[mode];
  elements.btnRepeat.classList.toggle('active', mode !== 'none');
  elements.btnRepeat.setAttribute('aria-pressed', String(mode !== 'none'));
  elements.btnRepeat.title = label;
  elements.btnRepeat.setAttribute('aria-label', label);
  const badgeEl = elements.btnRepeat.querySelector('.repeat-badge');
  if (badgeEl) badgeEl.textContent = badge;
}

async function refreshCacheCount() {
  const n = await getCacheCount();
  if (elements.cacheCountBadge) elements.cacheCountBadge.textContent = `캐시 ${n}개`;
}

function updateExportRowVisibility() {
  if (!elements.exportRow) return;
  elements.exportRow.classList.toggle('hidden', state.segments.length === 0);
}

const MAX_READY_AUDIO_BUFFERS = 12;
const PREFETCH_SEGMENT_COUNT = 4;
const STABLE_PLAYBACK_STORAGE_KEY = 'voxflow_stable_playback';

function sleep(ms, signal = null) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(id); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
  });
}

function escapeHtmlText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const TRANSFORM_CHUNK_SIZE = 4000;

function extractContentTokens(text) {
  const tokens = new Set();
  const addWord = (word) => {
    const w = word.replace(/[*_`#[\]()]/g, '').trim();
    // All-uppercase tokens (API, URL, AI, HTML, JSON…) are phonetically transliterated
    // by the transform rules, so they will never appear verbatim in the output.
    if (/^[A-Z]+$/.test(w)) return;
    if (w.length >= 2 && (/[가-힣]/.test(w) || /^[A-Za-z]+$/.test(w)) && !/\d/.test(w)) {
      tokens.add(w);
    }
  };
  const addLine = (line) => line.trim().split(/\s+/).forEach(addWord);

  // Table cell content (skip separator rows like |---|)
  for (const row of text.matchAll(/^\s*\|(.+)\|/gm)) {
    if (/^[\s|:-]+$/.test(row[0])) continue;
    row[1].split('|').forEach(cell => addLine(cell));
  }

  // List item content
  for (const m of text.matchAll(/^[ \t]*(?:[-*•]|\d+\.)\s+(.+)/gm)) {
    addLine(m[1]);
  }

  // General paragraph content: strip markdown markers, then sample every other sentence.
  // Avoids over-weighting long prose while still catching silent omissions.
  const stripped = text
    .replace(/^#{1,3} .+/gm, '')           // headings handled separately
    .replace(/^\s*(?:[-*•]|\d+\.)\s+/gm, '') // list markers already covered
    .replace(/^\s*\|.+/gm, '')              // table rows already covered
    .replace(/[*_`[\]()]/g, '');
  const sentences = stripped.split(/(?<=[.!?。])\s+|\n+/).filter(s => s.trim().length > 4);
  sentences.filter((_, i) => i % 2 === 0).forEach(s => addLine(s));

  return [...tokens];
}

function verifyStructuralPreservation(original, transformed) {
  const issues = [];

  // Rule 6: section headings (##) must survive transformation
  const origHeadings = (original.match(/^#{1,3} .+/gm) || []).length;
  const trHeadings   = (transformed.match(/^#{1,3} .+/gm) || []).length;
  if (origHeadings > 1 && trHeadings < Math.floor(origHeadings * 0.8)) {
    issues.push(`섹션 제목 수 감소 (원문 ${origHeadings}개 → 변환 ${trHeadings}개)`);
  }

  // Content token check across tables, lists, and body paragraphs
  const tokens = extractContentTokens(original);
  if (tokens.length >= 4) {
    const trLower = transformed.toLowerCase();
    const missing = tokens.filter(t => {
      const tLow = t.toLowerCase();
      if (trLower.includes(tLow)) return false;
      // 한국어 어근 매칭: 변환 규칙이 어미/조사를 바꾸므로 마지막 1~2자를 제외한 어근으로 재검사
      if (/[가-힣]/.test(t) && t.length >= 4) {
        const stem = tLow.slice(0, Math.max(3, t.length - 2));
        if (trLower.includes(stem)) return false;
      }
      return true;
    });
    const missingRate = missing.length / tokens.length;
    // Paragraph rewriting can legitimately rephrase ~40% of tokens; flag above that.
    if (missingRate > 0.4) {
      const examples = missing.slice(0, 3).join(', ');
      issues.push(`원문 핵심 토큰의 ${Math.round(missingRate * 100)}%가 변환 결과에서 발견되지 않습니다 (예: ${examples}).`);
    }
  }

  return issues;
}

function splitTextIntoTransformChunks(text, maxChars = TRANSFORM_CHUNK_SIZE) {
  const sections = text.split(/(?=\n#{1,3} )/);
  const chunks = [];
  let current = '';

  const flushUnit = (unit) => {
    if (!unit.trim()) return;
    if (unit.length <= maxChars) {
      chunks.push(unit.trim());
      return;
    }
    // Line-level fallback
    const lines = unit.split('\n');
    let lineBuf = '';
    for (const line of lines) {
      if (lineBuf.length + line.length + 1 <= maxChars) {
        lineBuf += (lineBuf ? '\n' : '') + line;
      } else {
        if (lineBuf) chunks.push(lineBuf.trim());
        if (line.length > maxChars) {
          // Soft-slice: break at the last whitespace or punctuation before the limit
          let remaining = line;
          while (remaining.length > maxChars) {
            let cut = maxChars;
            const boundary = remaining.slice(0, maxChars).search(/[\s.,!?。，、]+(?=[^\s.,!?。，、]*$)/);
            if (boundary > maxChars * 0.5) cut = boundary;
            chunks.push(remaining.slice(0, cut).trim());
            remaining = remaining.slice(cut).trimStart();
          }
          lineBuf = remaining;
        } else {
          lineBuf = line;
        }
      }
    }
    if (lineBuf.trim()) chunks.push(lineBuf.trim());
  };

  for (const section of sections) {
    if (current.length + section.length <= maxChars) {
      current += section;
    } else {
      if (current) chunks.push(current.trim());
      if (section.length > maxChars) {
        const paragraphs = section.split(/\n\n+/);
        let sub = '';
        for (const para of paragraphs) {
          if (sub.length + para.length + 2 <= maxChars) {
            sub += (sub ? '\n\n' : '') + para;
          } else {
            if (sub) chunks.push(sub.trim());
            if (para.length > maxChars) {
              flushUnit(para);
              sub = '';
            } else {
              sub = para;
            }
          }
        }
        current = sub;
      } else {
        current = section;
      }
    }
  }
  if (current.trim()) flushUnit(current);
  return chunks.filter(Boolean);
}

async function transformTextForTtsStructure(rawText, { apiKey, signal = null, structHint = '' } = {}) {
  if (!rawText || !rawText.trim()) return '';
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('구조 변환을 위해 OpenAI API Key를 먼저 저장해주세요.');
  }

  let transformed;
  if (rawText.length > TRANSFORM_CHUNK_SIZE) {
    const chunks = splitTextIntoTransformChunks(rawText);
    const results = [];
    let prevTail = '';
    for (const chunk of chunks) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      results.push(await transformChunkWithFallback(chunk, { apiKey, signal, prevTail, structHint }));
      prevTail = chunk.split('\n').slice(-4).join('\n');
    }
    transformed = results.join('\n\n');
  } else {
    transformed = await transformChunkWithFallback(rawText, { apiKey, signal, structHint });
  }

  const lossIssues = verifyStructuralPreservation(rawText, transformed);
  if (lossIssues.length > 0) {
    throw new Error('구조 변환 중 정보 누락이 감지되었습니다:\n' + lossIssues.join('\n'));
  }

  return normalizeSpeechTextForDisplay(transformed);
}

function setSkeletonLabel(msg) {
  const label = document.querySelector('.skeleton-label');
  if (label) label.innerHTML = `<span class="skeleton-dot"></span>${msg}`;
}

async function countdownWait(totalSec, labelPrefix, signal) {
  for (let remaining = totalSec; remaining > 0; remaining--) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    setSkeletonLabel(`${labelPrefix} — ${remaining}초 후 재시도 (취소하려면 위의 버튼 클릭)`);
    await sleep(1000, signal);
  }
  setSkeletonLabel('GPT-5 Mini가 문서를 TTS 구조로 변환하는 중입니다…');
}

async function countdownToast(totalSec, labelPrefix, signal) {
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    container.style.cssText = 'position:fixed;top:calc(env(safe-area-inset-top, 0px) + 64px);right:max(env(safe-area-inset-right, 0px) + 16px, 20px);z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.style.cssText = 'background:#fffbeb;border:1px solid rgba(245,158,11,0.3);color:#d97706;padding:12px 16px;border-radius:8px;font-size:13px;max-width:320px;box-shadow:0 4px 12px rgba(0,0,0,0.12);pointer-events:auto;';
  container.appendChild(toast);
  try {
    for (let remaining = totalSec; remaining > 0; remaining--) {
      if (signal?.aborted) break;
      toast.textContent = `${labelPrefix} — ${remaining}초 후 재시도`;
      await sleep(1000, signal);
    }
  } finally {
    toast.style.transition = 'opacity 0.3s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }
}

async function transformChunkWithFallback(rawText, { apiKey, signal = null, prevTail = '', structHint = '' } = {}) {
  const retryable = new Set([429, 500, 502, 503, 504]);
  let lastError = null;

  for (let attempt = 0; attempt < STRUCT_MAX_RETRIES; attempt++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    setSkeletonLabel(`GPT-5 Mini 변환 중… (${attempt + 1}/${STRUCT_MAX_RETRIES}회 시도)`);
    try {
      return await transformSingleChunk(rawText, { apiKey, signal, prevTail, structHint });
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      lastError = err;

      const isRetryable = retryable.has(err.status) || /internal error|temporarily|unavailable/i.test(err.message || '');
      if (!isRetryable) throw formatTransformError(err);
      if (attempt === STRUCT_MAX_RETRIES - 1) break;

      if (err.status === 429) {
        const fromHeader = parseFloat(err.retryAfterHeader);
        const fromMsg    = parseFloat((err.message || '').match(/retry after (\d+\.?\d*)/i)?.[1]);
        const delaySec   = (isFinite(fromHeader) && fromHeader > 0) ? fromHeader
                         : (isFinite(fromMsg)    && fromMsg    > 0) ? fromMsg : 30;
        await countdownWait(Math.ceil(delaySec) + 2, `GPT 한도 초과`, signal);
      } else {
        await sleep(600 * Math.pow(2, attempt), signal);
      }
    }
  }

  throw formatTransformError(lastError);
}

function formatTransformError(err) {
  if (err?.userFriendly) return new Error(err.message);
  if (err?.status === 429) return new Error('요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
  if (/internal error/i.test(err?.message || '')) return new Error('OpenAI 서버 오류가 반복됩니다. 잠시 후 다시 시도해주세요.');
  if (err?.status === 400) return new Error('구조 변환 요청이 거부되었습니다. API Key 또는 입력 내용을 확인해주세요.');
  if (err?.status === 401) return new Error('API Key가 유효하지 않습니다. OpenAI API Key를 확인해주세요.');
  if (err?.status === 403) return new Error('API Key 권한이 없습니다. OpenAI API 사용 권한을 확인해주세요.');
  const detail = err?.message ? `: ${err.message}` : '';
  return new Error(`구조 변환에 실패했습니다${detail}`);
}

async function transformSingleChunk(rawText, { apiKey, signal = null, prevTail = '', structHint = '' } = {}) {
  const systemLines = [
    '당신은 한국어 TTS용 발화 스크립트 변환기입니다.',
    '입력 문서를 사람이 자연스럽게 읽을 수 있는 음성 대본 형태로 변환하세요.',
    '',
    '규칙:',
    '- 문서가 아니라 "낭독 스크립트"처럼 작성합니다.',
    '- Markdown, 표, 코드, URL은 제거합니다.',
    '- 숫자와 기호는 한국어 발화 기준으로 변환합니다.',
    '- AI, API 같은 약어와 영문 용어는 발음 기준 한글로 변환하고, 화면 표시용 원문 영문은 괄호에 병기합니다.',
    '- 문장은 자연스럽게 숨 쉴 수 있는 길이로 유지합니다.',
    '- 기계적인 단문 반복을 피합니다.',
    '- 청취 이해도를 최우선으로 합니다.',
    '- 최종 출력은 평문만 허용합니다.'
  ];
  if (structHint) {
    systemLines.push('', '=== 말투 스타일 ===', structHint);
  }
  const systemText = systemLines.join('\n');

  const transformRules = [
    '다음 원문을 한국어 TTS 발화 스크립트로 변환하세요. (규칙 버전: v3 / OpenAI TTS 최적화)',
    '',
    '=== 출력 원칙 ===',
    'R1. 출력 허용 형식은 다음 셋뿐이다: ## 섹션 제목 / 일반 문단 / 빈 줄.',
    '  제거: Markdown 장식, HTML 태그, 코드 블록, JSON/XML/SQL, URL 원문, 표 구조, 인라인 코드',
    '  허용: ## 섹션 제목 (그대로 유지), 문단 구분 빈 줄, 쉼표, 마침표, 표시용 원문 보존 괄호',
    '',
    'R2. 섹션 유지: ## 제목 형식은 반드시 유지한다. (TTS chunk 경계 / 문맥 전환 / prosody 안정화)',
    '',
    '=== 문장 규칙 ===',
    'R3. 문장 길이: 권장 70~110자, 최대 140자. 쉼표 3개 초과·숫자 다수·목록 포함 시 분리한다.',
    '',
    'R4. 문장 분리 기준: 의미 단위 기준. 우선순위: 문단 끝 → 마침표 → 쉼표 → 접속사 앞.',
    '',
    'R5. 연결 어미 제한: ~하며, ~하고, ~하지만, ~따라, ~때문에 허용. 문장당 최대 1회.',
    '',
    '=== 목록 변환 규칙 ===',
    'R6. Bullet List 변환:',
    '  입력: - A / - B / - C',
    '  출력: 다음과 같습니다.\n  A,\n  B,\n  C입니다.',
    '',
    'R7. Numbered List 변환: 1. → 첫째는, 2. → 둘째는, 3. → 셋째는 형태로 변환한다.',
    '',
    '=== 숫자 규칙 ===',
    'R8. 숫자 읽기 정책 (R9 식별자가 아닐 때만 적용):',
    '  숫자가 포함된 원문 값은 반드시 한국어 발화형 뒤에 괄호로 원문을 병기한다.',
    '  일반 수 152 → 백오십이(152)',
    '  천 단위 12,500 → 만 이천오백(12,500)',
    '  소수 3.14 → 삼 점 일사(3.14)',
    '  퍼센트 25% → 이십오 퍼센트(25%)',
    '  범위 3~5 → 삼에서 오(3~5)',
    '  날짜 5/23 → 오월 이십삼일(5/23)',
    '  숫자+단위는 발화형 단위 뒤에 원문을 괄호 병기한다. 2년 → 이 년(2년), 3개월 → 삼 개월(3개월), 5건 → 오 건(5건).',
    '  예외: 강의/수업 주차 표기는 화면 표시용 문장에서는 원문 숫자를 유지한다. 9주차 강의 → 9주차 강의. 낭독 시에는 구주차로 읽는다.',
    '  금액, 시간, 버전, 단계, 순번, 코드, 전화번호, IP 주소처럼 숫자가 하나라도 들어간 값도 모두 괄호로 원문을 보존한다.',
    '',
    'R9. 숫자·영문 혼합 식별자는 자연스러운 한국어 발화/설명 뒤에 원문을 괄호 병기한다: 모델명(GPT-5), 버전(v2.1.3), 코드값(A-102), 전화번호(010-1234), IP 주소(192.168.0.1), 이메일(user@test.com).',
    '  단, SWIFT 전문 유형처럼 MT 뒤에 숫자가 붙은 코드는 숫자를 자리별로 읽는다. MT103 → 엠티일공삼(MT103), MT202 → 엠티이공이(MT202). 0은 공으로 읽는다.',
    '',
    '=== 기호 규칙 ===',
    'R10. 수식 기호는 한국어 발화형 뒤에 원문 기호를 괄호로 병기한다: + → 더하기(+), - → 빼기(-), × → 곱하기(×), ÷ → 나누기(÷), = → 같습니다(=).',
    '',
    'R11. 비교 기호: > → 초과, < → 미만, ≥ → 이상, ≤ → 이하.',
    '',
    '=== 단위 규칙 ===',
    'R12. 단위 변환: km → 킬로미터, GB → 기가바이트, ms → 밀리초, °C → 도씨, kg → 킬로그램.',
    '',
    '=== 영문 처리 규칙 ===',
    'R13. 약어/영문 용어 발음 병기: AI → 에이아이(AI), API → 에이피아이(API), GPU → 지피유(GPU), LLM → 엘엘엠(LLM), OCR → 오씨알(OCR), OpenAI → 오픈에이아이(OpenAI).',
    '  괄호 안 영문은 화면 표시용 원문 보존이며, 낭독 대상이 아니다.',
    '  정답/보기처럼 단독 알파벳 선택지는 화면 표시용 문장에서는 원문 대문자를 유지한다. 정답은 C입니다 → 정답은 C입니다. 낭독 시에는 씨입니다로 읽는다.',
    '',
    'R14. 영문 단어/제품명/조직명은 가능한 한 한글 발음 또는 한국어 설명으로 변환하고, 필요한 경우 바로 뒤에 영문 원문을 괄호로 병기한다.',
    '  원문에 영문자가 하나라도 들어간 단어, 약어, 제품명, 함수명, 필드명, 명령어, 파일명은 모두 괄호로 원문을 보존한다.',
    '  대문자 약어는 한국어 알파벳 명칭으로 읽는다. A=에이, C=씨, I=아이, L=엘, M=엠, O=오, R=알, S=에스, U=유. R은 아르가 아니라 알이다.',
    '  예: LCR → 엘씨알(LCR), URL → 유알엘(URL), SQL → 에스큐엘(SQL), CPU → 씨피유(CPU), CRM → 씨알엠(CRM).',
    '  한국어 표기는 철자식이 아니라 실제 영어 발음·국내 IT 관용 표기를 따른다. call은 칼이 아니라 콜(call), bid는 바이드가 아니라 비드(bid), callback은 콜백(callback), cache는 캐시(cache), token은 토큰(token), prompt는 프롬프트(prompt)로 쓴다.',
    '  모호하면 국립국어원 외래어 표기법의 영어 발음 표기 원칙과 국내 기술문서 관용 표기를 우선한다.',
    '  긴 영문 문장은 한국어 설명형으로 변환하며, 원문 전체를 길게 괄호 병기하지 않는다.',
    '',
    '=== URL 규칙 ===',
    'R15. URL 제거: URL 원문 대신 내용 설명으로 대체한다. (예: https://openai.com/docs → 오픈AI 공식 문서입니다.)',
    '',
    '=== 괄호 규칙 ===',
    'R16. 괄호 처리: 보충 설명은 쉼표로 변환한다. 단, R8/R13/R14의 화면 표시용 숫자·영문 원문 괄호는 유지한다.',
    '  예: GPT-5(최신 모델) → 지피티 파이브(GPT-5), 최신 모델 / 백오십이(152), 에이피아이(API)는 그대로 유지',
    '',
    '=== 코드 규칙 ===',
    'R17. 코드 제거: source code, JSON, XML, SQL, stack trace는 낭독하지 않고 기능 설명으로 변환한다.',
    '',
    '=== 스트리밍 규칙 ===',
    'R18. Chunk 크기: 권장 150~300자, 최대 500자 이하.',
    '',
    'R19. Chunk 종료 위치: 섹션 종료 → 문단 종료 → 마침표 → 쉼표 순으로 우선한다.',
    '',
    '=== 예외 처리 규칙 ===',
    'R20. 정보 보존: 핵심 의미는 반드시 유지한다. 중복 표현, 시각 장식, 불필요 수식, 레이아웃 정보는 제거 가능.'
  ].join('\n');

  const contextNote = prevTail
    ? `\n\n[이전 청크 끝부분 — 번호/목록 연속성 유지 참고용, 변환 대상 아님]\n${prevTail}\n[/이전 청크 끝부분]`
    : '';
  const userText = transformRules + contextNote + '\n\n원문:\n' + rawText;

  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: STRUCT_MODEL,
      store: false,
      reasoning_effort: 'low',
      messages: [
        { role: 'system', content: systemText },
        { role: 'user',   content: userText }
      ]
    }),
    signal
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData.error?.message || `HTTP ${response.status}`);
    err.status = response.status;
    err.retryAfterHeader = response.headers.get('Retry-After');
    throw err;
  }

  const result = await response.json();
  const transformed = result.choices?.[0]?.message?.content?.trim();
  if (!transformed) {
    const err = new Error('구조 변환 결과가 비어 있습니다. 입력 내용을 확인해주세요.');
    err.status = 0; err.userFriendly = true;
    throw err;
  }

  return transformed;
}

function stripTtsMarkers(text) {
  return text
    .replace(/\[pause\]/gi, '')
    .replace(/\[emphasis\]/gi, '')
    .replace(/\[cautious\]/gi, '')
    .replace(/  +/g, ' ')
    .trim();
}

function getAcronymPronunciation(value) {
  const token = String(value || '').trim();
  if (!/^[A-Z]{1,10}$/.test(token)) return '';
  return token.split('').map(letter => ACRONYM_LETTER_PRONUNCIATIONS[letter] || letter).join('');
}

function getDigitByDigitCodePronunciation(value) {
  const token = String(value || '').trim().toUpperCase();
  const match = token.match(/^(MT)(\d{2,6})$/);
  if (!match) return '';
  const prefix = getAcronymPronunciation(match[1]);
  const digits = match[2].split('').map(digit => DIGIT_PRONUNCIATIONS[digit] || digit).join('');
  return prefix + digits;
}

function addSourceNumberUnitParentheticals(text) {
  const unitPattern = SOURCE_NUMBER_UNITS;
  const pattern = new RegExp(`(^|[^가-힣\\d(（])(${Object.keys(KOREAN_SMALL_NUMBER_VALUES).join('|')})\\s+(${unitPattern})(?!\\s*[)）])(?!(?:\\s*[\\(（][^\\n\\)）]*[\\)）]))`, 'g');
  return String(text || '').replace(pattern, (match, prefix, numberWord, unit) => {
    const value = KOREAN_SMALL_NUMBER_VALUES[numberWord];
    if (!value) return match;
    return `${prefix}${numberWord} ${unit}(${value}${unit})`;
  });
}

function normalizeEnglishPronunciationParentheticals(text) {
  return addSourceNumberUnitParentheticals(String(text || '')
    .replace(/([가-힣]{1,12}(?:\s+[가-힣]{1,12})?)\s*[\(（]\s*(MT\d{2,6})\s*[\)）]/gi, (match, hangul, code) => {
      const preferred = getDigitByDigitCodePronunciation(code);
      if (!preferred) return match;
      return `${preferred}(${code})`;
    })
    .replace(/([가-힣]+)\s*[\(（]\s*([A-Za-z][A-Za-z0-9_-]*)\s*[\)）]/g, (match, hangul, english) => {
      const preferred = getDigitByDigitCodePronunciation(english) || getAcronymPronunciation(english) || ENGLISH_PRONUNCIATION_OVERRIDES[english.toLowerCase()];
      if (!preferred) return match;
      return `${preferred}(${english})`;
    }));
}

function getLectureWeekNumber(value) {
  const token = String(value || '').replace(/\s+/g, '');
  if (/^[1-9]\d?$/.test(token)) return String(Number.parseInt(token, 10));
  return LECTURE_WEEK_WORD_TO_NUMBER.get(token) || '';
}

function normalizeLectureWeekForDisplay(text) {
  const weekTokenPattern = `(?:[1-9]\\d?|${LECTURE_WEEK_WORD_PATTERN})`;
  const weekSourcePattern = new RegExp(`(${weekTokenPattern})\\s*주\\s*차\\s*[\\(（]\\s*(${weekTokenPattern})\\s*주\\s*차\\s*[\\)）]`, 'g');
  const weekWordPattern = new RegExp(`(${LECTURE_WEEK_WORD_PATTERN})\\s*주\\s*차`, 'g');

  return String(text || '')
    .replace(weekSourcePattern, (match, outer, inner) => {
      const numberText = getLectureWeekNumber(inner) || getLectureWeekNumber(outer);
      return numberText ? `${numberText}주차` : match;
    })
    .replace(/(^|[^\d])([1-9]\d?)\s*주\s*차/g, (match, prefix, numberText) => {
      return `${prefix}${Number.parseInt(numberText, 10)}주차`;
    })
    .replace(weekWordPattern, (match, weekWord) => {
      const numberText = getLectureWeekNumber(weekWord);
      return numberText ? `${numberText}주차` : match;
    });
}

function normalizeLectureWeekForNarration(text) {
  return normalizeLectureWeekForDisplay(text)
    .replace(/(^|[^\d])([1-9]\d?)주차/g, (match, prefix, numberText) => {
      const spoken = getSinoKoreanNumber(numberText);
      return spoken ? `${prefix}${spoken}주차` : match;
    });
}

function normalizeAnswerChoiceLettersForDisplay(text) {
  const answerContextPattern = new RegExp(`((?:정답|해답|답|보기|선택지)[^.!?。！？\\n]{0,12}?)(${ANSWER_CHOICE_PRONUNCIATION_PATTERN})(?:\\s*[\\(（]\\s*([A-Z])\\s*[\\)）])?(?=(?:입니다|이다|이에요|예요|였|였습니다|[은는이가을를와과도]|번|항|형|안|선택지|답|$|[\\s,.;:!?。！？)\\]）]))`, 'g');
  return String(text || '')
    .replace(answerContextPattern, (match, prefix, pronunciation, parentheticalLetter) => {
      return `${prefix}${parentheticalLetter || ANSWER_CHOICE_PRONUNCIATION_TO_LETTER.get(pronunciation) || pronunciation}`;
    })
    .replace(/([A-Z])\s+(입니다|이다|이에요|예요)/g, '$1$2');
}

function normalizeStandaloneAnswerChoiceLetters(text) {
  return String(text || '')
    .replace(/(^|[^A-Za-z0-9(（])([A-Z])(?=(?:입니다|이다|이에요|예요|였|였습니다|[은는이가을를와과도]|번|항|형|안|선택지|답|$|[\s,.;:!?。！？)\]）]))/g, (match, prefix, letter) => {
      const spoken = ACRONYM_LETTER_PRONUNCIATIONS[letter];
      return spoken ? `${prefix}${spoken}` : match;
    })
    .replace(/(에이|비|씨|디|이|에프|지|에이치|아이|제이|케이|엘|엠|엔|오|피|큐|알|에스|티|유|브이|더블유|엑스|와이|제트)\s+(입니다|이다|이에요|예요)/g, '$1$2');
}

function normalizeSpeechTextForDisplay(text) {
  return normalizeAnswerChoiceLettersForDisplay(
    normalizeLectureWeekForDisplay(
      normalizeEnglishPronunciationParentheticals(text)
    )
  );
}

function normalizeSpeechTextForNarration(text) {
  return normalizeStandaloneAnswerChoiceLetters(
    normalizeLectureWeekForNarration(
      normalizeEnglishPronunciationParentheticals(text)
    )
  );
}

function removeDisplayOnlyEnglishParentheticals(text) {
  return String(text || '')
    .replace(/\s*[\(（]([^()（）]*)[\)）]/g, (match, inner) => {
      const body = String(inner || '').trim();
      if (!/[가-힣]/.test(body) && /[A-Za-z0-9+\-×÷=<>≥≤~%/.:]/.test(body)) return '';
      return match;
    })
    .replace(/\s+([,.;:!?。！？])/g, '$1')
    .replace(/ {2,}/g, ' ')
    .trim();
}

function getNarrationText(text) {
  return removeDisplayOnlyEnglishParentheticals(normalizeSpeechTextForNarration(stripTtsMarkers(text)));
}

async function generateSpeech(text, { apiKey, voice = 'marin', styleHint = '', signal = null }) {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('OpenAI API Key가 누락되었습니다. 상단 설정 바에서 API Key를 입력해주세요.');
  }

  const cleanText = getNarrationText(text);

  // 캐시 조회 — 히트 시 API 호출 없이 즉시 반환
  const cacheKey = await makeTtsCacheKey(cleanText, voice, styleHint);
  const cached = await getCachedAudio(cacheKey);
  if (cached) return { arrayBuffer: cached, fromCache: true };

  const payload = { model: TTS_MODEL, input: cleanText, voice, response_format: 'mp3' };
  if (styleHint) payload.instructions = styleHint;

  const retryableStatuses = new Set([429, 500, 502, 503, 504]);
  let lastError = null;

  for (let attempt = 0; attempt < TTS_MAX_RETRIES; attempt++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify(payload),
        signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error?.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.retryAfterHeader = response.headers.get('Retry-After');
        throw error;
      }

      const arrayBuffer = await response.arrayBuffer();
      setCachedAudio(cacheKey, arrayBuffer); // 백그라운드 저장, await 불필요
      return { arrayBuffer };
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      lastError = error;

      const canRetry = retryableStatuses.has(error.status) || /internal error|temporarily|unavailable/i.test(error.message || '');
      if (!canRetry) {
        if (error.status === 400) throw new Error('TTS 요청이 거부되었습니다. 입력 텍스트 또는 API Key를 확인해주세요.');
        if (error.status === 401) throw new Error('API Key가 유효하지 않습니다. OpenAI API Key를 확인해주세요.');
        if (error.status === 403) throw new Error('API Key 권한이 없습니다. OpenAI API 사용 권한을 확인해주세요.');
        throw error;
      }
      if (attempt < TTS_MAX_RETRIES - 1) {
        if (error.status === 429) {
          const fromHeader = parseFloat(error.retryAfterHeader);
          const waitSec = isFinite(fromHeader) && fromHeader > 0 ? Math.ceil(fromHeader) + 2 : 30;
          await countdownToast(waitSec, `TTS 요청 한도 초과 (${attempt + 1}/${TTS_MAX_RETRIES}회)`, signal);
        } else {
          await sleep(600 * Math.pow(2, attempt), signal);
        }
      }
    }
  }

  if (lastError?.status === 429) throw new Error('TTS 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
  throw lastError;
}

/**
 * ==========================================================================
 * AetherTTS - Smart Text/Markdown Chunker Module
 * ==========================================================================
 */

/**
 * Split a string into sentences based on punctuation and spacing.
 * 
 * @param {string} text Plain text to split.
 * @returns {string[]} Array of sentences.
 */
function splitSentences(text) {
  if (!text) return [];

  const DELIM = '\x01';
  const SHIELD = '\x02';
  // Protect common abbreviations so their trailing period doesn't trigger a split
  const shielded = text.replace(
    /\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|St|No)\.\s+/g,
    `$1.${SHIELD}`
  );
  const marked = shielded
    .replace(/([。！？])\s*/g, `$1${DELIM}`)
    .replace(/([!?])\s+/g, `$1${DELIM}`)
    // . splits only when followed by space + uppercase or Korean (avoids 3.14, U.S.A.)
    .replace(/\.\s+([A-Z가-힣])/g, `.${DELIM}$1`)
    .replace(/\n+/g, DELIM)
    .replace(new RegExp(SHIELD, 'g'), ' ');

  return marked.split(DELIM).map(s => s.trim()).filter(Boolean);
}

function splitLongText(text, maxChars = MAX_TTS_CHARS) {
  const chunks = [];
  let current = '';

  function pushCurrent() {
    const trimmed = current.trim();
    if (trimmed) chunks.push(trimmed);
    current = '';
  }

  function pushOversized(value) {
    let remaining = value.trim();
    while (remaining.length > maxChars) {
      let cut = Math.max(
        remaining.lastIndexOf(' ', maxChars),
        remaining.lastIndexOf(',', maxChars),
        remaining.lastIndexOf('，', maxChars),
        remaining.lastIndexOf(';', maxChars),
        remaining.lastIndexOf('；', maxChars)
      );
      if (cut < Math.floor(maxChars * 0.45)) {
        cut = maxChars;
      }
      chunks.push(remaining.slice(0, cut).trim());
      remaining = remaining.slice(cut).trim();
    }
    if (remaining) chunks.push(remaining);
  }

  for (const sentence of splitSentences(text)) {
    if (sentence.length > maxChars) {
      pushCurrent();
      pushOversized(sentence);
      continue;
    }

    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length > maxChars) {
      pushCurrent();
      current = sentence;
    } else {
      current = next;
    }
  }

  pushCurrent();
  return chunks.length ? chunks : [text.trim()].filter(Boolean);
}

/**
 * Parse plain text input into readable segments and return styled HTML.
 * 
 * @param {string} plainText The raw plain text input.
 * @returns {{html: string, segments: Array}} The rendered HTML and the segment metadata array.
 */
function parsePlainInput(plainText) {
  if (!plainText) return { html: '', segments: [] };
  plainText = normalizeSpeechTextForDisplay(plainText);
  
  const segments = [];
  let segmentId = 0;
  
  // Split by double newlines into paragraphs
  const paragraphs = plainText.split(/\n\s*\n/);
  let htmlResult = '';
  
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    
    const chunks = splitLongText(trimmed);
    if (chunks.length > 1) {
      let paraHtml = '';
      
      for (const chunk of chunks) {
        const chunkTrimmed = chunk.trim();
        if (!chunkTrimmed) continue;
        
        const id = segmentId++;
        segments.push({
          id,
          text: chunkTrimmed,
          ttsText: getNarrationText(chunkTrimmed),
          type: 'sentence',
          audioBuffer: null,
          state: 'idle'
        });
        
        paraHtml += `<span id="segment-${id}" class="preview-block sentence-span" data-segment-id="${id}">${escapeHtmlText(chunkTrimmed)} </span>`;
      }
      htmlResult += `<p class="plain-para">${paraHtml}</p>`;
    } else {
      const id = segmentId++;
      segments.push({
        id,
        text: trimmed,
        ttsText: getNarrationText(trimmed),
        type: 'p',
        audioBuffer: null,
        state: 'idle'
      });
      
      htmlResult += `<p id="segment-${id}" class="preview-block plain-para" data-segment-id="${id}">${escapeHtmlText(trimmed)}</p>`;
    }
  }
  
  return { html: htmlResult, segments };
}

function sanitizeHtmlFragment(html) {
  const template = document.createElement('template');
  template.innerHTML = html;

  template.content.querySelectorAll('script, style, iframe, object, embed').forEach(node => node.remove());
  template.content.querySelectorAll('*').forEach((node) => {
    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith('on') || (['href', 'src', 'xlink:href'].includes(name) && value.startsWith('javascript:'))) {
        node.removeAttribute(attr.name);
      }
    });
  });

  return template.innerHTML;
}

/**
 * Parse markdown text into segments and return interactive HTML with unique IDs.
 * Utilizes standard marked.js for core parsing and runs DOM post-processing.
 * 
 * @param {string} markdownText The raw markdown string.
 * @returns {{html: string, segments: Array}} Rendered HTML string and segment metadata.
 */
function parseMarkdown(markdownText) {
  if (!markdownText) return { html: '', segments: [] };
  markdownText = normalizeSpeechTextForDisplay(markdownText);
  
  // 1. Convert markdown to HTML using marked.js loaded in the window
  if (!window.marked) {
    console.error('marked.js is not loaded in the window context. Falling back to plain parsing.');
    return parsePlainInput(markdownText);
  }
  
  const rawHtml = window.marked.parse(markdownText);
  
  // 2. Load into a virtual DOM element for robust post-processing
  const temp = document.createElement('div');
  temp.innerHTML = sanitizeHtmlFragment(rawHtml);
  
  const segments = [];
  let segmentId = 0;
  
  // Select speakable semantic blocks
  const selector = 'p, h1, h2, h3, h4, h5, h6, li, blockquote';
  const elements = temp.querySelectorAll(selector);
  
  elements.forEach((el) => {
    // Skip blockquotes themselves (their nested elements, like 'p' or 'li', will be processed individually)
    if (el.tagName === 'BLOCKQUOTE') {
      return;
    }
    
    // Avoid reading content inside code snippets or code blocks
    if (el.closest('pre') || el.closest('code')) {
      return;
    }
    
    const textContent = el.textContent.trim();
    if (!textContent) return;
    
    // If it is long, decompose into smaller TTS-safe chunks.
    const chunks = splitLongText(textContent);
    if (el.tagName === 'P' && chunks.length > 1) {
      el.innerHTML = ''; // Clear original paragraph contents
      
      chunks.forEach((chunk) => {
        const chunkTrimmed = chunk.trim();
        if (!chunkTrimmed) return;
        
        const id = segmentId++;
        segments.push({
          id,
          text: chunkTrimmed,
          ttsText: getNarrationText(chunkTrimmed),
          type: 'sentence',
          audioBuffer: null,
          state: 'idle'
        });
        
        const span = document.createElement('span');
        span.id = `segment-${id}`;
        span.className = 'preview-block sentence-span';
        span.setAttribute('data-segment-id', id);
        span.textContent = chunkTrimmed + ' ';
        el.appendChild(span);
      });
    } else {
      // Standard block element (headings, list items, short paragraphs)
      const id = segmentId++;
      segments.push({
        id,
        text: textContent,
        ttsText: getNarrationText(textContent),
        type: el.tagName.toLowerCase(),
        audioBuffer: null,
        state: 'idle'
      });
      
      el.id = `segment-${id}`;
      el.classList.add('preview-block');
      el.setAttribute('data-segment-id', id);
    }
  });
  
  return { html: temp.innerHTML, segments };
}

function writeAsciiString(view, offset, value) {
  for (let i = 0; i < value.length; i++) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

// Finds the first/last frame where any channel exceeds the silence threshold.
// Returns trimmed {start, end} frame indices for gapless MP3 concatenation.
function getAudioBounds(buffer, threshold = 0.0005) {
  const len = buffer.length;
  let firstSignal = len;
  let lastSignal = 0;

  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      if (Math.abs(data[i]) >= threshold) { firstSignal = Math.min(firstSignal, i); break; }
    }
    for (let i = len - 1; i >= 0; i--) {
      if (Math.abs(data[i]) >= threshold) { lastSignal = Math.max(lastSignal, i); break; }
    }
  }

  if (firstSignal >= len || lastSignal === 0) return { start: 0, end: len };
  // Keep ~30 ms of natural tail decay after the last signal frame.
  const tailPad = Math.round(buffer.sampleRate * 0.03);
  return { start: firstSignal, end: Math.min(lastSignal + 1 + tailPad, len) };
}

function createWavBlobFromAudioBuffers(audioBuffers) {
  if (!audioBuffers.length) {
    throw new Error('연속 재생용 오디오가 없습니다.');
  }

  const sampleRate = audioBuffers[0].sampleRate;
  const numberOfChannels = Math.max(...audioBuffers.map(buffer => buffer.numberOfChannels || 1));
  const bytesPerSample = 2;

  // Compute silence-trimmed bounds for each buffer to remove MP3 encoder/decoder padding.
  const bounds = audioBuffers.map(buf => getAudioBounds(buf));
  const trimmedLengths = bounds.map((b, i) => b.end - b.start);

  const segmentStarts = [];
  const totalFrames = trimmedLengths.reduce((sum, len) => {
    segmentStarts.push(sum / sampleRate);
    return sum + len;
  }, 0);

  const dataSize = totalFrames * numberOfChannels * bytesPerSample;
  const wavBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(wavBuffer);

  writeAsciiString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAsciiString(view, 8, 'WAVE');
  writeAsciiString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * bytesPerSample, true);
  view.setUint16(32, numberOfChannels * bytesPerSample, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeAsciiString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let writeOffset = 44;
  for (let b = 0; b < audioBuffers.length; b++) {
    const buffer = audioBuffers[b];
    const { start, end } = bounds[b];
    const channelData = Array.from({ length: numberOfChannels }, (_, channel) => {
      const sourceChannel = Math.min(channel, buffer.numberOfChannels - 1);
      return buffer.getChannelData(sourceChannel);
    });

    for (let frame = start; frame < end; frame++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channelData[channel][frame] || 0));
        view.setInt16(writeOffset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        writeOffset += bytesPerSample;
      }
    }
  }

  return {
    blob: new Blob([wavBuffer], { type: 'audio/wav' }),
    segmentStarts,
    duration: totalFrames / sampleRate
  };
}

/**
 * ==========================================================================
 * AetherTTS - Web Audio API & Playback Queue Manager Module
 * ==========================================================================
 */


/**
 * QueueManager manages the sequential playback, pre-fetching, 
 * and Web Audio API node routing of the generated speech segments.
 */
class QueueManager {
  constructor() {
    this.audioCtx = null;
    this.analyserNode = null;
    this.gainNode = null;
    
    this.segments = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.repeatMode = 'none'; // 'none' | 'one' | 'all'
    this.status = 'idle'; // 'idle' | 'generating' | 'buffering' | 'playing' | 'paused'
    
    this.volume = 1.0;
    this.playbackRate = 1.0;
    
    this.currentSourceNode = null;
    this.startTime = 0;
    this.pausedAt = 0;
    this.generationAbortController = null;
    this.queueVersion = 0;
    this.nextScheduledTime = 0;
    this.preScheduledSource = null;
    this.preScheduledIndex = -1;
    this.useStablePlayback = false;
    this.mediaAudio = null;
    this.mediaObjectUrl = null;
    this.mediaSegmentStarts = [];
    this.mediaDuration = 0;
    this.mediaActiveIndex = -1;

    // API configuration for prefetching
    this.apiConfig = {
      apiKey: '',
      voice: 'marin',
      styleHint: ''
    };
    
    this.eventListeners = {
      statusChange: [],
      segmentStart: [],
      progress: [],
      stateUpdate: []
    };
    
    this.progressInterval = null;
  }

  /**
   * Lazy-initializes the browser Web Audio API context under user gesture.
   */
  initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'playback' });
      
      // Node routing: Source -> GainNode (Volume) -> AnalyserNode (Visualizer) -> Destination (Speakers)
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 256;
      
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
      
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);
    }
    
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  primeForAutoplay() {
    this.initAudio();
    if (!this.audioCtx || !this.gainNode) return;

    try {
      const buffer = this.audioCtx.createBuffer(1, 1, this.audioCtx.sampleRate);
      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.gainNode);
      source.onended = () => {
        try { source.disconnect(); } catch {}
      };
      source.start(0);
    } catch {
      // If silent priming is blocked, the normal play button remains the fallback.
    }
  }

  /**
   * Bind event listeners.
   */
  addEventListener(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback);
    }
  }

  /**
   * Emit events.
   */
  emit(event, ...args) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(cb => cb(...args));
    }
  }

  /**
   * Set speech segments.
   */
  setSegments(segments) {
    this.stop();
    this.queueVersion++;
    this.segments = segments.map(seg => ({
      ...seg,
      ttsText: seg.ttsText || getNarrationText(seg.text),
      audioBuffer: null,
      state: 'idle', // 'idle' | 'generating' | 'ready' | 'error'
      errorMsg: null
    }));
    this.currentIndex = 0;
    this.emit('stateUpdate', this.segments);
  }

  /**
   * Update API Configuration.
   */
  setConfig(config) {
    this.apiConfig = { ...this.apiConfig, ...config };
  }

  setStablePlayback(enabled) {
    const nextValue = Boolean(enabled);
    if (this.useStablePlayback === nextValue) return;
    this.stop();
    this.useStablePlayback = nextValue;
  }

  releaseDistantAudioBuffers(centerIndex = this.currentIndex) {
    const readySegments = this.segments
      .filter(seg => seg.audioBuffer)
      .sort((a, b) => Math.abs(a.id - centerIndex) - Math.abs(b.id - centerIndex));

    readySegments.slice(MAX_READY_AUDIO_BUFFERS).forEach((seg) => {
      seg.audioBuffer = null;
      if (seg.state === 'ready') {
        seg.state = 'idle';
      }
    });
  }

  /**
   * Set playback volume (0.0 to 1.0).
   */
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
    if (this.mediaAudio) {
      this.mediaAudio.volume = this.volume;
    }
  }

  /**
   * Set playback speed (0.5 to 2.0).
   */
  setPlaybackRate(value) {
    const newRate = Math.max(0.5, Math.min(2.0, value));
    if (this.currentSourceNode && newRate !== this.playbackRate) {
      // Recalibrate startTime so elapsed/pausedAt calculations stay correct after rate change
      const elapsed = (this.audioCtx.currentTime - this.startTime) * this.playbackRate;
      this.startTime = this.audioCtx.currentTime - (elapsed / newRate);
      this.currentSourceNode.playbackRate.setValueAtTime(newRate, this.audioCtx.currentTime);
    }
    this.playbackRate = newRate;
    if (this.mediaAudio) {
      this.mediaAudio.playbackRate = newRate;
    }
  }

  /**
   * Start or resume playback of the queue.
   */
  async play() {
    this.initAudio();
    
    if (this.segments.length === 0) return;

    if (this.useStablePlayback) {
      await this.playStable();
      return;
    }
    
    this.isPlaying = true;
    
    if (this.status === 'paused') {
      // Resume logic
      // Note: In Web Audio API, a stopped source cannot be resuscitated. 
      // We recreate the source node and start from where it was paused.
      this.playSegment(this.currentIndex, this.pausedAt);
      return;
    }
    
    this.playSegment(this.currentIndex);
  }

  /**
   * Pause current playback.
   */
  pause() {
    if (!this.isPlaying) return;

    if (this.useStablePlayback) {
      if (!this.mediaAudio) {
        this.stop();
        return;
      }
      this.isPlaying = false;
      this.setStatus('paused');
      this.mediaAudio.pause();
      this.pausedAt = Math.max(0, this.mediaAudio.currentTime - (this.mediaSegmentStarts[this.currentIndex] || 0));
      this.stopProgressTracking();
      return;
    }

    this.isPlaying = false;
    this.setStatus('paused');
    this._clearPreScheduled();

    if (this.currentSourceNode) {
      this.currentSourceNode.onended = null;
      this.currentSourceNode.stop();
      this.currentSourceNode = null;
      this.pausedAt = (this.audioCtx.currentTime - this.startTime) * this.playbackRate;
    }

    this.stopProgressTracking();
  }

  /**
   * Completely stop playback and reset pointers.
   */
  stop() {
    this.isPlaying = false;
    this.setStatus('idle');
    this._clearPreScheduled();
    this.nextScheduledTime = 0;
    this._destroyStableMedia();

    if (this.generationAbortController) {
      this.generationAbortController.abort();
      this.generationAbortController = null;
    }

    if (this.currentSourceNode) {
      this.currentSourceNode.onended = null;
      this.currentSourceNode.stop();
      this.currentSourceNode = null;
    }

    this.pausedAt = 0;
    this.currentIndex = 0;
    this.stopProgressTracking();
    this.emit('progress', 0, 1);
  }

  /**
   * Skip forward.
   */
  next() {
    if (this.currentIndex < this.segments.length - 1) {
      this.jumpToSegment(this.currentIndex + 1);
    }
  }

  /**
   * Skip backward.
   */
  prev() {
    if (this.currentIndex > 0) {
      this.jumpToSegment(this.currentIndex - 1);
    }
  }

  /**
   * Jump directly to a specific segment and play.
   */
  jumpToSegment(index) {
    if (index < 0 || index >= this.segments.length) return;

    if (this.useStablePlayback && this.mediaAudio) {
      this.currentIndex = index;
      this.pausedAt = 0;
      this.mediaAudio.currentTime = this.mediaSegmentStarts[index] || 0;
      this.emit('segmentStart', index);
      this.emit('progress', this.mediaAudio.currentTime, this.mediaDuration || this.mediaAudio.duration || 1);
      if (this.isPlaying) {
        this.mediaAudio.play().catch(() => {});
        this.setStatus('playing');
        this.startStableProgressTracking();
      }
      return;
    }

    if (this.useStablePlayback) {
      this.stop();
      this.currentIndex = index;
      this.isPlaying = true;
      this.playStable();
      return;
    }
    
    this.stop();
    this.currentIndex = index;
    this.isPlaying = true;
    this.playSegment(index);
  }

  async playStable() {
    if (this.segments.length === 0) return;

    this.isPlaying = true;
    this._clearPreScheduled();

    if (!this.mediaAudio) {
      try {
        await this.prepareStableMedia();
      } catch (err) {
        if (err.name === 'AbortError') return;
        this.isPlaying = false;
        this.setStatus('idle');
        showNotification(`차량 모드 준비 실패: ${err.message}`, 'error');
        return;
      }
    }

    if (!this.isPlaying || !this.mediaAudio) return;

    if (this.status !== 'paused') {
      this.mediaAudio.currentTime = this.mediaSegmentStarts[this.currentIndex] || 0;
    }

    this.mediaAudio.volume = this.volume;
    this.mediaAudio.playbackRate = this.playbackRate;
    this.emit('segmentStart', this.currentIndex);

    try {
      await this.mediaAudio.play();
      this.setStatus('playing');
      this.startStableProgressTracking();
    } catch (err) {
      this.isPlaying = false;
      this.setStatus('paused');
      showNotification('브라우저가 자동 재생을 막았습니다. 재생 버튼을 한 번 더 눌러주세요.', 'warning');
    }
  }

  async prepareStableMedia() {
    if (this.mediaAudio) return;

    this.setStatus('generating');
    this._destroyStableMedia();

    if (!this.generationAbortController) {
      this.generationAbortController = new AbortController();
    }

    const { signal } = this.generationAbortController;
    const capturedVersion = this.queueVersion;
    const audioBuffers = [];

    for (let i = 0; i < this.segments.length; i++) {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
      if (this.queueVersion !== capturedVersion) throw new DOMException('Aborted', 'AbortError');

      const segment = this.segments[i];
      if (!segment.audioBuffer) {
        segment.state = 'generating';
        this.emit('stateUpdate', this.segments);

        const result = await generateSpeech(segment.ttsText || segment.text, { ...this.apiConfig, signal });
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
        if (this.queueVersion !== capturedVersion) throw new DOMException('Aborted', 'AbortError');

        segment.audioBuffer = await this.decodeAudio(result.arrayBuffer);
        segment.state = 'ready';
        segment.errorMsg = null;
        this.emit('stateUpdate', this.segments);
      }
      audioBuffers.push(segment.audioBuffer);
    }

    this.setStatus('buffering');
    const { blob, segmentStarts, duration } = createWavBlobFromAudioBuffers(audioBuffers);
    const audio = new Audio();
    audio.preload = 'auto';
    audio.playsInline = true;
    audio.setAttribute('playsinline', '');
    audio.setAttribute('webkit-playsinline', '');
    audio.src = URL.createObjectURL(blob);
    audio.volume = this.volume;
    audio.playbackRate = this.playbackRate;
    audio.addEventListener('ended', () => this._handleStableEnded());
    audio.addEventListener('error', () => {
      if (!this.isPlaying) return;
      this.isPlaying = false;
      this.setStatus('idle');
      showNotification('차량 모드 오디오 재생 중 오류가 발생했습니다.', 'error');
    });

    this.mediaAudio = audio;
    this.mediaObjectUrl = audio.src;
    this.mediaSegmentStarts = segmentStarts;
    this.mediaDuration = duration;
    this.mediaActiveIndex = -1;
  }

  /**
   * Core segment playback router. Handles generation triggers, 
   * buffering waits, and Web Audio node scheduling.
   */
  async playSegment(index, offset = 0) {
    if (index < 0 || index >= this.segments.length) {
      this.stop();
      return;
    }
    
    this.currentIndex = index;
    const segment = this.segments[index];
    this.emit('segmentStart', index);
    
    // Case 1: Audio buffer is ready
    if (segment.audioBuffer) {
      this.pausedAt = offset;
      if (!this.generationAbortController) {
        this.generationAbortController = new AbortController();
      }
      this.executePlayback(segment.audioBuffer, offset);
      this.prefetchNext();
      return;
    }
    
    // Case 2: Audio is actively generating
    if (segment.state === 'generating') {
      this.setStatus('buffering');
      const checkInterval = setInterval(() => {
        if (!this.isPlaying || this.currentIndex !== index) {
          clearInterval(checkInterval);
          return;
        }
        if (segment.state === 'ready' && segment.audioBuffer) {
          clearInterval(checkInterval);
          this.playSegment(index, offset);
        } else if (segment.state === 'error') {
          clearInterval(checkInterval);
          this.setStatus('idle');
          showNotification(`음성 재생 실패: ${segment.errorMsg}`);
        } else if (segment.state === 'idle') {
          // abort로 인해 idle로 돌아온 경우 → 직접 생성 재시작
          clearInterval(checkInterval);
          this.playSegment(index, offset);
        }
      }, 100);
      return;
    }
    
    // Case 3: Idle / Needs generation
    this.setStatus('generating');
    segment.state = 'generating';
    this.emit('stateUpdate', this.segments);

    if (!this.generationAbortController) {
      this.generationAbortController = new AbortController();
    }
    const { signal } = this.generationAbortController;

    try {
      const result = await generateSpeech(segment.ttsText || segment.text, { ...this.apiConfig, signal });
      const audioBuffer = await this.decodeAudio(result.arrayBuffer);

      segment.audioBuffer = audioBuffer;
      segment.state = 'ready';
      this.releaseDistantAudioBuffers(index);
      this.emit('stateUpdate', this.segments);

      if (this.isPlaying && this.currentIndex === index) {
        this.playSegment(index, offset);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        segment.state = 'idle';
        this.emit('stateUpdate', this.segments);
        return;
      }
      segment.state = 'error';
      segment.errorMsg = err.message || 'API Call failed';
      this.emit('stateUpdate', this.segments);

      if (this.isPlaying && this.currentIndex === index) {
        this.isPlaying = false;
        this.setStatus('idle');
        showNotification(`음성 생성 실패: ${err.message}`, 'error', () => {
          segment.state = 'idle';
          segment.errorMsg = null;
          this.emit('stateUpdate', this.segments);
          this.play();
        });
      }
    }
  }

  /**
   * Triggers background prefetching of upcoming queue segments.
   */
  async prefetchNext() {
    for (let i = 1; i <= PREFETCH_SEGMENT_COUNT; i++) {
      const nextIndex = this.currentIndex + i;
      if (nextIndex >= this.segments.length) break;
      
      const segment = this.segments[nextIndex];
      if (segment.audioBuffer) {
        if (i === 1) this._tryPreSchedule(nextIndex, segment.audioBuffer);
        continue;
      }
      if (segment.state !== 'idle') continue;
      
      // Async background generation trigger
      segment.state = 'generating';
      this.emit('stateUpdate', this.segments);
      
      const signal = this.generationAbortController?.signal ?? null;
      const capturedVersion = this.queueVersion;
      (async () => {
        try {
          const result = await generateSpeech(segment.ttsText || segment.text, { ...this.apiConfig, signal });
          if (this.queueVersion !== capturedVersion) return;
          segment.audioBuffer = await this.decodeAudio(result.arrayBuffer);
          segment.state = 'ready';
          this.releaseDistantAudioBuffers(nextIndex);
          this._tryPreSchedule(nextIndex, segment.audioBuffer);
        } catch (err) {
          if (this.queueVersion !== capturedVersion) return;
          if (err.name === 'AbortError') {
            segment.state = 'idle';
          } else {
            console.error(`Prefetch failed for segment ${nextIndex}:`, err);
            segment.state = 'error';
            segment.errorMsg = err.message;
          }
        } finally {
          if (this.queueVersion === capturedVersion) {
            this.emit('stateUpdate', this.segments);
          }
        }
      })();
    }
  }

  _destroyStableMedia() {
    if (this.mediaAudio) {
      this.mediaAudio.pause();
      this.mediaAudio.removeAttribute('src');
      this.mediaAudio.load();
      this.mediaAudio = null;
    }
    if (this.mediaObjectUrl) {
      URL.revokeObjectURL(this.mediaObjectUrl);
      this.mediaObjectUrl = null;
    }
    this.mediaSegmentStarts = [];
    this.mediaDuration = 0;
    this.mediaActiveIndex = -1;
  }

  _getStableSegmentIndex(time) {
    for (let i = this.mediaSegmentStarts.length - 1; i >= 0; i--) {
      if (time + 0.03 >= this.mediaSegmentStarts[i]) return i;
    }
    return 0;
  }

  _getStableSegmentEnd(index) {
    return this.mediaSegmentStarts[index + 1] ?? this.mediaDuration;
  }

  _handleStableEnded() {
    if (!this.isPlaying) return;

    if (this.repeatMode === 'all') {
      this.currentIndex = 0;
      this.pausedAt = 0;
      this.mediaAudio.currentTime = 0;
      this.playStable();
    } else if (this.repeatMode === 'one') {
      this.mediaAudio.currentTime = this.mediaSegmentStarts[this.currentIndex] || 0;
      this.playStable();
    } else {
      this.stop();
    }
  }

  startStableProgressTracking() {
    this.stopProgressTracking();

    this.progressInterval = setInterval(() => {
      if (!this.isPlaying || !this.mediaAudio) {
        this.stopProgressTracking();
        return;
      }

      let current = Math.min(this.mediaAudio.currentTime || 0, this.mediaDuration || this.mediaAudio.duration || 1);
      const duration = this.mediaDuration || this.mediaAudio.duration || 1;

      if (this.repeatMode === 'one') {
        const start = this.mediaSegmentStarts[this.currentIndex] || 0;
        const end = this._getStableSegmentEnd(this.currentIndex);
        if (end > start && current >= end - 0.03) {
          this.mediaAudio.currentTime = start;
          current = start;
        }
      }

      const activeIndex = this._getStableSegmentIndex(current);
      if (activeIndex !== this.currentIndex && activeIndex >= 0 && activeIndex < this.segments.length) {
        this.currentIndex = activeIndex;
        this.pausedAt = 0;
        this.emit('segmentStart', activeIndex);
      }

      this.emit('progress', current, duration);
    }, 100);
  }

  /**
   * Set Status.
   */
  setStatus(newStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.emit('statusChange', newStatus);
    }
  }

  /**
   * Execute physical buffer playback.
   */
  _clearPreScheduled() {
    if (this.preScheduledSource) {
      this.preScheduledSource.onended = null;
      try { this.preScheduledSource.stop(); } catch {}
      this.preScheduledSource = null;
    }
    this.preScheduledIndex = -1;
  }

  _tryPreSchedule(index, audioBuffer) {
    if (!this.isPlaying || index !== this.currentIndex + 1) return;
    if (this.nextScheduledTime <= this.audioCtx.currentTime) return;
    if (this.preScheduledIndex === index) return;
    this._clearPreScheduled();

    const source = this.audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.setValueAtTime(this.playbackRate, this.audioCtx.currentTime);
    source.connect(this.gainNode);

    source.onended = () => this._handlePlaybackEnded(source);

    source.start(this.nextScheduledTime, 0);
    this.preScheduledSource = source;
    this.preScheduledIndex = index;
  }

  _activatePreScheduledCurrent() {
    if (this.preScheduledIndex !== this.currentIndex || !this.preScheduledSource) {
      return false;
    }

    const scheduledSource = this.preScheduledSource;
    const segment = this.segments[this.currentIndex];
    const scheduledStartAt = this.nextScheduledTime;

    this.currentSourceNode = scheduledSource;
    this.preScheduledSource = null;
    this.preScheduledIndex = -1;

    if (segment?.audioBuffer) {
      this.startTime = scheduledStartAt;
      this.nextScheduledTime = scheduledStartAt + (segment.audioBuffer.duration / this.playbackRate);
      this.startProgressTracking(segment.audioBuffer.duration);
    }

    this.prefetchNext();
    return true;
  }

  _handlePlaybackEnded(source) {
    if (this.currentSourceNode !== source) return;
    this.stopProgressTracking();
    this.currentSourceNode = null;

    if (!this.isPlaying) return;

    if (this.repeatMode === 'one') {
      this.pausedAt = 0;
      this.nextScheduledTime = 0;
      this._clearPreScheduled();
      this.playSegment(this.currentIndex);
    } else if (this.currentIndex < this.segments.length - 1) {
      this.currentIndex++;
      this.pausedAt = 0;
      this.emit('segmentStart', this.currentIndex);

      if (this._activatePreScheduledCurrent()) return;

      this._clearPreScheduled();
      const nextSeg = this.segments[this.currentIndex];
      if (nextSeg?.audioBuffer) {
        this.executePlayback(nextSeg.audioBuffer, 0);
      } else {
        this.nextScheduledTime = 0;
        this.playSegment(this.currentIndex);
      }
      this.prefetchNext();
    } else if (this.repeatMode === 'all') {
      this.currentIndex = 0;
      this.pausedAt = 0;
      this.nextScheduledTime = 0;
      this._clearPreScheduled();
      this.playSegment(0);
    } else {
      this._clearPreScheduled();
      this.stop();
    }
  }

  executePlayback(audioBuffer, offset = 0, scheduledStartAt = null) {
    this.setStatus('playing');

    const now = this.audioCtx.currentTime;
    const startAt = (scheduledStartAt !== null && scheduledStartAt > now)
      ? scheduledStartAt : now;

    const source = this.audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.setValueAtTime(this.playbackRate, now);
    source.connect(this.gainNode);
    this.currentSourceNode = source;

    this.startTime = startAt - (offset / this.playbackRate);
    const segDuration = (audioBuffer.duration - offset) / this.playbackRate;
    this.nextScheduledTime = startAt + segDuration;

    source.onended = () => this._handlePlaybackEnded(source);

    source.start(startAt, offset);
    this.startProgressTracking(audioBuffer.duration);
  }

  /**
   * Decode returned audio payload. Automatically handles fallback 
   * decodeAudioData vs raw PCM 16-bit decoding.
   */
  async decodeAudio(arrayBuffer) {
    this.initAudio();
    try {
      return await this.audioCtx.decodeAudioData(arrayBuffer.slice(0));
    } catch (err) {
      throw new Error('오디오 디코딩에 실패했습니다. 브라우저가 MP3 형식을 지원하는지 확인해주세요.');
    }
  }

  /**
   * Track current segment playback progress.
   */
  startProgressTracking(duration) {
    this.stopProgressTracking();
    
    this.progressInterval = setInterval(() => {
      if (!this.isPlaying || !this.currentSourceNode) {
        this.stopProgressTracking();
        return;
      }
      
      const elapsed = (this.audioCtx.currentTime - this.startTime) * this.playbackRate;
      this.emit('progress', elapsed, duration);
    }, 100);
  }

  /**
   * Stop tracking.
   */
  stopProgressTracking() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }
}

/**
 * ==========================================================================
 * AetherTTS - Main Application Controller Module
 * ==========================================================================
 */

// Global application state
const state = {
  isMarkdownMode: true,
  currentFile: null,
  segments: [],
  apiKey: '',
  voice: 'marin',
  styleHint: '',
  structHint: '',
  configSnapshot: { voice: 'marin', styleHint: '' },
  transformAbortController: null,
  parseRequestId: 0,
  isTransforming: false,
  rawHtml: '',
  lastRender: { html: '', segments: [] }
};

// Instantiate Playback Queue Manager
const queue = new QueueManager();

function flushAudioBuffers() {
  if (queue.segments.length > 0) {
    queue.stop();
    queue.segments.forEach(seg => {
      seg.audioBuffer = null;
      if (seg.state === 'ready' || seg.state === 'generating') seg.state = 'idle';
    });
    queue.emit('stateUpdate', queue.segments);
  }
  state.configSnapshot = { voice: state.voice, styleHint: state.styleHint };
}

// DOM Elements
const elements = {
  apiKeyInput: document.getElementById('api-key'),
  apiKeyWrapper: document.getElementById('api-key-wrapper'),
  btnSaveApiKey: document.getElementById('btn-save-api-key'),
  btnEditApiKey: document.getElementById('btn-edit-api-key'),
  btnDeleteApiKey: document.getElementById('btn-delete-api-key'),
  chkPersistKey: document.getElementById('chk-persist-key'),
  
  tabText: document.getElementById('tab-text'),
  tabMd: document.getElementById('tab-md'),
  contentTextInput: document.getElementById('content-text-input'),
  contentMdInput: document.getElementById('content-md-input'),
  
  textareaInput: document.getElementById('textarea-input'),
  charCounter: document.getElementById('char-counter'),
  btnGenerate: document.getElementById('btn-generate'),
  
  uploadZone: document.getElementById('upload-zone'),
  fileInput: document.getElementById('file-input'),
  fileInfoCard: document.getElementById('file-info-card'),
  fileName: document.getElementById('file-name'),
  fileSize: document.getElementById('file-size'),
  btnRemoveFile: document.getElementById('btn-remove-file'),
  btnGenerateMd: document.getElementById('btn-generate-md'),
  
  selectVoice: document.getElementById('select-voice'),
  chkAutoplay: document.getElementById('chk-autoplay'),
  chkStablePlayback: document.getElementById('chk-stable-playback'),
  presetChips: document.querySelectorAll('.chip[data-preset]'),
  btnClearCache: document.getElementById('btn-clear-cache'),
  cacheCountBadge: document.getElementById('cache-count-badge'),
  btnExportScript: document.getElementById('btn-export-script'),
  btnExportAudio: document.getElementById('btn-export-audio'),
  exportRow: document.getElementById('export-row'),
  
  visualizer: document.getElementById('visualizer-canvas'),
  statusBadge: document.getElementById('status-badge'),
  statusText: document.getElementById('status-text'),
  segmentCounter: document.getElementById('segment-counter'),
  previewPanel: document.querySelector('.preview-panel'),
  
  btnPrev: document.getElementById('btn-prev'),
  btnPlayPause: document.getElementById('btn-play-pause'),
  btnNext: document.getElementById('btn-next'),
  btnStop: document.getElementById('btn-stop'),
  btnRepeat: document.getElementById('btn-repeat'),
  volumeSlider: document.getElementById('volume-slider'),
  speedInput: document.getElementById('speed-input'),
  
  progressBar: document.getElementById('progress-bar'),
  timeElapsed: document.getElementById('time-elapsed'),
  timeTotal: document.getElementById('time-total'),
  
  previewTitle: document.getElementById('preview-title'),
  previewBody: document.getElementById('preview-body'),
  playlistContainer: document.getElementById('playlist-container'),
  btnSourceToggle: document.getElementById('btn-source-toggle'),
  btnToggleView: document.getElementById('btn-toggle-view')
};

let currentViewMode = 'preview'; // 'preview' | 'playlist'
let visualizerAnimationId = null;
let visualizerPhase = 0;

/**
 * Initialize AetherTTS Web Application.
 */
document.addEventListener('DOMContentLoaded', () => {
  setupApiKey();
  setupTabs();
  setupUploadZone();
  setupSettings();
  setupPlayerControls();
  setupQueueListeners();
  setupTextareaCounter();
  refreshCacheCount();
  updateRepeatButton();
  setupPullToRefresh();

  elements.btnSourceToggle.addEventListener('click', () => {
    if (currentViewMode === 'raw') {
      // 스마트 프리뷰로 복귀
      renderPreview(state.lastRender.html, state.lastRender.segments);
    } else {
      // 원문 보기
      if (state.rawHtml) showRawPreview(state.currentFile?.content ?? '');
    }
  });
  
  elements.btnClearCache.addEventListener('click', async () => {
    const btn = elements.btnClearCache;
    btn.disabled = true;
    const count = await clearTtsCache();
    if (count !== null) flushAudioBuffers();
    btn.disabled = false;
    if (count === null) {
      showNotification('캐시 초기화 중 오류가 발생했습니다.', 'error');
    } else if (count === 0) {
      showNotification('초기화할 캐시가 없습니다.', 'warning');
    } else {
      showNotification(`TTS 캐시 ${count}개 항목이 삭제되었습니다.`, 'success');
    }
    refreshCacheCount();
  });


  elements.btnExportScript.addEventListener('click', () => {
    if (!state.segments.length) {
      showNotification('내보낼 대본이 없습니다.', 'warning');
      return;
    }
    const text = state.segments.map((s, i) => `[${i + 1}] ${s.text}`).join('\n\n');
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => showNotification('대본이 클립보드에 복사되었습니다.', 'success'),
        () => fallbackCopyText(text)
      );
    } else {
      fallbackCopyText(text);
    }
  });

  elements.btnExportAudio.addEventListener('click', async () => {
    const btn = elements.btnExportAudio;
    const origHtml = btn.innerHTML;
    btn.disabled = true;
    const ok = await exportFullAudio((done, total) => {
      btn.textContent = `생성 중 ${done + 1}/${total}…`;
    }).catch(err => {
      showNotification(`MP3 내보내기 실패: ${err.message}`, 'error');
      return false;
    });
    btn.disabled = false;
    btn.innerHTML = origHtml;
    if (window.lucide) window.lucide.createIcons();
    if (ok) showNotification('MP3 내보내기가 완료되었습니다.', 'success');
  });

  // Start the beautiful canvas visualizer loop
  startVisualizer();
  
  // Render Lucide icons loaded in header
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

/* ==========================================================================
   API Key & Storage Settings
   ========================================================================== */

function setupApiKey() {
  // Prefer persistent (localStorage) key, fall back to session key
  const savedKey = localStorage.getItem('voxflow_openai_api_key') || sessionStorage.getItem('voxflow_openai_api_key');
  if (savedKey) {
    state.apiKey = savedKey;
    elements.apiKeyInput.value = savedKey;
    queue.setConfig({ apiKey: savedKey });
    elements.chkPersistKey.checked = Boolean(localStorage.getItem('voxflow_openai_api_key'));
    setApiKeyEditMode(false);
  } else {
    setApiKeyEditMode(true);
  }
  
  elements.btnSaveApiKey.addEventListener('click', saveApiKey);
  elements.btnEditApiKey.addEventListener('click', () => {
    setApiKeyEditMode(true);
    elements.apiKeyInput.focus();
    elements.apiKeyInput.select();
  });
  elements.btnDeleteApiKey.addEventListener('click', async () => {
    cancelTransform();
    queue.stop();
    flushAudioBuffers();
    localStorage.removeItem('voxflow_openai_api_key');
    sessionStorage.removeItem('voxflow_openai_api_key');
    state.apiKey = '';
    queue.setConfig({ apiKey: '' });
    elements.apiKeyInput.value = '';
    elements.chkPersistKey.checked = false;
    setApiKeyEditMode(true);
    await clearTtsCache();
    refreshCacheCount();
    showNotification('API Key와 TTS 캐시가 삭제되었습니다.', 'success');
  });

  elements.apiKeyInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveApiKey();
    }
  });

  elements.apiKeyInput.addEventListener('input', () => {
    if (!elements.apiKeyInput.value.trim()) {
      setApiKeySecurityState(false);
    }
  });
}

function saveApiKey() {
  const key = elements.apiKeyInput.value.trim();

  if (key) {
    const persist = elements.chkPersistKey.checked;
    if (persist) {
      localStorage.setItem('voxflow_openai_api_key', key);
      sessionStorage.removeItem('voxflow_openai_api_key');
    } else {
      sessionStorage.setItem('voxflow_openai_api_key', key);
      localStorage.removeItem('voxflow_openai_api_key');
    }
    state.apiKey = key;
    queue.setConfig({ apiKey: key });
    setApiKeySecurityState(true);
    setApiKeyEditMode(false);
  } else {
    localStorage.removeItem('voxflow_openai_api_key');
    sessionStorage.removeItem('voxflow_openai_api_key');
    state.apiKey = '';
    queue.setConfig({ apiKey: '' });
    setApiKeySecurityState(false);
    setApiKeyEditMode(true);
  }
}

function setApiKeySecurityState(isSecure) {
  if (isSecure) {
    elements.apiKeyWrapper.classList.add('secure');
  } else {
    elements.apiKeyWrapper.classList.remove('secure');
  }
}

function setApiKeyEditMode(isEditing) {
  elements.apiKeyInput.readOnly = !isEditing;
  elements.btnSaveApiKey.classList.toggle('hidden', !isEditing);
  elements.btnEditApiKey.classList.toggle('hidden', isEditing);
  elements.btnDeleteApiKey.classList.toggle('hidden', isEditing);
  setApiKeySecurityState(Boolean(state.apiKey) && !isEditing);
}

/* ==========================================================================
   Tabs Management (Direct Input vs. File Upload)
   ========================================================================== */

function setupTabs() {
  elements.tabText.addEventListener('click', () => {
    if (state.isMarkdownMode) {
      state.isMarkdownMode = false;
      elements.tabText.classList.add('active');
      elements.tabMd.classList.remove('active');
      elements.contentTextInput.classList.add('active');
      elements.contentMdInput.classList.remove('active');
      cancelTransform();
      state.segments = [];
      state.rawHtml = '';
      state.currentFile = null;
      state.lastRender = { html: '', segments: [] };
      currentViewMode = 'preview';
      queue.setSegments([]);
      renderPreview('', []);
    }
  });

  elements.tabMd.addEventListener('click', () => {
    if (!state.isMarkdownMode) {
      state.isMarkdownMode = true;
      elements.tabMd.classList.add('active');
      elements.tabText.classList.remove('active');
      elements.contentMdInput.classList.add('active');
      elements.contentTextInput.classList.remove('active');
      cancelTransform();
      state.segments = [];
      queue.setSegments([]);
      renderPreview('', []);
    }
  });
}

/* ==========================================================================
   Markdown File Upload & Processing
   ========================================================================== */

function setupUploadZone() {
  // Trigger file dialog
  elements.uploadZone.addEventListener('click', () => {
    elements.fileInput.click();
  });

  // Handle file selection
  elements.fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFileImport(file);
  });

  // Drag-and-Drop listeners
  ['dragenter', 'dragover'].forEach(eventName => {
    elements.uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      elements.uploadZone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    elements.uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      elements.uploadZone.classList.remove('dragover');
    }, false);
  });

  elements.uploadZone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file) handleFileImport(file);
  }, false);

  // Remove file action
  elements.btnRemoveFile.addEventListener('click', (e) => {
    e.stopPropagation(); // Avoid triggering upload click
    cancelTransform();
    state.currentFile = null;
    state.rawHtml = '';
    state.lastRender = { html: '', segments: [] };
    elements.fileInput.value = '';
    elements.fileInfoCard.classList.add('hidden');
    elements.uploadZone.classList.remove('hidden');
    elements.btnGenerateMd.classList.add('hidden');
    state.segments = [];
    queue.setSegments([]);
    renderPreview('', []);
  });

  elements.btnGenerateMd.addEventListener('click', async () => {
    if (state.isTransforming) {
      cancelTransform();
      state.segments = [];
      queue.setSegments([]);
      renderPreview('', []);
      return;
    }
    await triggerParsing();
  });
}

function handleFileImport(file) {
  // Verify extension
  const extension = file.name.split('.').pop().toLowerCase();
  if (extension !== 'md' && extension !== 'txt') {
    showNotification('오직 마크다운(.md) 또는 텍스트(.txt) 파일만 업로드할 수 있습니다.');
    return;
  }

  state.currentFile = file;
  
  // Show file info card
  elements.fileName.textContent = file.name;
  elements.fileSize.textContent = formatBytes(file.size);
  elements.fileInfoCard.classList.remove('hidden');
  elements.uploadZone.classList.add('hidden');
  
  // Parse contents
  const fileToken = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    if (state.currentFile !== fileToken) return;
    state.currentFile.content = e.target.result;
    elements.btnGenerateMd.classList.remove('hidden');
    showRawPreview(e.target.result);
    if (window.lucide) window.lucide.createIcons();
  };
  reader.onerror = () => {
    state.currentFile = null;
    elements.fileInfoCard.classList.add('hidden');
    elements.uploadZone.classList.remove('hidden');
    showNotification('파일을 읽는 중 오류가 발생했습니다.');
  };
  reader.readAsText(file);
}

function showRawPreview(content) {
  const html = window.marked
    ? sanitizeHtmlFragment(window.marked.parse(content))
    : `<pre style="white-space:pre-wrap;word-break:break-word;font-size:13px;">${content.replace(/</g, '&lt;')}</pre>`;
  state.rawHtml = html;
  currentViewMode = 'raw';
  elements.previewTitle.innerHTML = '<i data-lucide="file-text"></i> 원문 미리보기';
  elements.btnToggleView.classList.add('hidden');
  elements.previewBody.innerHTML = html;
  elements.previewBody.classList.remove('hidden');
  elements.playlistContainer.classList.add('hidden');
  // 스마트 프리뷰 결과가 있으면 토글 버튼 표시
  if (state.lastRender.segments.length > 0) {
    elements.btnSourceToggle.innerHTML = '<i data-lucide="sparkles" style="width:12px;height:12px;"></i> 스마트 프리뷰';
    elements.btnSourceToggle.classList.remove('hidden');
  } else {
    elements.btnSourceToggle.classList.add('hidden');
  }
  if (window.lucide) window.lucide.createIcons();
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/* ==========================================================================
   Textarea Characters Counting
   ========================================================================== */

function setupPullToRefresh() {
  const indicator = document.getElementById('ptr-indicator');
  if (!indicator || !('ontouchstart' in window)) return;

  const THRESHOLD = 72;
  const HEIGHT    = 56;
  let startY      = 0;
  let isPulling   = false;

  document.addEventListener('touchstart', (e) => {
    if (window.scrollY !== 0) return;
    startY    = e.touches[0].clientY;
    isPulling = true;
    indicator.style.transition = 'none';
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isPulling) return;
    const delta = e.touches[0].clientY - startY;
    if (delta <= 0) { isPulling = false; return; }
    const shown = Math.min(delta / THRESHOLD * HEIGHT, HEIGHT + 10);
    indicator.style.transform = `translateY(calc(-100% + ${shown}px))`;
    indicator.classList.toggle('ready', delta >= THRESHOLD);
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (!isPulling) return;
    isPulling = false;
    const delta = e.changedTouches[0].clientY - startY;
    indicator.style.transition = 'transform 0.25s ease';
    if (delta >= THRESHOLD) {
      indicator.style.transform = 'translateY(0)';
      indicator.classList.remove('ready');
      indicator.classList.add('refreshing');
      setTimeout(() => location.reload(), 600);
    } else {
      indicator.style.transform = 'translateY(-100%)';
      indicator.classList.remove('ready');
    }
  }, { passive: true });
}

function setupTextareaCounter() {
  elements.textareaInput.addEventListener('input', () => {
    const count = elements.textareaInput.value.length;
    elements.charCounter.textContent = `${count} 자`;
    if (state.segments.length > 0) {
      cancelTransform();
      state.segments = [];
      queue.setSegments([]);
      renderPreview('', []);
    }
  });

  elements.btnGenerate.addEventListener('click', async () => {
    if (state.isTransforming) {
      cancelTransform();
      state.segments = [];
      queue.setSegments([]);
      renderPreview('', []);
      return;
    }
    await triggerParsing();
  });
}

/* ==========================================================================
   System/Speech Settings Form
   ========================================================================== */

function setupSettings() {
  state.voice = elements.selectVoice.value;
  const savedStablePlayback = localStorage.getItem(STABLE_PLAYBACK_STORAGE_KEY);
  const stablePlaybackEnabled = savedStablePlayback === null ? true : savedStablePlayback === 'true';
  if (elements.chkStablePlayback) {
    elements.chkStablePlayback.checked = stablePlaybackEnabled;
    queue.setStablePlayback(stablePlaybackEnabled);
    elements.chkStablePlayback.addEventListener('change', () => {
      const enabled = elements.chkStablePlayback.checked;
      localStorage.setItem(STABLE_PLAYBACK_STORAGE_KEY, String(enabled));
      queue.setStablePlayback(enabled);
    });
  }

  const syncConfig = () => {
    state.voice = elements.selectVoice.value;
    queue.setConfig({ apiKey: state.apiKey, voice: state.voice, styleHint: state.styleHint });
  };

  elements.selectVoice.addEventListener('change', () => { syncConfig(); flushAudioBuffers(); });

  // Preset chips
  elements.presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.styleHint = STYLE_PRESETS[chip.dataset.preset] ?? '';
      state.structHint = STRUCT_STYLE_HINTS[chip.dataset.preset] ?? '';
      syncConfig();
      flushAudioBuffers();
    });
  });

  syncConfig();
}

/* ==========================================================================
   Interactive Parser and Playlist Generator
   ========================================================================== */

function cancelTransform() {
  state.parseRequestId++;
  if (state.transformAbortController) {
    state.transformAbortController.abort();
    state.transformAbortController = null;
  }
  if (state.isTransforming) {
    state.isTransforming = false;
    setTransformingUi(false);
  }
}

async function triggerParsing() {
  let sourceText = '';
  cancelTransform();
  queue.stop();
  const parseRequestId = ++state.parseRequestId;
  state.transformAbortController = new AbortController();

  if (state.isMarkdownMode) {
    if (state.currentFile && state.currentFile.content) {
      sourceText = state.currentFile.content;
    }
  } else {
    sourceText = elements.textareaInput.value.trim();
  }

  if (!sourceText) {
    state.transformAbortController = null;
    state.segments = [];
    queue.setSegments([]);
    renderPreview('', []);
    return false;
  }

  if (!state.apiKey) {
    state.transformAbortController = null;
    showNotification('OpenAI API Key를 먼저 저장해주세요.', 'warning');
    state.segments = [];
    queue.setSegments([]);
    renderPreview('', []);
    return false;
  }

  if (elements.chkAutoplay.checked) {
    queue.primeForAutoplay();
  }

  state.isTransforming = true;
  setTransformingUi(true);

  try {
    const transformedText = await transformTextForTtsStructure(sourceText, {
      apiKey: state.apiKey,
      signal: state.transformAbortController.signal,
      structHint: state.structHint
    });

    if (parseRequestId !== state.parseRequestId) return false;

    const parseResult = parseMarkdown(transformedText);
    state.segments = parseResult.segments;
    queue.setSegments(state.segments);
    state.configSnapshot = { voice: state.voice, styleHint: state.styleHint };
    renderPreview(parseResult.html, parseResult.segments);
    showNotification('GPT-5 Mini 구조 변환이 완료되었습니다.', 'success');
    if (elements.chkAutoplay.checked) {
      await queue.play();
    }
    return true;
  } catch (err) {
    if (err.name === 'AbortError') return false;
    if (parseRequestId !== state.parseRequestId) return false;
    console.error('Structure transform failed:', err);
    state.segments = [];
    queue.setSegments([]);
    renderPreview('', []);
    showNotification(err.message || '구조 변환에 실패했습니다. 다시 시도해주세요.', 'error');
    return false;
  } finally {
    if (parseRequestId === state.parseRequestId) {
      state.isTransforming = false;
      state.transformAbortController = null;
      setTransformingUi(false);
    }
  }
}


function setTransformingUi(isTransforming) {
  elements.btnPlayPause.disabled = isTransforming;
  elements.btnStop.disabled      = isTransforming;
  elements.btnNext.disabled      = isTransforming;
  elements.btnPrev.disabled      = isTransforming;
  elements.speedInput.disabled   = isTransforming;

  if (isTransforming) {
    elements.statusBadge.className = 'status-badge generating';
    elements.statusText.textContent = 'GPT-5 Mini 변환 중';

    // Update generate buttons if visible (text tab / md tab)
    elements.btnGenerate.disabled = false;
    elements.btnGenerate.classList.add('btn-cancel');
    elements.btnGenerate.innerHTML = '<i data-lucide="x-circle" style="width:14px;height:14px;"></i> 변환 취소';
    if (!elements.btnGenerateMd.classList.contains('hidden')) {
      elements.btnGenerateMd.disabled = false;
      elements.btnGenerateMd.classList.add('btn-cancel');
      elements.btnGenerateMd.innerHTML = '<i data-lucide="x-circle" style="width:14px;height:14px;"></i> 변환 취소';
    }
    if (window.lucide) window.lucide.createIcons();

    elements.previewTitle.innerHTML = '<i data-lucide="book-open"></i> 스마트 프리뷰어';
    elements.btnSourceToggle.classList.add('hidden');
    elements.btnToggleView.classList.add('hidden');
    elements.previewBody.classList.remove('hidden');
    elements.playlistContainer.classList.add('hidden');
    elements.previewBody.innerHTML = `
      <div class="transform-skeleton">
        <div class="skeleton-label"><span class="skeleton-dot"></span>GPT-5 Mini가 문서를 TTS 구조로 변환하는 중입니다…</div>
        <div class="skeleton-line w-90"></div>
        <div class="skeleton-line w-75"></div>
        <div class="skeleton-line w-85"></div>
        <div class="skeleton-line w-60"></div>
        <div class="skeleton-line w-90"></div>
        <div class="skeleton-line w-70"></div>
        <div class="skeleton-line w-80"></div>
      </div>`;
  } else {
    elements.statusBadge.className = `status-badge ${queue.status === 'idle' ? 'idle' : queue.status}`;
    elements.statusText.textContent = queue.status === 'idle' ? '대기 중' : elements.statusText.textContent;


    elements.btnGenerate.classList.remove('btn-cancel');
    elements.btnGenerate.disabled = false;
    elements.btnGenerate.innerHTML = '<i data-lucide="sparkles"></i> 텍스트 분석 및 플레이리스트 생성';
    elements.btnGenerateMd.classList.remove('btn-cancel');
    elements.btnGenerateMd.disabled = false;
    elements.btnGenerateMd.innerHTML = '<i data-lucide="sparkles"></i> 파일 분석 및 플레이리스트 생성';
    if (window.lucide) window.lucide.createIcons();
  }
  updateWakeLock();
}

function renderPreview(htmlContent, segments) {
  // Clear container
  elements.previewBody.innerHTML = '';
  elements.playlistContainer.innerHTML = '';
  
  if (segments.length === 0) {
    state.lastRender = { html: '', segments: [] };
    elements.previewBody.innerHTML = '<p class="text-muted text-center" style="grid-column: span 2; padding: 40px 0;">분석 및 렌더링된 데이터가 없습니다. 원고를 입력하거나 파일을 업로드하세요.</p>';
    elements.playlistContainer.innerHTML = '<p class="text-muted text-center" style="padding: 20px 0;">플레이리스트가 비어 있습니다.</p>';
    elements.segmentCounter.textContent = '청크 0 / 0';
    currentViewMode = 'preview';
    elements.previewBody.classList.remove('hidden');
    elements.playlistContainer.classList.add('hidden');
    elements.previewTitle.innerHTML = '<i data-lucide="book-open"></i> 스마트 프리뷰어';
    elements.btnToggleView.classList.add('hidden');
    elements.btnSourceToggle.classList.add('hidden');
    updateExportRowVisibility();
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  state.lastRender = { html: htmlContent, segments };
  updateExportRowVisibility();
  
  elements.segmentCounter.textContent = `청크 1 / ${segments.length}`;
  
  // Render Markdown / Plain HTML Preview
  elements.previewBody.innerHTML = htmlContent;
  
  // Render Playlist Chunks View
  segments.forEach((seg, index) => {
    const item = document.createElement('div');
    item.className = 'segment-item';
    item.id = `playlist-item-${seg.id}`;
    item.setAttribute('data-segment-id', seg.id);
    
    const statusIcon = document.createElement("div");
    statusIcon.className = "segment-status-icon";
    const indexNum = document.createElement("span");
    indexNum.className = "index-num";
    indexNum.textContent = String(index + 1);
    statusIcon.appendChild(indexNum);

    const segmentText = document.createElement("div");
    segmentText.className = "segment-text";
    segmentText.textContent = seg.text;

    const segmentActions = document.createElement("div");
    segmentActions.className = "segment-actions";
    const playButton = document.createElement("button");
    playButton.className = "btn btn-icon";
    playButton.style.width = "28px";
    playButton.style.height = "28px";
    playButton.innerHTML = '<i data-lucide="play" style="width:12px; height:12px;"></i>';
    segmentActions.appendChild(playButton);

    item.append(statusIcon, segmentText, segmentActions);
    
    // Add Click listener to jump and play
    item.addEventListener('click', () => {
      if (state.isTransforming) return;
      queue.jumpToSegment(index);
    });
    
    elements.playlistContainer.appendChild(item);
  });
  
  // Add Click listeners to all rendered GFM markdown preview elements!
  const previewBlocks = elements.previewBody.querySelectorAll('.preview-block');
  previewBlocks.forEach(block => {
    block.addEventListener('click', () => {
      if (state.isTransforming) return;
      const segId = parseInt(block.getAttribute('data-segment-id'), 10);
      const segmentIndex = segments.findIndex(s => s.id === segId);
      if (segmentIndex !== -1) {
        queue.jumpToSegment(segmentIndex);
      }
    });
  });
  
  // Toggle layout logic
  currentViewMode = 'preview';
  elements.previewTitle.innerHTML = '<i data-lucide="book-open"></i> 스마트 프리뷰어';
  elements.previewBody.classList.remove('hidden');
  elements.playlistContainer.classList.add('hidden');

  elements.btnToggleView.classList.remove('hidden');
  elements.btnToggleView.innerHTML = '<i data-lucide="list-music" style="width:12px;height:12px;"></i> Playlist Mode';
  elements.btnToggleView.onclick = () => {
    if (currentViewMode === 'preview') {
      currentViewMode = 'playlist';
      elements.previewBody.classList.add('hidden');
      elements.playlistContainer.classList.remove('hidden');
      elements.previewTitle.innerHTML = '<i data-lucide="list-music"></i> 플레이리스트 뷰';
      elements.btnToggleView.innerHTML = '<i data-lucide="book-open" style="width:12px;height:12px;"></i> Preview Mode';
    } else {
      currentViewMode = 'preview';
      elements.playlistContainer.classList.add('hidden');
      elements.previewBody.classList.remove('hidden');
      elements.previewTitle.innerHTML = '<i data-lucide="book-open"></i> 스마트 프리뷰어';
      elements.btnToggleView.innerHTML = '<i data-lucide="list-music" style="width:12px;height:12px;"></i> Playlist Mode';
    }
    if (window.lucide) window.lucide.createIcons();
  };

  // 원문이 있으면 원문 보기 토글 표시
  if (state.rawHtml) {
    elements.btnSourceToggle.innerHTML = '<i data-lucide="file-text" style="width:12px;height:12px;"></i> 원문 보기';
    elements.btnSourceToggle.classList.remove('hidden');
  } else {
    elements.btnSourceToggle.classList.add('hidden');
  }
  
  // Render Lucide icons inside playlist items
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/* ==========================================================================
   Audio Player Dashboard Controls binding
   ========================================================================== */

function setupPlayerControls() {
  elements.btnPlayPause.addEventListener('click', async () => {
    if (state.isTransforming) {
      showNotification('구조 변환이 완료된 후 재생할 수 있습니다.', 'warning');
      return;
    }

    if (state.segments.length === 0) {
      const parsed = await triggerParsing();
      if (!parsed) return;
    }
    
    if (state.segments.length === 0) {
      showNotification('음성으로 생성할 텍스트가 존재하지 않습니다.', 'warning');
      return;
    }
    
    if (queue.status === 'playing' || queue.status === 'buffering' || (queue.useStablePlayback && queue.status === 'generating')) {
      queue.pause();
    } else {
      // Flush stale buffers if voice/style changed since last play (e.g. typed style then clicked play)
      if (state.voice !== state.configSnapshot.voice || state.styleHint !== state.configSnapshot.styleHint) {
        flushAudioBuffers();
      }
      queue.play();
    }
  });

  elements.btnStop.addEventListener('click', () => {
    queue.stop();
  });

  elements.btnNext.addEventListener('click', () => {
    if (state.isTransforming) return;
    queue.next();
  });

  elements.btnPrev.addEventListener('click', () => {
    if (state.isTransforming) return;
    queue.prev();
  });

  elements.btnRepeat.addEventListener('click', () => {
    const next = { none: 'all', all: 'one', one: 'none' };
    queue.repeatMode = next[queue.repeatMode] ?? 'none';
    updateRepeatButton();
  });

  // Volume Slider adjustment
  elements.volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    queue.setVolume(val);
  });

  // Real-time speech rate adjustment
  elements.speedInput.addEventListener('change', (e) => {
    queue.setPlaybackRate(parseFloat(e.target.value));
  });
}

/* ==========================================================================
   Queue Manager Playback Listeners
   ========================================================================== */

function setupQueueListeners() {
  // Track queue statuses
  queue.addEventListener('statusChange', (status) => {
    elements.statusBadge.className = `status-badge ${status}`;

    if (status === 'playing') {
      elements.btnPlayPause.classList.add('playing');
      elements.btnPlayPause.innerHTML = '<i data-lucide="pause"></i>';
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    } else {
      elements.btnPlayPause.classList.remove('playing');
      elements.btnPlayPause.innerHTML = '<i data-lucide="play"></i>';
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = (status === 'paused') ? 'paused' : 'none';
      }
    }

    // WakeLock — 변환/생성/버퍼링/재생 중 화면 꺼짐 방지
    updateWakeLock();

    // Status text details
    let label = '대기';
    if (status === 'generating') label = '음성 생성 중...';
    if (status === 'buffering') label = '버퍼링 중...';
    if (status === 'playing') label = '재생 중';
    if (status === 'paused') label = '일시 정지';

    elements.statusText.textContent = label;
    if (window.lucide) window.lucide.createIcons();
  });

  // Highlight active segment
  queue.addEventListener('segmentStart', (index) => {
    elements.segmentCounter.textContent = `청크 ${index + 1} / ${state.segments.length}`;

    const seg = state.segments[index];

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: seg?.text?.slice(0, 60) || 'VoxFlow',
        artist: 'AI TTS',
        album: state.currentFile?.name || ''
      });
      navigator.mediaSession.playbackState = 'playing';
    }
    
    const segment = state.segments[index];
    
    // 1. Remove highlight of previous elements
    document.querySelectorAll('.preview-block, .segment-item').forEach(el => {
      el.classList.remove('active-speech', 'active', 'playing', 'generating');
    });
    
    // 2. Highlight element in Previewer — 활성 문장을 프리뷰어 상단으로 스크롤
    const activeEl = document.getElementById(`segment-${segment.id}`);
    if (activeEl && elements.previewPanel) {
      activeEl.classList.add('active-speech');
      if (!elements.previewBody.classList.contains('hidden')) {
        scrollActivePreviewBlock(activeEl);
      }
    }
    
    // 3. Highlight item in Playlist View
    const playlistItem = document.getElementById(`playlist-item-${segment.id}`);
    if (playlistItem) {
      playlistItem.classList.add('active');
      
      const icon = playlistItem.querySelector('.segment-status-icon');
      if (icon) {
        if (queue.status === 'generating') {
          playlistItem.classList.add('generating');
          icon.innerHTML = '<i data-lucide="loader-2" class="animate-spin" style="width:12px; height:12px;"></i>';
        } else {
          playlistItem.classList.add('playing');
          icon.innerHTML = '<i data-lucide="volume-2" style="width:12px; height:12px;"></i>';
        }
        if (window.lucide) window.lucide.createIcons();
      }
      
      playlistItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  // Keep segment metadata statuses updated in real time
  queue.addEventListener('stateUpdate', (updatedSegments) => {
    updatedSegments.forEach(seg => {
      const playlistItem = document.getElementById(`playlist-item-${seg.id}`);
      if (playlistItem) {
        const icon = playlistItem.querySelector('.segment-status-icon');
        
        if (seg.state === 'generating') {
          playlistItem.classList.add('generating');
          playlistItem.classList.remove('ready', 'error');
          if (icon) icon.innerHTML = '<i data-lucide="loader-2" class="animate-spin" style="width:12px; height:12px;"></i>';
        } else if (seg.state === 'ready') {
          playlistItem.classList.add('ready');
          playlistItem.classList.remove('generating', 'error');
          if (icon && !playlistItem.classList.contains('active')) {
            icon.innerHTML = `<span class="index-num">${seg.id + 1}</span>`;
          }
        } else if (seg.state === 'error') {
          playlistItem.classList.add('error');
          playlistItem.classList.remove('generating', 'ready');
          if (icon) icon.innerHTML = '<i data-lucide="alert-circle" style="color:var(--accent); width:12px; height:12px;"></i>';
        }
      }
    });
    
    if (window.lucide) window.lucide.createIcons();
  });

  // Track chunk's running time progress
  queue.addEventListener('progress', (elapsed, duration) => {
    // Math checks
    const percent = Math.min(100, (elapsed / duration) * 100);
    elements.progressBar.value = percent;
    
    elements.timeElapsed.textContent = formatTime(elapsed);
    elements.timeTotal.textContent = formatTime(duration);
  });
}

function formatTime(secs) {
  if (isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

let safeAreaTopProbe = null;

function getSafeAreaInsetTop() {
  if (!safeAreaTopProbe) {
    safeAreaTopProbe = document.createElement('div');
    safeAreaTopProbe.style.cssText = 'position:fixed;top:env(safe-area-inset-top, 0px);left:0;width:0;height:0;visibility:hidden;pointer-events:none;';
    document.body.appendChild(safeAreaTopProbe);
  }
  return parseFloat(getComputedStyle(safeAreaTopProbe).top) || 0;
}

function scrollActivePreviewBlock(activeEl) {
  const isMobileViewport = window.matchMedia('(max-width: 720px)').matches;
  if (isMobileViewport) {
    const safeTop = getSafeAreaInsetTop();
    const viewportTop = window.visualViewport?.offsetTop ?? 0;
    const topOffset = Math.max(24, viewportTop + safeTop + 14);
    const targetTop = activeEl.getBoundingClientRect().top + window.scrollY - topOffset;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
    return;
  }

  const panelRect = elements.previewPanel.getBoundingClientRect();
  const elRect = activeEl.getBoundingClientRect();
  const headerHeight = elements.previewPanel.querySelector('.preview-header-row')?.offsetHeight ?? 0;
  const padding = 12;
  const targetScrollTop = elements.previewPanel.scrollTop
    + (elRect.top - panelRect.top)
    - headerHeight - padding;
  elements.previewPanel.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
}

function showNotification(message, type = 'error', onRetry = null) {
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    container.style.cssText = 'position:fixed;top:calc(env(safe-area-inset-top, 0px) + 64px);right:max(env(safe-area-inset-right, 0px) + 16px, 20px);z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(container);
  }

  const styles = {
    error:   { bg: '#fef2f2', border: 'rgba(239,68,68,0.3)',   color: '#dc2626' },
    warning: { bg: '#fffbeb', border: 'rgba(245,158,11,0.3)',  color: '#d97706' },
    success: { bg: '#f0fdf4', border: 'rgba(34,197,94,0.3)',   color: '#16a34a' },
  };
  const s = styles[type] ?? styles.error;

  const toast = document.createElement('div');
  toast.style.cssText = `background:${s.bg};border:1px solid ${s.border};color:${s.color};padding:12px 16px;border-radius:8px;font-size:13px;max-width:320px;box-shadow:0 4px 12px rgba(0,0,0,0.12);pointer-events:auto;animation:fade-in 0.3s ease-out;`;

  const dismiss = () => {
    toast.style.transition = 'opacity 0.3s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  };

  if (type === 'error') {
    toast.style.paddingBottom = '10px';
    const body = document.createElement('div');
    body.textContent = message;
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'margin-top:10px;display:flex;justify-content:flex-end;gap:8px;';

    const mkBtn = (label, onClick) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.style.cssText = `background:transparent;border:1px solid ${s.border};color:${s.color};padding:3px 12px;border-radius:5px;font-size:12px;font-weight:600;cursor:pointer;`;
      b.addEventListener('click', onClick);
      return b;
    };

    if (onRetry) {
      btnRow.appendChild(mkBtn('닫기', dismiss));
      btnRow.appendChild(mkBtn('재시도', () => { dismiss(); onRetry(); }));
    } else {
      btnRow.appendChild(mkBtn('확인', dismiss));
    }

    toast.appendChild(body);
    toast.appendChild(btnRow);
  } else {
    toast.textContent = message;
    setTimeout(dismiss, 4000);
  }

  container.appendChild(toast);
}

function stopVisualizer() {
  if (visualizerAnimationId) {
    cancelAnimationFrame(visualizerAnimationId);
    visualizerAnimationId = null;
  }
}

function resizeVisualizerCanvas() {
  const canvas = elements.visualizer;
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight || 120;
}

/* ==========================================================================
   Highly Premium Flowing Curves Audio Visualizer
   ========================================================================== */

function startVisualizer() {
  if (visualizerAnimationId || document.hidden) {
    return;
  }

  const canvas = elements.visualizer;
  const ctx = canvas.getContext('2d');

  resizeVisualizerCanvas();
  
  function draw() {
    if (document.hidden) {
      visualizerAnimationId = null;
      return;
    }

    visualizerAnimationId = requestAnimationFrame(draw);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let amplitude = 0.1; // Default low idle vibration
    let frequency = 0.015;
    
    // If playing, read actual frequency data
    if (queue.analyserNode && (queue.status === 'playing' || queue.status === 'buffering')) {
      const bufferLength = queue.analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      queue.analyserNode.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      
      // Modulate parameters based on volume
      amplitude = 0.1 + (avg / 255) * 1.4; // Scaled height
      frequency = 0.01 + (avg / 255) * 0.02; // Scaled wave count
    }
    
    visualizerPhase += 0.04; // Wave speed
    
    // Draw 3 layered transparent sinewaves for organic look
    const waveCount = 3;
    const waveColors = [
      'rgba(139, 92, 246, 0.4)', // Purple
      'rgba(6, 182, 212, 0.3)',  // Cyan
      'rgba(236, 72, 153, 0.2)'  // Accent Pink
    ];
    
    for (let w = 0; w < waveCount; w++) {
      ctx.beginPath();
      ctx.lineWidth = w === 0 ? 3 : 1.5;
      ctx.strokeStyle = waveColors[w];
      
      const centerY = canvas.height / 2;
      const wavePhase = visualizerPhase + (w * Math.PI / 3);
      const waveAmplitude = (canvas.height / 3) * amplitude * (1 - w * 0.25);
      
      for (let x = 0; x < canvas.width; x++) {
        // Apply smooth fading multipliers at borders to ground the curves nicely
        const borderFading = Math.sin(Math.PI * x / canvas.width);
        
        const y = centerY + Math.sin(x * frequency + wavePhase) * waveAmplitude * borderFading;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
  }
  
  draw();
}

// ── Screen Wake Lock ──────────────────────────────────────────────────────────
let wakeLockSentinel = null;
let wakeLockDesired = false;
let wakeLockRequestInFlight = false;
let wakeFallbackVideo = null;
let wakeFallbackCanvas = null;
let wakeFallbackPaint = null;
let wakeFallbackTimer = null;
let silentWakeSource = null;
let silentWakeGain = null;

function shouldKeepScreenAwake() {
  return state.isTransforming || ['playing', 'generating', 'buffering'].includes(queue.status);
}

function ensureWakeFallbackVideo() {
  if (wakeFallbackVideo) return wakeFallbackVideo;
  if (!HTMLCanvasElement.prototype.captureStream) return null;

  const video = document.createElement('video');
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
  if ('disablePictureInPicture' in video) video.disablePictureInPicture = true;

  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 2;
  const ctx = canvas.getContext('2d');
  let toggle = false;
  const paint = () => {
    if (!ctx) return;
    toggle = !toggle;
    ctx.fillStyle = toggle ? '#000' : '#111';
    ctx.fillRect(0, 0, 2, 2);
  };
  paint();

  video.srcObject = canvas.captureStream(1);
  document.body.appendChild(video);
  wakeFallbackVideo = video;
  wakeFallbackCanvas = canvas;
  wakeFallbackPaint = paint;
  return wakeFallbackVideo;
}

function startSilentWakeAudio() {
  if (silentWakeSource) return;
  try {
    queue.initAudio();
    if (!queue.audioCtx) return;
    silentWakeGain = queue.audioCtx.createGain();
    silentWakeGain.gain.setValueAtTime(0.000001, queue.audioCtx.currentTime);
    silentWakeSource = queue.audioCtx.createOscillator();
    silentWakeSource.frequency.setValueAtTime(20, queue.audioCtx.currentTime);
    silentWakeSource.connect(silentWakeGain);
    silentWakeGain.connect(queue.audioCtx.destination);
    silentWakeSource.start();
  } catch {
    silentWakeSource = null;
    silentWakeGain = null;
  }
}

function stopSilentWakeAudio() {
  if (silentWakeSource) {
    try { silentWakeSource.stop(); } catch {}
    try { silentWakeSource.disconnect(); } catch {}
    silentWakeSource = null;
  }
  if (silentWakeGain) {
    try { silentWakeGain.disconnect(); } catch {}
    silentWakeGain = null;
  }
}

function startWakeFallback() {
  const video = ensureWakeFallbackVideo();
  if (wakeFallbackPaint && !wakeFallbackTimer) {
    wakeFallbackPaint();
    wakeFallbackTimer = setInterval(wakeFallbackPaint, 1000);
  }
  if (video && video.paused) {
    video.play().catch(() => {});
  }
  startSilentWakeAudio();
}

function stopWakeFallback() {
  if (wakeFallbackVideo && !wakeFallbackVideo.paused) {
    wakeFallbackVideo.pause();
  }
  if (wakeFallbackTimer) {
    clearInterval(wakeFallbackTimer);
    wakeFallbackTimer = null;
  }
  stopSilentWakeAudio();
}

async function acquireWakeLock() {
  wakeLockDesired = true;
  if (document.visibilityState !== 'visible') return;

  startWakeFallback();

  if (!('wakeLock' in navigator)) return;
  if (wakeLockSentinel && !wakeLockSentinel.released) return;
  if (wakeLockRequestInFlight) return;

  try {
    wakeLockRequestInFlight = true;
    wakeLockSentinel = await navigator.wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null;
      if (wakeLockDesired && document.visibilityState === 'visible') {
        setTimeout(acquireWakeLock, 250);
      }
    }, { once: true });
  } catch {
    // iOS standalone/PWA and low-power states can reject native Wake Lock.
    // The media fallback above still gives us the best browser-only chance.
  } finally {
    wakeLockRequestInFlight = false;
  }
}

function releaseWakeLock() {
  wakeLockDesired = false;
  stopWakeFallback();
  if (wakeLockSentinel && !wakeLockSentinel.released) {
    const sentinel = wakeLockSentinel;
    wakeLockSentinel = null;
    sentinel.release().catch(() => {});
  } else {
    wakeLockSentinel = null;
  }
}

function updateWakeLock() {
  if (shouldKeepScreenAwake()) {
    acquireWakeLock();
  } else {
    releaseWakeLock();
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopVisualizer();
  } else {
    // 화면 복귀 시 AudioContext 재개 (화면 잠금 후 복귀 대응)
    if (queue.audioCtx?.state === 'suspended') {
      queue.audioCtx.resume().catch(() => {});
    }
    // WakeLock은 화면 꺼짐 시 자동 해제되므로 활성 작업이 있으면 재취득
    updateWakeLock();
    if (!visualizerAnimationId) startVisualizer();
  }
});

// MediaSession API: 화면 꺼짐·잠금 상태에서도 오디오 계속 재생
if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: 'VoxFlow',
    artist: 'AI TTS',
    album: ''
  });

  navigator.mediaSession.setActionHandler('play',  () => queue.play());
  navigator.mediaSession.setActionHandler('pause', () => queue.pause());
  navigator.mediaSession.setActionHandler('nexttrack', () => queue.next());
  navigator.mediaSession.setActionHandler('previoustrack', () => queue.prev());
}

// AudioContext는 사용자 제스처 없이 suspended될 수 있음 — 재개 보장
document.addEventListener('click', () => {
  if (queue.audioCtx?.state === 'suspended') queue.audioCtx.resume().catch(() => {});
  if (wakeLockDesired && shouldKeepScreenAwake()) acquireWakeLock();
}, { once: false, passive: true });

window.addEventListener('pagehide', stopVisualizer);
window.addEventListener('resize', resizeVisualizerCanvas);
