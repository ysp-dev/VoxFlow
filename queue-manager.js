'use strict';

function writeAsciiString(view, offset, value) {
  for (let i = 0; i < value.length; i++) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
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
    this._primedAudio = null;
    this.primedObjectUrl = null;
    this.autoplayPrimeId = 0;
    this.autoplayPrimePromise = null;

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
  }

  /**
   * Start or resume playback of the queue.
   */
  async play() {
    requestPlaybackAudioSession();
    await this.ensureAudioContextRunning();

    if (this.segments.length === 0) return;

    this.isPlaying = true;

    if (this.status === 'paused') {
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
    this._clearPreScheduled();
    this.nextScheduledTime = 0;
    if (!preservePrimedAudio) this._clearPrimedAudio();
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
    return Boolean(this._primedAudio && !this._primedAudio.paused);
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

    this.stop();
    this.currentIndex = index;
    this.isPlaying = true;
    if (shouldPrimeAudioFocus) {
      this.primeForAutoplay();
    }
    this.playSegment(index);
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
    this._clearPrimedAudio();
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
