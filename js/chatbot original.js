// import { fetchData, geminiKey, GEMINI_MODEL } from "./config.js";
// let products = [];
// let discounts = [];
// let theatres = [];
// let schedule = [];
// let chatHistory = [];
// let isReady = false;

// // ── DOM refs ──
// const messagesEl = document.getElementById("messages");
// const inputEl = document.getElementById("user-input");
// const sendBtn = document.getElementById("send-btn");
// const chatPanel = document.getElementById("chat-panel");
// const chatToggle = document.getElementById("chat-toggle");
// const chatBadge = document.getElementById("chat-badge");
// const headerStatus = document.getElementById("header-status");
// const closeBtn = document.getElementById("close-btn");

// // ── Toggle open/close ──
// chatToggle.addEventListener("click", () => {
//   chatPanel.classList.toggle("open");
//   chatBadge.style.display = "none";
// });

// closeBtn.addEventListener("click", () => {
//   chatPanel.classList.remove("open");
// });

// async function loadProducts() {
//   try {
//     const res = await fetch(PRODUCTS_API);
//     const data = await res.json();

//     // SỬA LỖI TẠI ĐÂY: Tự động tìm mảng dữ liệu bất kể Google Script trả về kiểu gì
//     if (data && Array.isArray(data.products)) {
//       products = data.products;
//     } else if (Array.isArray(data)) {
//       products = data; // Nếu dữ liệu trả về trực tiếp là 1 mảng
//     } else if (data && typeof data === "object") {
//       // Tìm thuộc tính bất kỳ trong Object chứa một mảng
//       const fallbackKey = Object.keys(data).find((key) =>
//         Array.isArray(data[key]),
//       );
//       products = fallbackKey ? data[fallbackKey] : [];
//     } else {
//       products = [];
//     }

//     console.log("Sản phẩm đã tải:", products);
//     const discountsData =
//       appData.discountsData || (await fetchData()).discounts; // Cố gắng lấy từ appData trước, nếu không có thì fetch
//     if (discountsData && Array.isArray(discountsData.products)) {
//       discounts = discountsData.products;
//     } else if (Array.isArray(discountsData)) {
//       discounts = discountsData; // Nếu dữ liệu trả về trực tiếp là 1 mảng
//     } else if (discountsData && typeof discountsData === "object") {
//       // Tìm thuộc tính bất kỳ trong Object chứa một mảng
//       const fallbackKey = Object.keys(discountsData).find((key) =>
//         Array.isArray(discountsData[key]),
//       );
//       discounts = fallbackKey ? discountsData[fallbackKey] : [];
//     } else {
//       discounts = [];
//     }
//     checkReady();
//   } catch (e) {
//     console.error(
//       "Không thể tải dữ liệu sản phẩm. Kích hoạt chế độ dự phòng.",
//       e,
//     );
//     products = []; // Gán mảng rỗng để không bị lỗi crash code map() ở dưới
//     discounts = []; // Gán mảng rỗng cho discounts
//     checkReady(); // Vẫn cho phép Chatbot hoạt động kể cả khi lỗi dữ liệu Sheets
//   }
// }

// function checkReady() {
//   // Thay đổi điều kiện: Chỉ cần có API Key là nút chat sẽ mở khóa, không bắt buộc độ dài mảng Sheets phải lớn hơn 0
//   if (geminiKey) {
//     isReady = true;
//     sendBtn.disabled = false;
//     headerStatus.textContent = "Sẵn sàng";
//   }
// }

// // ── Build single prompt (nối history thành 1 chuỗi) ──
// function buildPrompt(userMessage) {
//   let productList = products
//     .map((p) => {
//       // Xử lý chuỗi JSON theatres sang định dạng dễ đọc cho AI
//       let schedule = "";
//       try {
//         const theatresObj =
//           typeof p.theatres === "string" ? JSON.parse(p.theatres) : p.theatres;
//         schedule = Object.entries(theatresObj)
//           .map(([name, times]) => `${name}: ${times.join(", ")}`)
//           .join(" | ");
//       } catch (e) {
//         schedule = p.theatres || "Chưa có lịch chiếu";
//       }

//       return (
//         `Phim: ${p.title}\n` +
//         `- Thể loại: ${p.genre} | Định dạng: ${p.style} | Giới hạn: ${p.rated}\n` +
//         `- Giá vé: ${p.ticketprice} | Đánh giá: ${p.audiencerating} | Thời lượng: ${p.duration} phút\n` +
//         `- Lịch chiếu các rạp: ${p.theatres || "Chưa có lịch chiếu"}\n` +
//         `- Tóm tắt: ${p.desc}\n` +
//         `- Giá vé cơ bản: ${p.base_ticket || "N/A"}` +
//         `- Giá vé VIP: ${p.premium_ticket || "N/A"}` +
//         `- Giá vé sofa: ${p.sofa_ticket || "N/A"}`
//       );
//     })
//     .join("\n\n");
//   let discountList = discounts;
//   if (discountList.length > 0) {
//     let discountText = discountList
//       .map(
//         (d) =>
//           `Ưu đãi: ${d.offer_name}\n- Điều kiện: ${d.conditions} - Giảm giá: ${d.discount} - Giảm giá tối đa: ${d.max_discount} - Trạng thái: ${d.status || "N/A"}- Từ ngày: ${d.valid_from || "N/A"} - Đến ngày: ${d.valid_until || "N/A"}\n`,
//       )
//       .join("\n\n");
//     productList += `\n\nDanh sách ưu đãi:\n${discountText}`;
//   }
//   console.log("Danh sách sản phẩm cho prompt:", productList);
//   const systemCtx = `Bạn là trợ lý tư vấn bán vé xem phim thân thiện. Danh sách phim và vé:\n${productList}\n; cùng với danh sách ưu đãi: ${discountList.length > 0 ? "Có" : "Không có"}. Mỗi phần tử của danh sách là một phim hoặc vé xem phim với đầy đủ thông tin bạn cần. Trả lời bằng tiếng Việt, ngắn gọn, hiển thị giá bằng USD.`;

//   let historyText = "";
//   for (const turn of chatHistory) {
//     const role = turn.role === "user" ? "Khách" : "Trợ lý";
//     historyText += `${role}: ${turn.parts[0].text}\n`;
//   }

//   return `${systemCtx}\n\n${historyText ? "Lịch sử:\n" + historyText + "\n" : ""}Khách: ${userMessage}\nTrợ lý:`;
// }

// // ── Send to Gemini ──
// async function sendToGemini(userMessage) {
//   const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`;

//   const body = {
//     contents: [{ role: "user", parts: [{ text: buildPrompt(userMessage) }] }],
//   };

//   const res = await fetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(body),
//   });

//   if (!res.ok) {
//     const err = await res.json();
//     throw new Error(err.error?.message || `HTTP ${res.status}`);
//   }

//   const data = await res.json();
//   return (
//     data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi."
//   );
// }

// // ── Chat logic ──
// async function chat(userMessage) {
//   if (!isReady) {
//     alert("Vui lòng nhập Gemini API key và chờ dữ liệu tải!");
//     return;
//   }
//   if (!userMessage.trim()) return;

//   appendMessage("user", userMessage);
//   inputEl.value = "";
//   sendBtn.disabled = true;

//   const typingEl = appendMessage("typing", "⏳ Đang suy nghĩ...");

//   try {
//     const reply = await sendToGemini(userMessage);

//     // Save to history
//     chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
//     chatHistory.push({ role: "model", parts: [{ text: reply }] });

//     typingEl.remove();
//     appendMessage("bot", reply, true);
//   } catch (e) {
//     typingEl.remove();
//     appendMessage("bot", `❌ Lỗi: ${e.message}`);
//   } finally {
//     sendBtn.disabled = false;
//     inputEl.focus();
//   }
// }

// // ── UI helpers ──
// function appendMessage(type, text, showBadge = false) {
//   const div = document.createElement("div");
//   div.className = `message ${type}`;
//   div.textContent = text;
//   messagesEl.appendChild(div);
//   messagesEl.scrollTop = messagesEl.scrollHeight;
//   if (showBadge && !chatPanel.classList.contains("open")) {
//     chatBadge.style.display = "block";
//   }
//   return div;
// }

// window.askSuggestion = function (btn) {
//   inputEl.value = btn.textContent.trim();
//   chat(btn.textContent.trim());
// };

// // ── Event listeners ──
// sendBtn.addEventListener("click", () => chat(inputEl.value));

// inputEl.addEventListener("keydown", (e) => {
//   if (e.key === "Enter" && !e.shiftKey) {
//     e.preventDefault();
//     chat(inputEl.value);
//   }
// });

// // ── Init ──
// loadProducts();
