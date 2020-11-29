import { Browser, Page } from "puppeteer";

const DEFAULT_STARTDATE = "10/01/2020";
const DEFAULT_ENDDATE = "10/30/2020";
const targetUrl = "https://develop.pub.afflu.net/list?type=dates";
const apiUrl = "https://develop.pub.afflu.net/api/query/dates";

interface ResultRow {
  date: string;
  overviewLink: string;
  commissionsTotal: number;
  netSales: number;
  netLeads: number;
  clicks: number;
  epc: number;
  impressions: number;
  cr: number;
}

interface ScrapeResult {
  startDate: string;
  endDate: string;
  rows: ResultRow[];
}

const dataTableRoot = ".portlet-datatable[data-name='dates']";
const datePickerPopup = ".daterangepicker.dropdown-menu";
const loginRoot = ".login-form";

export const selectors = {
  loginForm: {
    root: loginRoot,
    usernameInput: `${loginRoot} input[type='email']`,
    passwordInput: `${loginRoot} input[type='password']`,
    loginButton: `${loginRoot} button.green`,
  },
  datePicker: {
    root: ".page-toolbar #datepicker",
    leftInput: `${datePickerPopup} .calendar.left .daterangepicker_input input`,
    rightInput: `${datePickerPopup} .calendar.right .daterangepicker_input input`,
    applyButton: `${datePickerPopup} button.btn-success`,
  },
  dataTable: {
    root: dataTableRoot,
    rows: `${dataTableRoot} table tbody tr`,
    pagination: {
      root: `${dataTableRoot} ul.pagination`,
      next: `${dataTableRoot} ul.pagination li.next > a[title="Next"]`,
      pageButton: `${dataTableRoot} ul.pagination li`,
    },
    sizePicker: {
      root: `${dataTableRoot} .dataTables_length`,
      maxSize: `${dataTableRoot} .dataTables_length ul.dropdown-menu > li:last-child > a`,
    },
  },
};

async function replaceText(
  page: Page,
  selector: string,
  text: string
): Promise<void> {
  const input = await page.$(selector);
  await input?.click({ clickCount: 3 });
  await input?.type(text, { delay: 20 });
}

export async function login(
  browser: Browser,
  username: string,
  password: string
): Promise<Page> {
  let page: Page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );
  const { usernameInput, passwordInput, loginButton } = selectors.loginForm;
  console.log("Navigating to https://develop.pub.afflu.net");
  await page.goto("https://develop.pub.afflu.net");
  await page.waitForSelector(usernameInput);
  console.log(`Filling out login form...`);
  await page.type(usernameInput, username, { delay: 20 });
  await page.type(passwordInput, password, { delay: 20 });
  await page.click(loginButton);
  console.log(`logging in with username ${username} and password *****`);
  await page.waitForNavigation({ waitUntil: "networkidle0" });
  console.log("login successful!");
  return page;
}

export async function readDatatablePage(page: Page) {
  const rows = await page.$$eval(
    selectors.dataTable.rows,
    function transformData(rows: Element[]) {
      return rows.map((row) => {
        const result = {} as ResultRow;
        const cells = Array.from(row.querySelectorAll("td"));
        result.overviewLink =
          cells[0].querySelector("a")?.getAttribute("href") || "";
        result.date = cells[0].textContent || "";
        result.commissionsTotal = parseFloat(
          cells[1].textContent?.replace(/\$|,/g, "") || "0.00"
        );
        result.netSales = parseInt(cells[2].textContent || "0");
        result.netLeads = parseInt(cells[3].textContent || "0");
        result.clicks = parseInt(cells[4].textContent || "0");
        result.epc = parseFloat(
          cells[5].textContent?.replace(/\$|,/g, "") || "0.00"
        );
        result.impressions = parseInt(cells[6].textContent || "0");
        result.cr = parseFloat(
          cells[7].textContent?.replace(/\%/g, "") || "0.00"
        );
        return result;
      });
    }
  );
  return rows;
}

export async function scrape(
  page: Page,
  startDate = DEFAULT_STARTDATE,
  endDate = DEFAULT_ENDDATE
): Promise<ScrapeResult> {
  const response: ScrapeResult = {
    startDate,
    endDate,
    rows: [],
  };
  const { datePicker, dataTable } = selectors;
  if (!page) {
    throw new Error(`Unable to open page ${targetUrl}`);
  }
  console.log(`Navigating to ${targetUrl}`);
  await page.goto(targetUrl);

  await page.waitForSelector(datePicker.root);
  // click on the datepicker button to open the picker
  await page.click(datePicker.root);
  // paste the start and end dates in the datepicker inputs
  await replaceText(page, datePicker.leftInput, startDate);
  await replaceText(page, datePicker.rightInput, endDate);
  // click on the datepicker 'Apply' button
  await page.click(datePicker.applyButton);
  // wait for network
  await page.waitForResponse(apiUrl);
  await page.waitForSelector(dataTable.sizePicker.root);
  // click on table size to open dropdown
  await page.click(dataTable.sizePicker.root);

  // select the 'All' option to show all results
  await page.click(dataTable.sizePicker.maxSize);
  // wait for network
  await page.waitForResponse(apiUrl);

  // read data from table
  const pageData = await readDatatablePage(page);
  response.rows.push(...pageData);

  console.log(response);

  return response;
}
