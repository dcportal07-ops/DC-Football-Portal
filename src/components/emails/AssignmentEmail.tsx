import * as React from 'react';
import { Html, Body, Container, Text, Link, Preview, Heading } from '@react-email/components';

export const AssignmentEmail = ({ playerName, coachName, taskTitle, link }: any) => (
  <Html>
    <Preview>New Homework Assigned: {taskTitle}</Preview>
    <Body style={{ backgroundColor: '#fff', fontFamily: 'sans-serif' }}>
      <Container style={{ margin: '0 auto', padding: '20px' }}>
        <Heading style={{ fontSize: '20px' }}>New Task Alert 🎯</Heading>
        <Text>Hey <strong>{playerName}</strong>,</Text>
        <Text>Coach <strong>{coachName}</strong> just assigned you a new homework task:</Text>
        
        <div style={{ padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '8px', margin: '20px 0' }}>
            <Text style={{ margin: 0, fontWeight: 'bold' }}>{taskTitle}</Text>
        </div>

        <Link href={link} style={{ color: '#2563eb', textDecoration: 'underline' }}>
          View Assignment & Video
        </Link>
      </Container>
    </Body>
  </Html>
);