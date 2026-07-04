// ── Imports ──
import { fetchData } from "./config.js";
const GEMINI_MODEL = "gemini-2.5-flash-lite";

// BƯỚC KHẮC PHỤC 1: Khai báo lại từ khóa để GitHub Actions có thể tìm thấy và tiêm Key thật vào khi deploy
let geminiKey = "__GEMINI_API_KEY__";

let products = [];
let discounts = [];
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
// ── Simplified Data Loader (Bản nâng cấp chống kẹt) ──
async function loadProducts() {
  try {
    console.log("Đang tải dữ liệu rạp phim...");
    const appData = await fetchData();

    products = appData?.products || [];
    discounts = appData?.discounts || [];

    console.log("Loaded products:", products);
  } catch (e) {
    // Nếu lỗi fetch dữ liệu, ghi nhận lỗi nhưng KHÔNG ĐƯỢC làm sập luồng xử lý chat
    console.error("Cảnh báo: Không thể nạp dữ liệu phim từ lớp config:", e);
    products = [];
    discounts = [];
  } finally {
    // Bắt buộc phải chạy hàm kiểm tra Ready dù việc nạp phim thành công hay thất bại
    checkReady();
  }
}
function checkReady() {
  console.log("Trạng thái geminiKey hiện tại:", geminiKey);

  // Kiểm tra môi trường chạy
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Nâng cấp điều kiện: Chỉ cần Key tồn tại và không bị trống rỗng
  if (geminiKey && geminiKey !== "" && geminiKey !== "__GEMINI_API_KEY__") {
    isReady = true;
    sendBtn.disabled = false;
    headerStatus.textContent = "Sẵn sàng";
    console.log("🤖 Chatbot đã sẵn sàng với Key thực tế.");
  } else if (isLocal) {
    // Nếu chạy ở máy tính (Local) chưa tiêm Key, vẫn mở để test qua server.js (localhost:3000)
    isReady = true;
    sendBtn.disabled = false;
    headerStatus.textContent = "Chạy Local thử nghiệm";
  } else {
    // Biện pháp khẩn cấp: Nếu lên GitHub Pages rồi mà việc tiêm key bị lỗi,
    // Ép hệ thống mở khóa nút để người dùng nhập tin nhắn, lỗi sẽ hiển thị trực tiếp khi bấm gửi thay vì đóng băng.
    isReady = true;
    sendBtn.disabled = false;
    headerStatus.textContent = "Sẵn sàng (Chế độ dự phòng)";
    console.warn(
      "Cảnh báo: Phát hiện chữ thô __GEMINI_API_KEY__, mở khóa chế độ dự phòng.",
    );
  }
}

// ── Fast, Lightweight Prompt Builder ──
function buildPrompt(userMessage) {
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

  let discountSection = "";
  if (discounts && discounts.length > 0) {
    let discountText = discounts
      .map(
        (d) =>
          `Ưu đãi: ${d.offer_name}\n- Điều kiện: ${d.conditions}\n - Giảm giá: ${d.discount}\n - Giảm giá tối đa: ${d.max_discount}\n - Trạng thái: ${d.status || "N/A"}\n`,
      )
      .join("\n\n");
    discountSection = `\n\nDanh sách ưu đãi:\n${discountText}`;
  }

  const systemCtx = `Bạn là trợ lý tư vấn bán vé xem phim thân thiện của rạp CineSeat. Danh sách phim:\n${productText}\n; danh sách ưu đãi: \n${discountSection}\n. Trả lời bằng tiếng Việt, ngắn gọn, hiển thị giá bằng USD.`;

  let historyText = "";
  for (const turn of chatHistory) {
    const role = turn.role === "user" ? "Khách" : "Trợ lý";
    historyText += `${role}: ${turn.parts[0].text}\n`;
  }

  let prompt = systemCtx + "\n\n";
  if (historyText) {
    prompt += "Lịch sử cuộc trò chuyện:\n" + historyText + "\n";
  }
  prompt += "Khách: " + userMessage + "\nTrợ lý:";
  return prompt;
}
// if (
//   window.location.hostname === "localhost" ||
//   window.location.hostname === "127.0.0.1"
// ) {
//   geminiKey = "";
// }
// ── Send to Gemini ──
async function sendToGemini(userMessage) {
  let url = "";
  let body = {};

  // SỬA LỖI 2: Phân tách định tuyến thông minh theo phương thức triển khai đám mây
  // Nếu đã đưa lên GitHub Pages: Gọi thẳng trực tiếp tới cấu trúc API của Google bằng Key đã được robot tự động tiêm vào
  url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`;
  body = {
    contents: [{ role: "user", parts: [{ text: buildPrompt(userMessage) }] }],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(
      err.error?.message || err.error || `HTTP Lỗi: ${res.status}`,
    );
  }

  const data = await res.json();

  // Bóc tách linh hoạt cấu trúc trả về từ Server Proxy hoặc từ máy chủ Google trực tiếp
  if (data.reply) return data.reply;
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi."
  );
}

// ── Chat logic ──
async function chat(userMessage) {
  if (!isReady) {
    alert("Hệ thống trợ lý đang khởi tạo dữ liệu, vui lòng đợi giây lát!");
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
    appendMessage("bot", `❌ Lỗi kết nối AI: ${e.message}`);
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
