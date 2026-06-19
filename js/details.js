import { fetchData } from "./config.js";
import {
  addToCart,
  allReady,
  checkLoggedIn,
  popup,
  movieSum,
  dateSum,
  timeSum,
  ticketTotal,
  fee,
  total,
} from "./general.js";
// const appData = await fetchData();
const movieId = new URLSearchParams(window.location.search).get("id");
const title = document.getElementById("title");
const tagCont = document.getElementById("tagCont");
const genreCont = document.getElementById("genreCont");
const rating = document.getElementById("rating");
const releaseDate = document.getElementById("releaseDateTxt");
const runtime = document.getElementById("runtimeTxt");
const director = document.getElementById("directorTxt");
const lang = document.getElementById("languageTxt");
const description = document.getElementById("description");
const style = document.getElementById("styleCont");
const bookBtn = document.getElementById("bookBtn");
const poster = document.getElementById("poster");
const trailerLink = document.getElementById("trailerLink");
const cast = document.getElementById("actorsTxt");
const dateBtns = document.querySelectorAll(".show-time");
const timeBtns = document.querySelectorAll(".cta-booking");
async function loadMovieDetails() {
  try {
    const appData = await fetchData();
    const movie = appData.products.find(
      (m) => Number(m.id) === Number(movieId),
    );
    if (movie) {
      title.textContent = movie.title;
      tagCont.textContent = movie.rated;
      genreCont.innerHTML = movie.genre
        .split(",")
        .map((g) => `<button class="tag tag-btn">${g}</button>`)
        .join("");
      if (movie.audiencerating === "") {
        rating.style.display = "none";
      } else {
        rating.innerHTML = `<i class="fa-solid fa-star"></i> ${movie.audiencerating || "N/A"}`;
      }
      const airingDate = new Date(movie.airingdate);
      releaseDate.textContent = airingDate.toLocaleDateString("vi-VN") || "N/A";
      runtime.textContent = movie.duration || "N/A";
      director.textContent = movie.director || "N/A";
      lang.textContent = movie.language || "N/A";
      description.textContent = movie.desc || "N/A";
      poster.src = movie.posterlink || "";
      style.innerHTML = movie.style
        .split(",")
        .map((s) => `<button class=" tag tag-btn">${s}</button>`)
        .join("");
      if (movie.clip === "") {
        trailerLink.style.display = "none";
      } else {
        trailerLink.href = movie.clip;
      }
      cast.textContent = movie.casts || "N/A";
    }
    // 1. Declare state trackers in the shared parent scope layout
    let selectedDateId = null;

    dateBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!checkLoggedIn()) return;

        const isActive = btn.classList.contains("active");

        dateBtns.forEach((a) => a.classList.remove("active"));

        if (!isActive) {
          btn.classList.add("active");
          selectedDateId = btn.id; // Update global parent scope tracker state
        } else {
          selectedDateId = null; // Reset if toggled off
        }
      });
    });

    timeBtns.forEach((a) => {
      a.addEventListener("click", () => {
        if (!checkLoggedIn()) return;

        // 2. Add a critical user Guard Check
        if (!selectedDateId) {
          alert("Please select a date first!"); // Please select a date first!
          return;
        }

        let timeId = a.id;
        const [hours, minutes] = timeId.split(":").map(Number);

        let time = new Date();
        time.setHours(hours, minutes, 0, 0);
        console.log(time);

        // 3. Now selectedDateId is perfectly readable here!
        localStorage.setItem(
          "cart",
          JSON.stringify({
            movieId: movieId,
            title: movie.title,
            showTime: timeId, // Storing raw string like "10:00" is usually cleaner for carts
            showDate: selectedDateId, // Safely mapped!
            price: Number(movie.base_ticket) + 2,
          }),
        );
        movieSum.innerHTML = `Movie: ${movie.title}`;
        dateSum.innerHTML = `Date: ${selectedDateId}`;
        timeSum.innerHTML = `Time: ${timeId}`;
        ticketTotal.innerHTML = `Ticket: $${Number(movie.base_ticket)}`;
        total.innerHTML = `Total: $${Number(movie.base_ticket) + 2}`;
        popup.classList.add("active");
      });
    });
    allReady();
  } catch (error) {
    console.error("Error loading movie details:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadMovieDetails);
