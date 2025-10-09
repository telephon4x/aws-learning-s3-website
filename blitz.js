(() => {
  const DATA_URL = "data/examQA.json";
  const SESSION_KEY = "blitzSession_v1"; // localStorage key

  const els = {
    start: null,
    counter: null,
    card: null,
    qText: null,
    qOptions: null,
    feedback: null,
    explanation: null,
    controls: null,
    prev: null,
    reveal: null,
    next: null,
    summary: null,
    summaryLine: null,
    restart: null,
  };

  let allQuestions = [];
  let blitzSet = [];
  let idx = 0;
  let revealed = false;
  let selection = {}; // { qId: [indices] }
  let correctMap = {}; // { qId: [indices] }

  document.addEventListener("DOMContentLoaded", () => {
    els.start = document.getElementById("start-blitz");
    els.counter = document.getElementById("blitz-counter");
    els.card = document.getElementById("blitz-question");
    els.qText = document.getElementById("q-text");
    els.qOptions = document.getElementById("q-options");
    els.feedback = document.getElementById("q-feedback");
    els.explanation = document.getElementById("q-expl");
    els.controls = document.getElementById("blitz-controls");
    els.prev = document.getElementById("prev-q");
    els.reveal = document.getElementById("reveal");
    els.next = document.getElementById("next-q");
    els.summary = document.getElementById("blitz-summary");
    els.summaryLine = document.getElementById("summary-line");
    els.restart = document.getElementById("restart");

    els.start?.addEventListener("click", startBlitz);
    els.prev?.addEventListener("click", () => goto(idx - 1));
    els.next?.addEventListener("click", () => goto(idx + 1));
    els.reveal?.addEventListener("click", () => { revealed = true; render(); });
    els.restart?.addEventListener("click", startBlitz);
  });

  async function startBlitz() {
    revealed = false;
    idx = 0;
    selection = {};
    correctMap = {};
    els.summary.style.display = "none";

    // Load questions (cache in-memory per page load)
    if (allQuestions.length === 0) {
      try {
        const res = await fetch(DATA_URL, { cache: "no-store" });
        allQuestions = await res.json();
      } catch (e) {
        alert("Unable to load question bank.");
        return;
      }
    }

    // Build 10 random questions
    blitzSet = pickRandom10(normalizeQuestions(allQuestions));
    // Precompute correct indices for each
    blitzSet.forEach(q => {
      correctMap[q._id] = computeCorrectIndices(q);
    });

    // Show UI
    els.counter.style.display = "block";
    els.card.style.display = "block";
    els.controls.style.display = "flex";
    // Reset feedback area
    els.feedback.style.display = "none";
    els.explanation.style.display = "none";

    // Persist blank session
    persistSession();

    render();
  }

  function goto(i) {
    if (i < 0) return;
    if (i >= blitzSet.length) {
      showSummary();
      return;
    }
    idx = i;
    revealed = false;
    render();
  }

  function render() {
    const q = blitzSet[idx];
    if (!q) return;

    // Counter
    els.counter.textContent = `Question ${idx + 1} / ${blitzSet.length}`;

    // Question text
    els.qText.innerHTML = sanitize(q.question || "Untitled question");

    // Options
    const correctIdxs = correctMap[q._id] || [];
    const multi = correctIdxs.length > 1;
    const currentSel = selection[q._id] || [];

    els.qOptions.innerHTML = "";
    q.options.forEach((optText, i) => {
      const id = `opt_${q._id}_${i}`;
      const label = document.createElement("label");
      label.setAttribute("for", id);
      label.style.display = "flex";
      label.style.gap = "8px";
      label.style.alignItems = "flex-start";

      const input = document.createElement("input");
      input.type = multi ? "checkbox" : "radio";
      input.name = multi ? `opt_${q._id}[]` : `opt_${q._id}`;
      input.id = id;
      input.value = String(i);
      input.checked = currentSel.includes(i);

      input.addEventListener("change", () => {
        if (multi) {
          const arr = new Set(selection[q._id] || []);
          if (input.checked) arr.add(i); else arr.delete(i);
          selection[q._id] = Array.from(arr);
        } else {
          selection[q._id] = [i];
        }
        persistSession();
        if (revealed) paintFeedback(q);
      });

      const span = document.createElement("span");
      span.innerHTML = sanitize(optText);

      label.appendChild(input);
      label.appendChild(span);
      els.qOptions.appendChild(label);
    });

    // Feedback / explanation
    paintFeedback(q);
  }

  function paintFeedback(q) {
    const correctIdxs = correctMap[q._id] || [];
    const currentSel = selection[q._id] || [];
    const isAnswered =
      (currentSel.length > 0) ||
      (correctIdxs.length === 0); // if no correct present, treat as unanswered but don't error

    if (!revealed || !isAnswered) {
      els.feedback.style.display = "none";
      els.explanation.style.display = "none";
      return;
    }

    // Highlight selected + correct
    Array.from(els.qOptions.querySelectorAll("label")).forEach((label, i) => {
      label.style.borderRadius = "8px";
      label.style.padding = "8px";
      label.style.border = "1px solid #e5edf7";
      label.style.background = "#fff";

      const selected = (selection[q._id] || []).includes(i);
      const correct = (correctIdxs || []).includes(i);

      if (correct && selected) {
        label.style.background = "#e9f9ee";
        label.style.borderColor = "#9ad5a8";
      } else if (correct) {
        label.style.background = "#eef7ff";
        label.style.borderColor = "#a8c9ff";
      } else if (selected && !correct) {
        label.style.background = "#fff0f0";
        label.style.borderColor = "#f5b7b1";
      }
    });

    const isCorrect =
      arraysEq(new Set(currentSel), new Set(correctIdxs));

    els.feedback.style.display = "block";
    els.feedback.style.fontWeight = "600";
    els.feedback.textContent = isCorrect ? "✅ Correct" : "❌ Incorrect";

    const expl = q.explanation || q.explanations || "";
    els.explanation.style.display = expl ? "block" : "none";
    els.explanation.innerHTML = expl ? sanitize(expl) : "";
  }

  function showSummary() {
    // Compute score
    let correctCount = 0;
    blitzSet.forEach(q => {
      const sel = selection[q._id] || [];
      const cor = correctMap[q._id] || [];
      if (arraysEq(new Set(sel), new Set(cor))) correctCount++;
    });

    els.card.style.display = "none";
    els.controls.style.display = "none";
    els.counter.style.display = "none";
    els.summary.style.display = "block";
    els.summaryLine.textContent =
      `You answered ${correctCount} of ${blitzSet.length} correctly.`;
  }

  // -------- utils --------

  function pickRandom10(arr) {
    const shuffled = arr.slice().sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(10, shuffled.length));
  }

  // Extract visible text from an option that might be an object
  function optionToText(v) {
    if (v == null) return "";
    if (typeof v === "string" || typeof v === "number") return String(v);
    if (typeof v === "object") {
      // common fields we’ve seen across datasets
      return (
        v.text ||
        v.label ||
        v.value ||
        v.answer ||
        v.title ||
        v.option ||
        ""
      );
    }
    return String(v);
  }

  // Normalize foreign shapes into { _id, question, options[], correct, explanation, _rawOptions[] }
  function normalizeQuestions(arr) {
    let nextId = 1;
    return arr
      .map(raw => {
        const question =
          raw.question || raw.text || raw.title || "";
        const rawOptions =
          raw.options ||
          raw.choices ||
          raw.answers ||
          [];
        const options = Array.isArray(rawOptions)
          ? rawOptions.map(optionToText)
          : [];

        const correct =
          raw.correct ||
          raw.correctAnswers ||
          raw.answer ||
          raw.answers ||
          null;

        const explanation =
          raw.explanation || raw.explanations || raw.explain || "";

        // Only keep questions with at least two options
        if (!question || !Array.isArray(options) || options.length < 2) return null;

        return {
          _id: String(raw.id || raw.ID || nextId++),
          question: question,
          options,
          correct,
          explanation,
          _rawOptions: rawOptions // keep original to detect flags like {correct:true}
        };
      })
      .filter(Boolean);
  }

  // Compute correct indices from many possible shapes:
  // - question.correct as array/index/letters/texts
  // - OR option objects with {correct:true} / {isCorrect:true}
  function computeCorrectIndices(q) {
    const opts = q.options || [];
    const rawOpts = Array.isArray(q._rawOptions) ? q._rawOptions : [];
    const c = q.correct;

    // 1) Option-level flags (works even if `correct` is missing):
    const flagged = rawOpts
      .map((v, i) => (v && typeof v === "object" && (v.correct || v.isCorrect)) ? i : -1)
      .filter(i => i >= 0);
    if (flagged.length > 0) {
      return Array.from(new Set(flagged)).sort((a,b)=>a-b);
    }

    // 2) Question-level `correct` field
    const lettersToIndex = (v) => {
      const s = String(v).trim();
      if (/^[A-Za-z]$/.test(s)) {
        const idx = s.toUpperCase().charCodeAt(0) - 65;
        return (idx >= 0 && idx < opts.length) ? idx : -1;
      }
      return -1;
    };

    const textToIndex = (t) => {
      const i = opts.findIndex(o => normalize(o) === normalize(String(t)));
      return i >= 0 ? i : -1;
    };

    if (Array.isArray(c)) {
      const idxs = c
        .map(v => {
          if (typeof v === "number") return (v >= 0 && v < opts.length) ? v : -1;
          if (typeof v === "string") {
            const li = lettersToIndex(v);
            if (li >= 0) return li;
            const ti = textToIndex(v);
            if (ti >= 0) return ti;
          }
          return -1;
        })
        .filter(i => i >= 0);
      return Array.from(new Set(idxs)).sort((a,b)=>a-b);
    }

    if (typeof c === "number") {
      return (c >= 0 && c < opts.length) ? [c] : [];
    }

    if (typeof c === "string") {
      const li = lettersToIndex(c);
      if (li >= 0) return [li];
      const ti = textToIndex(c);
      if (ti >= 0) return [ti];
      if (c.includes(",")) {
        const parts = c.split(",").map(s => s.trim());
        const idxs = parts.map(p => {
          const li2 = lettersToIndex(p);
          if (li2 >= 0) return li2;
          const ti2 = textToIndex(p);
          return ti2;
        }).filter(i => i >= 0);
        return Array.from(new Set(idxs)).sort((a,b)=>a-b);
      }
    }

    return [];
  }

  function arraysEq(aSet, bSet) {
    if (aSet.size !== bSet.size) return false;
    for (const v of aSet) if (!bSet.has(v)) return false;
    return true;
  }

  function normalize(s) {
    return String(s).replace(/\s+/g, " ").trim().toLowerCase();
  }

  function sanitize(s) {
    return String(s)
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");
  }

  function persistSession() {
    try {
      const payload = {
        when: Date.now(),
        order: blitzSet.map(q => q._id),
        selection
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    } catch {}
  }
})();
