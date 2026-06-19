import { fetchData } from "./config.js";
import {
  logout,
  checkLoggedIn,
  redirectTo,
  allReady,
  addToCart,
  buttonLinkHandler,
} from "./general.js";
async function initializeDashboard() {
  try {
    const appData = await fetchData();

    // 🌟 LEAVING OBJECT PROPERTIES ALONE: Processing movie array
    const discountData = appData.discounts;
    var finalDiscounts = discountData;
    renderDiscounts(finalDiscounts);
    allReady();
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu trang chủ:", error);
    // Fallbacks to keep rendering from breaking on empty results
    renderDiscounts([]);
  }
}
function renderDiscounts(discounts) {
  const discountsContainer = document.getElementById("offers");
  discountsContainer.innerHTML = "";
  discounts.forEach((discount) => {
    const discountCard = document.createElement("div");
    const a = document.createElement("a");
    a.href = "#";
    a.appendChild(discountCard);
    a.classList.add("discount-link");
    discountCard.className = "discount-card";

    // 🌟 LEAVING OBJECT PROPERTIES ALONE: Original innerHTML template
    discountCard.innerHTML = `
      <div class="discount-info">
        <h4>${discount.offer_name || "N/A"}</h4>
        <p>${discount.conditions || "N/A"}</p>
        <p>Valid from ${new Date(discount.valid_from).toLocaleDateString() || "N/A"} to ${new Date(discount.valid_until).toLocaleDateString() || "N/A"}</p>
      </div>
      <div class="discount-value">
        <h1>${discount.discount || "N/A"}</h1>
      </div>
    `;
    discountsContainer.appendChild(a);
  });
}
initializeDashboard();
