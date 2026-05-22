/**
 * ==========================================================================
 * AetherTTS - Main Application Controller Module
 * ==========================================================================
 */

import { parseMarkdown, parsePlainInput } from './chunker.js';
import { QueueManager } from './player.js';

// Global application state
const state = {
  isMarkdownMode: true,
  currentFile: null,
  segments: [],
  apiKey: '',
  model: 'gemini-2.0-flash',
  voice: 'Kore',
  styleHint: ''
};

// Instantiate Playback Queue Manager
const queue = new QueueManager();

// DOM Elements
const elements = {
  apiKeyInput: document.getElementById('api-key'),
  apiKeyWrapper: document.getElementById('api-key-wrapper'),
  
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
  
  selectModel: document.getElementById('select-model'),
  inputCustomModel: document.getElementById('input-custom-model'),
  selectVoice: document.getElementById('select-voice'),
  inputStyleHint: document.getElementById('input-style-hint'),
  
  visualizer: document.getElementById('visualizer-canvas'),
  statusBadge: document.getElementById('status-badge'),
  statusText: document.getElementById('status-text'),
  segmentCounter: document.getElementById('segment-counter'),
  
  btnPrev: document.getElementById('btn-prev'),
  btnPlayPause: document.getElementById('btn-play-pause'),
  btnNext: document.getElementById('btn-next'),
  btnStop: document.getElementById('btn-stop'),
  volumeSlider: document.getElementById('volume-slider'),
  speedInput: document.getElementById('speed-input'),
  
  progressBar: document.getElementById('progress-bar'),
  timeElapsed: document.getElementById('time-elapsed'),
  timeTotal: document.getElementById('time-total'),
  
  previewTitle: document.getElementById('preview-title'),
  previewBody: document.getElementById('preview-body'),
  playlistContainer: document.getElementById('playlist-container'),
  btnToggleView: document.getElementById('btn-toggle-view')
};

let currentViewMode = 'preview'; // 'preview' | 'playlist'
let visualizerAnimationId = null;

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
  // Load saved API key from localStorage
  const savedKey = localStorage.getItem('aether_tts_api_key');
  if (savedKey) {
    state.apiKey = savedKey;
    elements.apiKeyInput.value = savedKey;
    setApiKeySecurityState(true);
  }
  
  // Handle key changes
  elements.apiKeyInput.addEventListener('input', (e) => {
    const key = e.target.value.trim();
    state.apiKey = key;
    
    if (key) {
      localStorage.setItem('aether_tts_api_key', key);
      setApiKeySecurityState(true);
    } else {
      localStorage.removeItem('aether_tts_api_key');
      setApiKeySecurityState(false);
    }
    
    // Sync to queue manager
    queue.setConfig({ apiKey: key });
  });
}

function setApiKeySecurityState(isSecure) {
  if (isSecure) {
    elements.apiKeyWrapper.classList.add('secure');
  } else {
    elements.apiKeyWrapper.classList.remove('secure');
  }
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
      
      // Auto generate playlist if text is present
      triggerParsing();
    }
  });

  elements.tabMd.addEventListener('click', () => {
    if (!state.isMarkdownMode) {
      state.isMarkdownMode = true;
      elements.tabMd.classList.add('active');
      elements.tabText.classList.remove('active');
      elements.contentMdInput.classList.add('active');
      elements.contentTextInput.classList.remove('active');
      
      // Auto generate playlist if file is parsed
      triggerParsing();
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
    state.currentFile = null;
    elements.fileInput.value = '';
    elements.fileInfoCard.classList.add('hidden');
    elements.uploadZone.classList.remove('hidden');
    
    // Clear preview
    state.segments = [];
    queue.setSegments([]);
    renderPreview('', []);
  });
}

function handleFileImport(file) {
  // Verify extension
  const extension = file.name.split('.').pop().toLowerCase();
  if (extension !== 'md' && extension !== 'txt') {
    alert('오직 마크다운(.md) 또는 텍스트(.txt) 파일만 업로드할 수 있습니다.');
    return;
  }

  state.currentFile = file;
  
  // Show file info card
  elements.fileName.textContent = file.name;
  elements.fileSize.textContent = formatBytes(file.size);
  elements.fileInfoCard.classList.remove('hidden');
  elements.uploadZone.classList.add('hidden');
  
  // Parse contents
  const reader = new FileReader();
  reader.onload = (e) => {
    state.currentFile.content = e.target.result;
    triggerParsing();
  };
  reader.readAsText(file);
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

function setupTextareaCounter() {
  elements.textareaInput.addEventListener('input', () => {
    const count = elements.textareaInput.value.length;
    elements.charCounter.textContent = `${count} 자`;
  });

  elements.btnGenerate.addEventListener('click', () => {
    triggerParsing();
  });
}

/* ==========================================================================
   System/Speech Settings Form
   ========================================================================== */

function setupSettings() {
  // Sync initial configuration values
  state.model = elements.selectModel.value;
  state.voice = elements.selectVoice.value;
  state.styleHint = elements.inputStyleHint.value;

  // Key sync helper
  const syncConfig = () => {
    let activeModel = elements.selectModel.value;
    if (activeModel === 'custom') {
      elements.inputCustomModel.classList.remove('hidden');
      activeModel = elements.inputCustomModel.value.trim() || 'gemini-2.0-flash';
    } else {
      elements.inputCustomModel.classList.add('hidden');
    }
    
    state.model = activeModel;
    state.voice = elements.selectVoice.value;
    state.styleHint = elements.inputStyleHint.value.trim();

    queue.setConfig({
      apiKey: state.apiKey,
      model: state.model,
      voice: state.voice,
      styleHint: state.styleHint
    });
  };

  elements.selectModel.addEventListener('change', syncConfig);
  elements.inputCustomModel.addEventListener('input', syncConfig);
  elements.selectVoice.addEventListener('change', syncConfig);
  elements.inputStyleHint.addEventListener('input', syncConfig);

  // Trigger sync on loaded
  syncConfig();
}

/* ==========================================================================
   Interactive Parser and Playlist Generator
   ========================================================================== */

function triggerParsing() {
  let parseResult = { html: '', segments: [] };
  
  if (state.isMarkdownMode) {
    if (state.currentFile && state.currentFile.content) {
      parseResult = parseMarkdown(state.currentFile.content);
    }
  } else {
    const textVal = elements.textareaInput.value.trim();
    if (textVal) {
      parseResult = parsePlainInput(textVal);
    }
  }
  
  state.segments = parseResult.segments;
  queue.setSegments(state.segments);
  renderPreview(parseResult.html, parseResult.segments);
}

function renderPreview(htmlContent, segments) {
  // Clear container
  elements.previewBody.innerHTML = '';
  elements.playlistContainer.innerHTML = '';
  
  if (segments.length === 0) {
    elements.previewBody.innerHTML = '<p class="text-muted text-center" style="grid-column: span 2; padding: 40px 0;">분석 및 렌더링된 데이터가 없습니다. 원고를 입력하거나 파일을 업로드하세요.</p>';
    elements.playlistContainer.innerHTML = '<p class="text-muted text-center" style="padding: 20px 0;">플레이리스트가 비어 있습니다.</p>';
    elements.segmentCounter.textContent = '청크 0 / 0';
    return;
  }
  
  elements.segmentCounter.textContent = `청크 1 / ${segments.length}`;
  
  // Render Markdown / Plain HTML Preview
  elements.previewBody.innerHTML = htmlContent;
  
  // Render Playlist Chunks View
  segments.forEach((seg, index) => {
    const item = document.createElement('div');
    item.className = 'segment-item';
    item.id = `playlist-item-${seg.id}`;
    item.setAttribute('data-segment-id', seg.id);
    
    // Set structure
    item.innerHTML = `
      <div class="segment-status-icon">
        <span class="index-num">${index + 1}</span>
      </div>
      <div class="segment-text">${seg.text}</div>
      <div class="segment-actions">
        <button class="btn btn-icon" style="width:28px; height:28px;"><i data-lucide="play" style="width:12px; height:12px;"></i></button>
      </div>
    `;
    
    // Add Click listener to jump and play
    item.addEventListener('click', () => {
      queue.jumpToSegment(index);
    });
    
    elements.playlistContainer.appendChild(item);
  });
  
  // Add Click listeners to all rendered GFM markdown preview elements!
  const previewBlocks = elements.previewBody.querySelectorAll('.preview-block');
  previewBlocks.forEach(block => {
    block.addEventListener('click', () => {
      const segId = parseInt(block.getAttribute('data-segment-id'), 10);
      const segmentIndex = segments.findIndex(s => s.id === segId);
      if (segmentIndex !== -1) {
        queue.jumpToSegment(segmentIndex);
      }
    });
  });
  
  // Toggle layout logic
  elements.btnToggleView.classList.remove('hidden');
  elements.btnToggleView.onclick = () => {
    if (currentViewMode === 'preview') {
      currentViewMode = 'playlist';
      elements.previewBody.classList.add('hidden');
      elements.playlistContainer.classList.remove('hidden');
      elements.previewTitle.innerHTML = '<i data-lucide="list-music"></i> 플레이리스트 뷰';
      elements.btnToggleView.innerHTML = '<i data-lucide="book-open"></i> Preview Mode';
    } else {
      currentViewMode = 'preview';
      elements.playlistContainer.classList.add('hidden');
      elements.previewBody.classList.remove('hidden');
      elements.previewTitle.innerHTML = '<i data-lucide="book-open"></i> 스마트 프리뷰어';
      elements.btnToggleView.innerHTML = '<i data-lucide="list-music"></i> Playlist Mode';
    }
    if (window.lucide) window.lucide.createIcons();
  };
  
  // Render Lucide icons inside playlist items
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/* ==========================================================================
   Audio Player Dashboard Controls binding
   ========================================================================== */

function setupPlayerControls() {
  elements.btnPlayPause.addEventListener('click', () => {
    if (state.segments.length === 0) {
      triggerParsing();
    }
    
    if (state.segments.length === 0) {
      alert('음성으로 생성할 텍스트가 존재하지 않습니다.');
      return;
    }
    
    if (queue.status === 'playing' || queue.status === 'buffering') {
      queue.pause();
    } else {
      queue.play();
    }
  });

  elements.btnStop.addEventListener('click', () => {
    queue.stop();
  });

  elements.btnNext.addEventListener('click', () => {
    queue.next();
  });

  elements.btnPrev.addEventListener('click', () => {
    queue.prev();
  });

  // Volume Slider adjustment
  elements.volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    queue.setVolume(val);
  });

  // Real-time speech rate adjustment
  elements.speedInput.addEventListener('change', (e) => {
    let rate = parseFloat(e.target.value);
    if (isNaN(rate) || rate < 0.5) rate = 0.5;
    if (rate > 2.0) rate = 2.0;
    e.target.value = rate.toFixed(1);
    queue.setPlaybackRate(rate);
  });
}

/* ==========================================================================
   Queue Manager Playback Listeners
   ========================================================================== */

function setupQueueListeners() {
  // Track queue statuses
  queue.addEventListener('statusChange', (status) => {
    elements.statusBadge.className = `status-badge ${status}`;
    
    // Stop pulse animations if not playing
    if (status === 'playing') {
      elements.btnPlayPause.classList.add('playing');
      elements.btnPlayPause.innerHTML = '<i data-lucide="pause"></i>';
    } else {
      elements.btnPlayPause.classList.remove('playing');
      elements.btnPlayPause.innerHTML = '<i data-lucide="play"></i>';
    }
    
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
    
    const segment = state.segments[index];
    
    // 1. Remove highlight of previous elements
    document.querySelectorAll('.preview-block, .segment-item').forEach(el => {
      el.classList.remove('active-speech', 'active', 'playing', 'generating');
    });
    
    // 2. Highlight element in Previewer
    const activeEl = document.getElementById(`segment-${segment.id}`);
    if (activeEl) {
      activeEl.classList.add('active-speech');
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

/* ==========================================================================
   Highly Premium Flowing Curves Audio Visualizer
   ========================================================================== */

function startVisualizer() {
  const canvas = elements.visualizer;
  const ctx = canvas.getContext('2d');
  
  // Set accurate drawing dims
  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight || 120;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  let phase = 0;
  
  function draw() {
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
    
    phase += 0.04; // Wave speed
    
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
      const wavePhase = phase + (w * Math.PI / 3);
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
