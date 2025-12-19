import { Input } from '@/components/ui/input';

interface HoneypotFieldProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Honeypot field component for bot detection.
 * This field is invisible to humans but bots will typically fill it out.
 * If this field has any value on submit, it's likely a bot.
 */
export function HoneypotField({ value, onChange }: HoneypotFieldProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '-9999px',
        opacity: 0,
        height: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <label htmlFor="website_url">Website URL</label>
      <Input
        type="text"
        id="website_url"
        name="website_url"
        autoComplete="off"
        tabIndex={-1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/**
 * Check if the honeypot was triggered (filled out by a bot)
 */
export function isHoneypotTriggered(value: string): boolean {
  return value.trim().length > 0;
}
