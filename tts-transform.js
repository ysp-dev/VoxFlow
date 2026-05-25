'use strict';

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
  await showNotification('', 'warning', {
    countdownSeconds: totalSec,
    countdownLabel: labelPrefix,
    signal
  });
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
 * VoxFlow - Smart Text/Markdown Chunker Module
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
