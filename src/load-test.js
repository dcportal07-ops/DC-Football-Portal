import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  
    { duration: '1m', target: 50 },   
    { duration: '10s', target: 0 },   
  ],
};

export default function () {
  // Replace with your local or live URL
  const res = http.post('http://localhost:3000/list/messages'); 

  check(res, {
    'status is 200': (r) => r.status === 200, // Ensure server responds OK
    'duration < 500ms': (r) => r.timings.duration < 500, // Ensure it's fast
  });

  sleep(4); // Simulate the 4-second polling interval
}