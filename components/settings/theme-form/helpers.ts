import { fileUrl } from '@/lib/urls';

export const resolveHref = (value: string): string => {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  if (value.startsWith('/styles/')) {
    return value;
  }
  if (value.startsWith('/')) {
    return fileUrl(value);
  }
  return `/styles/${value}.css`;
};

export const parseCssVars = (css: string): Record<string, string> => {
  const vars: Record<string, string> = {};
  const rootMatch = css.match(/:root\s*\{([\s\S]*?)\}/);
  const block = rootMatch ? rootMatch[1] : css;
  const re = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) {
    vars[m[1]] = m[2].trim();
  }
  return vars;
};
