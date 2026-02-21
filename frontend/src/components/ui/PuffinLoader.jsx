// Cloudspace-branded loading components for easy replacement of existing spinners
import React from "react";

// Main Cloudspace loader component - can replace most existing loading divs
export const PuffinLoader = ({
  size = "md",
  className = "",
  message = null,
  inline = false,
  fullHeight = false,
}) => {
  const sizeClasses = {
    xs: { icon: "h-6 w-6", spinner: "h-6 w-6" },
    sm: { icon: "h-8 w-8", spinner: "h-8 w-8" },
    md: { icon: "h-12 w-12", spinner: "h-12 w-12" },
    lg: { icon: "h-16 w-16", spinner: "h-16 w-16" },
    xl: { icon: "h-20 w-20", spinner: "h-20 w-20" },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  const spinnerContent = (
    <div
      className={`flex ${
        inline
          ? "flex-row items-center space-x-4"
          : "flex-col items-center justify-center space-y-4"
      } ${className}`}
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
      {message && (
        <div className={inline ? "" : "text-center"}>
          <p className="text-gray-600 font-medium">{message}</p>
        </div>
      )}
    </div>
  );

  if (fullHeight) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

// Quick replacement for common loading patterns
export const LoadingDiv = ({ className = "h-8 w-8", message = null }) => (
  <PuffinLoader
    size="sm"
    className={className.includes("h-") ? "" : className}
    message={message}
  />
);

// For replacing animate-spin divs directly
export const ReplacementSpinner = ({
  originalClassName = "",
  message = null,
  showIcon = true,
}) => {
  // Extract size from original className if possible
  let size = "sm";
  if (originalClassName.includes("h-12") || originalClassName.includes("w-12"))
    size = "md";
  if (originalClassName.includes("h-16") || originalClassName.includes("w-16"))
    size = "lg";
  if (originalClassName.includes("h-20") || originalClassName.includes("w-20"))
    size = "xl";
  if (originalClassName.includes("h-4") || originalClassName.includes("w-4"))
    size = "xs";

  if (!showIcon) {
    // Just return the original spinner style for cases where icon doesn't fit
    return <div className={originalClassName} />;
  }

  return <PuffinLoader size={size} message={message} />;
};

export default PuffinLoader;
