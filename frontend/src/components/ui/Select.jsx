import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown, Check } from 'lucide-react';

const SelectContext = createContext();

const Select = ({ value, onValueChange, defaultValue, children }) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [isOpen, setIsOpen] = useState(false);
  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <SelectContext.Provider value={{
      value: currentValue,
      onValueChange: handleValueChange,
      isOpen,
      setIsOpen
    }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const context = useContext(SelectContext);

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={() => context?.setIsOpen(!context?.isOpen)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
});

SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder, className, ...props }) => {
  const context = useContext(SelectContext);
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // This will be updated when SelectItem is selected
    const selectedItem = document.querySelector(`[data-value="${context?.value}"]`);
    if (selectedItem) {
      setDisplayValue(selectedItem.textContent);
    } else {
      setDisplayValue('');
    }
  }, [context?.value]);

  return (
    <span className={cn('block truncate', className)} {...props}>
      {displayValue || placeholder}
    </span>
  );
};

const SelectContent = ({ className, children, ...props }) => {
  const context = useContext(SelectContext);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        context?.setIsOpen(false);
      }
    };

    if (context?.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [context?.isOpen]);

  if (!context?.isOpen) return null;

  return (
    <div
      ref={ref}
      className={cn(
        'absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const SelectItem = ({ value, className, children, ...props }) => {
  const context = useContext(SelectContext);
  const isSelected = context?.value === value;

  return (
    <div
      data-value={value}
      className={cn(
        'relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-gray-100',
        isSelected && 'bg-primary-50 text-blue-900',
        className
      )}
      onClick={() => context?.onValueChange(value)}
      {...props}
    >
      <span className={cn('block truncate', isSelected && 'font-medium')}>
        {children}
      </span>
      {isSelected && (
        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary">
          <Check className="h-4 w-4" />
        </span>
      )}
    </div>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };