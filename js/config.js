// Export APIs
export const BASE_URL =
  "https://script.google.com/macros/s/AKfycbzXSjNUF9dy0Ewz83AaF3AXy4xQhzUHiFt1C0N_RyfbQrWwr3QPV1vl_A8-mXe3WjtjhA/exec";
export const PRODUCTS_API = `${BASE_URL}?sheetName=Movies`;
export const DISCOUNTS_API = `${BASE_URL}?sheetName=Discounts`;
console.log(PRODUCTS_API, DISCOUNTS_API);
let cachedData;
const CACHE_KEY = "cineseat_session_cache";

// Fetching and extracting data
export async function fetchData() {
  if (cachedData) return cachedData;

  // 2. Browser Session Storage check (for page-to-page navigation persistence)
  const persistentCache = sessionStorage.getItem(CACHE_KEY);
  if (persistentCache) {
    try {
      cachedData = JSON.parse(persistentCache);
      console.log(
        "⚡ [CineSeat Cache]: Data loaded instantly from browser session storage.",
      );
      return cachedData;
    } catch (e) {
      console.warn(
        "Cache corruption detected, falling back to clean network fetch...",
      );
      sessionStorage.removeItem(CACHE_KEY);
    }
  }

  try {
    console.log(
      "🌐 Triggering localized network loader across Google App Endpoints...",
    );
    const [productsRes, discountsRes] = await Promise.all([
      fetch(PRODUCTS_API),
      fetch(DISCOUNTS_API),
    ]);

    // Raw Extractions
    const rawProductsBundle = await productsRes.json();
    const rawDiscountsBundle = await discountsRes.json();

    // Extract arrays based on original structure detection rules
    const productsList = extractArray(
      rawProductsBundle?.products || rawProductsBundle,
    );
    const discountsList = extractArray(
      rawDiscountsBundle?.products || rawDiscountsBundle,
    );

    cachedData = {
      products: productsList,
      discounts: discountsList,
    };

    // 🌟 SAVE TO LOCAL PERSISTENCE STORAGE
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));

    console.log("Dữ liệu đã xử lý và phân tích cấu trúc hoàn tất.");
    return cachedData;
  } catch (error) {
    console.error("Lỗi khi tải hoặc xử lý cấu trúc dữ liệu:", error);
    throw error;
  }
}

function extractArray(target) {
  if (Array.isArray(target)) return target;
  if (target && typeof target === "object") {
    const key = Object.keys(target).find((k) => Array.isArray(target[k]));
    if (key) {
      return target[key];
    } else {
      return [];
    }
  }
  return [];
}
