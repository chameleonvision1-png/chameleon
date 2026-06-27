const http = require('http');
const puppeteer = require('puppeteer-core');

function getWebSocketDebuggerUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json/version', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.webSocketDebuggerUrl);
        } catch (e) {
          reject(new Error('Failed to parse WebSocket Debugger URL: ' + e.message));
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Fetching WebSocket debugger URL from Chrome...');
  let wsUrl;
  try {
    wsUrl = await getWebSocketDebuggerUrl();
    console.log('Connected to debugger URL:', wsUrl);
  } catch (e) {
    console.error('Error connecting to Chrome debugger. Make sure Chrome is open and debugging is enabled.');
    console.error(e.message);
    process.exit(1);
  }

  console.log('Connecting Puppeteer to Chrome...');
  const browser = await puppeteer.connect({
    browserWSEndpoint: wsUrl,
    defaultViewport: null // Keep user's default viewport
  });

  console.log('Opening a new tab...');
  const page = await browser.newPage();

  console.log('Navigating to http://sync.localhost:3000/...');
  await page.goto('http://sync.localhost:3000/', { waitUntil: 'networkidle2' });

  console.log('Waiting for the product list to load...');
  // Wait for the tools grid to be visible
  await page.waitForSelector('a[href*="/tool/"]', { timeout: 15000 });

  // Get the first link that is clickable (isAvailable)
  const productLinks = await page.$$('a[href*="/tool/"]');
  console.log(`Found ${productLinks.length} product links.`);

  if (productLinks.length === 0) {
    throw new Error('No available products found on the home page.');
  }

  // Click on the first product card
  console.log('Clicking on the first product card...');
  await Promise.all([
    page.evaluate(el => el.click(), productLinks[0]),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);

  console.log(`Successfully navigated to: ${page.url()}`);

  console.log('Waiting for the "Add to Cart" button...');
  // The button has text "أضف للسلة" or "Add to Cart"
  // Let's find a button that contains the cart icon or has the purchase class
  await page.waitForSelector('button', { timeout: 10000 });

  // Find the add to cart button using XPath or page.evaluate
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const addToCartBtn = buttons.find(btn => {
      const text = btn.textContent || '';
      return text.includes('أضف') || text.includes('Add') || text.includes('السلة') || text.includes('Cart');
    });
    if (addToCartBtn) {
      addToCartBtn.click();
      return true;
    }
    return false;
  });

  if (!clicked) {
    throw new Error('Could not find or click the "Add to Cart" button.');
  }
  console.log('Clicked "Add to Cart" button successfully!');

  console.log('Waiting for the Cart Drawer to open and display checkout button...');
  await page.waitForSelector('a[href="/checkout"]', { timeout: 10000 });
  console.log('Cart Drawer is open.');

  console.log('Clicking the "Checkout" / "إتمام الشراء" button...');
  await Promise.all([
    page.evaluate(() => {
      const checkoutLink = document.querySelector('a[href="/checkout"]');
      if (checkoutLink) checkoutLink.click();
    }),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);

  console.log(`Successfully navigated to checkout page: ${page.url()}`);
  console.log('Visual test complete! You should see the checkout screen open in Chrome.');

  // Disconnect from browser
  await browser.disconnect();
  console.log('Puppeteer disconnected.');
}

run().catch(console.error);
