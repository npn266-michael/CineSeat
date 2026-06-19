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
    const movieData = appData.products;
    console.log("Dữ liệu phim:", movieData);
    var finalMovies = movieData;
    renderMovies(finalMovies);
    allReady();
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu trang chủ:", error);
    // Fallbacks to keep rendering from breaking on empty results
    renderMovies([]);
  }
}
function renderMovies(movies) {
  const moviesContainer = document.getElementById("now-showing");
  moviesContainer.innerHTML = "";
  const upcomingMoviesContainer = document.getElementById("upcoming-releases");
  upcomingMoviesContainer.innerHTML = "";
  var upcomingMovies = [];
  movies.forEach((movie) => {
    var currentDate = new Date();
    var airingDate = new Date(movie.airingdate);
    if (airingDate > currentDate) {
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
initializeDashboard();
