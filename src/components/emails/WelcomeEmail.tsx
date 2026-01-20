import * as React from 'react';
import {
  Html, Body, Container, Text, Link, Preview, Section, Heading, Hr, Img
} from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
  role: string;
  email: string;
  password?: string; // Optional: Only if you auto-generate passwords
  loginUrl: string;
}

export const WelcomeEmail = ({ name, role, email, password, loginUrl }: WelcomeEmailProps) => (
  <Html>
    <Preview>Welcome to the Portal - Your Login Details</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to the Team, {name}!</Heading>
        <Text style={text}>
          You have been invited to join the <strong>DCway Portal</strong> as a <span style={{textTransform:'capitalize'}}>{role}</span>.
        </Text>
        
        <Section style={box}>
          <Text style={paragraph}><strong>Your Login Credentials:</strong></Text>
          <Hr style={hr} />
          <Text style={paragraph}>Email: <strong>{email}</strong></Text>
          {password && (
             <Text style={paragraph}>Temporary Password: <strong>{password}</strong></Text>
          )}
        </Section>

        <Section style={btnContainer}>
          <Link href={loginUrl} style={button}>
            Login to Portal
          </Link>
        </Section>
        
        <Text style={footer}>
          Please change your password after logging in for the first time.
        </Text>
      </Container>
    </Body>
  </Html>
);

// --- Simple Styles ---
const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' };
const container = { margin: '0 auto', padding: '20px 0 48px', width: '580px' };
const h1 = { color: '#333', fontSize: '24px', fontWeight: 'bold', paddingTop: '32px' };
const text = { color: '#525f7f', fontSize: '16px', lineHeight: '26px' };
const box = { padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e6ebf1', marginTop: '20px' };
const paragraph = { fontSize: '16px', lineHeight: '24px', color: '#525f7f' };
const hr = { borderColor: '#e6ebf1', margin: '20px 0' };
const btnContainer = { textAlign: 'center' as const, marginTop: '32px' };
const button = { backgroundColor: '#000', borderRadius: '5px', color: '#fff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const, display: 'block', padding: '12px 24px' };
const footer = { color: '#8898aa', fontSize: '12px', lineHeight: '16px', marginTop: '30px', textAlign: 'center' as const };