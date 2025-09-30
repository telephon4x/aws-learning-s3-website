let flashcards = [];
let currentIndex = 0;

async function loadFlashcards(domain) {
  try {
    const response = await fetch(`data/${domain}QA.json`);
    flashcards = await response.json();
    currentIndex = 0;
    renderFlashcard();
  } catch (error) {
    console.error("Error loading flashcards:", error);
  }
}

function renderFlashcard() {
  const container = document.getElementById("flashcard-container");
  container.innerHTML = ""; // clears everything

  if (flashcards.length === 0) {
    container.innerHTML = "<p>No flashcards available.</p>";
    return;
  }

  const card = flashcards[currentIndex];

  // Flashcard element
  const cardElement = document.createElement("div");
  cardElement.className = "flashcard";
  cardElement.innerHTML = `
    <div class="front">${card.question}</div>
    <div class="back">${card.answer}</div>
  `;
  cardElement.addEventListener("click", () => {
    cardElement.classList.toggle("flipped");
  });

  container.appendChild(cardElement);

  // Card counter
  const counter = document.createElement("p");
  counter.className = "card-counter";
  counter.textContent = `Card ${currentIndex + 1} of ${flashcards.length}`;
  container.appendChild(counter);

  // Nav buttons
  const navContainer = document.createElement("div");
  navContainer.className = "flashcard-nav";

  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.className = "nav-button";
  prevButton.onclick = () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderFlashcard();
    }
  };

  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.className = "nav-button";
  nextButton.onclick = () => {
    if (currentIndex < flashcards.length - 1) {
      currentIndex++;
      renderFlashcard();
    }
  };

  navContainer.appendChild(prevButton);
  navContainer.appendChild(nextButton);
  container.appendChild(navContainer);
}
