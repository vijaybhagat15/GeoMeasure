import React from "react";

export default function ToolbarButton({
  active = false,
  onClick,
  icon = null,       
  label = "",        
  compact = false,   
  title,             
  className = "",
}) {
  const tooltip = title ?? label;

  return (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      aria-pressed={active}
      className={` inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-sans select-none transition-transform duration-150 ease-out shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400
        ${active
          ? "bg-blue-600 text-white border border-blue-700 shadow-md scale-[1.02]"
          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 active:scale-95"
        }
        ${className}
      `}
    >
      {icon ? (
        <span className="flex items-center justify-center w-5 h-5 flex-shrink-0" aria-hidden>
          {icon}
        </span>
      ) : null}

      {label ? (
        <span className={`${compact ? "sr-only" : "hidden sm:inline"} text-xs md:text-sm`}>
          {label}
        </span>
      ) : null}
    </button>
  );
}
