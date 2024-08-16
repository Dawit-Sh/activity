let currentData = null;

async function fetchReadingData(year) {
  try {
    const response = await fetch(`logs/${year}.json`);
    if (!response.ok) {
      throw new Error("File not found");
    }
    const data = await response.json();
    currentData = data;
    return data;
  } catch (error) {
    console.error("Error fetching reading data:", error);
    currentData = null;
    return null;
  }
}

function createStarRating(rating) {
  const fullStar = "★";
  const emptyStar = "☆";
  return fullStar.repeat(rating) + emptyStar.repeat(5 - rating);
}

function createActivitySection(month, books) {
  const section = document.createElement("div");
  section.className = "activity-section";

  const title = document.createElement("div");
  title.className = "activity-title";
  title.textContent = month;
  section.appendChild(title);

  if (!books || books.length === 0) {
    const slackingMessage = document.createElement("div");
    slackingMessage.className = "slacking-message";
    slackingMessage.textContent = "Was slacking off";
    section.appendChild(slackingMessage);
  } else {
    const bookList = document.createElement("ul");
    bookList.className = "book-list";

    books.forEach((book) => {
      const bookItem = document.createElement("li");
      bookItem.className = "book-item";

      const icon = document.createElement("span");
      icon.className = "icon icon-book";
      bookItem.appendChild(icon);

      const bookTitle = document.createElement("span");
      bookTitle.className = "book-title";
      bookTitle.textContent = book.title;
      bookItem.appendChild(bookTitle);

      const bookRating = document.createElement("span");
      bookRating.className = "book-rating";
      bookRating.textContent = createStarRating(book.rating);
      bookItem.appendChild(bookRating);

      bookList.appendChild(bookItem);
    });

    section.appendChild(bookList);
  }

  return section;
}

async function displayReadingActivity(year) {
  const data = await fetchReadingData(year);
  const activityContainer = document.getElementById("readingActivity");
  const errorMessage = document.getElementById("error-message");

  if (!data) {
    activityContainer.innerHTML = "";
    errorMessage.textContent = "Data does not exist";
    return;
  }

  errorMessage.textContent = "";
  activityContainer.innerHTML = "";

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const currentMonthIndex = months.indexOf(currentMonth);

  // Display current month first
  const currentMonthBooks = data[currentMonth] || [];
  const currentMonthSection = createActivitySection(
    currentMonth,
    currentMonthBooks
  );
  activityContainer.appendChild(currentMonthSection);

  // Display remaining months in chronological order
  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonthIndex + i + 1) % 12;
    const month = months[monthIndex];
    if (month !== currentMonth) {
      const books = data[month] || [];
      const section = createActivitySection(month, books);
      activityContainer.appendChild(section);
    }
  }
}

function getShortMonth(month) {
  return month.slice(0, 3);
}

function displaySearchResults(results) {
  const modal = document.getElementById("searchModal");
  const searchResults = document.getElementById("searchResults");

  searchResults.innerHTML = ""; // Clear previous results

  if (results.length === 0) {
    searchResults.innerHTML = "<p>No results found</p>";
  } else {
    results.forEach((book) => {
      const bookItem = document.createElement("div");
      bookItem.className = "book-item";

      const bookMonth = document.createElement("span");
      bookMonth.className = "book-month";
      bookMonth.textContent = getShortMonth(book.month);
      bookItem.appendChild(bookMonth);

      const bookTitle = document.createElement("span");
      bookTitle.className = "book-title";
      bookTitle.textContent = book.title;
      bookItem.appendChild(bookTitle);

      const bookRating = document.createElement("span");
      bookRating.className = "book-rating";
      bookRating.textContent = createStarRating(book.rating);
      bookItem.appendChild(bookRating);

      searchResults.appendChild(bookItem);
    });
  }

  document.getElementById("searchModal").style.display = "flex";
}

function hideModal() {
  document.getElementById("searchModal").style.display = "none";
}

async function handleSearch(year, title) {
  if (year) {
    await displayReadingActivity(year);
  }

  if (title && currentData) {
    const results = [];
    for (const month in currentData) {
      if (currentData.hasOwnProperty(month)) {
        const books = currentData[month];
        books.forEach((book) => {
          if (book.title.toLowerCase().includes(title.toLowerCase())) {
            results.push({ ...book, month: month });
          }
        });
      }
    }
    displaySearchResults(results);
  }
}

document.getElementById("searchYearButton").addEventListener("click", () => {
  const year = document.getElementById("searchYearInput").value.trim();
  handleSearch(year, null);
});

document.getElementById("searchTitleButton").addEventListener("click", () => {
  const title = document.getElementById("searchTitleInput").value.trim();
  handleSearch(null, title);
});

document
  .getElementById("searchYearInput")
  .addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      document.getElementById("searchYearButton").click();
    }
  });

document
  .getElementById("searchTitleInput")
  .addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      document.getElementById("searchTitleButton").click();
    }
  });

document.getElementById("modalClose").addEventListener("click", hideModal);

// Load current year data on startup and clear search bars
window.addEventListener("load", () => {
  const currentYear = new Date().getFullYear();
  displayReadingActivity(currentYear);
  document.getElementById("searchYearInput").value = "";
  document.getElementById("searchTitleInput").value = "";
});
