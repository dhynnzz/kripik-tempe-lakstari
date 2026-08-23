import React, { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

export interface Option {
  value: number | string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: number | string;
  onChange: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Pilih salah satu',
  disabled = false,
  searchable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Filter options based on search query
  const filteredOptions = searchable && searchQuery.trim()
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Calculate position
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < 250 && spaceAbove > spaceBelow) {
          setDropdownPosition('top');
        } else {
          setDropdownPosition('bottom');
        }
      }

      // Auto focus search input
      if (searchable && options.length > 7) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, searchable, options.length]);

  const handleSelect = (val: number | string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`custom-select-container ${isOpen ? 'active-container' : ''}`} ref={dropdownRef}>
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''}`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) setSearchQuery('');
          }
        }}
        disabled={disabled}
      >
        <span className={`trigger-label ${!selectedOption ? 'is-placeholder' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className="custom-select-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className={`custom-select-dropdown is-open ${dropdownPosition === 'top' ? 'position-top' : 'position-bottom'}`}>
          {searchable && options.length > 7 && (
            <div className="custom-select-search-box">
              <input
                ref={searchInputRef}
                type="text"
                className="custom-select-search-input"
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <ul className="custom-select-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  className={`custom-select-option ${String(option.value) === String(value) ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  <span>{option.label}</span>
                  {String(option.value) === String(value) && (
                    <svg
                      className="check-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              ))
            ) : (
              <li className="custom-select-empty">Tidak ada hasil</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
