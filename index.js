/*
// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");
}

(async () => {
  await sortHackerNewsArticles();
})();
*/

const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News "newest" page
  await page.goto("https://news.ycombinator.com/newest");

  // wait for articles to load
  await page.waitForSelector(".athing"); // athing is the class for articles

  // scrape the first 100 articles
  const articles = await page.$$eval(".athing", (articles) => {
    return articles.slice(0, 100).map((article) => {
      const title = article.querySelector(".titleline a").innerText;
      const ageElement = article.nextElementSibling.querySelector(".age a");
      const age = ageElement ? ageElement.innerText : null;
      return { title, age };
    });
  });

  // Check if the articles are sorted from newest to oldest
  let isSorted = true;
  for (let i = 1; i < articles.length; i++) {
    if (articles[i].age > articles[i - 1].age) {
      isSorted = false;
      break;
    }
  }

  // Output the result
  if (isSorted) {
    console.log("The first 100 articles are sorted from newest to oldest.");
  } else {
    console.log("The articles are NOT sorted correctly.");
  }
}

(async () => {
  await sortHackerNewsArticles();
})();