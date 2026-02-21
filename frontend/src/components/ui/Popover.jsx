import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

const PopoverContext = createContext();

const Popover = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

const PopoverTrigger = ({ asChild, children, ...props }) => {
  const context = useContext(PopoverContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e) => {
        children.props.onClick?.(e);
        context?.setIsOpen(!context?.isOpen);
      }
    });
  }

  return (
    <button
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        context?.setIsOpen(!context?.isOpen);
      }}
    >
      {children}
    </button>
  );
};

const PopoverContent = ({ className, align = 'center', side = 'bottom', children, ...props }) => {
  const context = useContext(PopoverContext);
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

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0'
  };

  const sideClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2'
  };

  return (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-900 shadow-md',
        alignmentClasses[align],
        sideClasses[side],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Popover, PopoverTrigger, PopoverContent };