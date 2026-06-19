// Export APIs
export const BASE_URL =
  "https://script.google.com/macros/s/AKfycbzXSjNUF9dy0Ewz83AaF3AXy4xQhzUHiFt1C0N_RyfbQrWwr3QPV1vl_A8-mXe3WjtjhA/exec";
export const PRODUCTS_API = `${BASE_URL}?sheetName=Movies`;
export const DISCOUNTS_API = `${BASE_URL}?sheetName=Discounts`;
export const THEATRES_API = `${BASE_URL}?sheetName=Theatres`;
export const SCHEDULE_API = `${BASE_URL}?sheetName=Seats`;
console.log(PRODUCTS_API, DISCOUNTS_API, THEATRES_API, SCHEDULE_API);
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
    const [productsRes, discountsRes, theatresRes, scheduleRes] =
      await Promise.all([
        fetch(PRODUCTS_API),
        fetch(DISCOUNTS_API),
        fetch(THEATRES_API),
        fetch(SCHEDULE_API),
      ]);

    // Raw Extractions
    const rawProductsBundle = await productsRes.json();
    const rawDiscountsBundle = await discountsRes.json();
    // const rawTheatresBundle = await theatresRes.json();
    // const rawScheduleBundle = await scheduleRes.json();

    // Extract arrays based on original structure detection rules
    const productsList = extractArray(
      rawProductsBundle?.products || rawProductsBundle,
    );
    const discountsList = extractArray(
      rawDiscountsBundle?.products || rawDiscountsBundle,
    );
    // const theatresList = extractArray(
    //   rawTheatresBundle?.theatres || rawTheatresBundle,
    // );
    // const scheduleList = extractArray(
    //   rawScheduleBundle?.schedule || rawScheduleBundle,
    // );

    // Central Deciphering Engine: Map numbers/IDs into clean relational Objects
    // const processedProducts = productsList.map((movie) => {
    //   let formattedScheduleIds = [];
    //   const theatresInput = movie.theatres;

    //   if (typeof theatresInput === "string") {
    //     const trimmed = theatresInput.trim();
    //     if (trimmed.startsWith("[")) {
    //       try {
    //         formattedScheduleIds = JSON.parse(trimmed);
    //       } catch {
    //         formattedScheduleIds = trimmed.split(",").map((id) => id.trim());
    //       }
    //     } else {
    //       formattedScheduleIds = trimmed.split(",").map((id) => id.trim());
    //     }
    //   } else if (Array.isArray(theatresInput)) {
    //     formattedScheduleIds = theatresInput;
    //   } else if (theatresInput) {
    //     formattedScheduleIds = [theatresInput];
    //   }

    //   // Match raw IDs against the full imported schedule objects list
    //   const matchedSchedules = formattedScheduleIds
    //     .map((id) => scheduleList.find((s) => Number(s.id) === Number(id)))
    //     .filter(Boolean);

    //   // Group showtimes by venue/style configurations
    //   const groups = {};
    //   matchedSchedules.forEach((session) => {
    //     const groupKey = `${session.theatres} (${session.style})`;
    //     const date = new Date(session.time);
    //     const timeStr = date.toLocaleTimeString("en-US", {
    //       hour: "2-digit",
    //       minute: "2-digit",
    //       hour12: false,
    //       timeZone: "Asia/Bangkok",
    //     });

    //     if (!groups[groupKey]) groups[groupKey] = [];
    //     groups[groupKey].push({
    //       time: timeStr,
    //       seats: session.seats || "Trống",
    //     });
    //   });

    //   // Build out the dynamic localized text mapping for this movie block
    //   let compiledScheduleText = "Chưa có lịch chiếu";
    //   if (Object.keys(groups).length > 0) {
    //     compiledScheduleText = Object.entries(groups)
    //       .map(([name, times]) => {
    //         const sessionsTxt = times
    //           .map(
    //             (s) =>
    //               `\n    * Suất ${s.time} - Trạng thái ghế: [ ${s.seats} ]`,
    //           )
    //           .join("");
    //         return `\n  + ${name}:${sessionsTxt}`;
    //       })
    //       .join("");
    //     compiledScheduleText += `\n\n* Ghi chú hướng dẫn AI: Cấu trúc của phần trạng thái ghế là (Hàng ghế)+(Số ghế) và đi kèm dấu '#' nếu như ghế đó đã được đặt (Ví dụ: A3# là đã đặt, A4 là ghế trống).`;
    //   }

    //   return {
    //     ...movie,
    //     decipheredSchedules: matchedSchedules,
    //     prebuiltScheduleString: compiledScheduleText,
    //   };
    // });

    cachedData = {
      products: productsList,
      discounts: discountsList,
      // theatres: theatresList,
      // schedule: scheduleList,
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
