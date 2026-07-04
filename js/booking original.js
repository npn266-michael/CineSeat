import { fetchData } from "./config.js";
import { allReady } from "./general.js";
let currentMovie = null;
let selectedSchedule = null;
const selectedSeats = new Map(); // Tracks selected { seatLabel: price }

async function initBookingPage() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = Number(urlParams.get("movieId"));
    const timeframeId = Number(urlParams.get("timeframeId"));

    if (!movieId || !timeframeId) {
      document.getElementById("seat-grid-layout").innerHTML =
        "<p class='error-msg'>Missing parameters in URL.</p>";
      return;
    }

    const appData = await fetchData();
    currentMovie = appData.products.find((p) => Number(p.id) === movieId);

    if (!currentMovie) {
      document.getElementById("seat-grid-layout").innerHTML =
        "<p class='error-msg'>Movie not found.</p>";
      return;
    }

    // Populate static metadata
    document.getElementById("booking-movie-title").textContent =
      currentMovie.title;
    document.getElementById("booking-movie-meta").textContent =
      `${currentMovie.genre} | ${currentMovie.duration} Mins | Rated: ${currentMovie.rated}`;

    selectedSchedule = appData.schedule.find(
      (s) => Number(s.id) === timeframeId,
    );

    console.log("Selected Schedule Found:", selectedSchedule);

    // 🌟 THE FIX: Fire layout assembly here safely AFTER data resolves!
    if (selectedSchedule && selectedSchedule.seats) {
      renderTheaterGrid(selectedSchedule.seats);
    } else {
      document.getElementById("seat-grid-layout").innerHTML =
        "<p class='error-msg'>No seat map available for this session.</p>";
    }
  } catch (error) {
    console.error("Layout initialization failure:", error);
  }
}

function renderTheaterGrid(seatsString) {
  const gridContainer = document.getElementById("seat-grid-layout");
  gridContainer.innerHTML = "";
  updateCartDisplay();

  if (!seatsString) return;

  const seatsArray = seatsString.split(",").map((s) => s.trim());
  const uniqueRows = [];

  seatsArray.forEach((seatToken) => {
    const seatLabel = seatToken.endsWith("#")
      ? seatToken.slice(0, -1)
      : seatToken;
    const row = seatLabel.charAt(0).toUpperCase();
    if (!uniqueRows.includes(row)) uniqueRows.push(row);
  });

  uniqueRows.sort().forEach((rowLetter) => {
    // 1. Render Left Row Badge
    const leftBadge = document.createElement("div");
    leftBadge.className = "row-letter-badge left-marker";
    leftBadge.textContent = rowLetter;
    gridContainer.appendChild(leftBadge);

    // Filter and cleanly isolate the processing row items
    const rowSeats = seatsArray
      .filter((seatToken) => {
        const label = seatToken.endsWith("#")
          ? seatToken.slice(0, -1)
          : seatToken;
        return label.charAt(0).toUpperCase() === rowLetter;
      })
      .sort((a, b) => {
        const numA = parseInt(
          (a.endsWith("#") ? a.slice(0, -1) : a).slice(1),
          10,
        );
        const numB = parseInt(
          (b.endsWith("#") ? b.slice(0, -1) : b).slice(1),
          10,
        );
        return numA - numB;
      });

    // 2. Render Row Element Items
    rowSeats.forEach((seatToken, index) => {
      const isBooked = seatToken.endsWith("#");
      const seatLabel = isBooked ? seatToken.slice(0, -1) : seatToken;
      const seatPriceInfo = getSeatTypeAndPrice(seatLabel);

      const seatDiv = document.createElement("div");
      seatDiv.className = `seat-node ${seatPriceInfo.classType} ${isBooked ? "status-booked" : "status-available"}`;
      seatDiv.dataset.seatId = seatLabel;

      let columnStart = 0;

      // EXPLICIT MATHEMATICAL LAYOUT MAPPING ENGINE
      if (rowLetter === "H") {
        const hMapping = [2, 3, 4, 5, 8, 9, 13, 14, 15, 16];
        columnStart = hMapping[index];
        seatDiv.style.gridColumnStart = columnStart;

        const isCompanion = index % 2 !== 0;
        seatDiv.innerHTML = `${seatLabel}<br><span class="seat-type-sub">${isCompanion ? "C" : "W"}</span>`;
        if (isCompanion) {
          seatDiv.classList.replace("seat-wheelchair", "seat-companion");
        }
      } else if (rowLetter === "I") {
        columnStart = 2 + index * 4;
        seatDiv.style.gridColumn = `${columnStart} / span 3`;
        seatDiv.innerHTML = `${seatLabel}<br><span class="seat-type-sub">SF</span>`;
      } else {
        const seatColNum = index + 1;

        if (seatColNum <= 5) {
          columnStart = seatColNum + 1;
        } else if (seatColNum <= 9) {
          columnStart = seatColNum + 2;
        } else {
          columnStart = seatColNum + 3;
        }
        seatDiv.style.gridColumnStart = columnStart;
        seatDiv.innerHTML = `${seatLabel}<br><span class="seat-type-sub">${seatPriceInfo.label}</span>`;
      }

      if (!isBooked) {
        seatDiv.addEventListener("click", () => {
          const isSelected = seatDiv.classList.toggle("status-selected");
          if (isSelected) {
            selectedSeats.set(seatLabel, seatPriceInfo.price);
          } else {
            selectedSeats.delete(seatLabel);
          }
          updateCartDisplay();
        });
      }

      gridContainer.appendChild(seatDiv);
    });

    // 3. Render Right Mirror Row Badge
    const rightBadge = document.createElement("div");
    rightBadge.className = "row-letter-badge right-marker";
    rightBadge.textContent = rowLetter;
    gridContainer.appendChild(rightBadge);
  });
}

function getSeatTypeAndPrice(seatLabel) {
  const row = seatLabel.charAt(0).toUpperCase();

  const priceBase = parseFloat(currentMovie.base_ticket) || 5.0;
  const priceVIP = parseFloat(currentMovie.premium_ticket) || 8.0;
  const priceSofa = parseFloat(currentMovie.sofa_ticket) || 15.0;

  if (row === "I") {
    return { price: priceSofa, label: "SF", classType: "seat-sofa" };
  } else if (row === "H") {
    return { price: priceBase, label: "W", classType: "seat-wheelchair" };
  } else if (["D", "E", "F", "G"].includes(row)) {
    return { price: priceVIP, label: "VIP", classType: "seat-vip" };
  } else {
    return { price: priceBase, label: "S", classType: "seat-standard" };
  }
}

function updateCartDisplay() {
  const seatsDisplay = document.getElementById("selected-seats-display");
  const priceDisplay = document.getElementById("total-price-display");
  const continueBtn = document.getElementById("checkout-continue-btn");

  if (selectedSeats.size === 0) {
    seatsDisplay.textContent = "None";
    priceDisplay.textContent = "0.00 USD";
    if (continueBtn) continueBtn.disabled = true;
    return;
  }

  const keysArray = Array.from(selectedSeats.keys());
  let totalCost = 0;
  selectedSeats.forEach((price) => {
    totalCost += price;
  });

  seatsDisplay.textContent = keysArray.join(", ");
  priceDisplay.textContent = `${totalCost.toFixed(2)} USD`;
  if (continueBtn) continueBtn.disabled = false;
}

// Global Event Trigger Listener
document.addEventListener("DOMContentLoaded", initBookingPage);
