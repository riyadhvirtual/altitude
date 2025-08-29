export type DbErrorMappings = {
  // Map of substring -> friendly message for unique/duplicate errors
  unique?: Record<string, string>;
  // Friendly message when a generic FK / CHECK / other constraint breaks
  constraint?: string;
  // Friendly message for reference/dependency errors
  reference?: string;
  // Friendly message for NOT-NULL violations
  notNull?: string;
  // Fallback message when nothing matched
  fallback?: string;
};

/**
 * Normalised database error handler
 *
 * It inspects the error message coming from the database/driver and throws a
 * new Error containing a user-friendly message based on the provided mapping
 * The function always throws; its return type is `never` so TypeScript knows
 * execution will not continue past this call
 */
/**
 * Extract a user-friendly error message from a database error without throwing
 * Returns the error message that would be thrown by handleDbError
 */
export function extractDbErrorMessage(
  error: unknown,
  map: DbErrorMappings
): string {
  // If we somehow received a non-Error value, fall back immediately.
  if (!(error instanceof Error)) {
    return map.fallback ?? 'Unexpected database error';
  }

  const msg = error.message.toLowerCase();

  // Check for nested cause error (for sqlite)
  let causeMsg = '';
  if (error.cause && error.cause instanceof Error) {
    causeMsg = error.cause.message.toLowerCase();
  }

  // Unique / duplicate violations
  if (
    msg.includes('unique') ||
    msg.includes('duplicate') ||
    causeMsg.includes('unique') ||
    causeMsg.includes('duplicate')
  ) {
    if (map.unique) {
      const combinedMsg = (msg + ' ' + causeMsg).toLowerCase();

      // First, try to find specific constraint failure patterns
      for (const [substr, friendly] of Object.entries(map.unique)) {
        const constraintName = substr.toLowerCase();

        // Look for specific constraint failure pattern: "constraint failed: constraint_name"
        const constraintPattern = `constraint failed: ${constraintName}`;

        if (combinedMsg.includes(constraintPattern)) {
          return friendly;
        }
      }

      // Fallback: look for field names in constraint context only
      for (const [substr, friendly] of Object.entries(map.unique)) {
        const fieldName = substr.toLowerCase();

        // Only match if the field appears after "failed:" to avoid SQL query matches
        const failedIndex = combinedMsg.indexOf('failed:');
        if (failedIndex !== -1) {
          const constraintPart = combinedMsg.substring(failedIndex);

          if (
            constraintPart.includes(`.${fieldName}`) ||
            constraintPart.includes(`${fieldName}_`)
          ) {
            return friendly;
          }
        }
      }
    }
    return map.fallback ?? 'Record already exists';
  }

  // Foreign-key / general constraint violations
  if (msg.includes('foreign key') || msg.includes('constraint')) {
    return map.constraint ?? map.fallback ?? 'Violates a database constraint';
  }

  // Reference / dependency violations
  if (msg.includes('reference') || msg.includes('dependent')) {
    return (
      map.reference ??
      map.fallback ??
      'Violates a database reference/dependency'
    );
  }

  // NOT NULL violations
  if (msg.includes('not null')) {
    return map.notNull ?? map.fallback ?? 'Required information is missing';
  }

  // Nothing matched – fall back
  return map.fallback ?? 'Database operation failed';
}

export function handleDbError(error: unknown, map: DbErrorMappings): never {
  // If we somehow received a non-Error value, fall back immediately.
  if (!(error instanceof Error)) {
    throw new Error(map.fallback ?? 'Unexpected database error');
  }

  const msg = error.message.toLowerCase();

  // Unique / duplicate violations
  if (msg.includes('unique') || msg.includes('duplicate')) {
    if (map.unique) {
      for (const [substr, friendly] of Object.entries(map.unique)) {
        if (msg.includes(substr.toLowerCase())) {
          throw new Error(friendly);
        }
      }
    }
    throw new Error(map.fallback ?? 'Record already exists');
  }

  // Foreign-key / general constraint violations
  if (msg.includes('foreign key') || msg.includes('constraint')) {
    throw new Error(
      map.constraint ?? map.fallback ?? 'Violates a database constraint'
    );
  }

  // Reference / dependency violations
  if (msg.includes('reference') || msg.includes('dependent')) {
    throw new Error(
      map.reference ??
        map.fallback ??
        'Violates a database reference/dependency'
    );
  }

  // NOT NULL violations
  if (msg.includes('not null')) {
    throw new Error(
      map.notNull ?? map.fallback ?? 'Required information is missing'
    );
  }

  // Nothing matched – fall back
  throw new Error(map.fallback ?? 'Database operation failed');
}
