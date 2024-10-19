const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://news.ycombinator.com/newest");

  (async () => {
    await sortHackerNewsArticles();
  })();

  // wait for articles to load
  await page.waitForSelector(".athing");

  let totalArticles = 0; // Keep track of the total number of articles
  const allArticles = []; // Array to store all articles

  // Function to scrape and log articles
  async function scrapeAndLogArticles() {
    // Scrape articles
    const articles = await page.$$eval(".athing", (articles) => {
      return articles.map((article) => {
        const title = article.querySelector(".titleline a").innerText;
        const ageElement = article.nextElementSibling.querySelector(".age a");
        const age = ageElement ? ageElement.innerText : null;
        return { title, age };
      });
    });

    // Append new articles to the allArticles array
    allArticles.push(...articles);

    // Check if we already have 100 articles
    if (totalArticles >= 100) {
      return; // Skip logging if we have 100 or more articles
  }

    // Log the most recent batch of articles
    console.log("Scraped articles and ages:");
    const articlesToLog = allArticles.slice(totalArticles, totalArticles + 30); // Get the next 30 articles
    articlesToLog.forEach((article, index) => {
        if (totalArticles + index + 1 <= 100) { // Only log if the count is <= 100
            console.log(`${totalArticles + index + 1}: ${article.title} - Age: ${article.age}`);
        }
    });

    // Update the total number of articles
    totalArticles += articlesToLog.length;
  }

  // Load articles from up to 4 pages (1 initial + 3 more)
  const maxPages = 3; // We can keep this as is since it counts additional pages
  await scrapeAndLogArticles(); // Scrape initial page first

  for (let pageCount = 0; pageCount < maxPages; pageCount++) {
      // Click the "More" button to load more articles if it exists
      const moreButton = await page.$('a.morelink');
      if (moreButton) {
          await moreButton.click();
          await page.waitForTimeout(2000); // Wait for the page to load new articles
          await scrapeAndLogArticles(); // Scrape the articles on the current page
      } else {
          console.log("No more articles to load.");
          break; // Exit the loop if there are no more articles
      }
  }

  // Sorting check for the first 100 articles
  if (totalArticles >= 100) {
    const first100Articles = allArticles.slice(0, 100);
    const sortedFirst100Articles = [...first100Articles].sort((a, b) => {
        return convertAgeToMinutes(a.age) - convertAgeToMinutes(b.age);
    });

    const isSorted = first100Articles.every((article, index) => {
        return article === sortedFirst100Articles[index]; // Compare the original with the sorted
    });

    if (isSorted) {
        console.log("The first 100 articles are sorted from newest to oldest.");
    } else {
        console.log("The first 100 articles are NOT sorted correctly.");
    }
  } else {
    console.log("Fewer than 100 articles were scraped.");
  }

  await browser.close();
}

// Helper function to convert age text to minutes for comparison
function convertAgeToMinutes(age) {
  if (!age) return Infinity; // if no age, assume it's very old
  if (age.includes("minute") && age.startsWith("0")) return 0;

  const [value, unit] = age.split(" ");
  const numValue = parseInt(value);
  if (unit.startsWith("minute")) return numValue;
  if (unit.startsWith("hour")) return numValue * 60;
  if (unit.startsWith("day")) return numValue * 60 * 24;
  if (unit.startsWith("month")) return numValue * 60 * 24 * 30;
  if (unit.startsWith("year")) return numValue * 60 * 24 * 365;
  return Infinity; // fallback for unknown formats
}