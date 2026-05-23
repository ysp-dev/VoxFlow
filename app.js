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
    'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>'
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
 * AetherTTS - Gemini API Client Module
 * ==========================================================================
 */

/**
 * Call the Google Gemini API to perform Text-To-Speech on a text chunk.
 * 
 * @param {string} text The text to convert to speech.
 * @param {object} config Configuration options.
 * @param {string} config.apiKey Google Gemini API Key.
 * @param {string} config.model Gemini model identifier (e.g., 'gemini-2.5-flash-preview-tts').
 * @param {string} config.voice Prebuilt voice name (e.g., 'Kore', 'Aoede', 'Puck').
 * @param {string} config.styleHint Emotional or stylistic hint for reading style.
 * @returns {Promise<{mimeType: string, base64Data: string}>} The audio data structure.
 */
const DEFAULT_TTS_MODEL = 'gemini-3.1-flash-tts-preview';
const TTS_FALLBACK_MODELS = ['gemini-3.1-flash-tts-preview', 'gemini-2.5-pro-preview-tts', 'gemini-2.5-flash-preview-tts'];
const TTS_ATTEMPTS_PER_MODEL = 1;
const STRUCTURE_TRANSFORM_MODELS = ['gemini-3.5-flash', 'gemini-2.5-flash'];
const STRUCTURE_ATTEMPTS_PER_MODEL = 2;
const MAX_TTS_CHARS = 500;
const MAX_READY_AUDIO_BUFFERS = 12;

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

async function transformTextForTtsStructure(rawText, { apiKey, signal = null } = {}) {
  if (!rawText || !rawText.trim()) return '';
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('구조 변환을 위해 Gemini API Key를 먼저 저장해주세요.');
  }

  let transformed;
  if (rawText.length > TRANSFORM_CHUNK_SIZE) {
    const chunks = splitTextIntoTransformChunks(rawText);
    const results = [];
    let prevTail = '';
    for (const chunk of chunks) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      results.push(await transformChunkWithFallback(chunk, { apiKey, signal, prevTail }));
      prevTail = chunk.split('\n').slice(-4).join('\n');
    }
    transformed = results.join('\n\n');
  } else {
    transformed = await transformChunkWithFallback(rawText, { apiKey, signal });
  }

  const lossIssues = verifyStructuralPreservation(rawText, transformed);
  if (lossIssues.length > 0) {
    throw new Error('구조 변환 중 정보 누락이 감지되었습니다:\n' + lossIssues.join('\n'));
  }

  return transformed;
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
  setSkeletonLabel('Gemini 3.5가 문서를 TTS 구조로 변환하는 중입니다…');
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

async function transformChunkWithFallback(rawText, { apiKey, signal = null, prevTail = '' } = {}) {
  const retryable = new Set([429, 500, 502, 503, 504]);
  let lastError = null;

  for (let mi = 0; mi < STRUCTURE_TRANSFORM_MODELS.length; mi++) {
    const model = STRUCTURE_TRANSFORM_MODELS[mi];
    if (mi > 0) {
      const prev = STRUCTURE_TRANSFORM_MODELS[mi - 1];
      showNotification(`Gemini ${prev} 실패 → Gemini ${model} 로 전환합니다.`, 'warning');
      setSkeletonLabel(`Gemini ${model} 로 전환하여 변환 중입니다…`);
    }

    for (let attempt = 0; attempt < STRUCTURE_ATTEMPTS_PER_MODEL; attempt++) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      setSkeletonLabel(`${model} 변환 중… (${attempt + 1}/${STRUCTURE_ATTEMPTS_PER_MODEL}회 시도)`);
      try {
        return await transformSingleChunk(rawText, { apiKey, signal, prevTail, model });
      } catch (err) {
        if (err.name === 'AbortError') throw err;
        lastError = err;

        const isRetryable = retryable.has(err.status) || /internal error|temporarily|unavailable/i.test(err.message || '');
        if (!isRetryable) throw formatTransformError(err);

        const isLastAttemptForModel = attempt === STRUCTURE_ATTEMPTS_PER_MODEL - 1;
        if (isLastAttemptForModel) break;

        if (err.status === 429) {
          const fromHeader = parseFloat(err.retryAfterHeader);
          const fromMsg    = parseFloat((err.message || '').match(/retry in (\d+\.?\d*)\s*s/i)?.[1]);
          const delaySec   = (isFinite(fromHeader) && fromHeader > 0) ? fromHeader
                           : (isFinite(fromMsg)    && fromMsg    > 0) ? fromMsg : 30;
          const waitSec = Math.ceil(delaySec) + 2;
          await countdownWait(waitSec, `${model} 한도 초과`, signal);
        } else {
          await sleep(600 * Math.pow(2, attempt), signal);
        }
      }
    }
  }

  throw formatTransformError(lastError);
}

function formatTransformError(err) {
  if (err?.userFriendly) return new Error(err.message);
  if (err?.status === 429) return new Error('모든 모델의 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
  if (/internal error/i.test(err?.message || '')) return new Error('Gemini 서버 오류가 반복됩니다. 잠시 후 다시 시도해주세요.');
  if (err?.status === 400) return new Error('구조 변환 요청이 거부되었습니다. API Key 또는 입력 내용을 확인해주세요.');
  if (err?.status === 403) return new Error('API Key 권한이 없습니다. Gemini API 사용 권한을 확인해주세요.');
  const detail = err?.message ? `: ${err.message}` : '';
  return new Error(`구조 변환에 실패했습니다${detail}`);
}

async function transformSingleChunk(rawText, { apiKey, signal = null, prevTail = '', model = STRUCTURE_TRANSFORM_MODELS[0] } = {}) {
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';
  const systemText = [
    'You transform source documents into Korean-friendly TTS input.',
    'Return only the transformed text. Do not add commentary, code fences, summaries, or metadata.',
    'Preserve every piece of source information without omission.'
  ].join(' ');

  const transformRules = [
    '다음 원문을 VOXFLOW TTS용 평문 구조로 변환하세요.',
    '',
    '구조 변환 규칙',
    '1. 표(|, ---), HTML 태그, 마크다운 서식(**, _, `)을 모두 제거하고 평문으로 변환한다. 단, 규칙 6에 명시된 섹션 제목(##)은 예외로 유지한다.',
    '2. 한 문장은 하나의 완결된 의미 단위로 구성한다. 문장 간 빈 줄 하나로 단락을 구분한다.',
    '3. 한 문장은 60자 이내로 제한한다. 초과 시 의미 단위로 분리한다.',
    '4. 글머리 기호(-, •, *)로 된 목록은 "다음과 같습니다. 항목1, 항목2, 항목3입니다." 패턴으로 변환한다.',
    '5. 번호 목록(1. 2. 3.)은 첫째, 둘째, 셋째 등 서수 표현으로 변환한다.',
    '6. 섹션 제목은 ## 제목 형태로 유지한다(규칙 1의 예외). TTS 청크 구분 기준으로 활용된다.',
    '7. 원본의 모든 정보를 누락 없이 보존한다.',
    '',
    '숫자·기호 변환 규칙',
    '8. 숫자는 문맥에 따라 한국어 수사로 변환한다. 단, 연도·코드·모델번호는 숫자 원문을 유지한다.',
    '9. 수식 기호는 한국어로 치환한다. + → 더하기, - → 빼기, × → 곱하기, ÷ → 나누기, = → 같습니다.',
    '10. 비교 기호는 서술어로 치환한다. > → 초과, < → 미만, ≥ → 이상, ≤ → 이하.',
    '11. %는 퍼센트로, °C는 도씨로, /는 문맥에 따라 또는·대·당으로 풀어 쓴다.',
    '12. 통화 기호는 통화명으로 변환한다. $ → 달러, € → 유로, ₩ → 원.',
    '',
    '영문·약어 처리 규칙',
    '13. 영문 약어(IT, AI, API 등)는 원문을 유지한다.',
    '14. 영문 전체 문장이 본문에 포함된 경우, 해당 언어 그대로 유지하거나 한국어 번역을 병기한다.',
    '15. 고유명사(브랜드, 제품명, 인명)는 원문을 유지한다.',
    '',
    'Gemini TTS 인라인 마커 삽입 규칙',
    '16. 섹션 전환 시 첫 문장 앞에 [pause]를 삽입한다.',
    '17. 핵심어·강조 단어 앞에 [emphasis]를 삽입한다.',
    '18. 경고·주의·예외 사항 문장 앞에 [cautious]를 삽입한다.',
    '19. 질문 형식 문장 뒤에는 [pause]를 삽입한다.',
    '',
    '추가 규칙',
    '20. 문장 연결성 확보: 60자 제한으로 문장을 나눌 때, 무조건 완결형 어미만 쓰기보다는 문맥에 따라 \'~하며,\', \'~하고,\' 같은 연결 어미를 적절히 섞어 자연스러운 대화체 리듬을 살린다. 단, TTS 호흡이 너무 길어지지 않도록 한 문장 안에서 연결 어미는 최대 1회만 허용한다.',
    '   나쁜 예시 (너무 단조로움): "A 시스템을 도입합니다. 그리고 데이터를 분석합니다. 효율성이 높아집니다." (X)',
    '   좋은 예시 (자연스러운 리듬): "A 시스템을 도입하여 데이터를 분석하면, 업무 효율성을 크게 높일 수 있습니다." (O)',
    '21. 범위 기호 처리: 물결표(~)는 문맥에 따라 "에서", "부터", "까지" 등의 명확한 한글 조사로 풀어 쓴다.',
    '22. 마커 남발 방지: [emphasis]와 [cautious]는 텍스트 전체의 핵심 주제에만 보수적으로 적용하며, 한 단락에 2회를 초과하지 않는다.'
  ].join('\n');
  const contextNote = prevTail
    ? `\n\n[이전 청크 끝부분 — 번호/목록 연속성 유지 참고용, 변환 대상 아님]\n${prevTail}\n[/이전 청크 끝부분]`
    : '';
  const userText = transformRules + contextNote + '\n\n원문:\n' + rawText;

  const payload = {
    contents: [{ parts: [{ text: userText }] }],
    systemInstruction: { parts: [{ text: systemText }] },
    generationConfig: {
      responseMimeType: 'text/plain'
    }
  };

  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(payload),
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
  const candidate = result.candidates?.[0];
  const finishReason = candidate?.finishReason;
  if (finishReason && finishReason !== 'STOP') {
    const err = new Error(`구조 변환이 중간에 중단되었습니다 (${finishReason}). 문서를 더 짧게 나눠 다시 시도해보세요.`);
    err.status = 0; err.userFriendly = true;
    throw err;
  }

  const transformed = candidate?.content?.parts?.map(p => p.text || '').join('').trim();
  if (!transformed) {
    const err = new Error('구조 변환 결과가 비어 있습니다. 입력 내용을 확인해주세요.');
    err.status = 0; err.userFriendly = true;
    throw err;
  }

  return transformed;
}
function parseQuotaType(msg = '', retryAfterSec = NaN) {
  if (/per.?day|daily|quota_exceeded_per_day/i.test(msg)) return 'RPD';
  if (/per.?minute|rate.?limit|quota_exceeded_per_minute/i.test(msg)) return 'RPM';
  // Heuristic: long retry → RPD, short retry → RPM
  if (isFinite(retryAfterSec)) return retryAfterSec > 300 ? 'RPD' : 'RPM';
  return 'RPM';
}

async function generateSpeech(text, { apiKey, model = DEFAULT_TTS_MODEL, voice = 'Kore', styleHint = '', signal = null }) {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Gemini API Key가 누락되었습니다. 상단 설정 바에서 API Key를 입력해주세요.');
  }

  const cleanModel = model.replace(/^models\//, '') || DEFAULT_TTS_MODEL;

  // Build fallback list starting from the user-selected model (forward only)
  const primaryIdx = TTS_FALLBACK_MODELS.indexOf(cleanModel);
  const modelsToTry = primaryIdx >= 0 ? TTS_FALLBACK_MODELS.slice(primaryIdx) : [cleanModel];

  const retryableStatuses = new Set([429, 500, 502, 503, 504]);
  let lastError = null;

  const systemText = `You are a professional Text-To-Speech narrator. Read the provided text naturally, interpreting inline markers as follows: [pause] = insert a brief pause; [emphasis] = stress the immediately following word or phrase; [cautious] = read the following sentence in a careful, cautionary tone. Remove these markers from the spoken output — do not read them aloud. Do NOT add any preamble, commentary, or filler phrases such as "Sure", "Here is the audio", or "Reading now". Start reading immediately.${styleHint ? ` Speech style: ${styleHint}` : ''}`;

  for (let mi = 0; mi < modelsToTry.length; mi++) {
    const currentModel = modelsToTry[mi];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent`;

    if (mi > 0) {
      const qt = lastError?.status === 429
        ? parseQuotaType(lastError.message, parseFloat(lastError.retryAfterHeader))
        : null;
      const reason = qt ? `${qt} 초과` : '내부 오류';
      showNotification(`TTS ${modelsToTry[mi - 1]} ${reason} → ${currentModel} 로 전환합니다.`, 'warning');
      // 내부 오류(500/503)는 일시적 과부하일 수 있으므로 전환 전 3초 대기
      if (lastError?.status !== 429) {
        await sleep(3000, signal);
      }
    }

    const payload = {
      contents: [{ parts: [{ text }] }],
      systemInstruction: { parts: [{ text: systemText }] },
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }
          }
        }
      }
    };

    for (let attempt = 0; attempt < TTS_ATTEMPTS_PER_MODEL; attempt++) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify(payload),
          signal
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error?.message || `HTTP error! status: ${response.status}`;
          const error = new Error(errorMessage);
          error.status = response.status;
          error.retryAfterHeader = response.headers.get('Retry-After');
          throw error;
        }

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error.message || `API Error Code: ${result.error.code}`);
        }

        const candidate = result.candidates?.[0];
        if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
          throw new Error(`음성 생성이 비정상 종료되었습니다 (finishReason: ${candidate.finishReason}). 해당 청크의 음성이 불완전할 수 있습니다.`);
        }

        const part = candidate?.content?.parts?.[0];
        if (!part) {
          throw new Error('Gemini API가 콘텐츠를 반환하지 않았습니다. 입력 텍스트 또는 설정을 확인하세요.');
        }

        if (part.inlineData) {
          return { mimeType: part.inlineData.mimeType, base64Data: part.inlineData.data };
        } else if (part.text) {
          throw new Error(`모델이 음성이 아닌 텍스트 결과를 반환했습니다. 선택한 모델(${currentModel})이 Native Audio Modality(AUDIO 출력)를 지원하는지 확인하세요.`);
        } else {
          throw new Error('Gemini API 응답 형식이 지원되지 않는 구조입니다.');
        }
      } catch (error) {
        if (error.name === 'AbortError') throw error;
        lastError = error;

        const isQuota = error.status === 429;
        const canRetry = retryableStatuses.has(error.status) || /internal error|temporarily|unavailable/i.test(error.message || '');
        const isLastAttemptForModel = attempt === TTS_ATTEMPTS_PER_MODEL - 1;

        if (!canRetry) {
          // 400/403 등 모델을 바꿔도 해결되지 않는 오류 → 즉시 중단
          if (error.status === 400) throw new Error('TTS 요청이 거부되었습니다. 입력 텍스트 또는 API Key를 확인해주세요.');
          if (error.status === 403) throw new Error('API Key 권한이 없습니다. Gemini API 사용 권한을 확인해주세요.');
          throw error;
        }
        if (isLastAttemptForModel) break; // exhausted attempts for this model

        if (isQuota) {
          const fromHeader = parseFloat(error.retryAfterHeader);
          const fromMsg = parseFloat((error.message || '').match(/retry in (\d+\.?\d*)\s*s/i)?.[1]);
          const delaySec = (isFinite(fromHeader) && fromHeader > 0) ? fromHeader
                         : (isFinite(fromMsg) && fromMsg > 0) ? fromMsg
                         : 30;
          const waitSec = Math.ceil(delaySec) + 2;
          const qt = parseQuotaType(error.message, parseFloat(error.retryAfterHeader));
          await countdownToast(waitSec, `TTS ${qt} 한도 초과 (${attempt + 1}/${TTS_ATTEMPTS_PER_MODEL}회)`, signal);
        } else {
          await sleep(600 * Math.pow(2, attempt), signal);
        }
      }
    }
  }

  console.error('Gemini TTS API Call Failure:', lastError);
  if (lastError?.status === 429) {
    const qt = parseQuotaType(lastError.message, parseFloat(lastError.retryAfterHeader));
    const hint = qt === 'RPD' ? '오늘 한도가 소진됐습니다. 내일 다시 시도해주세요.' : '잠시 후 다시 시도해주세요.';
    throw new Error(`모든 TTS 모델의 ${qt} 한도를 초과했습니다. ${hint}`);
  }
  if (/internal error/i.test(lastError?.message || '')) {
    throw new Error('Gemini TTS 서버 내부 오류가 반복되었습니다. 잠시 후 다시 시도하거나 입력 청크를 더 짧게 나눠보세요.');
  }
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

/**
 * ==========================================================================
 * AetherTTS - Web Audio API & Playback Queue Manager Module
 * ==========================================================================
 */

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
class QueueManager {
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
    this.generationAbortController = null;
    this.queueVersion = 0;

    // API configuration for prefetching
    this.apiConfig = {
      apiKey: '',
      model: DEFAULT_TTS_MODEL,
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
    this.queueVersion++;
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
    this.initAudio();
    
    if (this.segments.length === 0) return;
    
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
    
    this.isPlaying = false;
    this.setStatus('paused');
    
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
      const result = await generateSpeech(segment.text, { ...this.apiConfig, signal });
      const audioBuffer = await this.decodeAudio(result.base64Data, result.mimeType);

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
   * Triggers background prefetching of the next two segments in queue.
   */
  async prefetchNext() {
    const prefetchCount = 1; // Prefetch 1 segment ahead to reduce API quota pressure
    
    for (let i = 1; i <= prefetchCount; i++) {
      const nextIndex = this.currentIndex + i;
      if (nextIndex >= this.segments.length) break;
      
      const segment = this.segments[nextIndex];
      if (segment.state !== 'idle' || segment.audioBuffer) continue;
      
      // Async background generation trigger
      segment.state = 'generating';
      this.emit('stateUpdate', this.segments);
      
      const signal = this.generationAbortController?.signal ?? null;
      const capturedVersion = this.queueVersion;
      (async () => {
        try {
          const result = await generateSpeech(segment.text, { ...this.apiConfig, signal });
          if (this.queueVersion !== capturedVersion) return;
          segment.audioBuffer = await this.decodeAudio(result.base64Data, result.mimeType);
          segment.state = 'ready';
          this.releaseDistantAudioBuffers(nextIndex);
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
  voice: 'Kore',
  styleHint: '',
  configSnapshot: { voice: 'Kore', styleHint: '' },
  transformAbortController: null,
  parseRequestId: 0,
  isTransforming: false
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
  inputStyleHint: document.getElementById('input-style-hint'),
  
  visualizer: document.getElementById('visualizer-canvas'),
  statusBadge: document.getElementById('status-badge'),
  statusText: document.getElementById('status-text'),
  btnCancelTransform: document.getElementById('btn-cancel-transform'),
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
  const savedKey = localStorage.getItem('aether_tts_api_key') || sessionStorage.getItem('aether_tts_api_key');
  if (savedKey) {
    state.apiKey = savedKey;
    elements.apiKeyInput.value = savedKey;
    queue.setConfig({ apiKey: savedKey });
    elements.chkPersistKey.checked = Boolean(localStorage.getItem('aether_tts_api_key'));
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
  elements.btnDeleteApiKey.addEventListener('click', () => {
    cancelTransform();
    queue.stop();
    localStorage.removeItem('aether_tts_api_key');
    sessionStorage.removeItem('aether_tts_api_key');
    state.apiKey = '';
    queue.setConfig({ apiKey: '' });
    elements.apiKeyInput.value = '';
    elements.chkPersistKey.checked = false;
    setApiKeyEditMode(true);
    showNotification('API Key가 삭제되었습니다.', 'success');
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
      localStorage.setItem('aether_tts_api_key', key);
      sessionStorage.removeItem('aether_tts_api_key');
    } else {
      sessionStorage.setItem('aether_tts_api_key', key);
      localStorage.removeItem('aether_tts_api_key');
    }
    state.apiKey = key;
    queue.setConfig({ apiKey: key });
    setApiKeySecurityState(true);
    setApiKeyEditMode(false);
  } else {
    localStorage.removeItem('aether_tts_api_key');
    sessionStorage.removeItem('aether_tts_api_key');
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
  // Sync initial configuration values
  state.voice = elements.selectVoice.value;
  state.styleHint = elements.inputStyleHint.value;

  // Key sync helper
  const syncConfig = () => {
    state.voice = elements.selectVoice.value;
    state.styleHint = elements.inputStyleHint.value.trim();

    queue.setConfig({
      apiKey: state.apiKey,
      voice: state.voice,
      styleHint: state.styleHint
    });
  };

  // Voice change is discrete: flush cached audio immediately
  elements.selectVoice.addEventListener('change', () => { syncConfig(); flushAudioBuffers(); });
  // Style hint: sync config live; flush happens at play time if config drifted
  elements.inputStyleHint.addEventListener('input', syncConfig);

  // Trigger sync on loaded
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
    showNotification('Gemini 3.5 구조 변환을 위해 API Key를 먼저 저장해주세요.', 'warning');
    state.segments = [];
    queue.setSegments([]);
    renderPreview('', []);
    return false;
  }

  state.isTransforming = true;
  setTransformingUi(true);

  try {
    const transformedText = await transformTextForTtsStructure(sourceText, {
      apiKey: state.apiKey,
      signal: state.transformAbortController.signal
    });

    if (parseRequestId !== state.parseRequestId) return false;

    const parseResult = parseMarkdown(transformedText);
    state.segments = parseResult.segments;
    queue.setSegments(state.segments);
    state.configSnapshot = { voice: state.voice, styleHint: state.styleHint };
    renderPreview(parseResult.html, parseResult.segments);
    showNotification('Gemini 3.5 구조 변환이 완료되었습니다.', 'success');
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
    elements.statusText.textContent = 'Gemini 3.5 변환 중';

    // Dedicated cancel button (always visible in visualizer header)
    elements.btnCancelTransform.classList.remove('hidden');
    elements.btnCancelTransform.onclick = () => {
      cancelTransform();
      state.segments = [];
      queue.setSegments([]);
      renderPreview('', []);
    };

    // Also update generate buttons if visible (text tab / md tab)
    elements.btnGenerate.disabled = false;
    elements.btnGenerate.classList.add('btn-cancel');
    elements.btnGenerate.innerHTML = '<i data-lucide="x-circle" style="width:14px;height:14px;"></i> 변환 취소';
    if (!elements.btnGenerateMd.classList.contains('hidden')) {
      elements.btnGenerateMd.disabled = false;
      elements.btnGenerateMd.classList.add('btn-cancel');
      elements.btnGenerateMd.innerHTML = '<i data-lucide="x-circle" style="width:14px;height:14px;"></i> 변환 취소';
    }
    if (window.lucide) window.lucide.createIcons();

    elements.previewBody.classList.remove('hidden');
    elements.playlistContainer.classList.add('hidden');
    elements.previewBody.innerHTML = `
      <div class="transform-skeleton">
        <div class="skeleton-label"><span class="skeleton-dot"></span>Gemini 3.5가 문서를 TTS 구조로 변환하는 중입니다…</div>
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

    elements.btnCancelTransform.classList.add('hidden');
    elements.btnCancelTransform.onclick = null;

    elements.btnGenerate.classList.remove('btn-cancel');
    elements.btnGenerate.disabled = false;
    elements.btnGenerate.innerHTML = '<i data-lucide="sparkles"></i> 텍스트 분석 및 플레이리스트 생성';
    elements.btnGenerateMd.classList.remove('btn-cancel');
    elements.btnGenerateMd.disabled = false;
    elements.btnGenerateMd.innerHTML = '<i data-lucide="sparkles"></i> 파일 분석 및 플레이리스트 생성';
    if (window.lucide) window.lucide.createIcons();
  }
}

function renderPreview(htmlContent, segments) {
  // Clear container
  elements.previewBody.innerHTML = '';
  elements.playlistContainer.innerHTML = '';
  
  if (segments.length === 0) {
    elements.previewBody.innerHTML = '<p class="text-muted text-center" style="grid-column: span 2; padding: 40px 0;">분석 및 렌더링된 데이터가 없습니다. 원고를 입력하거나 파일을 업로드하세요.</p>';
    elements.playlistContainer.innerHTML = '<p class="text-muted text-center" style="padding: 20px 0;">플레이리스트가 비어 있습니다.</p>';
    elements.segmentCounter.textContent = '청크 0 / 0';
    currentViewMode = 'preview';
    elements.previewBody.classList.remove('hidden');
    elements.playlistContainer.classList.add('hidden');
    elements.previewTitle.innerHTML = '<i data-lucide="book-open"></i> 스마트 프리뷰어';
    elements.btnToggleView.classList.add('hidden');
    if (window.lucide) window.lucide.createIcons();
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
  elements.btnPlayPause.addEventListener('click', async () => {
    if (state.isTransforming) {
      showNotification('Gemini 3.5 구조 변환이 끝난 뒤 재생할 수 있습니다.', 'warning');
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
    
    if (queue.status === 'playing' || queue.status === 'buffering') {
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

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopVisualizer();
  } else if (!visualizerAnimationId) {
    startVisualizer();
  }
});

window.addEventListener('pagehide', stopVisualizer);
window.addEventListener('resize', resizeVisualizerCanvas);
