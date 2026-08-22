async function check() {
  const res = await fetch('http://localhost:3000/');
  console.log('GET / status:', res.status);
  const text = await res.text();
  console.log('HTML snippet:\n', text.slice(0, 500));

  const mainJsRes = await fetch('http://localhost:3000/src/main.tsx');
  console.log('GET /src/main.tsx status:', mainJsRes.status);

  const appJsRes = await fetch('http://localhost:3000/src/App.tsx');
  console.log('GET /src/App.tsx status:', appJsRes.status);
}
check().catch(console.error);
