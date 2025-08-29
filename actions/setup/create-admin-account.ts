'use server';

import { z } from 'zod';

import { handleAdminAccountCreation } from '@/domains/setup/create-admin-account';
import { extractDbErrorMessage } from '@/lib/db-error';
import { actionClient } from '@/lib/safe-action';

const createAdminAccountSchema = z.object({
  email: z
    .string()
    .trim()
    .max(255, 'Email must be less than 255 characters')
    .pipe(z.email('Invalid email format')),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  discordUsername: z
    .string()
    .min(2, 'Discord username must be at least 2 characters')
    .max(32, 'Discord username must be at most 32 characters')
    .regex(
      /^(?!.*[._]{2})(?!.*[_.]{2})(?!.*[_.]$)(?!^[_.])[a-z0-9._]+$/,
      'Invalid Discord username format'
    ),
});

export const createAdminAccountAction = actionClient
  .inputSchema(createAdminAccountSchema)
  .action(async ({ parsedInput }) => {
    const { email, name, password, discordUsername } = parsedInput;

    try {
      await handleAdminAccountCreation({
        email,
        name,
        password,
        discordUsername,
      });

      return {
        success: true,
        message: 'Admin account created successfully',
      };
    } catch (error) {
      const errorMessage = extractDbErrorMessage(error, {
        // This should never happen, but helpful when debugging
        unique: {
          users_email_unique: 'An account with this email already exists',
          users_callsign_unique: 'This callsign is already taken',
          users_discord_username_unique:
            'This Discord username is already taken',
        },
        fallback: 'Failed to create admin account',
      });

      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      };
    }
  });
