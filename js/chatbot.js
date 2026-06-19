// ── Imports ──
import { fetchData } from "./config.js";
let geminiKey = "AIzaSyAIwVavHGRKvrm9FjBrgohQPvZzsX34EpQ";
const GEMINI_MODEL = "gemini-2.5-flash-lite";
let products = [];
let discounts = [];
let theatres = [];
let schedule = [];
let chatHistory = [];
let isReady = false;

// ── DOM refs ──
const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const chatPanel = document.getElementById("chat-panel");
const chatToggle = document.getElementById("chat-toggle");
const chatBadge = document.getElementById("chat-badge");
const headerStatus = document.getElementById("header-status");
const closeBtn = document.getElementById("close-btn");

// ── Toggle open/close ──
chatToggle.addEventListener("click", () => {
  chatPanel.classList.toggle("open");
  chatBadge.style.display = "none";
});

closeBtn.addEventListener("click", () => {
  chatPanel.classList.remove("open");
});

// ── Simplified Data Loader ──
async function loadProducts() {
  try {
    const appData = await fetchData();

    // Assign mapped state data properties directly from returned entities
    products = appData.products;
    discounts = appData.discounts;

    console.log("Loaded fully deciphered products:", products);
    checkReady();
  } catch (e) {
    products = [];
    discounts = [];
    checkReady();
  }
}

function checkReady() {
  if (geminiKey) {
    isReady = true;
    sendBtn.disabled = false;
    headerStatus.textContent = "Sẵn sàng";
  }
}

// ── Fast, Lightweight Prompt Builder ──
function buildPrompt(userMessage) {
  // 1. Movie formatting using strings calculated in config layer
  let productText = products
    .map((p) => {
      return (
        `Phim: ${p.title}\n` +
        `- Thể loại: ${p.genre} | Định dạng: ${p.style} | Giới hạn: ${p.rated}\n` +
        `- Đánh giá: ${p.audiencerating}\n` +
        `- Thời lượng: ${p.duration} phút\n` +
        `- Tóm tắt: ${p.desc}\n` +
        `- Giá vé cơ bản: ${p.base_ticket || "N/A"}\n`
      );
    })
    .join("\n\n");

  // 2. Discounts formatting
  let discountSection = "";
  if (discounts && discounts.length > 0) {
    let discountText = discounts
      .map(
        (d) =>
          `Ưu đãi: ${d.offer_name}\n- Điều kiện: ${d.conditions}\n - Giảm giá: ${d.discount}\n - Giảm giá tối đa: ${d.max_discount}\n - Trạng thái: ${d.status || "N/A"}\n - Từ ngày: ${d.valid_from || "N/A"}\n - Đến ngày: ${d.valid_until || "N/A"}\n`,
      )
      .join("\n\n");
    discountSection = `\n\nDanh sách ưu đãi:\n${discountText}`;
  }

  const systemCtx = `Bạn là trợ lý tư vấn bán vé xem phim thân thiện. Danh sách phim và vé:\n${productText}\n; cùng với danh sách ưu đãi: \n${discountSection}\n. Mỗi phần tử của danh sách là một phim hoặc vé xem phim với đầy đủ thông tin bạn cần. Trả lời bằng tiếng Việt, ngắn gọn, hiển thị giá bằng USD.`;

  let historyText = "";
  for (const turn of chatHistory) {
    const role = turn.role === "user" ? "Khách" : "Trợ lý";
    historyText += `${role}: ${turn.parts[0].text}\n`;
  }

  let prompt = systemCtx + "\n\n";

  if (historyText) {
    prompt += "Lịch sử:\n";
    prompt += historyText + "\n";
  }

  prompt += "Khách: " + userMessage + "\n";
  prompt += "Trợ lý:";

  return prompt;
}

// ── Send to Gemini ──
async function sendToGemini(userMessage) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`;

  const body = {
    contents: [{ role: "user", parts: [{ text: buildPrompt(userMessage) }] }],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  if (
    data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0] &&
    data.candidates[0].content.parts[0].text
  ) {
    return data.candidates[0].content.parts[0].text;
  } else {
    return "Không có phản hồi.";
  }
}

// ── Chat logic ──
async function chat(userMessage) {
  if (!isReady) {
    alert("Vui lòng nhập Gemini API key và chờ dữ liệu tải!");
    return;
  }
  if (!userMessage.trim()) return;

  appendMessage("user", userMessage);
  inputEl.value = "";
  sendBtn.disabled = true;

  const typingEl = appendMessage("typing", "⏳ Đang suy nghĩ...");

  try {
    const reply = await sendToGemini(userMessage);

    chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
    chatHistory.push({ role: "model", parts: [{ text: reply }] });

    typingEl.remove();
    appendMessage("bot", reply, true);
  } catch (e) {
    typingEl.remove();
    appendMessage("bot", `❌ Lỗi: ${e.message}`);
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

// ── UI helpers ──
function appendMessage(type, text, showBadge = false) {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  if (showBadge && !chatPanel.classList.contains("open")) {
    chatBadge.style.display = "block";
  }
  return div;
}

window.askSuggestion = function (btn) {
  inputEl.value = btn.textContent.trim();
  chat(btn.textContent.trim());
};

// ── Event listeners ──
sendBtn.addEventListener("click", () => chat(inputEl.value));

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chat(inputEl.value);
  }
});

// ── Init ──
loadProducts();
