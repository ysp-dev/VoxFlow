'use strict';

const TTS_MODEL = 'gpt-4o-mini-tts';
const STRUCT_MODEL = 'gpt-5-mini';
const TTS_MAX_RETRIES = 2;
const STRUCT_MAX_RETRIES = 3;
const MAX_TTS_CHARS = 500;

const MAX_READY_AUDIO_BUFFERS = 12;
const PREFETCH_SEGMENT_COUNT = 4;
const INTER_CHUNK_PAUSE_SECONDS = 0.85;
