import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

const isDev = process.env.NODE_ENV === 'development'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const url = `${config.public.baseUrl}/docs-print`

  let browser
  try {
    const baseArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ]

    const launchOptions: Parameters<typeof puppeteer.launch>[0] = {
      args: baseArgs,
      headless: true,
      ignoreDefaultArgs: ['--disable-extensions'],
    }

    if (isDev) {
      launchOptions.executablePath = getChromePath()
    } else {
      launchOptions.args = [...chromium.args, ...baseArgs]
      launchOptions.executablePath = await chromium.executablePath()
    }

    browser = await puppeteer.launch(launchOptions)
    const page = await browser.newPage()
    await page.setViewport({ width: 794, height: 1123 })

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: false,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })

    setResponseHeader(event, 'Content-Type', 'application/pdf')
    setResponseHeader(event, 'Content-Disposition', 'attachment; filename="hsg-forms-documentation.pdf"')
    setResponseHeader(event, 'Cache-Control', 'no-store')

    return pdfBuffer
  } catch (error) {
    console.error('Docs PDF generation failed:', error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Docs PDF generation failed',
    })
  } finally {
    if (browser) await browser.close()
  }
})

function getChromePath(): string {
  if (process.platform === 'win32') {
    return 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  } else if (process.platform === 'darwin') {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }
  return '/usr/bin/google-chrome'
}
