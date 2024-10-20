// My code from index.js condensed
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // Launch browser and open page
  const browser = await chromium.launch({ headless: false });
  const page = await (await browser.newContext()).newPage();
  await page.goto("https://news.ycombinator.com/newest");

  // Function to scrape articles
  async function scrapeArticles() {
    return page.$$eval(".athing", (articles) => {
      return articles.map((article) => {
        const title = article.querySelector(".titleline a").innerText;
        const age = article.nextElementSibling.querySelector(".age a")?.innerText || null;
        return { title, age };
      });
    });
  }

  // Scrape up to 4 pages or 100 articles
  const allArticles = [];
  const maxPages = 3;
  for (let pageCount = 0; pageCount <= maxPages; pageCount++) {
    const articles = await scrapeArticles();
    allArticles.push(...articles);
    
    if (allArticles.length >= 100) break;

    const moreButton = await page.$('a.morelink');
    if (!moreButton) break;
    
    await moreButton.click();
    await page.waitForTimeout(2000); // Wait for new articles to load
  }

  // Slice first 100 articles and sort them by age
  const first100Articles = allArticles.slice(0, 100);
  const sortedArticles = first100Articles.sort((a, b) => {
    return convertAgeToMinutes(a.age) - convertAgeToMinutes(b.age);
  });

  // Check if the articles are already sorted by age
  const isSorted = first100Articles.every((article, index) => {
    return article === sortedArticles[index];
  });

  console.log(isSorted 
    ? "The first 100 articles are sorted from newest to oldest." 
    : "The first 100 articles are NOT sorted correctly.");

  await browser.close();
}

// Helper function to convert age text to minutes
function convertAgeToMinutes(age) {
  if (!age) return Infinity;
  const [value, unit] = age.split(" ");
  const num = parseInt(value);
  
  switch (unit) {
    case "minute": case "minutes": return num;
    case "hour": case "hours": return num * 60;
    case "day": case "days": return num * 60 * 24;
    case "month": case "months": return num * 60 * 24 * 30;
    case "year": case "years": return num * 60 * 24 * 365;
    default: return Infinity;
  }
}

sortHackerNewsArticles();