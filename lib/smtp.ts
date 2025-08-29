import { render } from '@react-email/render';
import nodemailer from 'nodemailer';
import type { ReactElement } from 'react';

import { getAirline } from '@/db/queries/airline';
import type { Airline } from '@/db/schema';

import { decrypt } from './encryption';

const usesAltitudeSubdomain =
  process.env.TENANT_USES_ALTITUDE_SUBDOMAIN === 'true';

export function createSmtpTransporter(airline: Airline) {
  if (usesAltitudeSubdomain) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const username = process.env.SMTP_USERNAME;
    const password = process.env.SMTP_PASSWORD;

    if (!host || !port || !username || !password) {
      throw new Error('Missing SMTP configuration in environment');
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: username,
        pass: password,
      },
    });
  }

  if (
    !airline.smtpHost ||
    !airline.smtpPort ||
    !airline.smtpUsername ||
    !airline.smtpPassword
  ) {
    throw new Error('Missing SMTP configuration in airline');
  }

  let password = airline.smtpPassword;
  if (password && password.includes(':')) {
    try {
      password = decrypt(password);
    } catch {
      throw new Error('Invalid SMTP password encryption');
    }
  }

  return nodemailer.createTransport({
    host: airline.smtpHost,
    port: airline.smtpPort,
    secure: airline.smtpSecure ?? true,
    auth: {
      user: airline.smtpUsername,
      pass: password,
    },
  });
}

export async function sendReactEmail(
  to: string | string[],
  subject: string,
  emailComponent: ReactElement
) {
  const airline = await getAirline();
  if (!airline) {
    throw new Error('Airline not found');
  }

  const fromEmail = usesAltitudeSubdomain
    ? process.env.SMTP_FROM_EMAIL
    : airline.smtpFromEmail;
  const fromName = airline.smtpFromName || airline.name;

  if (!fromEmail || !fromName) {
    throw new Error('Missing from email or name in configuration');
  }

  const transporter = createSmtpTransporter(airline);
  const html = await render(emailComponent);

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
}

export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string
) {
  const airline = await getAirline();
  if (!airline) {
    throw new Error('Airline not found');
  }

  const fromEmail = usesAltitudeSubdomain
    ? process.env.SMTP_FROM_EMAIL
    : airline.smtpFromEmail;
  const fromName = airline.smtpFromName || airline.name;

  if (!fromEmail || !fromName) {
    throw new Error('Missing from email or name in configuration');
  }

  const transporter = createSmtpTransporter(airline);

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
}

export async function verifySmtpConnection() {
  const airline = await getAirline();
  if (!airline) {
    return { success: false, error: 'Airline not found' };
  }

  try {
    const transporter = createSmtpTransporter(airline);
    await transporter.verify();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
