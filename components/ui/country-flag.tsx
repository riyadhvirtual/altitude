interface CountryFlagProps {
  countryCode: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  alt?: string;
}

export function CountryFlag({
  countryCode,
  className = '',
  size = 'md',
  alt,
}: CountryFlagProps) {
  const sizeClasses = {
    sm: 'h-6 w-9',
    md: 'h-9 w-15',
    lg: 'h-12 w-18',
  };

  const flagUrl = `https://kapowaz.github.io/circle-flags/flags/${countryCode.toLowerCase()}.svg`;
  const defaultAlt = `Flag of ${countryCode.toUpperCase()}`;

  return (
    <span
      className={`${sizeClasses[size]} relative flex-shrink-0 ${className}`}
    >
      <img
        src={flagUrl}
        alt={alt || defaultAlt}
        className="object-contain rounded-sm shadow-sm w-full h-full"
        loading="lazy"
      />
    </span>
  );
}
