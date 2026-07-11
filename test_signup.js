fetch('http://localhost:3000/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name: 'Test User', email: 'test1234@example.com', phone: '1234567890', password: 'password123' })
}).then(res => res.json()).then(console.log).catch(console.error);
