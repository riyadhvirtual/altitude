import React from 'react';

import { getAirline } from '@/db/queries/airline';
import {
  ApplicationApprovedEmail,
  InactivityNotificationEmail,
  PasswordResetEmail,
} from '@/emails';

import { sendReactEmail } from './smtp';

export async function sendApplicationApprovedEmail(
  userEmail: string,
  userName: string
) {
  const airline = await getAirline();
  if (!airline) {
    throw new Error('Airline not found');
  }

  return sendReactEmail(
    userEmail,
    `Your application to ${airline.name} has been approved!`,
    React.createElement(ApplicationApprovedEmail, {
      userName,
      airlineName: airline.name,
    })
  );
}

export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetUrl: string
) {
  const airline = await getAirline();
  if (!airline) {
    throw new Error('Airline not found');
  }

  return sendReactEmail(
    userEmail,
    `Password reset for ${airline.name}`,
    React.createElement(PasswordResetEmail, {
      userName,
      resetUrl,
      airlineName: airline.name,
    })
  );
}

export async function sendInactivityNotificationEmail(
  userEmail: string,
  userName: string,
  inactivityPeriod: number
) {
  const airline = await getAirline();
  if (!airline) {
    throw new Error('Airline not found');
  }

  const baseUrl = process.env.BETTER_AUTH_URL || '';
  const dashboardUrl = `${baseUrl}/dashboard`;
  const leaveRequestUrl = `${baseUrl}/leave`;

  return sendReactEmail(
    userEmail,
    `We miss seeing you in the skies - ${airline.name}`,
    React.createElement(InactivityNotificationEmail, {
      userName,
      airlineName: airline.name,
      inactivityPeriod,
      dashboardUrl,
      leaveRequestUrl,
    })
  );
}
