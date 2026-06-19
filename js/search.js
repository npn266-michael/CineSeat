import { fetchData } from "./config.js";
import { buttonLinkHandler, allReady } from "./general.js";
// search.html script execution loader
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Snag the current full URL query string parameters sequence
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  // 2. Fetch the value of the specific key token named "query"
  const searchQuery = urlParams.get("query");

  console.log("User searched for:", searchQuery); // Output: "Matrix"

  if (searchQuery) {
    // 3. Trigger your fetch script setup using this dynamic text term
    executeSearchFilter(searchQuery);
  } else {
    console.warn("No search parameters provided.");
  }
});

async function executeSearchFilter(searchTerm) {
  const appData = await fetchData(); // Get your movies array list template
  const movieData = appData.products;

  // Filter out any movie titles containing the search string value terms
  const results = movieData.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  renderResults(results); // Pass this array stack to your UI render loop
}
function renderResults(movies) {
  const container = document.querySelector(".card-grid");

  if (movies.length === 0) {
    container.innerHTML =
      "<p>Không tìm thấy phim nào khớp với từ khóa của bạn.</p>";
    return;
  }
  // Map elements out into UI cards
  // 1. Render all standard cards out to the DOM container setup first
  container.innerHTML = movies
    .map(
      (movie) => `
    <div class="card" data-id="${movie.id}" data-clip="${movie.clip || ""}">
      <div class="img-container">
        <img src="${movie.posterlink || "img/default-poster.png"}" alt="${movie.title}" onerror="this.onerror=null; this.src='./img/none.jpg'" class="card-img" />
        <div class="rating">
          <span class="tag tag-orange">${movie.rated || "N/A"}</span>
        </div>
        <div class="img-cover">
          <div class="img-cover-btn-container">
            <button class="cta-button cta-hero trailer-btn">Trailer</button>
            <button class="cta-button cta-hero-border details-btn">Details</button>
          </div>
        </div>
      </div>
      <h4>${movie.title}</h4>
      <p>Genre: ${movie.genre}</p>
    </div>
  `,
    )
    .join("");

  // 2. Query individual cards now that they safely live in the DOM layer
  const movieCards = container.querySelectorAll(".card");

  movieCards.forEach((movieCard, index) => {
    const movie = movies[index]; // Reference the corresponding data object parameters

    // Run your visibility logic
    if (movie.clip === "") {
      movieCard.querySelector(".trailer-btn").style.display = "none";
    }

    // Bind your link handler routines safely using class lookups
    buttonLinkHandler(movieCard, ".details-btn", `details.html?id=${movie.id}`);
    buttonLinkHandler(movieCard, ".trailer-btn", `${movie.clip || "#"}`);
  });
  allReady();
}
