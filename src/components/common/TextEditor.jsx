
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

  const wordCount = value.trim()
    ? value.trim().split(/\s+/).length
    : 0;

  const charCount = value.length;

  const paragraphCount = value.trim()
    ? value.trim().split(/\n\s*\n/).length
    : 0;

  const readingTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  const applyFormat = (prefix, suffix = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea || disabled) return;

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
    if (!textarea || disabled) return;

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
      textarea.setSelectionRange(
        start,
        start + replacement.length
      );
    }, 0);
  };

  const toolbarButton =
    'p-2 rounded-lg text-[#B0B8CA] hover:text-[#00E5FF] hover:bg-[#1B1E2D] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <div
      className={`
        rounded-2xl
        border border-[#272A3B]
        bg-[#121420]
        overflow-hidden
        shadow-inner
        focus-within:border-[#00BFD6]/60
        focus-within:ring-1
        focus-within:ring-[#00BFD6]/20
        transition-all duration-300
        ${className}
      `}
    >

      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#0D0F19] border-b border-[#272A3B]">

        <div className="flex flex-wrap items-center gap-0.5">

          <button
            type="button"
            onClick={() => applyFormat('**')}
            disabled={disabled}
            className={toolbarButton}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => applyFormat('*')}
            disabled={disabled}
            className={toolbarButton}
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => applyFormat('~~')}
            disabled={disabled}
            className={toolbarButton}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-5 bg-[#272A3B] mx-1" />

          <button
            type="button"
            onClick={() => applyLinePrefix('##')}
            disabled={disabled}
            className={toolbarButton}
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => applyLinePrefix('###')}
            disabled={disabled}
            className={toolbarButton}
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-5 bg-[#272A3B] mx-1" />

          <button
            type="button"
            onClick={() => applyLinePrefix('•')}
            disabled={disabled}
            className={toolbarButton}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => applyLinePrefix('1.')}
            disabled={disabled}
            className={toolbarButton}
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => applyLinePrefix('>')}
            disabled={disabled}
            className={toolbarButton}
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => applyFormat('`')}
            disabled={disabled}
            className={toolbarButton}
            title="Inline Code"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

        </div>

        {/* Word Count */}
        <div className="flex items-center gap-2 text-[11px] text-[#7D879C] font-mono px-2">
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
        className="
          w-full bg-transparent
          p-4
          text-xs sm:text-sm
          text-[#EAF2FF]
          placeholder-[#68738A]
          focus:outline-none
          leading-relaxed
          font-sans
          resize-y
          disabled:opacity-50
        "
      />

      {/* Bottom Statistics */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-[#0D0F19] border-t border-[#272A3B] text-[10px] text-[#7D879C] font-mono">

        <div className="flex items-center gap-3">
          <span>Chars: {charCount}</span>
          <span>Paragraphs: {paragraphCount}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[#00BFD6]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>BrandGuard Audit Ready</span>
        </div>

      </div>

    </div>
  );
};
