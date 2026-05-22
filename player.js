/**
 * ==========================================================================
 * AetherTTS - Web Audio API & Playback Queue Manager Module
 * ==========================================================================
 */

import { generateSpeech } from './gemini.js';

/**
 * Convert a base64 string into an ArrayBuffer.
 * 
 * @param {string} base64 Base64 string.
 * @returns {ArrayBuffer} ArrayBuffer representing binary bytes.
 */
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Convert raw 16-bit signed PCM (Little-Endian) into a standard Float32 AudioBuffer.
 * 
 * @param {AudioContext} audioCtx The AudioContext context.
 * @param {ArrayBuffer} arrayBuffer The raw PCM bytes.
 * @param {number} sampleRate The sample rate of PCM (Gemini outputs 24000Hz).
 * @returns {AudioBuffer} Renderable AudioBuffer.
 */
function pcmToAudioBuffer(audioCtx, arrayBuffer, sampleRate = 24000) {
  const int16Data = new Int16Array(arrayBuffer);
  const float32Data = new Float32Array(int16Data.length);
  
  // Normalize Int16 range [-32768, 32767] to Float32 range [-1.0, 1.0]
  for (let i = 0; i < int16Data.length; i++) {
    float32Data[i] = int16Data[i] / 32768.0;
  }
  
  const audioBuffer = audioCtx.createBuffer(1, float32Data.length, sampleRate);
  audioBuffer.copyToChannel(float32Data, 0);
  return audioBuffer;
}

/**
 * QueueManager manages the sequential playback, pre-fetching, 
 * and Web Audio API node routing of the generated speech segments.
 */
export class QueueManager {
  constructor() {
    this.audioCtx = null;
    this.analyserNode = null;
    this.gainNode = null;
    
    this.segments = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.status = 'idle'; // 'idle' | 'generating' | 'buffering' | 'playing' | 'paused'
    
    this.volume = 1.0;
    this.playbackRate = 1.0;
    
    this.currentSourceNode = null;
    this.startTime = 0;
    this.pausedAt = 0;
    
    // API configuration for prefetching
    this.apiConfig = {
      apiKey: '',
      model: 'gemini-2.0-flash',
      voice: 'Kore',
      styleHint: ''
    };
    
    this.eventListeners = {
      statusChange: [],
      segmentStart: [],
      segmentEnd: [],
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
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Node routing: Source -> GainNode (Volume) -> AnalyserNode (Visualizer) -> Destination (Speakers)
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 256;
      
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
      
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);
    }
    
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
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
    this.segments = segments.map(seg => ({
      ...seg,
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
    this.playbackRate = Math.max(0.5, Math.min(2.0, value));
    if (this.currentSourceNode) {
      this.currentSourceNode.playbackRate.setValueAtTime(this.playbackRate, this.audioCtx.currentTime);
    }
  }

  /**
   * Start or resume playback of the queue.
   */
  async play() {
    this.initAudio();
    
    if (this.segments.length === 0) return;
    
    this.isPlaying = true;
    
    if (this.status === 'paused' && this.currentSourceNode) {
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
    
    this.isPlaying = false;
    this.setStatus('paused');
    
    if (this.currentSourceNode) {
      this.currentSourceNode.onended = null;
      this.currentSourceNode.stop();
      this.currentSourceNode = null;
    }
    
    this.pausedAt += (this.audioCtx.currentTime - this.startTime) * this.playbackRate;
    this.stopProgressTracking();
  }

  /**
   * Completely stop playback and reset pointers.
   */
  stop() {
    this.isPlaying = false;
    this.setStatus('idle');
    
    if (this.currentSourceNode) {
      this.currentSourceNode.onended = null;
      this.currentSourceNode.stop();
      this.currentSourceNode = null;
    }
    
    this.pausedAt = 0;
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
    
    this.stop();
    this.currentIndex = index;
    this.isPlaying = true;
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
      this.executePlayback(segment.audioBuffer, offset);
      this.prefetchNext(); // Trigger prefetch for upcoming segments
      return;
    }
    
    // Case 2: Audio is actively generating
    if (segment.state === 'generating') {
      this.setStatus('buffering');
      // Wait for it to become ready
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
          alert(`음성 재생 실패: ${segment.errorMsg}`);
        }
      }, 100);
      return;
    }
    
    // Case 3: Idle / Needs generation
    this.setStatus('generating');
    segment.state = 'generating';
    this.emit('stateUpdate', this.segments);
    
    try {
      const result = await generateSpeech(segment.text, this.apiConfig);
      const audioBuffer = await this.decodeAudio(result.base64Data, result.mimeType);
      
      segment.audioBuffer = audioBuffer;
      segment.state = 'ready';
      this.emit('stateUpdate', this.segments);
      
      if (this.isPlaying && this.currentIndex === index) {
        this.playSegment(index, offset);
      }
    } catch (err) {
      segment.state = 'error';
      segment.errorMsg = err.message || 'API Call failed';
      this.emit('stateUpdate', this.segments);
      
      if (this.isPlaying && this.currentIndex === index) {
        this.isPlaying = false;
        this.setStatus('idle');
        alert(`음성 생성 실패: ${err.message}`);
      }
    }
  }

  /**
   * Triggers background prefetching of the next two segments in queue.
   */
  async prefetchNext() {
    const prefetchCount = 2; // Prefetch upcoming two segments
    
    for (let i = 1; i <= prefetchCount; i++) {
      const nextIndex = this.currentIndex + i;
      if (nextIndex >= this.segments.length) break;
      
      const segment = this.segments[nextIndex];
      if (segment.state !== 'idle' || segment.audioBuffer) continue;
      
      // Async background generation trigger
      segment.state = 'generating';
      this.emit('stateUpdate', this.segments);
      
      (async () => {
        try {
          const result = await generateSpeech(segment.text, this.apiConfig);
          segment.audioBuffer = await this.decodeAudio(result.base64Data, result.mimeType);
          segment.state = 'ready';
        } catch (err) {
          console.error(`Prefetch failed for segment ${nextIndex}:`, err);
          segment.state = 'error';
          segment.errorMsg = err.message;
        } finally {
          this.emit('stateUpdate', this.segments);
        }
      })();
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
  executePlayback(audioBuffer, offset = 0) {
    this.setStatus('playing');
    
    // Create source node
    const source = this.audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.setValueAtTime(this.playbackRate, this.audioCtx.currentTime);
    
    // Connect node to routing path
    source.connect(this.gainNode);
    this.currentSourceNode = source;
    
    this.startTime = this.audioCtx.currentTime - (offset / this.playbackRate);
    
    // Set callbacks
    source.onended = () => {
      this.stopProgressTracking();
      this.currentSourceNode = null;
      
      if (this.isPlaying) {
        // Auto transition to next segment
        if (this.currentIndex < this.segments.length - 1) {
          this.currentIndex++;
          this.pausedAt = 0;
          this.playSegment(this.currentIndex);
        } else {
          // Finished entire document
          this.stop();
          this.emit('segmentEnd', this.currentIndex);
        }
      }
    };
    
    source.start(0, offset);
    this.startProgressTracking(audioBuffer.duration);
  }

  /**
   * Decode returned audio payload. Automatically handles fallback 
   * decodeAudioData vs raw PCM 16-bit decoding.
   */
  async decodeAudio(base64Data, mimeType) {
    this.initAudio();
    const buffer = base64ToArrayBuffer(base64Data);
    
    if (mimeType.toLowerCase().includes('linear16') || mimeType.toLowerCase().includes('pcm')) {
      // Decode raw 16-bit PCM 24kHz
      return pcmToAudioBuffer(this.audioCtx, buffer, 24000);
    } else {
      // Decode standard formats (wav, mp3, etc.) supported natively
      try {
        return await this.audioCtx.decodeAudioData(buffer.slice(0));
      } catch (err) {
        console.warn('Browser decodeAudioData failed, trying PCM fallback:', err);
        // Sometimes raw PCM is returned with incorrect headers
        return pcmToAudioBuffer(this.audioCtx, buffer, 24000);
      }
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
