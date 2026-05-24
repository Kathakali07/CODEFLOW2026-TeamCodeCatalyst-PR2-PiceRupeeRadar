const fs = require('fs');

async function download(url, filename) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
    }
  });
  if (!res.ok) throw new Error(`Unexpected response ${res.statusText} for ${url}`);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(filename, Buffer.from(buffer));
  console.log(`Saved ${filename} (${buffer.byteLength} bytes)`);
}

(async () => {
  try {
    await download("https://logo.clearbit.com/hdfcbank.com", "hdfc.png");
    await download("https://logo.clearbit.com/icicibank.com", "icici.png");
    await download("https://logo.clearbit.com/indiapost.gov.in", "indiapost.png");
  } catch (e) {
    console.error(e);
  }
})();
