import puppeteer from "puppeteer";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const pdfName = `evidencia-${body.id}.pdf`;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      ignoreDefaultArgs: ["--disable-extensions"],
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security", // Disables same-origin policy
        "--disable-features=IsolateOrigins,site-per-process",
      ],
    });

    // // Abre una nueva página
    const page = await browser.newPage();
    // // Establece el tamaño de la ventana.
    await page.setViewport({ width: 1280, height: 720 });
    // // Carga tu HTML con TailwindCSS

    await page.goto(
      `https://forms.healthystartgroup.com/pdf?submission=${body.id}`,
      {
        waitUntil: "networkidle0",
        timeout: 60000, // Increase timeout to 60 seconds
      }
    );
    // await page.evaluate(() => setTimeout(() => {}, 20000));
    await page.waitForSelector("#report-content", { timeout: 10000 });
    await page.$$eval('[id^="report-content"]', (elms) =>
      elms.map((elm) => elm.innerHTML)
    );
    const selectorToRemove = ".noshow-pdf";
    await page.evaluate((sel) => {
      const elements = document.querySelectorAll(sel);
      for (let i = 0; i < elements.length; i++) {
        elements[i].parentNode.removeChild(elements[i]);
      }
    }, selectorToRemove);

    let pdfBuffer = null;
    try {
      pdfBuffer = await page.pdf({
        // path: `./public/${pdfName}`, // Local store
        format: "A4",
        landscape: true,
        pageRanges: "1",
        printBackground: true,
      });

      // Cierra el navegador
      await browser.close();

      const base64String = Buffer.from(pdfBuffer).toString("base64");

      return {
        ok: true,
        pdf: base64String,
        filename: pdfName,
      };
    } catch (error) {
      console.error("pdfBuffer failed:", error);
      throw createError({ statusCode: 500, message: "PDF generation failed" });
    }
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw createError({ statusCode: 500, message: "Browser failed" });
  }
});
