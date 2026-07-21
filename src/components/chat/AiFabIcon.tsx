/** Distinct AI assistant icon for the floating button (not WhatsApp, not a photo avatar). */
export function AiFabIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 3l1.2 3.6L17 7.8l-3.6 1.2L12 12.6 10.6 9l-3.6-1.2 3.8-1.2L12 3z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M5 4.5l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1z"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M6.5 14.5c0-2.76 2.46-5 5.5-5h.5c3.04 0 5.5 2.24 5.5 5v1.5c0 .83-.67 1.5-1.5 1.5h-1.05l-1.45 2.18a.75.75 0 0 1-1.24 0L11.55 17.5H8c-.83 0-1.5-.67-1.5-1.5v-1.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="15.5" r="0.75" fill="currentColor" />
      <circle cx="12" cy="15.5" r="0.75" fill="currentColor" />
      <circle cx="14.5" cy="15.5" r="0.75" fill="currentColor" />
    </svg>
  );
}
