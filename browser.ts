import puppeteer, { Browser } from "puppeteer";

export default {
  start: async (): Promise<Browser> => {
    let browser: Browser = {} as Browser;

    try {
      // this env variable is only set in the Dockerfile
      const isDocker = process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD || false;
      const browserArgs = [
        "--disable-setuid-sandbox",
        "--disable-notifications",
        "--start-fullscreen",
      ];
      // we want to set the --no-sandbox flag when it's running in a docker container
      if (isDocker) {
        browserArgs.push("--no-sandbox");
      }

      console.log("Opening the browser......");
      browser = await puppeteer.launch({
        headless: true,
        args: browserArgs,
        ignoreHTTPSErrors: true,
        defaultViewport: { width: 1366, height: 768 },
      });

      return browser;
    } catch (err) {
      console.log("Could not create browser instance: ", err);
    }

    return browser;
  },
};
