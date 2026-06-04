import { useState, useRef, useEffect, useCallback } from 'react';
import { classNames } from '../../utils/helpers';

interface AddressAutocompleteProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  fetchSuggestions: (query: string) => Promise<string[]>;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  name?: string;
}

export function AddressAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  fetchSuggestions,
  disabled,
  error,
  required,
  name,
}: AddressAutocompleteProps) {
  const [inputText, setInputText] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const lastExternalValue = useRef(value);

  useEffect(() => {
    if (value && value !== lastExternalValue.current) {
      setInputText(value);
    }
    lastExternalValue.current = value;
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset active index when suggestions change
  useEffect(() => {
    setActiveIndex(-1);
  }, [suggestions]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const fetchAndShow = useCallback(
    async (text: string) => {
      if (text.trim().length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }
      setIsLoading(true);
      try {
        const results = await fetchSuggestions(text.trim());
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch {
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchSuggestions]
  );

  const handleInputChange = useCallback(
    (text: string) => {
      setInputText(text);

      if (text === '') {
        lastExternalValue.current = '';
        onChange('');
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchAndShow(text), 300);
    },
    [fetchAndShow, onChange]
  );

  const handleSelect = useCallback(
    (suggestion: string) => {
      setInputText(suggestion);
      lastExternalValue.current = suggestion;
      onChange(suggestion);
      setSuggestions([]);
      setIsOpen(false);
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    setInputText(value);
    setSuggestions([]);
    setIsOpen(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || suggestions.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i < suggestions.length - 1 ? i + 1 : i));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0) handleSelect(suggestions[activeIndex]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    },
    [isOpen, suggestions, activeIndex, handleSelect]
  );

  return (
    <div className='w-full relative' ref={containerRef}>
      {label && (
        <label htmlFor={name} className='block text-sm font-medium text-secondary-700 mb-2'>
          {label}
          {required && <span className='text-error mr-1'>*</span>}
        </label>
      )}

      <div className='relative'>
        <input
          id={name}
          name={name}
          type='text'
          value={inputText}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete='off'
          className={classNames(
            'w-full px-4 py-3 border rounded-lg text-base transition-colors duration-200',
            'focus:outline-none focus:ring-2',
            error
              ? 'border-error focus:border-error focus:ring-error/20'
              : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500/20',
            disabled && 'bg-secondary-100 cursor-not-allowed'
          )}
        />
        {isLoading && (
          <div className='absolute left-3 top-1/2 -translate-y-1/2'>
            <div className='w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin' />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className='absolute z-50 w-full mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg max-h-52 overflow-y-auto'
        >
          {suggestions.map((suggestion, idx) => (
            <li
              key={idx}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(suggestion);
              }}
              className={classNames(
                'px-4 py-2.5 cursor-pointer text-secondary-800 text-sm transition-colors',
                idx === activeIndex ? 'bg-primary-100' : 'hover:bg-primary-50'
              )}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      {error && <p className='mt-1 text-sm text-error'>{error}</p>}
    </div>
  );
}
