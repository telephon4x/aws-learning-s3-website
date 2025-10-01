/* Exam runner: loads data/examQA.json, supports timed/untimed, single & multi answer,
   persists answers while navigating, and hides explanation if absent. */

let examData = [];
let isTimed = false;
let current = 0;
let userAnswers = {}; // { index: number[] } (array even for single-answer to generalize)
let timerInterval = null;
let remainingSeconds = 0;

// Expose startExam globally for the buttons in practice.html
window.startExam = async function (timed = false) {
  isTimed = timed;
  clearInterval(timerInterval);
  document.getElementById("exam-timer").style.display = "none";

  try {
    const res = await fetch("data/examQA.json", { cache: "no-cache" });
    examData = await res.json();
  } catch (e) {
    console.error("Failed to load examQA.json:", e);
    renderMessage("Error loading questions. Please check the console.");
    return;
  }

  if (!Array.isArray(examData) || examData.length === 0) {
    renderMessage("No questions available.");
    return;
  }

  // reset state
  current = 0;
  userAnswers = {};

  // Timer (130 minutes default)
  if (isTimed) {
    remainingSeconds = 130 * 60;
    document.getElementById("exam-timer").style.display = "block";
    updateTimerLabel();
    timerInterval = setInterval(() => {
      remainingSeconds--;
      updateTimerLabel();
      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        submitExam(true); // auto-submit
      }
    }, 1000);
  }

  renderQuestion();
};

function updateTimerLabel() {
  const el = document.getElementById("exam-timer");
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  el.textContent = `Time remaining: ${m}:${String(s).padStart(2, "0")}`;
}

function renderMessage(msg) {
  const container = document.querySelector(".exam-container");
  container.innerHTML = `<div class="result">${msg}</div>`;
}

function renderQuestion() {
  const q = examData[current];
  if (!q) return;

  const container = document.querySelector(".exam-container");
  container.innerHTML = "";

  // Determine if this is multi-answer (>=2 correct choices)
  const correctIndexes = q.choices
    .map((c, i) => (c.correct ? i : -1))
    .filter((i) => i !== -1);
  const isMulti = correctIndexes.length > 1;

  // Title / progress
  const head = document.createElement("div");
  head.className = "question";
  head.innerHTML = `
    <h3>Q${current + 1} of ${examData.length}</h3>
    <p>${escapeHtml(q.question)}</p>
    ${isMulti ? `<p class="muted">Select all that apply.</p>` : ""}
  `;

  // Answers
  const answersDiv = document.createElement("div");
  answersDiv.className = "answers";

  const saved = userAnswers[current] || [];
  q.choices.forEach((choice, idx) => {
    const id = `q${current}_opt${idx}`;
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = isMulti ? "checkbox" : "radio";
    input.name = `q${current}`;
    input.value = String(idx);
    input.id = id;
    if (saved.includes(idx)) input.checked = true;

    input.addEventListener("change", () => {
      // Persist selection
      if (isMulti) {
        const arr = new Set(userAnswers[current] || []);
        if (input.checked) arr.add(idx);
        else arr.delete(idx);
        userAnswers[current] = Array.from(arr);
      } else {
        userAnswers[current] = [idx];
      }
    });

    const textSpan = document.createElement("span");
    textSpan.textContent = " " + choice.text;

    label.appendChild(input);
    label.appendChild(textSpan);
    answersDiv.appendChild(label);
  });

  head.appendChild(answersDiv);

  // Optional explanation is NOT shown during the exam; it will show on the review screen.
  // (We still keep graceful styling if we ever need it inline.)
  if (q.explanation && q.explanation.trim()) {
    const optional = document.createElement("div");
    optional.className = "explanation optional-explanation";
    optional.style.display = "none";
    optional.innerHTML = `<strong>Explanation:</strong> ${escapeHtml(q.explanation)}`;
    head.appendChild(optional);
  }

  container.appendChild(head);

  // Controls
  const controls = document.createElement("div");
  controls.className = "exam-controls";

  const prevBtn = document.createElement("button");
  prevBtn.className = "exam-button";
  prevBtn.textContent = "Previous";
  prevBtn.disabled = current === 0;
  prevBtn.onclick = () => {
    current = Math.max(0, current - 1);
    renderQuestion();
    scrollToTop();
  };

  const nextBtn = document.createElement("button");
  nextBtn.className = "exam-button";
  nextBtn.textContent = current === examData.length - 1 ? "Submit" : "Next";
  nextBtn.onclick = () => {
    if (current === examData.length - 1) {
      submitExam(false);
    } else {
      current = Math.min(examData.length - 1, current + 1);
      renderQuestion();
      scrollToTop();
    }
  };

  controls.appendChild(prevBtn);
  controls.appendChild(nextBtn);
  container.appendChild(controls);
}

function submitExam(autoSubmitted) {
  // finalize score
  let correctCount = 0;

  examData.forEach((q, idx) => {
    const correct = new Set(
      q.choices.map((c, i) => (c.correct ? i : -1)).filter((i) => i !== -1)
    );
    const picked = new Set(userAnswers[idx] || []);
    if (setEquals(correct, picked)) correctCount++;
  });

  clearInterval(timerInterval);
  document.getElementById("exam-timer").style.display = "none";

  renderReview(correctCount, autoSubmitted);
}

function renderReview(correctCount, autoSubmitted) {
  const container = document.querySelector(".exam-container");
  container.innerHTML = `
    <div class="result">
      ${autoSubmitted ? "Time expired. " : ""}Exam finished.<br/>
      Score: ${correctCount} / ${examData.length}
    </div>
  `;

  examData.forEach((q, idx) => {
    const block = document.createElement("div");
    block.className = "question";

    const correctIndexes = new Set(
      q.choices.map((c, i) => (c.correct ? i : -1)).filter((i) => i !== -1)
    );
    const picked = new Set(userAnswers[idx] || []);
    const isCorrect = setEquals(correctIndexes, picked);

    const header = document.createElement("h3");
    header.textContent = `Q${idx + 1}: ${isCorrect ? "✅" : "❌"}`;
    block.appendChild(header);

    const text = document.createElement("p");
    text.textContent = q.question;
    block.appendChild(text);

    const list = document.createElement("ul");
    list.style.marginLeft = "18px";

    q.choices.forEach((choice, cidx) => {
      const li = document.createElement("li");
      const pickedMark = picked.has(cidx) ? " (your choice)" : "";
      const correctMark = choice.correct ? " (correct)" : "";
      li.textContent = `${choice.text}${pickedMark}${correctMark}`;
      // subtle color
      if (choice.correct) li.style.color = "#1b5fe0";
      if (picked.has(cidx) && !choice.correct) li.style.color = "#b00020";
      list.appendChild(li);
    });
    block.appendChild(list);

    // Explanation (only render if present)
    if (q.explanation && q.explanation.trim()) {
      const exp = document.createElement("div");
      exp.className = "explanation";
      exp.innerHTML = `<strong>Explanation:</strong> ${escapeHtml(q.explanation)}`;
      block.appendChild(exp);
    }

    container.appendChild(block);
  });

  const restart = document.createElement("div");
  restart.className = "exam-controls";
  const btn = document.createElement("button");
  btn.className = "exam-button";
  btn.textContent = "Start New Exam";
  btn.onclick = () => startExam(isTimed);
  restart.appendChild(btn);
  container.appendChild(restart);
}

function setEquals(a, b) {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Simple HTML escaper for safety
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
