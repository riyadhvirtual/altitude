import { z } from 'zod';

const discordWebhookSchema = z.object({
  content: z.string().optional(),
  username: z.string().optional(),
  avatar_url: z.string().url().optional(),
  embeds: z
    .array(
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        color: z.number().optional(),
        fields: z
          .array(
            z.object({
              name: z.string(),
              value: z.string(),
              inline: z.boolean().optional(),
            })
          )
          .optional(),
        timestamp: z.string().optional(),
        footer: z
          .object({
            text: z.string(),
            icon_url: z.string().url().optional(),
          })
          .optional(),
        author: z
          .object({
            name: z.string(),
            icon_url: z.string().url().optional(),
          })
          .optional(),
      })
    )
    .optional(),
});

export type DiscordWebhookPayload = z.infer<typeof discordWebhookSchema>;

interface WebhookSendOptions {
  url: string;
  payload: DiscordWebhookPayload;
  retryCount?: number;
  timeout?: number;
}

export class WebhookError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: string
  ) {
    super(message);
    this.name = 'WebhookError';
  }
}

export async function sendDiscordWebhook({
  url,
  payload,
  retryCount = 3,
  timeout = 10000,
}: WebhookSendOptions): Promise<void> {
  const validatedPayload = discordWebhookSchema.parse(payload);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new WebhookError(
          `Discord webhook failed with status ${response.status}`,
          response.status,
          errorText
        );
      }

      return;
    } catch (error) {
      lastError = error as Error;

      if (
        error instanceof WebhookError &&
        error.status &&
        error.status >= 400 &&
        error.status < 500
      ) {
        throw error;
      }

      if (attempt < retryCount - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  throw new WebhookError(
    `Failed to send Discord webhook after ${retryCount} attempts: ${lastError?.message}`,
    lastError instanceof WebhookError ? lastError.status : undefined,
    lastError instanceof WebhookError ? lastError.response : undefined
  );
}

export function createDiscordEmbed({
  title,
  description,
  color = 0x3498db,
  fields = [],
  timestamp = new Date().toISOString(),
  footer,
  author,
}: {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  timestamp?: string;
  footer?: { text: string; icon_url?: string };
  author?: { name: string; icon_url?: string };
}) {
  return {
    title,
    description,
    color,
    fields,
    timestamp,
    footer,
    author,
  };
}
