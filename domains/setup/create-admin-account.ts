import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { users } from '@/db/schema';
import { authClient } from '@/lib/auth-client';
import { type DbErrorMappings, extractDbErrorMessage } from '@/lib/db-error';
import { extractErrorMessage } from '@/lib/error-handler';
import { OWNER_ROLE, stringifyRoles } from '@/lib/roles';

const ADMIN_CALLBACK_URL = '/setup';
const DEFAULT_ADMIN_CALLSIGN = 1;

interface AdminAccountData {
  email: string;
  name: string;
  password: string;
  discordUsername: string;
}

interface AuthResult {
  error?: {
    code?: string;
    message?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface SignUpParams {
  email: string;
  password: string;
  name: string;
  callsign: number;
  discordUsername: string;
  callbackURL?: string;
}

const dbErrorMappings: DbErrorMappings = {
  unique: {
    users_email_unique: 'An account with this email already exists',
    users_callsign_unique: 'This callsign is already taken',
    users_discord_username_unique: 'This Discord username is already taken',
  },
  fallback: 'Could not find user to promote to admin',
};

function isUserExistsError(error: unknown): boolean {
  const message = extractErrorMessage(error, '').toLowerCase();
  return (
    message.includes('already exists') ||
    message.includes('user_already_exists') ||
    message.includes('duplicate') ||
    message.includes('unique')
  );
}

async function promoteUserToAdmin(email: string): Promise<void> {
  try {
    const result = await db
      .update(users)
      .set({
        role: stringifyRoles([OWNER_ROLE]),
        verified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email));

    if (result.rowsAffected === 0) {
      throw new Error('Could not find user to promote to admin');
    }
  } catch (error) {
    const message = extractDbErrorMessage(error, dbErrorMappings);
    throw new Error(message);
  }
}

async function createUserAccount(data: AdminAccountData): Promise<AuthResult> {
  const signupParams: SignUpParams = {
    email: data.email,
    password: data.password,
    name: data.name,
    callsign: DEFAULT_ADMIN_CALLSIGN,
    discordUsername: data.discordUsername,
    callbackURL: ADMIN_CALLBACK_URL,
  };

  try {
    const result = await authClient.signUp.email(signupParams);
    return result as AuthResult;
  } catch (err) {
    const message = extractErrorMessage(err, 'Failed to create admin account');
    return { error: { message } };
  }
}

async function checkDatabaseSetup(): Promise<void> {
  try {
    await db.select().from(users).limit(1);
  } catch {
    throw new Error(
      'Database is not properly set up. Please run migrations first.'
    );
  }
}

export async function handleAdminAccountCreation(
  data: AdminAccountData
): Promise<void> {
  try {
    await checkDatabaseSetup();

    const { error: signUpError } = await createUserAccount(data);

    if (signUpError) {
      if (isUserExistsError(signUpError)) {
        await promoteUserToAdmin(data.email);
      } else {
        const message = extractErrorMessage(
          signUpError,
          'Failed to create admin account'
        );
        throw new Error(message);
      }
    } else {
      await promoteUserToAdmin(data.email);
    }
  } catch (error) {
    if (error instanceof Error) {
      const dbMessage = extractDbErrorMessage(error, dbErrorMappings);
      if (dbMessage !== dbErrorMappings.fallback) {
        throw new Error(dbMessage);
      }
    }
    throw error;
  }
}
