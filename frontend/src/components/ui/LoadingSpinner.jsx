// Loading spinner components
import React from "react";

export const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClasses[size]} ${className}`}
    />
  );
};

// Cloudspace-branded loading spinner with icon
export const PuffinSpinner = ({
  size = "md",
  className = "",
  showText = false,
  text = "Loading...",
}) => {
  const sizeClasses = {
    sm: { icon: "h-8 w-8", spinner: "h-8 w-8" },
    md: { icon: "h-12 w-12", spinner: "h-12 w-12" },
    lg: { icon: "h-16 w-16", spinner: "h-16 w-16" },
    xl: { icon: "h-20 w-20", spinner: "h-20 w-20" },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-8 ${className}`}
    >
      <div className="relative p-2">
        <img
          src="/icon.png"
          alt="Cloudspace Icon"
          className={`${currentSize.icon} opacity-80`}
        />
        <div
          className={`absolute inset-0 m-2 animate-spin rounded-full border-b-2 border-primary ${currentSize.spinner}`}
        ></div>
      </div>
      {showText && (
        <div className="text-center">
          <p className="text-gray-600 font-medium">{text}</p>
        </div>
      )}
    </div>
  );
};

// Enhanced page loader with Cloudspace branding
export const PageLoader = ({
  message = "Loading...",
  usePuffin = true,
  subtitle = null,
}) => {
  if (usePuffin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
        <PuffinSpinner size="lg" />
        <div className="text-center">
          <p className="text-gray-600 font-medium text-lg">{message}</p>
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};

// Inline Cloudspace spinner for smaller spaces
export const InlinePuffinSpinner = ({ size = "sm", text = null }) => (
  <div className="flex items-center justify-center space-x-4">
    <PuffinSpinner size={size} />
    {text && <span className="text-gray-600">{text}</span>}
  </div>
);

// Card loading state with Cloudspace branding
export const CardLoader = ({ message = "Loading...", height = "h-64" }) => (
  <div
    className={`${height} flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200`}
  >
    <PuffinSpinner size="md" />
    <p className="mt-6 text-gray-500 text-sm">{message}</p>
  </div>
);

export default LoadingSpinner;
