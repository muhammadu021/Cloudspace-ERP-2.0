import React from 'react';
import { cn } from '@/utils/cn';

const Alert = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      'relative w-full rounded-lg border p-4',
      {
        'bg-white border-gray-200': variant === 'default',
        'border-red-200 bg-red-50 text-red-800': variant === 'destructive',
        'border-yellow-200 bg-yellow-50 text-yellow-800': variant === 'warning',
        'border-green-200 bg-green-50 text-green-800': variant === 'success',
        'border-primary-200 bg-primary-50 text-blue-800': variant === 'info',
      },
      className
    )}
    {...props}
  />
));

Alert.displayName = 'Alert';

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));

AlertDescription.displayName = 'AlertDescription';

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));

AlertTitle.displayName = 'AlertTitle';

export { Alert, AlertDescription, AlertTitle };