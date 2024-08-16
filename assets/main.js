async function fetchReadingData() {
  const currentYear = new Date().getFullYear();
  try {
    const response = await fetch(`logs/${currentYear}.json`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching reading data:", error);
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

async function displayReadingActivity() {
  const data = await fetchReadingData();
  if (!data) return;

  const activityContainer = document.getElementById("readingActivity");

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

displayReadingActivity();
