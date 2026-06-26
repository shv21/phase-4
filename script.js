const ask = document.querySelector("#ask");
const idea = document.querySelector("#idea");
const summarize = document.querySelector("#summarize");

const inputBox = document.querySelector("#inputBox");
const outputBox = document.querySelector(".outputBox");
const errorBox = document.querySelector("#errorBox");

const GEMINI_API_KEY = "AQ.Ab8RN6IjqYaBkqTSyi_5QzbiyeQXeUsBd-gtEOGWpWsRgknHLg";

const GEMINI_API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

function setLoading(state) {
  ask.disabled = state;
  idea.disabled = state;
  summarize.disabled = state;

  if (state) {
    ask.textContent = "...";
  } else {
    ask.textContent = "Ask Me Anything";
  }
}

function scrollToBottom() {
  outputBox.scrollTop = outputBox.scrollHeight;
}

function createMessage(text, type) {
  const msg = document.createElement("div");
  msg.classList.add(type);
  msg.textContent = text;

  outputBox.appendChild(msg);
  scrollToBottom();

  return msg;
}

async function apiAns(text) {
  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{parts: [{ text }],},],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to connect to Gemini");
  }

  if (!data.candidates?.length) {
    throw new Error("No response received from Gemini");
  }

  return data.candidates[0].content.parts[0].text;
}

async function handlePrompt(userText, prompt, mode = "AI") {
  if (!userText.trim()) {
    errorBox.textContent = "Please enter something.";
    return;
  }

  errorBox.textContent = "";
  setLoading(true);

  try {
    createMessage(userText, "user-msg");

    inputBox.value = "";

    const loadingMsg = createMessage("Thinking...", "ai-msg");

    const answer = await apiAns(prompt);

    loadingMsg.remove();

    createMessage(answer, "ai-msg");
  } catch (error) {
    errorBox.textContent = error.message;
    console.error(error);
  } finally {
    setLoading(false);
  }
}

ask.addEventListener("click", () => {
  const text = inputBox.value.trim();

  handlePrompt(
    text,
    text,
    "AI"
  );
});

summarize.addEventListener("click", () => {
  const text = inputBox.value.trim();

  handlePrompt(
    text,
    `Summarize the following text in simple words:

${text}`,
    "Summary"
  );
});

idea.addEventListener("click", () => {
  const text = inputBox.value.trim();

  handlePrompt(
    text,
    `Generate 5 creative ideas about:

${text}`,
    "Ideas"
  );
});

inputBox.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    if (!ask.disabled) {
      ask.click();
    }
  }
});

/* Welcome Message */

window.addEventListener("DOMContentLoaded", () => {
  createMessage(
    "Hello! Ask me anything, summarize text, or generate ideas.",
    "ai-msg"
  );
});