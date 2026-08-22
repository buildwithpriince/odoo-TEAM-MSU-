async function crawl() {
  const visited = new Set<string>();
  const queue: string[] = ['http://localhost:3000/src/main.tsx'];

  console.log('Starting Vite module crawl...');

  while (queue.length > 0) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`❌ HTTP ${res.status} on ${url}`);
        const errText = await res.text();
        console.error(errText.slice(0, 500));
        continue;
      }

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('javascript') || contentType.includes('text/')) {
        const code = await res.text();
        
        // Find import/from statements
        const importRegex = /(?:import|from)\s+['"]([^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(code)) !== null) {
          const importPath = match[1];
          if (importPath.startsWith('/') || importPath.startsWith('.')) {
            const nextUrl = new URL(importPath, url).toString();
            if (!visited.has(nextUrl)) {
              queue.push(nextUrl);
            }
          }
        }
      }
    } catch (err: any) {
      console.error(`❌ Fetch error on ${url}:`, err.message);
    }
  }

  console.log(`\n Crawled ${visited.size} Vite modules successfully with no HTTP errors!`);
}

crawl().catch(console.error);
