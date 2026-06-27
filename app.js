'use strict';

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fallbackCopyText(
  text,
  baseName = 'voxflow-script',
  successMessage = '대본이 클립보드에 복사되었습니다.',
  downloadMessage = '클립보드 접근 불가 — 텍스트 파일로 저장했습니다.'
) {
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
    showNotification(successMessage, 'success');
  } else {
    const title = (baseName || 'voxflow-script').replace(/[^\w가-힣]/g, '_');
    downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), `${title}.txt`);
    showNotification(downloadMessage, 'success');
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
  elements.exportRow.classList.toggle('hidden', state.segments.length === 0 || state.isAudioFileMode);
}

/**
 * ==========================================================================
 * VoxFlow - Main Application Controller Module
 * ==========================================================================
 */

// Global application state
const state = {
  isMarkdownMode: true,
  isAudioFileMode: false,
  currentFile: null,
  segments: [],
  apiKey: '',
  voice: 'cedar',
  styleHint: '',
  structHint: '',
  passthroughTransform: true,
  configSnapshot: { voice: 'cedar', styleHint: '' },
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
      queue._revokeSegmentAudioUrl?.(seg);
      seg.audioBuffer = null;
      seg.audioArrayBuffer = null;
      seg.audioMimeType = null;
      if (seg.state === 'ready' || seg.state === 'generating') seg.state = 'idle';
    });
    queue.emit('stateUpdate', queue.segments);
  }
  state.configSnapshot = { voice: state.voice, styleHint: state.styleHint };
}

// DOM Elements
const elements = {
  apiKeyInput: document.getElementById('api-key'),
  btnToggleKeyVis: document.getElementById('btn-toggle-key-vis'),
  btnTheme: document.getElementById('btn-theme'),
  
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
  presetChips: document.querySelectorAll('.chip[data-preset]'),
  styleHintInput: document.getElementById('style-hint-input'),
  btnClearCache: document.getElementById('btn-clear-cache'),
  cacheCountBadge: document.getElementById('cache-count-badge'),
  btnExportScript: document.getElementById('btn-export-script'),
  btnExportAudio: document.getElementById('btn-export-audio'),
  exportRow: document.getElementById('export-row'),
  
  btnAudioImport: document.getElementById('btn-audio-import'),
  audioFileInput: document.getElementById('audio-file-input'),
  vizContainer: document.querySelector('.visualizer-container'),

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
  btnToggleView: document.getElementById('btn-toggle-view'),
  btnPreviewImport: document.getElementById('btn-preview-import'),
  previewFileInput: document.getElementById('preview-file-input')
};

let currentViewMode = 'preview'; // 'preview' | 'playlist'

/**
 * Initialize VoxFlow Web Application.
 */
document.addEventListener('DOMContentLoaded', () => {
  setupApiKey();
  setupTabs();
  setupUploadZone();
  setupPreviewerImport();
  setupAudioImport();
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
    const fallbackTitle = state.currentFile?.name?.replace(/\.[^.]+$/, '') || 'voxflow-script';
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => showNotification('대본이 클립보드에 복사되었습니다.', 'success'),
        () => fallbackCopyText(text, fallbackTitle)
      );
    } else {
      fallbackCopyText(text, fallbackTitle);
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
  const savedKey = localStorage.getItem('voxflow_openai_api_key');
  if (savedKey) {
    state.apiKey = savedKey;
    elements.apiKeyInput.value = savedKey;
    queue.setConfig({ apiKey: savedKey });
  }

  let saveTimer = null;
  elements.apiKeyInput.addEventListener('input', () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const key = elements.apiKeyInput.value.trim();
      if (key) {
        localStorage.setItem('voxflow_openai_api_key', key);
        state.apiKey = key;
        queue.setConfig({ apiKey: key });
      } else {
        localStorage.removeItem('voxflow_openai_api_key');
        state.apiKey = '';
        queue.setConfig({ apiKey: '' });
      }
    }, 400);
  });

  elements.btnToggleKeyVis.addEventListener('click', () => {
    const isPassword = elements.apiKeyInput.type === 'password';
    elements.apiKeyInput.type = isPassword ? 'text' : 'password';
    const icon = elements.btnToggleKeyVis.querySelector('i, svg');
    if (icon) {
      icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
      if (window.lucide) window.lucide.createIcons();
    }
  });

  elements.btnTheme.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('voxflow_theme', isDark ? 'dark' : 'light');
    const icon = elements.btnTheme.querySelector('i, svg');
    if (icon) {
      icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
      if (window.lucide) window.lucide.createIcons();
    }
  });

  if (localStorage.getItem('voxflow_theme') === 'dark') {
    document.body.classList.add('dark');
    const icon = elements.btnTheme.querySelector('i, svg');
    if (icon) icon.setAttribute('data-lucide', 'sun');
  }
}

/* ==========================================================================
   Tabs Management (Direct Input vs. File Upload)
   ========================================================================== */

function setupTabs() {
  syncGenerateButtonVisibility();

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
      elements.fileInput.value = '';
      elements.fileInfoCard.classList.add('hidden');
      elements.uploadZone.classList.remove('hidden');
      currentViewMode = 'preview';
      queue.setSegments([]);
      renderPreview('', []);
      syncGenerateButtonVisibility();
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
      syncGenerateButtonVisibility();
    }
  });
}

function syncGenerateButtonVisibility() {
  if (state.isTransforming) return;
  const hasMarkdownFile = Boolean(state.currentFile?.content);
  elements.btnGenerate.classList.toggle('hidden', state.isMarkdownMode);
  elements.btnGenerateMd.classList.toggle('hidden', !state.isMarkdownMode || !hasMarkdownFile);
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
    syncGenerateButtonVisibility();
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
    syncGenerateButtonVisibility();
    showRawPreview(e.target.result);
    if (window.lucide) window.lucide.createIcons();
  };
  reader.onerror = () => {
    state.currentFile = null;
    elements.fileInfoCard.classList.add('hidden');
    elements.uploadZone.classList.remove('hidden');
    syncGenerateButtonVisibility();
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
  const syncConfig = () => {
    state.voice = elements.selectVoice.value;
    queue.setConfig({ apiKey: state.apiKey, voice: state.voice, styleHint: state.styleHint });
  };

  const updateStyleHintInput = () => {
    const el = elements.styleHintInput;
    const isPassthrough = state.passthroughTransform;
    el.disabled = isPassthrough;
    el.value = isPassthrough ? '' : state.structHint;
    el.placeholder = isPassthrough
      ? '기본 모드: GPT 변환 없이 원문을 그대로 TTS 재생합니다'
      : 'GPT가 텍스트를 변환할 때 적용할 스타일 힌트를 직접 입력하세요.';
  };

  elements.selectVoice.addEventListener('change', () => { syncConfig(); flushAudioBuffers(); });

  // Preset chips
  elements.presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      elements.presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.styleHint = STYLE_PRESETS[chip.dataset.preset] ?? '';
      state.structHint = STRUCT_STYLE_HINTS[chip.dataset.preset] ?? '';
      state.passthroughTransform = PASSTHROUGH_PRESETS.has(chip.dataset.preset);
      updateStyleHintInput();
      syncConfig();
      flushAudioBuffers();
    });
  });

  // Style hint textarea — 사용자가 직접 편집 시 state.structHint 업데이트
  elements.styleHintInput.addEventListener('input', () => {
    if (!state.passthroughTransform) {
      state.structHint = elements.styleHintInput.value;
    }
  });

  updateStyleHintInput();
  syncConfig();
}

/* ==========================================================================
   Smart Previewer — Markdown Import & Auto-TTS
   ========================================================================== */

function setupPreviewerImport() {
  elements.btnPreviewImport.addEventListener('click', () => {
    elements.previewFileInput.value = '';
    elements.previewFileInput.click();
  });

  elements.previewFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handlePreviewImport(file);
  });

  const panel = elements.previewPanel;

  panel.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    panel.classList.add('drop-target');
  });

  panel.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    panel.classList.add('drop-target');
  });

  panel.addEventListener('dragleave', (e) => {
    if (!panel.contains(e.relatedTarget)) {
      panel.classList.remove('drop-target');
    }
  });

  panel.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    panel.classList.remove('drop-target');
    const file = e.dataTransfer.files[0];
    if (file) handlePreviewImport(file);
  });
}

/* ==========================================================================
   Audio Player — Direct MP3/Audio File Import
   ========================================================================== */

let audioImportRequestId = 0;

function setupAudioImport() {
  elements.btnAudioImport.addEventListener('click', () => {
    elements.audioFileInput.value = '';
    elements.audioFileInput.click();
  });

  elements.audioFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleAudioImport(file);
  });

  const viz = elements.vizContainer;
  if (!viz) return;

  viz.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    viz.classList.add('drop-target');
  });

  viz.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    viz.classList.add('drop-target');
  });

  viz.addEventListener('dragleave', (e) => {
    if (!viz.contains(e.relatedTarget)) viz.classList.remove('drop-target');
  });

  viz.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    viz.classList.remove('drop-target');
    const file = e.dataTransfer.files[0];
    if (file) handleAudioImport(file);
  });
}

async function handleAudioImport(file) {
  if (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|ogg|aac|flac)$/i.test(file.name)) {
    showNotification('지원하는 오디오 파일(.mp3, .wav, .m4a 등)을 선택해주세요.', 'warning');
    return;
  }

  const importRequestId = ++audioImportRequestId;
  cancelTransform();
  queue.stop();

  elements.btnPlayPause.disabled = true;
  elements.statusBadge.className = 'status-badge generating';
  elements.statusText.textContent = '오디오 로딩 중...';

  try {
    const arrayBuffer = await file.arrayBuffer();
    if (importRequestId !== audioImportRequestId) return;

    queue.initAudio();
    const audioBuffer = await queue.decodeAudio(arrayBuffer);
    if (importRequestId !== audioImportRequestId) return;

    state.isAudioFileMode = true;
    state.rawHtml = '';
    state.currentFile = null;
    state.lastRender = { html: '', segments: [] };

    // setSegments resets audioBuffer to null, so we patch it in after
    queue.setSegments([{ id: 0, text: file.name.replace(/\.[^.]+$/, ''), ttsText: '' }]);
    queue.segments[0].audioArrayBuffer = arrayBuffer;
    queue.segments[0].audioMimeType = file.type || 'audio/mpeg';
    queue.segments[0].audioBuffer = audioBuffer;
    queue.segments[0].state = 'ready';
    state.segments = queue.segments;

    renderAudioFilePreview(file);
    updateExportRowVisibility();
    elements.segmentCounter.textContent = '청크 1 / 1';
    elements.progressBar.value = 0;
    elements.timeElapsed.textContent = '0:00';
    elements.timeTotal.textContent = formatTime(audioBuffer.duration);
    elements.statusBadge.className = 'status-badge idle';
    elements.statusText.textContent = '재생 준비됨';
    elements.btnPlayPause.disabled = false;
  } catch (err) {
    if (importRequestId !== audioImportRequestId) return;
    console.error('Audio import failed:', err);
    showNotification(`오디오 파일 로딩 실패: ${err.message}`, 'error');
    elements.statusBadge.className = 'status-badge idle';
    elements.statusText.textContent = '대기 중';
    elements.btnPlayPause.disabled = false;
  }
}

function renderAudioFilePreview(file) {
  const ext = (file.name.split('.').pop() || 'AUDIO').toUpperCase();
  const baseName = file.name.replace(/\.[^.]+$/, '');

  elements.previewTitle.innerHTML = '<i data-lucide="music"></i> 오디오 파일 재생';
  elements.previewBody.innerHTML = `
    <div class="audio-file-card">
      <div class="audio-file-icon"><i data-lucide="music-2" style="width:24px;height:24px;"></i></div>
      <div class="audio-file-info">
        <div class="audio-file-name">${baseName}</div>
        <div class="audio-file-meta">${ext} &middot; ${formatBytes(file.size)}</div>
      </div>
    </div>`;
  elements.previewBody.classList.remove('hidden');
  elements.playlistContainer.classList.add('hidden');
  elements.btnToggleView.classList.add('hidden');
  elements.btnSourceToggle.classList.add('hidden');
  currentViewMode = 'preview';

  if (window.lucide) window.lucide.createIcons();
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.readAsText(file);
  });
}

async function handlePreviewImport(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  if (extension !== 'md' && extension !== 'txt') {
    showNotification('마크다운(.md) 또는 텍스트(.txt) 파일만 가져올 수 있습니다.', 'warning');
    return;
  }

  // 마크다운 모드로 전환
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

  state.currentFile = file;
  elements.fileName.textContent = file.name;
  elements.fileSize.textContent = formatBytes(file.size);
  elements.fileInfoCard.classList.remove('hidden');
  elements.uploadZone.classList.add('hidden');

  try {
    const content = await readFileAsText(file);
    if (state.currentFile !== file) return;
    state.currentFile.content = content;
    syncGenerateButtonVisibility();
    showRawPreview(content);
    if (window.lucide) window.lucide.createIcons();

    await triggerDirectTts({ autoplay: elements.chkAutoplay.checked });
  } catch {
    state.currentFile = null;
    elements.fileInfoCard.classList.add('hidden');
    elements.uploadZone.classList.remove('hidden');
    syncGenerateButtonVisibility();
    showNotification('파일을 읽는 중 오류가 발생했습니다.', 'error');
  }
}

async function triggerDirectTts({ autoplay = true } = {}) {
  if (!state.apiKey) {
    showNotification('OpenAI API Key를 먼저 입력해주세요.', 'warning');
    return false;
  }
  const sourceText = state.currentFile?.content;
  if (!sourceText) return false;

  cancelTransform();
  queue.stop();

  if (autoplay) queue.primeForAutoplay();

  try {
    const parseResult = parseMarkdown(sourceText);
    state.segments = parseResult.segments;
    queue.setSegments(state.segments);
    state.configSnapshot = { voice: state.voice, styleHint: state.styleHint };
    renderPreview(parseResult.html, parseResult.segments);
    if (autoplay) await queue.play();
    return true;
  } catch (err) {
    console.error('Direct TTS parse failed:', err);
    state.segments = [];
    queue.setSegments([]);
    renderPreview('', []);
    showNotification(err.message || '세그먼트 생성에 실패했습니다.', 'error');
    return false;
  } finally {
    state.isTransforming = false;
    state.transformAbortController = null;
    setTransformingUi(false);
  }
}

/* ==========================================================================
   Interactive Parser and Playlist Generator
   ========================================================================== */

function cancelTransform() {
  state.isAudioFileMode = false;
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

async function triggerParsing(options = {}) {
  const {
    autoplay = elements.chkAutoplay.checked,
    primeAudioFocus = autoplay
  } = options;
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

  if (primeAudioFocus) {
    queue.primeForAutoplay();
  }

  state.isTransforming = true;
  setTransformingUi(true);

  try {
    let transformedText;
    if (state.passthroughTransform) {
      transformedText = sourceText;
    } else {
      transformedText = await transformTextForTtsStructure(sourceText, {
        apiKey: state.apiKey,
        signal: state.transformAbortController.signal,
        structHint: state.structHint
      });
    }

    if (parseRequestId !== state.parseRequestId) return false;

    const parseResult = parseMarkdown(transformedText);
    state.segments = parseResult.segments;
    queue.setSegments(state.segments);
    state.configSnapshot = { voice: state.voice, styleHint: state.styleHint };
    renderPreview(parseResult.html, parseResult.segments);
    showNotification(
      state.passthroughTransform ? '원문 그대로 TTS 준비가 완료되었습니다.' : 'GPT-5 Mini 구조 변환이 완료되었습니다.',
      'success'
    );
    if (autoplay) {
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
    syncGenerateButtonVisibility();
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
      const parsed = await triggerParsing({ autoplay: false, primeAudioFocus: true });
      if (!parsed) return;
    }
    
    if (state.segments.length === 0) {
      showNotification('음성으로 생성할 텍스트가 존재하지 않습니다.', 'warning');
      return;
    }
    
    if (queue.status === 'playing' || queue.status === 'buffering') {
      queue.pause();
    } else {
      // Flush stale buffers if voice/style changed since last play (e.g. typed style then clicked play)
      if (state.voice !== state.configSnapshot.voice || state.styleHint !== state.configSnapshot.styleHint) {
        flushAudioBuffers();
      }
      await queue.primeForAutoplay();
      await queue.play();
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
        navigator.mediaSession.playbackState = queue.hasActiveAudioFocus()
          ? 'playing'
          : ((status === 'paused') ? 'paused' : 'none');
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
    updatedSegments.forEach((seg, index) => {
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
            icon.innerHTML = `<span class="index-num">${index + 1}</span>`;
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

function getSafeAreaInsetTop() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:env(safe-area-inset-top, 0px);left:0;width:0;height:0;visibility:hidden;pointer-events:none;';
  document.body.appendChild(probe);
  const inset = parseFloat(getComputedStyle(probe).top) || 0;
  probe.remove();
  return inset;
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

function getNotificationContainer() {
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
  return container;
}

function showNotification(message, type = 'error', optionsOrRetry = null) {
  const options = typeof optionsOrRetry === 'function'
    ? { onRetry: optionsOrRetry }
    : (optionsOrRetry || {});
  const {
    onRetry = null,
    duration = 4000,
    countdownSeconds = 0,
    countdownLabel = '',
    signal = null
  } = options;
  const container = getNotificationContainer();
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
  } else if (countdownSeconds > 0) {
    toast.textContent = message;
  } else {
    toast.textContent = message;
    setTimeout(dismiss, duration);
  }

  container.appendChild(toast);
  if (countdownSeconds > 0) {
    return (async () => {
      try {
        for (let remaining = countdownSeconds; remaining > 0; remaining--) {
          if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
          toast.textContent = `${countdownLabel || message} — ${remaining}초 후 재시도`;
          await sleep(1000, signal);
        }
      } finally {
        dismiss();
      }
    })();
  }
  return Promise.resolve();
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
  if (wakeFallbackVideo) {
    const stream = wakeFallbackVideo.srcObject;
    if (stream && typeof stream.getTracks === 'function') {
      stream.getTracks().forEach(track => track.stop());
    }
    wakeFallbackVideo.removeAttribute('src');
    wakeFallbackVideo.srcObject = null;
    wakeFallbackVideo.remove();
    wakeFallbackVideo = null;
  }
  wakeFallbackCanvas = null;
  wakeFallbackPaint = null;
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
    if (queue.audioCtx?.state === 'suspended') {
      queue.audioCtx.resume().catch(() => {});
    }
    // WakeLock은 화면 꺼짐 시 자동 해제되므로 활성 작업이 있으면 재취득
    updateWakeLock();
    if (!isVisualizerRunning()) startVisualizer();
  }
});

// MediaSession API: 화면 꺼짐·잠금 상태에서도 오디오 계속 재생
if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: 'VoxFlow',
    artist: 'AI TTS',
    album: ''
  });

  navigator.mediaSession.setActionHandler('play', async () => {
    await queue.primeForAutoplay();
    await queue.play();
  });
  navigator.mediaSession.setActionHandler('pause', () => queue.pause());
  navigator.mediaSession.setActionHandler('nexttrack', () => queue.next());
  navigator.mediaSession.setActionHandler('previoustrack', () => queue.prev());
}

// AudioContext는 사용자 제스처 없이 suspended될 수 있음 — 재개 보장
document.addEventListener('click', () => {
  if (queue.audioCtx?.state === 'suspended') queue.audioCtx.resume().catch(() => {});
  if (wakeLockDesired && shouldKeepScreenAwake()) acquireWakeLock();
}, { once: false, passive: true });

window.addEventListener('pagehide', () => {
  stopVisualizer();
  stopWakeFallback();
  queue.releaseAudioSession();
});
window.addEventListener('resize', resizeVisualizerCanvas);
