import { type ClassValue, clsx } from 'clsx';
import crypto from 'crypto';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getResponsiveDialogStyles(
  isMobile: boolean,
  baseClasses = '',
  maxWidthClass = 'sm:max-w-2xl',
  mobileMode: 'sheet' | 'fit' = 'sheet'
) {
  // Mobile layout presets
  // sheet: fills the viewport vertically with top/bottom insets — great for long forms
  const mobileSheet =
    'top-12 bottom-12 w-auto max-w-[calc(100vw-2rem)] max-h-[calc(100svh-6rem)] overflow-y-auto rounded-md';

  // fit: centered on both axes and sized to content with safe side margins
  const mobileFit =
    'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bottom-auto w-full max-w-[calc(100vw-2rem)] max-h-[calc(100svh-8rem)] overflow-y-auto rounded-md';

  // Desktop: rely on centered positioning from DialogContent; only control sizing + rounding
  const desktopSizing = `${maxWidthClass} sm:w-full sm:max-h-[85vh] sm:rounded-lg`;

  const mobileClasses = mobileMode === 'fit' ? mobileFit : mobileSheet;
  const responsiveClasses = `${baseClasses} ${isMobile ? mobileClasses : desktopSizing}`;
  const className = responsiveClasses;
  const style = isMobile ? { borderRadius: 'var(--radius)' } : undefined;

  return { className, style };
}

export function getResponsiveCardStyles(
  isMobile: boolean,
  additionalClasses = ''
) {
  const baseClasses = additionalClasses;
  const className = isMobile ? baseClasses : `${baseClasses} rounded-md`;
  const style = isMobile ? { borderRadius: 'var(--radius)' } : undefined;

  return { className, style };
}

export function formatHoursMinutes(totalMinutes: number | null | undefined) {
  const minutes = totalMinutes ?? 0;

  if (!Number.isFinite(minutes) || minutes < 0) {
    return '0hrs 00m';
  }

  // Normalize to whole minutes to avoid decimals in output
  const whole = Math.round(minutes);
  const hrs = Math.floor(whole / 60);
  const mins = whole % 60;
  const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
  return `${hrs}hrs ${minsStr}m`;
}

export function formatFullCallsign(
  airline: string,
  user: string | number
): string {
  if (!airline || typeof airline !== 'string') {
    throw new Error('Invalid airline code');
  }

  if (user === null || user === undefined) {
    throw new Error('Invalid user identifier');
  }

  const sanitizedAirline = airline.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  const sanitizedUser = String(user).replace(/[^A-Z0-9]/gi, '');

  if (!sanitizedAirline || !sanitizedUser) {
    throw new Error('Invalid callsign components after sanitization');
  }

  return `${sanitizedAirline}${sanitizedUser}`;
}

export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*-_=+';

  const allChars = uppercase + lowercase + numbers + symbols;
  const categories = [uppercase, lowercase, numbers, symbols];

  if (length < 8 || length > 128) {
    throw new Error('Password length must be between 8 and 128 characters');
  }

  const getSecureRandomChar = (charset: string): string => {
    const randomBytes = crypto.randomBytes(1);
    const randomIndex = randomBytes[0] % charset.length;
    return charset[randomIndex];
  };

  let password = '';

  for (const category of categories) {
    password += getSecureRandomChar(category);
  }

  for (let i = password.length; i < length; i++) {
    password += getSecureRandomChar(allChars);
  }

  const passwordArray = password.split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const randomBytes = crypto.randomBytes(4);
    const randomIndex = randomBytes.readUInt32BE(0) % (i + 1);
    [passwordArray[i], passwordArray[randomIndex]] = [
      passwordArray[randomIndex],
      passwordArray[i],
    ];
  }

  return passwordArray.join('');
}

export function convertMinutesToTime(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) {
    return '00:00';
  }

  const cappedMinutes = Math.min(minutes, 1440);

  const hrs = Math.floor(cappedMinutes / 60);
  const mins = cappedMinutes % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function convertTimeToMinutes(time: string): number | null {
  if (typeof time !== 'string') {
    return null;
  }

  const match = time.match(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/);
  if (!match) {
    return null;
  }

  const hrs = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);

  if (hrs < 0 || hrs > 23 || mins < 0 || mins > 59) {
    return null;
  }

  return hrs * 60 + mins;
}

export function formatValue(
  value: string | number,
  format: 'number' | 'hours' | 'percentage'
): string {
  if (typeof value === 'string') {
    return value.replace(/[<>'"&]/g, '');
  }

  if (!Number.isFinite(value)) {
    return '0';
  }

  try {
    switch (format) {
      case 'number':
        return value.toLocaleString();
      case 'hours':
        return formatHoursMinutes(value);
      case 'percentage':
        return value % 1 === 0
          ? `${value.toLocaleString()}%`
          : `${value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
      default:
        return value.toString();
    }
  } catch {
    return '0';
  }
}

export function formatCompactNumber(num: number): string {
  if (!Number.isFinite(num)) {
    return '0';
  }

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1000000) {
    return `${sign}${(absNum / 1000000).toFixed(1)}M`;
  }
  if (absNum >= 1000) {
    return `${sign}${(absNum / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function formatPercentage(value: number, decimals: number = 1): string {
  if (!Number.isFinite(value)) {
    return '0%';
  }

  const validDecimals = Math.max(0, Math.min(10, Math.floor(decimals)));

  return value % 1 === 0 ? `${value}%` : `${value.toFixed(validDecimals)}%`;
}

export function formatChange(value: number, decimals: number = 1): string {
  if (!Number.isFinite(value)) {
    return '0%';
  }

  const validDecimals = Math.max(0, Math.min(10, Math.floor(decimals)));

  const absValue = Math.abs(value);
  const formattedValue =
    absValue % 1 === 0
      ? absValue.toLocaleString()
      : absValue.toLocaleString(undefined, {
          minimumFractionDigits: validDecimals,
          maximumFractionDigits: validDecimals,
        });

  if (value > 0) {
    return `+${formattedValue}%`;
  }
  if (value < 0) {
    return `-${formattedValue}%`;
  }
  return '0%';
}

export function assignDefined<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined) {
      (target as Record<string, unknown>)[key] = value as unknown;
    }
  }
  return target;
}

export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) {
    return '0m';
  }

  const cappedMinutes = Math.min(minutes, 525600);

  if (cappedMinutes < 60) {
    return `${cappedMinutes}m`;
  }

  const hours = Math.floor(cappedMinutes / 60);
  const remainingMinutes = cappedMinutes % 60;

  if (hours < 24) {
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (remainingHours > 0) {
    return `${days}d ${remainingHours}h`;
  }

  return `${days}d`;
}

export function safeParseNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function getWelcomeMessage(): string {
  const messages = [
    'Ready to soar through the skies?',
    'Welcome back! Ready for another flight?',
    "Good to see you. How's the flying going?",
    'Ready to take to the skies?',
    'Welcome back. Time for some aviation adventures?',
    'Ready to conquer the skies?',
    "Wings up! Let's get flying",
    'Your cockpit awaits. Ready for departure?',
    "Clear skies ahead, let's make it a great flight",
    'Welcome aboard, captain',
    'Preflight checks complete. Ready for action?',
    'Another day, another adventure in the sky',
    "Let's log some more hours in the air",
    'The runway is clear. Ready for takeoff?',
    "Strap in—it's time to fly",
  ];

  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

// Abbreviates and safely truncates verbose airport names to avoid layout issues
// - Replaces common terms (International -> Intl, Airport -> AP, etc.)
// - Drops long descriptors after a spaced hyphen ("City - Long Name" -> "City")
// - Removes parenthetical suffixes
// - Ellipsizes if still longer than the provided max length
export function shortenAirportName(
  name: string,
  maxLength: number = 32
): string {
  const original = typeof name === 'string' ? name.trim() : '';
  if (!original) {
    return '';
  }

  // Prefer the city/name before a spaced hyphen which often carries long honorifics
  let result = original.includes(' - ')
    ? original.split(' - ')[0]!.trim()
    : original;

  // Remove parenthetical sections
  result = result.replace(/\s*\([^)]*\)\s*/g, ' ').trim();

  // Common aviation terms -> shorter forms
  const replacements: Array<[RegExp, string]> = [
    [/\bIntercontinental\b/gi, 'Intl'],
    [/\bInternational\b/gi, 'Intl'],
    [/\bAirport\b/gi, 'AP'],
    [/\bRegional\b/gi, 'Reg'],
    [/\bMunicipal\b/gi, 'Muni'],
    [/\bNational\b/gi, 'Natl'],
  ];

  for (const [re, sub] of replacements) {
    result = result.replace(re, sub);
  }

  // Trim redundant trailing AP if it still exceeds max later we'll ellipsize anyway
  result = result.replace(/\s+AP$/i, '');

  // Collapse duplicate spaces
  result = result.replace(/\s{2,}/g, ' ').trim();

  if (result.length > maxLength) {
    // Avoid cutting mid‑word when possible
    const slice = result.slice(0, Math.max(0, maxLength - 1));
    const lastSpace = slice.lastIndexOf(' ');
    const safe = lastSpace > 12 ? slice.slice(0, lastSpace) : slice; // keep reasonable chunk
    return `${safe.trim()}…`;
  }

  return result;
}
