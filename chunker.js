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
export function splitSentences(text) {
  if (!text) return [];
  
  // Match punctuation (. ! ?) followed by whitespace or end of line.
  // We use standard matches to avoid regex compatibility issues in older engines.
  const sentences = [];
  let current = '';
  
  // Simple but robust punctuation-whitespace split
  const parts = text.split(/([.!?]\s+|\n+)/);
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    
    if (i % 2 === 0) {
      current = part;
    } else {
      current += part;
      if (current.trim().length > 0) {
        sentences.push(current.trim());
      }
      current = '';
    }
  }
  
  if (current.trim().length > 0) {
    sentences.push(current.trim());
  }
  
  return sentences;
}

/**
 * Parse plain text input into readable segments and return styled HTML.
 * 
 * @param {string} plainText The raw plain text input.
 * @returns {{html: string, segments: Array}} The rendered HTML and the segment metadata array.
 */
export function parsePlainInput(plainText) {
  if (!plainText) return { html: '', segments: [] };
  
  const segments = [];
  let segmentId = 0;
  
  // Split by double newlines into paragraphs
  const paragraphs = plainText.split(/\n\s*\n/);
  let htmlResult = '';
  
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    
    // Check if the paragraph is very long (exceeds 300 characters)
    if (trimmed.length > 300) {
      const sentences = splitSentences(trimmed);
      let paraHtml = '';
      
      for (const sentence of sentences) {
        const sentenceTrimmed = sentence.trim();
        if (!sentenceTrimmed) continue;
        
        const id = segmentId++;
        segments.push({
          id,
          text: sentenceTrimmed,
          type: 'sentence',
          audioBuffer: null,
          state: 'idle'
        });
        
        paraHtml += `<span id="segment-${id}" class="preview-block sentence-span" data-segment-id="${id}">${sentence} </span>`;
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
      
      htmlResult += `<p id="segment-${id}" class="preview-block plain-para" data-segment-id="${id}">${trimmed}</p>`;
    }
  }
  
  return { html: htmlResult, segments };
}

/**
 * Parse markdown text into segments and return interactive HTML with unique IDs.
 * Utilizes standard marked.js for core parsing and runs DOM post-processing.
 * 
 * @param {string} markdownText The raw markdown string.
 * @returns {{html: string, segments: Array}} Rendered HTML string and segment metadata.
 */
export function parseMarkdown(markdownText) {
  if (!markdownText) return { html: '', segments: [] };
  
  // 1. Convert markdown to HTML using marked.js loaded in the window
  if (!window.marked) {
    console.error('marked.js is not loaded in the window context. Falling back to plain parsing.');
    return parsePlainInput(markdownText);
  }
  
  const rawHtml = window.marked.parse(markdownText);
  
  // 2. Load into a virtual DOM element for robust post-processing
  const temp = document.createElement('div');
  temp.innerHTML = rawHtml;
  
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
    
    // If it's a paragraph and it's long, decompose into sentence spans
    if (el.tagName === 'P' && textContent.length > 300) {
      const sentences = splitSentences(textContent);
      el.innerHTML = ''; // Clear original paragraph contents
      
      sentences.forEach((sentence) => {
        const sentenceTrimmed = sentence.trim();
        if (!sentenceTrimmed) return;
        
        const id = segmentId++;
        segments.push({
          id,
          text: sentenceTrimmed,
          type: 'sentence',
          audioBuffer: null,
          state: 'idle'
        });
        
        const span = document.createElement('span');
        span.id = `segment-${id}`;
        span.className = 'preview-block sentence-span';
        span.setAttribute('data-segment-id', id);
        span.textContent = sentence + ' ';
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
