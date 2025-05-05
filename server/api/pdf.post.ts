import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Use local Chrome when developing locally
const isDev = process.env.NODE_ENV === 'development';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const pdfName = `evidencia-${body.id}.pdf`;

  let browser;
  try {
    const launchOptions = {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
      headless: 'new',
      ignoreDefaultArgs: ['--disable-extensions'],
    };

    // Use local Chrome executable when in development
    if (isDev) {
      launchOptions.executablePath = getChromePath();
    } else {
      // Use @sparticuz/chromium for production (Vercel)
      launchOptions.args = [...chromium.args, ...launchOptions.args];
      launchOptions.executablePath = await chromium.executablePath();
    }

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    await page.goto(
      `https://forms.healthystartgroup.com/pdf?submission=${body.id}`,
      {
        waitUntil: 'networkidle0',
        timeout: 60000,
      }
    );

    await page.waitForSelector('#report-content', { timeout: 10000 });
    await page.$$eval('[id^="report-content"]', (elms) =>
      elms.map((elm) => elm.innerHTML)
    );

    const selectorToRemove = '.noshow-pdf';
    await page.evaluate((sel) => {
      const elements = document.querySelectorAll(sel);
      for (let i = 0; i < elements.length; i++) {
        elements[i].parentNode.removeChild(elements[i]);
      }
    }, selectorToRemove);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      pageRanges: '1',
      printBackground: true,
    });

    return {
      ok: true,
      pdf: Buffer.from(pdfBuffer).toString('base64'),
      filename: pdfName,
    };
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'PDF generation failed',
    });
  } finally {
    if (browser) await browser.close();
  }
});

// Helper function to get local Chrome path
function getChromePath() {
  if (process.platform === 'win32') {
    return 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
  } else if (process.platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  } else {
    return '/usr/bin/google-chrome';
  }
}