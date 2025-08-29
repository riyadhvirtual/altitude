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

interface ApplicationApprovedEmailProps {
  userName: string;
  airlineName: string;
  dashboardUrl?: string;
}

export const ApplicationApprovedEmail: React.FC<
  ApplicationApprovedEmailProps
> = ({ userName, airlineName, dashboardUrl = '#' }) => {
  const previewText = `Welcome aboard ${airlineName}! Your pilot application has been approved.`;

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
            Your application has been approved
          </Heading>

          <Text style={{ fontSize: '16px', margin: '0 0 12px 0' }}>
            Hi {userName},
          </Text>

          <Text style={{ fontSize: '16px', margin: '0 0 12px 0' }}>
            Welcome aboard! We&apos;re excited to have you as part of{' '}
            <strong>{airlineName}</strong>, ready to soar to new heights
            together.
          </Text>

          <Text style={{ fontSize: '16px', margin: '0 0 20px 0' }}>
            You can now access your dashboard and begin flying with us.
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
              Access Your Dashboard
            </span>
          </Button>

          <Text style={{ fontSize: '14px' }}>
            If you ever have any questions, feel free to reach out to our crew.
          </Text>

          <Text style={{ fontSize: '14px', margin: '0' }}>
            Fly safe,
            <br />
            <strong>{airlineName}</strong>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
