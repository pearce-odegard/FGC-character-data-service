import { Browser, Page } from "puppeteer";
import { AutoScroll } from "./types";

export async function scrapeVideoURLs(
  searchURL: string,
  browser: Browser,
  scroller: AutoScroll
): Promise<string[]> {
  const page = await browser.newPage();
  await page.goto(searchURL);

  let shouldKeepScrolling = true;

  while (shouldKeepScrolling) {
    // attempt to find a random video that is at the very end of the page
    try {
      await page.waitForSelector('a[href="/watch?v=j4Ffaf-4vUs"]', {
        timeout: 50,
      });
      // set shouldKeepScrolling to false once it is found
      shouldKeepScrolling = false;
    } catch (e) {
      // if error thrown, scroll
      await scroller(page);
    }
  }

  const videoThumbnails = await page.$$("a#thumbnail.ytd-thumbnail");
  const propertyJsHandles = await Promise.all(
    videoThumbnails.map((handle) => handle.getProperty("href"))
  );
  const hrefs = await Promise.all(
    propertyJsHandles.map((handle) => handle.jsonValue())
  );

  await page.close();

  return hrefs;
}

export async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      const distance = 1000000;
      let totalHeight = 0;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve(true);
        }
      }, 50);
    });
  });
}
