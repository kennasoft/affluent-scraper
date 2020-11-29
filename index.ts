import { Browser } from "puppeteer";
import { createConnection } from "typeorm";
import dotenv from "dotenv";
import browser from "./browser";
import ScrapeData from "./entities/ScrapeData";
import { scrape, login } from "./page-scraper";

dotenv.config();

async function run() {
  const browserInstance: Browser = await browser.start();

  const page = await login(
    browserInstance,
    process.env.AFFLUENT_USERNAME || "",
    process.env.AFFLUENT_PASSWORD || ""
  );

  const response = await scrape(page);
  await browserInstance.close();

  const db = await createConnection();
  await db.getRepository(ScrapeData).save(response.rows);
  await db.close();

  console.log("Scraping complete. Exiting program. Bye bye");
}

run();
