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

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  airlineName: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  userName,
  resetUrl,
  airlineName,
}) => {
  const previewText = `Reset your password for ${airlineName}`;

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
            Reset your password
          </Heading>

          <Text style={{ fontSize: '16px', margin: '0 0 12px 0' }}>
            Hi {userName},
          </Text>

          <Text style={{ fontSize: '16px', margin: '0 0 12px 0' }}>
            We received a request to reset your password for your{' '}
            <strong>{airlineName}</strong> account.
          </Text>

          <Text style={{ fontSize: '16px', margin: '0 0 20px 0' }}>
            Click the button below to reset your password:
          </Text>

          <Button
            href={resetUrl}
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
              Reset Password
            </span>
          </Button>

          <Text style={{ fontSize: '14px', margin: '20px 0 12px 0' }}>
            <strong>Important security information:</strong>
          </Text>

          <Text style={{ fontSize: '14px', margin: '0 0 12px 0' }}>
            • This link will expire in 1 hour for your security
          </Text>

          <Text style={{ fontSize: '14px', margin: '0 0 12px 0' }}>
            • Do not share this link with anyone
          </Text>

          <Text style={{ fontSize: '14px', margin: '0 0 12px 0' }}>
            • If you didn&apos;t request this password reset, please ignore this
            email
          </Text>

          <Text style={{ fontSize: '14px', margin: '20px 0 12px 0' }}>
            If you&apos;re having trouble clicking the button, copy and paste
            the URL below into your web browser:
          </Text>

          <Text
            style={{
              fontSize: '12px',
              margin: '0 0 20px 0',
              wordBreak: 'break-all',
              color: '#666666',
            }}
          >
            {resetUrl}
          </Text>

          <Text style={{ fontSize: '14px', margin: '0' }}>
            Stay secure,
            <br />
            <strong>{airlineName}</strong>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
