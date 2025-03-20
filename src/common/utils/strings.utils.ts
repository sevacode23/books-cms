/**
 * Build a proper tsquery string from an input phrase.
 * @param raw - The input phrase.
 * @returns The tsquery string.
 * @example toTsQuery("harry potter") => "harry & potter"
 */
export const toTsQuery = (raw: string): string => {
  const trimmed = raw.trim();

  if (!trimmed) {
    return '';
  }

  return trimmed.split(/\s+/).join(' & ');
};
