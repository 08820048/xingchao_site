/** 星潮标志：一弯潮线托起一颗四角星。纯几何，单色，任何尺寸都清晰。 */
export function Mark({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="currentColor">
      <path d="M16 1.5c.9 5.4 3.3 8.1 8.6 9-5.3.9-7.7 3.6-8.6 9-.9-5.4-3.3-8.1-8.6-9 5.3-.9 7.7-3.6 8.6-9Z" />
      <path d="M2 21.5c3.2 3.6 7.1 5.4 12 5.4 5.6 0 10.2-2.6 13.7-7.8-3.4 2.2-6.4 3.1-9.4 2.7-3.1-.4-5-1.9-7-3.6C8.6 16.3 5.6 17 2 21.5Z" />
    </svg>
  );
}
