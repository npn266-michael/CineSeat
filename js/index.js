// ── Refactored Imports ──
// Removed PRODUCTS_API and DISCOUNTS_API imports
import { fetchData } from "./config.js";
import {
  logout,
  checkLoggedIn,
  redirectTo,
  allReady,
  addToCart,
  buttonLinkHandler,
  popup,
  movieSum,
  dateSum,
  timeSum,
  ticketTotal,
  fee,
  total,
} from "./general.js";
// const hero_switcher_items = document.querySelectorAll(".hero-switcher-item");
// hero_switcher_items.forEach((item) => {
//   item.addEventListener("click", () => {
//     hero_switcher_items.forEach((i) => i.classList.remove("active"));
//     item.classList.add("active");
//   });
// });

// ── Unified Data Fetch & Initialization ──
async function initializeDashboard() {
  try {
    // Single call safely retrieves cached responses for both datasets
    const appData = await fetchData();

    // 🌟 LEAVING OBJECT PROPERTIES ALONE: Processing movie array
    const movieData = appData.products;
    console.log("Dữ liệu phim:", movieData);
    var finalMovies = movieData;
    renderMovies(finalMovies);

    const discountData = appData.discounts;
    console.log("Dữ liệu giảm giá:", discountData);
    const finalDiscounts =
      discountData && Array.isArray(discountData.products)
        ? discountData.products
        : Array.isArray(discountData)
          ? discountData
          : [];
    renderDiscounts(finalDiscounts.splice(0, 4));
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu trang chủ:", error);
    // Fallbacks to keep rendering from breaking on empty results
    renderMovies([]);
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
  allReady();
}

function renderMovies(movies) {
  const moviesContainer = document.getElementById("now-showing");
  moviesContainer.innerHTML = "";
  const upcomingMoviesContainer = document.getElementById("upcoming-releases");
  const movieSelector = document.getElementById("movie-selector");
  upcomingMoviesContainer.innerHTML = "";
  var upcomingMovies = [];
  var anchor = 0;
  var anchor2 = 0;
  movies.forEach((movie) => {
    var currentDate = new Date();
    var airingDate = new Date(movie.airingdate);
    movieSelector.innerHTML += `<option value="${movie.id}">${movie.title}</option>`;
    if (airingDate > currentDate) {
      if (anchor >= 4) return;
      anchor++;
      upcomingMovies.push(movie);
      console.log("Phim sắp chiếu:", movie);
      const movieCard = document.createElement("div");
      movieCard.className = "card";
      movieCard.innerHTML = `
        <div class="img-container">
          <img src="${movie.posterlink || "img/default-poster.png"}" alt="${movie.title}" onerror="this.onerror=null; this.src='./img/none.jpg'" class="card-img" />
          <div class="rating">
            <span class="tag tag-orange">${movie.rated || "N/A"}</span>
          </div>
          <div class="img-cover">
            <div class="img-cover-btn-container">
              <button class="cta-button cta-hero" id="trailer-btn">Trailer</button>
              <button class="cta-button cta-hero-border" id="details-btn">Details</button>
            </div>
          </div>
        </div>
        <h4>${movie.title}</h4>
        <p>Genre: ${movie.genre}</p>
      `;
      if (movie.clip === "") {
        movieCard.querySelector("#trailer-btn").style.display = "none";
      }
      upcomingMoviesContainer.appendChild(movieCard);
      buttonLinkHandler(
        movieCard,
        "#details-btn",
        `details.html?id=${movie.id}`,
      );
      buttonLinkHandler(movieCard, "#trailer-btn", `${movie.clip || "#"}`);
    } else {
      if (anchor2 >= 4) return;
      anchor2++;
      const movieCard = document.createElement("div");
      movieCard.className = "card";
      movieCard.innerHTML = `
      <div class="img-container">
        <img src="${movie.posterlink || "img/default-poster.png"}" alt="${movie.title}" onerror="this.onerror=null; this.src='./img/none.jpg'" class="card-img" />
        <div class="rating">
            <div class="audience-rating-box">
              <i class="fa-solid fa-star"></i>
              <span>${movie.audiencerating || "N/A"}</span>
            </div>
            <span class="tag tag-orange">${movie.rated || "N/A"}</span>
        </div>
        <div class="img-cover">
          <div class="img-cover-btn-container">
            <button class="cta-button cta-hero" id="trailer-btn">Trailer</button>
            <button class="cta-button cta-hero-border" id="details-btn">Details</button>
          </div>
        </div>
      </div>
      <h4>${movie.title}</h4>
      <p>Genre: ${movie.genre}</p>
    `;
      if (movie.clip === "") {
        movieCard.querySelector("#trailer-btn").style.display = "none";
      }
      moviesContainer.appendChild(movieCard);
      buttonLinkHandler(
        movieCard,
        "#details-btn",
        `details.html?id=${movie.id}`,
      );
      buttonLinkHandler(movieCard, "#trailer-btn", `${movie.clip || "#"}`);
    }
  });
}
const hero_booking_form = document.querySelector(".hero-booking-form");
hero_booking_form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!checkLoggedIn()) {
    return; // Completely halts execution if user isn't authenticated
  }
  const movieId = document.getElementById("movie-selector").value;
  const showDate = document.getElementById("showdate").value;
  const showTime = document.getElementById("time-selector").value;
  const appData = await fetchData();
  const movieData = appData.products;

  const matchedMovie = movieData.find((m) => Number(m.id) === Number(movieId));
  console.log(matchedMovie);
  if (matchedMovie) {
    // 🌟 Just call addToCart directly! It handles the user checks internally.
    localStorage.setItem(
      "cart",
      JSON.stringify({
        movieId: movieId,
        title: matchedMovie.title,
        showTime: showTime,
        showDate: showDate,
        price: Number(matchedMovie.base_ticket) + 2,
      }),
    );
    movieSum.innerHTML = `Movie: ${matchedMovie.title}`;
    dateSum.innerHTML = `Date: ${showDate}`;
    timeSum.innerHTML = `Time: ${showTime}`;
    ticketTotal.innerHTML = `Ticket: $${Number(matchedMovie.base_ticket)}`;
    total.innerHTML = `Total: $${Number(matchedMovie.base_ticket) + 2}`;
    popup.classList.add("active");
  } else {
    console.error("Movie not found.");
  }
});
// ── Run Dashboard Initialization ──
initializeDashboard();
