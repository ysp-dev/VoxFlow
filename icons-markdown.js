'use strict';

(function () {
  const fence = String.fromCharCode(96, 96, 96);
  const iconPaths = {
    'waves': '<path d="M2 12c3-5 5 5 8 0s5-5 8 0 5 5 8 0"/><path d="M2 6c3-5 5 5 8 0s5-5 8 0 5 5 8 0"/><path d="M2 18c3-5 5 5 8 0s5-5 8 0 5 5 8 0"/>',
    'moon': '<path d="M12 3a6 6 0 1 0 9 7.4A8 8 0 1 1 12 3z"/>',
    'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    'key-round': '<path d="M2 18l6-6"/><circle cx="14" cy="10" r="6"/><path d="M8 18l3 3"/><path d="M11 15l3 3"/>',
    'eye': '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M3 3l18 18"/><path d="M10.6 10.6A2 2 0 0 0 13.4 13.4"/><path d="M9.9 4.2A9.8 9.8 0 0 1 12 4c6.5 0 10 8 10 8a17.8 17.8 0 0 1-3.2 4.3"/><path d="M6.6 6.7C3.7 8.6 2 12 2 12s3.5 8 10 8a9.9 9.9 0 0 0 4.4-1"/>',
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
    'brain-circuit': '<path d="M12 5a3 3 0 0 0-5.2-2 3 3 0 0 0-3 5 3 3 0 0 0 0 5 3 3 0 0 0 3 5A3 3 0 0 0 12 16"/><path d="M12 5a3 3 0 0 1 5.2-2 3 3 0 0 1 3 5 3 3 0 0 1 0 5 3 3 0 0 1-3 5A3 3 0 0 1 12 16"/><path d="M8 8h8"/><path d="M8 12h3"/><path d="M13 12h3"/><path d="M8 16h8"/><circle cx="8" cy="8" r="1"/><circle cx="16" cy="8" r="1"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/>',
    'mic': '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/><path d="M8 22h8"/>',
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
