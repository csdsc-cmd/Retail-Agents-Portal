import { useState, useRef, useEffect } from 'react';
import { exportData, ExportFormat, ExportConfig } from '../../services/exportService';
import styles from './ExportButton.module.css';

interface ExportButtonProps {
  config: ExportConfig;
  className?: string;
}

export default function ExportButton({ config, className }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setIsOpen(false);

    try {
      await exportData(format, config);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`} ref={dropdownRef}>
      <button
        className={styles.button}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {isExporting ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            Exporting...
          </>
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="16"
              height="16"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="14"
              height="14"
              className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="menu">
          <button
            className={styles.option}
            onClick={() => handleExport('pdf')}
            role="menuitem"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM9 17H7v-5h2a2 2 0 0 1 0 4H8v1H7v-1h-.5V17H9zm-.5-2.5H8v-1h.5a.5.5 0 0 1 0 1zm4 2.5h-2v-5h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2zm0-4h-1v3h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1zm5-1v1h-2v1h1.5v1H15v2h-1v-5h3z"/>
            </svg>
            Export as PDF
          </button>
          <button
            className={styles.option}
            onClick={() => handleExport('excel')}
            role="menuitem"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-6-7l-2 4h1.5l1.25-2.5L14 19h1.5l-2-4 2-4H14l-1.25 2.5L11.5 11H10l2 4z"/>
            </svg>
            Export as Excel
          </button>
          <button
            className={styles.option}
            onClick={() => handleExport('csv')}
            role="menuitem"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15h2v2H8v-2zm0-4h2v2H8v-2zm4 4h4v2h-4v-2zm0-4h4v2h-4v-2z"/>
            </svg>
            Export as CSV
          </button>
        </div>
      )}
    </div>
  );
}
