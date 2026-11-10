import React, { useRef } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Sparkles
} from 'lucide-react';

export const TextEditor = ({
  value = '',
  onChange,
  placeholder = 'Write or paste your marketing copy here...',
  minRows = 10,
  className = '',
  disabled = false
}) => {
  const textareaRef = useRef(null);

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;
  const paragraphCount = value.trim() ? value.trim().split(/\n\s*\n/).length : 0;
  const readingTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  const applyFormat = (prefix, suffix = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);

    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;
    const newValue = `${before}${replacement}${after}`;
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || 4)
      );
    }, 0);
  };

  const applyLinePrefix = (prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = value.substring(0, start);
    const after = value.substring(end);
    const selectedText = value.substring(start, end) || 'Item';

    const replacement = selectedText
      .split('\n')
      .map((line) => `${prefix} ${line}`)
      .join('\n');

    const newValue = `${before}${replacement}${after}`;
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + replacement.length);
    }, 0);
  };

  return (
    <div className={`rounded-2xl border border-[#1E294B] bg-[#090D1E] overflow-hidden shadow-inner focus-within:border-purple-500/60 focus-within:ring-1 focus-within:ring-purple-500/30 transition-all ${className}`}>
      
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-[#0C1226] border-b border-[#1A2448]">
        <div className="flex flex-wrap items-center gap-0.5 text-slate-300">
          <button
            type="button"
            onClick={() => applyFormat('**')}
            className="p-1.5 rounded-lg hover:bg-[#162044] hover:text-white transition-colors"
            title="Bold (**text**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('*')}
            className="p-1.5 rounded-lg hover:bg-[#162044] hover:text-white transition-colors"
            title="Italic (*text*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('~~')}
            className="p-1.5 rounded-lg hover:bg-[#162044] hover:text-white transition-colors"
            title="Strikethrough (~~text~~)"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-[#1E294B] mx-1" />

          <button
            type="button"
            onClick={() => applyLinePrefix('##')}
            className="p-1.5 rounded-lg hover:bg-[#162044] hover:text-white transition-colors text-[11px] font-bold flex items-center gap-0.5"
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyLinePrefix('###')}
            className="p-1.5 rounded-lg hover:bg-[#162044] hover:text-white transition-colors text-[11px] font-bold flex items-center gap-0.5"
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-[#1E294B] mx-1" />

          <button
            type="button"
            onClick={() => applyLinePrefix('•')}
            className="p-1.5 rounded-lg hover:bg-[#162044] hover:text-white transition-colors"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyLinePrefix('1.')}
            className="p-1.5 rounded-lg hover:bg-[#162044] hover:text-white transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyLinePrefix('>')}
            className="p-1.5 rounded-lg hover:bg-[#162044] hover:text-white transition-colors"
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyFormat('`')}
            className="p-1.5 rounded-lg hover:bg-[#162044] hover:text-white transition-colors"
            title="Inline Code"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Word count pill */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono px-2">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{readingTime}</span>
        </div>
      </div>

      {/* Editor Body */}
      <textarea
        ref={textareaRef}
        rows={minRows}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed font-sans resize-y"
      />

      {/* Bottom stats footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#070A17] border-t border-[#141C38] text-[10px] text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <span>Chars: {charCount}</span>
          <span>Paragraphs: {paragraphCount}</span>
        </div>
        <div className="flex items-center gap-1.5 text-purple-400">
          <Sparkles className="w-3 h-3" />
          <span>BrandGuard Audit Ready</span>
        </div>
      </div>
    </div>
  );
};
