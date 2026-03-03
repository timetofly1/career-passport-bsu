import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchableSelectProps {
  options: string[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder: string;
  label?: string;
  multiple?: boolean;
  required?: boolean;
}

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  label,
  multiple = false,
  required = false,
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedArray = multiple
    ? (value as string[])
    : value
      ? [value as string]
      : [];

  const filtered = options.filter(o =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (item: string) => {
    if (multiple) {
      const arr = value as string[];
      const next = arr.includes(item) ? arr.filter(v => v !== item) : [...arr, item];
      onChange(next);
    } else {
      onChange(item);
      setOpen(false);
      setSearch('');
    }
  };

  const remove = (item: string) => {
    if (multiple) {
      onChange((value as string[]).filter(v => v !== item));
    } else {
      onChange('');
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          {label} {!required && <span className="text-muted-foreground font-normal">(optional)</span>}
        </label>
      )}

      {/* Selected chips for multi-select */}
      {multiple && selectedArray.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedArray.map(item => (
            <span
              key={item}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground"
            >
              {item}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); remove(item); }}
                className="hover:bg-primary-foreground/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Trigger / search input */}
      <div
        className={cn(
          "flex items-center h-12 w-full rounded-xl border bg-card px-3 cursor-pointer transition-all",
          open ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
        )}
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        <input
          ref={inputRef}
          type="text"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          placeholder={!multiple && selectedArray.length > 0 ? selectedArray[0] : placeholder}
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-border bg-popover shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">No results found</div>
          ) : (
            filtered.map(option => {
              const selected = selectedArray.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2.5 text-sm text-left transition-colors hover:bg-accent",
                    selected && "bg-accent/50 font-medium"
                  )}
                  onClick={() => toggle(option)}
                >
                  <span className={cn(
                    "w-4 h-4 shrink-0 rounded border flex items-center justify-center",
                    selected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                  )}>
                    {selected && <Check className="w-3 h-3" />}
                  </span>
                  <span className="truncate">{option}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
