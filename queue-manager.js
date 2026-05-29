'use strict';

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

function createWavBlobFromAudioBuffers(audioBuffers, gapSeconds = INTER_CHUNK_PAUSE_SECONDS) {
  if (!audioBuffers.length) {
    throw new Error('연속 재생용 오디오가 없습니다.');
  }

  const sampleRate = audioBuffers[0].sampleRate;
  const numberOfChannels = Math.max(...audioBuffers.map(buffer => buffer.numberOfChannels || 1));
  const bytesPerSample = 2;

  // Compute silence-trimmed bounds for each buffer to remove MP3 encoder/decoder padding.
  const bounds = audioBuffers.map(buf => getAudioBounds(buf));
  const trimmedLengths = bounds.map((b, i) => b.end - b.start);
  const gapFrames = Math.max(0, Math.round(sampleRate * gapSeconds));

  const segmentStarts = [];
  const totalFrames = trimmedLengths.reduce((sum, len, index) => {
    segmentStarts.push(sum / sampleRate);
    return sum + len + (index < trimmedLengths.length - 1 ? gapFrames : 0);
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

    if (b < audioBuffers.length - 1) {
      writeOffset += gapFrames * numberOfChannels * bytesPerSample;
    }
  }

  return {
    blob: new Blob([wavBuffer], { type: 'audio/wav' }),
    segmentStarts,
    duration: totalFrames / sampleRate
  };
}

function createMp3BlobFromAudioBuffers(mp3Buffers, audioBuffers) {
  if (!mp3Buffers.length || mp3Buffers.length !== audioBuffers.length) {
    throw new Error('연속 재생용 MP3 오디오가 없습니다.');
  }

  const segmentStarts = [];
  let duration = 0;
  let totalBytes = 0;

  for (let i = 0; i < mp3Buffers.length; i++) {
    segmentStarts.push(duration);
    duration += audioBuffers[i]?.duration || 0;
    totalBytes += mp3Buffers[i].byteLength || 0;
  }

  const merged = new Uint8Array(totalBytes);
  let offset = 0;
  for (const buffer of mp3Buffers) {
    const bytes = new Uint8Array(buffer);
    merged.set(bytes, offset);
    offset += bytes.byteLength;
  }

  return {
    blob: new Blob([merged], { type: 'audio/mpeg' }),
    segmentStarts,
    duration,
    bytes: totalBytes,
    format: 'mp3'
  };
}

const STABLE_PLAYBACK_LEAD_IN_SECONDS = 1.4;
const STABLE_SAFE_WAV_MAX_BYTES = 128 * 1024 * 1024;

function createCarSafeWavBlobFromAudioBuffers(
  audioBuffers,
  gapSeconds = INTER_CHUNK_PAUSE_SECONDS,
  leadInSeconds = STABLE_PLAYBACK_LEAD_IN_SECONDS
) {
  if (!audioBuffers.length) {
    throw new Error('차량 안전 재생용 오디오가 없습니다.');
  }

  const sampleRate = audioBuffers[0].sampleRate;
  const numberOfChannels = Math.max(...audioBuffers.map(buffer => buffer.numberOfChannels || 1));
  const bytesPerSample = 2;
  const leadInFrames = Math.max(0, Math.round(sampleRate * leadInSeconds));
  const gapFrames = Math.max(0, Math.round(sampleRate * gapSeconds));
  const segmentStarts = [];

  let cursorFrames = leadInFrames;
  for (let i = 0; i < audioBuffers.length; i++) {
    // Treat the warm-up as part of the first segment so initial playback starts at 0.
    segmentStarts.push(i === 0 ? 0 : cursorFrames / sampleRate);
    cursorFrames += audioBuffers[i].length;
    if (i < audioBuffers.length - 1) cursorFrames += gapFrames;
  }

  const totalFrames = cursorFrames;
  const dataSize = totalFrames * numberOfChannels * bytesPerSample;
  if (dataSize > STABLE_SAFE_WAV_MAX_BYTES) {
    throw new Error(`차량 안전 WAV가 너무 큽니다. (${Math.round(dataSize / 1024 / 1024)} MB)`);
  }

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

  let writeOffset = 44 + (leadInFrames * numberOfChannels * bytesPerSample);
  for (let b = 0; b < audioBuffers.length; b++) {
    const buffer = audioBuffers[b];
    const channelData = Array.from({ length: numberOfChannels }, (_, channel) => {
      const sourceChannel = Math.min(channel, buffer.numberOfChannels - 1);
      return buffer.getChannelData(sourceChannel);
    });

    for (let frame = 0; frame < buffer.length; frame++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channelData[channel][frame] || 0));
        view.setInt16(writeOffset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        writeOffset += bytesPerSample;
      }
    }

    if (b < audioBuffers.length - 1) {
      writeOffset += gapFrames * numberOfChannels * bytesPerSample;
    }
  }

  return {
    blob: new Blob([wavBuffer], { type: 'audio/wav' }),
    segmentStarts,
    duration: totalFrames / sampleRate,
    bytes: 44 + dataSize,
    format: 'wav-car',
    leadInSeconds,
    gapSeconds
  };
}

function createAudioFocusWavBlob(durationSeconds = 0.14, sampleRate = 8000) {
  const frameCount = Math.max(1, Math.floor(durationSeconds * sampleRate));
  const bytesPerSample = 2;
  const dataSize = frameCount * bytesPerSample;
  const wavBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(wavBuffer);

  writeAsciiString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAsciiString(view, 8, 'WAVE');
  writeAsciiString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeAsciiString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let writeOffset = 44;
  const fadeFrames = Math.max(1, Math.floor(frameCount * 0.25));
  for (let frame = 0; frame < frameCount; frame++) {
    const fadeIn = Math.min(1, frame / fadeFrames);
    const fadeOut = Math.min(1, (frameCount - frame - 1) / fadeFrames);
    const envelope = Math.max(0, Math.min(fadeIn, fadeOut));
    const sample = Math.sin((2 * Math.PI * 220 * frame) / sampleRate) * 0.006 * envelope;
    view.setInt16(writeOffset, sample * 0x7fff, true);
    writeOffset += bytesPerSample;
  }

  return new Blob([wavBuffer], { type: 'audio/wav' });
}

function requestPlaybackAudioSession() {
  if ('audioSession' in navigator && navigator.audioSession) {
    try {
      navigator.audioSession.type = 'playback';
    } catch {
      // Unsupported session types are ignored by browsers that expose a partial API.
    }
  }

  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.playbackState = 'playing';
    } catch {
      // Media Session state is best-effort and should never block playback.
    }
  }
}

const STABLE_RECOVERY_MAX_ATTEMPTS = 4;
const STABLE_RECOVERY_BASE_DELAY_MS = 700;
const STABLE_PROGRESS_STALL_MS = 4500;
const STABLE_PROGRESS_EPSILON = 0.04;

/**
 * ==========================================================================
 * VoxFlow - Web Audio API & Playback Queue Manager Module
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
    this._primedAudio = null;
    this.primedObjectUrl = null;
    this.autoplayPrimeId = 0;
    this.autoplayPrimePromise = null;
    this.mediaSegmentStarts = [];
    this.mediaDuration = 0;
    this.mediaActiveIndex = -1;
    this.stableMediaCleanup = null;
    this.stableRecoveryTimer = null;
    this.stableRecoveryAttempts = 0;
    this.stablePauseIntent = 'idle';
    this.stableLastProgressAt = 0;
    this.stableLastCurrentTime = 0;
    this.diagnostics = [];

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
      stateUpdate: [],
      diagnostic: []
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

  async ensureAudioContextRunning() {
    this.initAudio();
    if (!this.audioCtx) return false;
    if (this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch {
        return false;
      }
    }
    return this.audioCtx.state === 'running';
  }

  primeForAutoplay() {
    requestPlaybackAudioSession();
    this.initAudio();

    // Prime Web Audio API context (일반 모드)
    if (this.audioCtx && this.gainNode) {
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

    // Keep a tiny foreground audio stream alive while text/voice generation runs.
    // This is the only browser-safe way to request mobile/BT audio focus from
    // other tabs/apps without directly controlling them.
    if (this._primedAudio && this.primedObjectUrl) {
      if (this._primedAudio.paused) {
        this.autoplayPrimePromise = this._primedAudio.play()
          .then(() => {
            this.autoplayPrimePromise = null;
            requestPlaybackAudioSession();
            return this._primedAudio;
          })
          .catch(() => {
            this.autoplayPrimePromise = null;
            return null;
          });
      }
      return this.autoplayPrimePromise || Promise.resolve(this._primedAudio);
    }
    if (this.autoplayPrimePromise) {
      return this.autoplayPrimePromise;
    }
    if (this._primedAudio || this.primedObjectUrl) {
      this._clearPrimedAudio();
    }

    try {
      const primeId = ++this.autoplayPrimeId;
      const primerUrl = URL.createObjectURL(createAudioFocusWavBlob());
      const primer = new Audio();
      primer.preload = 'auto';
      primer.playsInline = true;
      primer.setAttribute('playsinline', '');
      primer.setAttribute('webkit-playsinline', '');
      primer.muted = false;
      primer.volume = 0.08;
      primer.loop = true;
      primer.src = primerUrl;
      this.autoplayPrimePromise = primer.play().then(() => {
        if (primeId !== this.autoplayPrimeId) {
          primer.pause();
          primer.removeAttribute('src');
          primer.load();
          URL.revokeObjectURL(primerUrl);
          return null;
        }

        this._primedAudio = primer;
        this.primedObjectUrl = primerUrl;
        this.autoplayPrimePromise = null;
        requestPlaybackAudioSession();
        return primer;
      }).catch(() => {
        if (primeId === this.autoplayPrimeId) {
          this.autoplayPrimePromise = null;
        }
        primer.pause();
        primer.removeAttribute('src');
        primer.load();
        URL.revokeObjectURL(primerUrl);
        return null;
      });
      return this.autoplayPrimePromise;
    } catch {
      return Promise.resolve(null);
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

  removeEventListener(event, callback) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event] = this.eventListeners[event].filter(listener => listener !== callback);
  }

  /**
   * Emit events.
   */
  emit(event, ...args) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(cb => cb(...args));
    }
  }

  getDiagnostics() {
    return [...this.diagnostics];
  }

  recordDiagnostic(event, details = {}) {
    this._logDiagnostic(event, details);
  }

  _getMediaSnapshot() {
    const audio = this.mediaAudio;
    const duration = this.mediaDuration || audio?.duration || 0;
    let audioSessionType = '';
    try {
      audioSessionType = navigator.audioSession?.type || '';
    } catch {
      audioSessionType = '';
    }

    return {
      status: this.status,
      stable: this.useStablePlayback,
      playing: this.isPlaying,
      index: `${this.currentIndex + 1}/${this.segments.length || 0}`,
      currentTime: Number.isFinite(audio?.currentTime) ? Number(audio.currentTime.toFixed(2)) : 0,
      duration: Number.isFinite(duration) ? Number(duration.toFixed(2)) : 0,
      paused: audio ? audio.paused : null,
      ended: audio ? audio.ended : null,
      readyState: audio ? audio.readyState : null,
      networkState: audio ? audio.networkState : null,
      audioCtx: this.audioCtx?.state || '',
      visibility: document.visibilityState,
      hidden: document.hidden,
      audioSession: audioSessionType,
      pauseIntent: this.stablePauseIntent
    };
  }

  _logDiagnostic(event, details = {}) {
    const entry = {
      time: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
      event,
      details,
      snapshot: this._getMediaSnapshot()
    };

    this.diagnostics.push(entry);
    if (this.diagnostics.length > 80) this.diagnostics.shift();

    try {
      console.debug('[VoxFlow audio]', entry);
    } catch {
      // Console logging is diagnostic-only.
    }

    this.emit('diagnostic', entry);
  }

  /**
   * Set speech segments.
   */
  setSegments(segments) {
    this.stop({ preservePrimedAudio: Boolean((this._primedAudio || this.autoplayPrimePromise) && segments.length) });
    this.queueVersion++;
    this.segments = segments.map(seg => ({
      ...seg,
      ttsText: seg.ttsText || getNarrationText(seg.text),
      audioBuffer: null,
      audioArrayBuffer: null,
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
    this._logDiagnostic('stable-mode', { enabled: nextValue });
  }

  releaseDistantAudioBuffers(centerIndex = this.currentIndex) {
    const readySegments = this.segments
      .map((seg, index) => ({ seg, index }))
      .filter(({ seg }) => seg.audioBuffer)
      .sort((a, b) => Math.abs(a.index - centerIndex) - Math.abs(b.index - centerIndex));

    readySegments.slice(MAX_READY_AUDIO_BUFFERS).forEach(({ seg }) => {
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
    requestPlaybackAudioSession();
    await this.ensureAudioContextRunning();
    
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
      this.stablePauseIntent = 'user';
      this._cancelStableRecovery('user-pause');
      this._logDiagnostic('stable:user-pause');
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
      this.pausedAt = Math.max(0, (this.audioCtx.currentTime - this.startTime) * this.playbackRate);
    }

    this.stopProgressTracking();
  }

  /**
   * Completely stop playback and reset pointers.
   */
  stop(options = {}) {
    const { preservePrimedAudio = false } = options;
    this.isPlaying = false;
    this.stablePauseIntent = 'stop';
    this._cancelStableRecovery('stop');
    this._clearPreScheduled();
    this.nextScheduledTime = 0;
    this._destroyStableMedia({ preservePrimedAudio });
    this.setStatus('idle');

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

  hasActiveAudioFocus() {
    const primedPlaying = Boolean(this._primedAudio && !this._primedAudio.paused);
    const mediaPlaying = Boolean(this.mediaAudio && !this.mediaAudio.paused);
    return primedPlaying || mediaPlaying;
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
    const shouldPrimeAudioFocus = !this.isPlaying;

    if (this.useStablePlayback && this.mediaAudio) {
      this.currentIndex = index;
      this.pausedAt = 0;
      this.stablePauseIntent = 'seek';
      this._cancelStableRecovery('seek');
      this.mediaAudio.currentTime = this.mediaSegmentStarts[index] || 0;
      this.emit('segmentStart', index);
      this.emit('progress', this.mediaAudio.currentTime, this.mediaDuration || this.mediaAudio.duration || 1);
      if (this.isPlaying) {
        this.stablePauseIntent = 'programmatic-play';
        this.mediaAudio.play()
          .then(() => {
            this.stablePauseIntent = 'playing';
            this.setStatus('playing');
            this.startStableProgressTracking();
          })
          .catch((err) => {
            this._logDiagnostic('stable:jump-play-failed', { message: err.message });
            this._scheduleStableRecovery('jump-play-failed');
          });
        this.setStatus('playing');
      }
      return;
    }

    if (this.useStablePlayback) {
      this.stop();
      this.currentIndex = index;
      this.isPlaying = true;
      if (shouldPrimeAudioFocus) {
        this.primeForAutoplay();
      }
      this.playStable();
      return;
    }
    
    this.stop();
    this.currentIndex = index;
    this.isPlaying = true;
    if (shouldPrimeAudioFocus) {
      this.primeForAutoplay();
    }
    this.playSegment(index);
  }

  async playStable() {
    if (this.segments.length === 0) return;

    this.isPlaying = true;
    this._clearPreScheduled();
    this._cancelStableRecovery('play-request');
    this._logDiagnostic('stable:play-request');

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
    requestPlaybackAudioSession();

    try {
      this.stablePauseIntent = 'programmatic-play';
      await this.mediaAudio.play();
      this.stablePauseIntent = 'playing';
      if (this._primedAudio && this._primedAudio !== this.mediaAudio) {
        this._clearPrimedAudio();
      }
      this.stableRecoveryAttempts = 0;
      this.stableLastProgressAt = Date.now();
      this.stableLastCurrentTime = this.mediaAudio.currentTime || 0;
      this.setStatus('playing');
      this.startStableProgressTracking();
    } catch (err) {
      if (this._primedAudio && this._primedAudio !== this.mediaAudio) {
        this._clearPrimedAudio();
      }
      this.isPlaying = false;
      this.stablePauseIntent = 'blocked';
      this._logDiagnostic('stable:play-blocked', { message: err.message });
      this.setStatus('paused');
      showNotification('브라우저가 자동 재생을 막았습니다. 재생 버튼을 한 번 더 눌러주세요.', 'warning');
    }
  }

  async prepareStableMedia() {
    if (this.mediaAudio) return;

    this.setStatus('generating');
    if (!this._primedAudio && this.autoplayPrimePromise) {
      await this.autoplayPrimePromise;
    }
    const primedAudio = this._primedAudio;
    const primedObjectUrl = this.primedObjectUrl;
    this._primedAudio = null;
    this.primedObjectUrl = null;
    this.autoplayPrimePromise = null;
    this._destroyStableMedia();
    let nextMediaObjectUrl = null;

    try {
      if (!this.generationAbortController) {
        this.generationAbortController = new AbortController();
      }

      const { signal } = this.generationAbortController;
      const capturedVersion = this.queueVersion;
      const audioBuffers = [];
      const mp3Buffers = [];

      for (let i = 0; i < this.segments.length; i++) {
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
        if (this.queueVersion !== capturedVersion) throw new DOMException('Aborted', 'AbortError');

        const segment = this.segments[i];
        const needsSpeech = !segment.audioArrayBuffer;
        const needsDecode = !segment.audioBuffer;
        if (needsSpeech || needsDecode) {
          segment.state = 'generating';
          this.emit('stateUpdate', this.segments);
        }

        if (needsSpeech) {
          const result = await generateSpeech(segment.ttsText || segment.text, { ...this.apiConfig, signal });
          if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
          if (this.queueVersion !== capturedVersion) throw new DOMException('Aborted', 'AbortError');

          segment.audioArrayBuffer = result.arrayBuffer;
        }

        if (needsDecode) {
          segment.audioBuffer = await this.decodeAudio(segment.audioArrayBuffer);
        }

        if (needsSpeech || needsDecode) {
          segment.state = 'ready';
          segment.errorMsg = null;
          this.emit('stateUpdate', this.segments);
        }
        audioBuffers.push(segment.audioBuffer);
        mp3Buffers.push(segment.audioArrayBuffer);
      }

      this.setStatus('buffering');
      requestPlaybackAudioSession();
      const audio = primedAudio || new Audio();
      audio.preload = 'auto';
      audio.playsInline = true;
      audio.setAttribute('playsinline', '');
      audio.setAttribute('webkit-playsinline', '');
      audio.loop = false;
      const canUseMp3 = typeof audio.canPlayType === 'function' && audio.canPlayType('audio/mpeg') !== '';
      let media;
      try {
        media = createCarSafeWavBlobFromAudioBuffers(audioBuffers);
      } catch (err) {
        this._logDiagnostic('stable:car-wav-fallback', { message: err.message });
        media = canUseMp3
          ? createMp3BlobFromAudioBuffers(mp3Buffers, audioBuffers)
          : { ...createWavBlobFromAudioBuffers(audioBuffers), bytes: null, format: 'wav' };
      }
      const { blob, segmentStarts, duration } = media;
      nextMediaObjectUrl = URL.createObjectURL(blob);
      if (primedAudio) {
        try {
          primedAudio.pause();
          primedAudio.currentTime = 0;
        } catch {}
      }
      audio.src = nextMediaObjectUrl;
      audio.load();
      if (primedObjectUrl) {
        URL.revokeObjectURL(primedObjectUrl);
      }
      audio.volume = this.volume;
      audio.playbackRate = this.playbackRate;

      this.mediaAudio = audio;
      this.mediaObjectUrl = nextMediaObjectUrl;
      this.mediaSegmentStarts = segmentStarts;
      this.mediaDuration = duration;
      this.mediaActiveIndex = -1;
      this.stableLastProgressAt = Date.now();
      this.stableLastCurrentTime = 0;
      this.stablePauseIntent = 'prepared';
      this._bindStableMedia(audio);
      const preparedDetails = {
        segments: this.segments.length,
        duration: Number(duration.toFixed(2)),
        format: media.format,
        bytes: media.bytes
      };
      if (media.leadInSeconds !== undefined) preparedDetails.leadInSeconds = media.leadInSeconds;
      if (media.gapSeconds !== undefined) preparedDetails.gapSeconds = media.gapSeconds;
      this._logDiagnostic('stable:prepared', preparedDetails);
      nextMediaObjectUrl = null;
    } catch (err) {
      if (primedAudio) {
        primedAudio.pause();
        primedAudio.removeAttribute('src');
        primedAudio.load();
      }
      if (primedObjectUrl) {
        URL.revokeObjectURL(primedObjectUrl);
      }
      if (nextMediaObjectUrl) {
        URL.revokeObjectURL(nextMediaObjectUrl);
      }
      throw err;
    }
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
      const capturedVersion = this.queueVersion;
      let cleanup = () => {};
      const onStateUpdate = () => {
        if (!this.isPlaying || this.currentIndex !== index) {
          cleanup();
          return;
        }
        if (this.queueVersion !== capturedVersion) {
          cleanup();
          return;
        }
        if (segment.state === 'ready' && segment.audioBuffer) {
          cleanup();
          this.playSegment(index, offset);
        } else if (segment.state === 'error') {
          cleanup();
          this.setStatus('idle');
          showNotification(`음성 재생 실패: ${segment.errorMsg}`);
        } else if (segment.state === 'idle') {
          // abort로 인해 idle로 돌아온 경우 → 직접 생성 재시작
          cleanup();
          this.playSegment(index, offset);
        }
      };
      cleanup = () => this.removeEventListener('stateUpdate', onStateUpdate);
      this.addEventListener('stateUpdate', onStateUpdate);
      onStateUpdate();
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
      segment.audioArrayBuffer = result.arrayBuffer;
      const audioBuffer = await this.decodeAudio(segment.audioArrayBuffer);

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
          segment.audioArrayBuffer = result.arrayBuffer;
          segment.audioBuffer = await this.decodeAudio(segment.audioArrayBuffer);
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

  _destroyStableMedia(options = {}) {
    const { preservePrimedAudio = false } = options;
    if (!preservePrimedAudio) {
      this._clearPrimedAudio();
    }
    this._cancelStableRecovery('destroy-media');
    if (this.stableMediaCleanup) {
      this.stableMediaCleanup();
    }
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
    this.stableLastProgressAt = 0;
    this.stableLastCurrentTime = 0;
  }

  _clearPrimedAudio() {
    this.autoplayPrimeId++;
    this.autoplayPrimePromise = null;
    if (this._primedAudio) {
      this._primedAudio.pause();
      this._primedAudio.removeAttribute('src');
      this._primedAudio.load();
      this._primedAudio = null;
    }
    if (this.primedObjectUrl) {
      URL.revokeObjectURL(this.primedObjectUrl);
      this.primedObjectUrl = null;
    }
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

  _bindStableMedia(audio) {
    if (this.stableMediaCleanup) {
      this.stableMediaCleanup();
    }

    const events = [
      'loadstart', 'loadedmetadata', 'canplay', 'canplaythrough',
      'play', 'playing', 'pause', 'waiting', 'stalled', 'suspend',
      'seeking', 'seeked', 'ended', 'error', 'abort'
    ];
    const bindings = events.map((eventName) => {
      const handler = () => this._handleStableMediaEvent(eventName);
      audio.addEventListener(eventName, handler);
      return { eventName, handler };
    });

    this.stableMediaCleanup = () => {
      bindings.forEach(({ eventName, handler }) => {
        audio.removeEventListener(eventName, handler);
      });
      this.stableMediaCleanup = null;
    };
  }

  _handleStableMediaEvent(eventName) {
    this._logDiagnostic(`media:${eventName}`);

    if (eventName === 'playing') {
      this.stablePauseIntent = 'playing';
      this.stableRecoveryAttempts = 0;
      this.stableLastProgressAt = Date.now();
      this.stableLastCurrentTime = this.mediaAudio?.currentTime || 0;
      this._cancelStableRecovery('media-playing');
      return;
    }

    if (eventName === 'ended') {
      this.stablePauseIntent = 'ended';
      this._cancelStableRecovery('media-ended');
      this._handleStableEnded();
      return;
    }

    if (eventName === 'error') {
      this._cancelStableRecovery('media-error');
      if (!this.isPlaying) return;
      this.isPlaying = false;
      this.stablePauseIntent = 'error';
      this.setStatus('idle');
      showNotification('차량 모드 오디오 재생 중 오류가 발생했습니다.', 'error');
      return;
    }

    if (eventName === 'pause') {
      if (this._shouldRecoverStablePlayback()) {
        this._scheduleStableRecovery('unexpected-pause', 350);
      }
      return;
    }

    if (eventName === 'waiting' || eventName === 'stalled') {
      if (this._shouldRecoverStablePlayback()) {
        this._scheduleStableRecovery(eventName, 1200);
      }
    }
  }

  _shouldRecoverStablePlayback() {
    if (!this.useStablePlayback || !this.isPlaying || !this.mediaAudio) return false;
    if (['user', 'stop', 'ended', 'error', 'blocked'].includes(this.stablePauseIntent)) return false;
    if (this.mediaAudio.ended) return false;

    const duration = this.mediaDuration || this.mediaAudio.duration || 0;
    if (Number.isFinite(duration) && duration > 0 && this.mediaAudio.currentTime >= duration - 0.35) {
      return false;
    }

    return true;
  }

  _cancelStableRecovery(reason = '') {
    if (!this.stableRecoveryTimer) return;
    clearTimeout(this.stableRecoveryTimer);
    this.stableRecoveryTimer = null;
    this._logDiagnostic('stable:recovery-cancel', { reason });
  }

  _scheduleStableRecovery(reason, delayMs = STABLE_RECOVERY_BASE_DELAY_MS) {
    if (!this._shouldRecoverStablePlayback()) return;
    if (this.stableRecoveryTimer) return;

    if (this.stableRecoveryAttempts >= STABLE_RECOVERY_MAX_ATTEMPTS) {
      this.isPlaying = false;
      this.stablePauseIntent = 'recovery-exhausted';
      this.setStatus('paused');
      this.stopProgressTracking();
      this._logDiagnostic('stable:recovery-exhausted', { reason });
      showNotification('차량 오디오가 반복해서 멈췄습니다. 재생 버튼을 다시 눌러주세요.', 'warning');
      return;
    }

    const nextDelay = delayMs + (this.stableRecoveryAttempts * 500);
    this._logDiagnostic('stable:recovery-scheduled', { reason, delayMs: nextDelay });
    this.stableRecoveryTimer = setTimeout(() => {
      this.stableRecoveryTimer = null;
      this._recoverStablePlayback(reason);
    }, nextDelay);
  }

  async _recoverStablePlayback(reason) {
    if (!this._shouldRecoverStablePlayback()) return;

    this.stableRecoveryAttempts++;
    this._logDiagnostic('stable:recovery-start', {
      reason,
      attempt: this.stableRecoveryAttempts
    });

    try {
      requestPlaybackAudioSession();
      if (this.audioCtx?.state === 'suspended') {
        await this.audioCtx.resume();
      }

      if (!this.mediaAudio) return;
      this.mediaAudio.volume = this.volume;
      this.mediaAudio.playbackRate = this.playbackRate;
      this.stablePauseIntent = 'recovery-play';
      await this.mediaAudio.play();
      this.stablePauseIntent = 'playing';
      this.stableLastProgressAt = Date.now();
      this.stableLastCurrentTime = this.mediaAudio.currentTime || 0;
      this.setStatus('playing');
      this.startStableProgressTracking();
      this._logDiagnostic('stable:recovery-success', {
        attempt: this.stableRecoveryAttempts
      });
    } catch (err) {
      this._logDiagnostic('stable:recovery-failed', {
        reason,
        attempt: this.stableRecoveryAttempts,
        message: err.message
      });
      this._scheduleStableRecovery('recovery-failed', STABLE_RECOVERY_BASE_DELAY_MS);
    }
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
      const now = Date.now();

      if (this.repeatMode === 'one') {
        const start = this.mediaSegmentStarts[this.currentIndex] || 0;
        const end = this._getStableSegmentEnd(this.currentIndex);
        if (end > start && current >= end - 0.03) {
          this.mediaAudio.currentTime = start;
          current = start;
          this.stableLastProgressAt = now;
          this.stableLastCurrentTime = current;
        }
      }

      if (!this.mediaAudio.paused && current > this.stableLastCurrentTime + STABLE_PROGRESS_EPSILON) {
        this.stableLastProgressAt = now;
        this.stableLastCurrentTime = current;
      } else if (
        !this.mediaAudio.paused &&
        duration - current > 1.2 &&
        now - this.stableLastProgressAt > STABLE_PROGRESS_STALL_MS
      ) {
        this.stableLastProgressAt = now;
        this._scheduleStableRecovery('progress-stalled', 0);
      } else if (this.mediaAudio.paused && this._shouldRecoverStablePlayback()) {
        this._scheduleStableRecovery('progress-paused', 250);
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
      this.nextScheduledTime = scheduledStartAt + (segment.audioBuffer.duration / this.playbackRate) + INTER_CHUNK_PAUSE_SECONDS;
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
        this.executePlayback(nextSeg.audioBuffer, 0, this.audioCtx.currentTime + INTER_CHUNK_PAUSE_SECONDS);
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

  async executePlayback(audioBuffer, offset = 0, scheduledStartAt = null) {
    requestPlaybackAudioSession();
    const audioContextReady = await this.ensureAudioContextRunning();
    if (!audioContextReady) {
      this.isPlaying = false;
      this.setStatus('paused');
      showNotification('브라우저 오디오 출력을 열지 못했습니다. 재생 버튼을 다시 눌러주세요.', 'warning');
      return;
    }
    if (!this.isPlaying) return;

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
    this.nextScheduledTime = startAt + segDuration + INTER_CHUNK_PAUSE_SECONDS;

    source.onended = () => this._handlePlaybackEnded(source);

    try {
      source.start(startAt, offset);
    } catch (err) {
      this.currentSourceNode = null;
      this.isPlaying = false;
      this.setStatus('paused');
      showNotification('오디오 재생 시작에 실패했습니다. 재생 버튼을 다시 눌러주세요.', 'warning');
      return;
    }
    if (!this.useStablePlayback) {
      this._clearPrimedAudio();
    }
    this.setStatus('playing');
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
      console.error('Audio decode failed:', err);
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
      
      const elapsed = Math.max(0, (this.audioCtx.currentTime - this.startTime) * this.playbackRate);
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
