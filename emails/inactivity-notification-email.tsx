import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface InactivityNotificationEmailProps {
  userName: string;
  airlineName: string;
  inactivityPeriod: number;
  dashboardUrl?: string;
  leaveRequestUrl?: string;
}

export const InactivityNotificationEmail: React.FC<
  InactivityNotificationEmailProps
> = ({
  userName,
  airlineName,
  inactivityPeriod,
  dashboardUrl = '#',
  leaveRequestUrl = '#',
}) => {
  const previewText = `We noticed you haven't flown with ${airlineName} recently`;

  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <style>
          {`
            @media (prefers-color-scheme: dark) {
              body, html {
                background-color: #ffffff !important;
                color: #000000 !important;
              }
              a {
                color: #000000 !important;
              }
            }
          `}
        </style>
      </Head>

      <Preview>{previewText}</Preview>

      <Body
        style={{
          backgroundColor: '#ffffff',
          color: '#000000',
          fontFamily: 'Helvetica, Arial, sans-serif',
          padding: '40px 20px',
        }}
      >
        <Container
          style={{
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          <Heading style={{ fontSize: '24px', marginBottom: '16px' }}>
            We miss seeing you in the skies
          </Heading>

          <Text style={{ fontSize: '16px', margin: '0 0 12px 0' }}>
            Hi {userName},
          </Text>

          <Text style={{ fontSize: '16px', margin: '0 0 12px 0' }}>
            We noticed you haven&apos;t logged any flights with{' '}
            <strong>{airlineName}</strong> in the last {inactivityPeriod} days.
          </Text>

          <Text style={{ fontSize: '16px', margin: '0 0 12px 0' }}>
            We understand life gets busy, but we wanted to reach out and remind
            you that your spot in our virtual skies is always waiting for you!
          </Text>

          <Text style={{ fontSize: '16px', margin: '0 0 20px 0' }}>
            Here&apos;s what you can do to stay active:
          </Text>

          <Text style={{ fontSize: '16px', margin: '0 0 8px 0' }}>
            • <strong>Log a flight</strong> - Jump back into the cockpit and
            file a new PIREP
          </Text>

          <Text style={{ fontSize: '16px', margin: '0 0 20px 0' }}>
            • <strong>Request leave</strong> - If you&apos;ll be away for a
            while, let us know so we can keep you active
          </Text>

          <Button
            href={dashboardUrl}
            style={{
              backgroundColor: '#000000',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-block',
              textAlign: 'center',
              marginRight: '12px',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '16px',
                WebkitTextFillColor: '#ffffff',
              }}
            >
              View Dashboard
            </span>
          </Button>

          <Button
            href={leaveRequestUrl}
            style={{
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-block',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                color: '#000000',
                fontWeight: 'bold',
                fontSize: '16px',
                WebkitTextFillColor: '#000000',
              }}
            >
              Request Leave
            </span>
          </Button>

          <Text style={{ fontSize: '14px', margin: '20px 0 12px 0' }}>
            <strong>About inactivity:</strong>
          </Text>

          <Text style={{ fontSize: '14px', margin: '0 0 12px 0' }}>
            • Users who don&apos;t fly for {inactivityPeriod} consecutive days
            may be considered inactive
          </Text>

          <Text style={{ fontSize: '14px', margin: '0 0 12px 0' }}>
            • Approved leave requests pause the inactivity timer
          </Text>

          <Text style={{ fontSize: '14px', margin: '0 0 12px 0' }}>
            • We send these reminders to help you stay connected with our
            community
          </Text>

          <Text style={{ fontSize: '14px' }}>
            If you have any questions or need assistance, don&apos;t hesitate to
            reach out to our crew.
          </Text>

          <Text style={{ fontSize: '14px', margin: '0' }}>
            Happy flying,
            <br />
            <strong>{airlineName}</strong>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
