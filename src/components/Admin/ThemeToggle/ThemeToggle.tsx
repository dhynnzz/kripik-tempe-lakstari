import './ThemeToggle.css';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle, className = '' }) => {
  return (
    <div
      className={`theme-toggle-pill ${isDark ? 'is-dark' : 'is-light'} ${className}`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      title={isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
    >
      <div className="toggle-inner">
        {/* Sliding Indicator Circle */}
        <div className={`sliding-thumb ${isDark ? 'thumb-dark' : 'thumb-light'}`}>
          {isDark ? (
            /* Moon Icon */
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          ) : (
            /* Sun Icon */
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          )}
        </div>

        {/* Faded Background Icon opposite */}
        <div className={`passive-icon ${isDark ? 'passive-light' : 'passive-dark'}`}>
          {isDark ? (
            /* Sun Icon (Faded) */
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line></svg>
          ) : (
            /* Moon Icon (Faded) */
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a202c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
