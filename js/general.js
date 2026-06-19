import { fetchData } from "./config.js";

let searchIndex = 0;
let profileAnchor = 0;
const profileButton = document.getElementById("profile-button");
const accountDropdown = document.getElementById("account-box");
const loginDropdown = document.getElementById("login-box");
const logoutBtn = document.getElementById("logout");
const myAccount = document.getElementById("myAccount");
const navLinks = document.querySelectorAll(".nav-link");
const searchBtn = document.getElementById("search-button");
const searchInputWrapper = document.querySelector(".search");
const searchIcon = document.getElementById("searchImg");
const searchInput = document.querySelector(".search-input");
export const popup = document.getElementById("confirmTicket");
const cancelBtn = document.querySelector(".cancelButton");
const confirmTicket = document.querySelector(".finalSubmit");
const loading = document.querySelector(".loading");
export const movieSum = document.getElementById("movieSum");
export const dateSum = document.getElementById("dateSum");
export const timeSum = document.getElementById("timeSum");
export const ticketTotal = document.getElementById("ticketTotal");
export const fee = document.getElementById("fee");
export const total = document.getElementById("total");
const burgerBtn = document.getElementById("burger-btn");
const mobileMenu = document.getElementById("mobile-menu");
if (burgerBtn) {
  burgerBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");

    const icon = burgerBtn.querySelector("i");

    if (mobileMenu.classList.contains("active")) {
      icon.classList.remove("fa-bars");
      icon.classList.add("fa-xmark");
    } else {
      icon.classList.remove("fa-xmark");
      icon.classList.add("fa-bars");
    }
  });
}
const mobileGuestMenu = document.getElementById("mobile-guest-menu");
const mobileAccountMenu = document.getElementById("mobile-account-menu");

function updateMobileMenu(isLoggedIn) {
  if (mobileGuestMenu || mobileAccountMenu) {
    if (isLoggedIn) {
      mobileGuestMenu.style.display = "none";
      mobileAccountMenu.style.display = "flex";
    } else {
      mobileGuestMenu.style.display = "flex";
      mobileAccountMenu.style.display = "none";
    }
  }
}
if (localStorage.getItem("currentUser")) {
  updateMobileMenu(true);
} else {
  updateMobileMenu(false);
}
const mobileLogout = document.getElementById("mobile-logout");
if (mobileLogout) {
  mobileLogout.addEventListener("click", () => {
    localStorage.removeItem("currentUser"); // or your login key

    updateMobileMenu(false);

    logout();
  });
}
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    // 🌟 1. Let standard auth pages bypass entirely and navigate naturally
    if (link.id === "login" || link.id === "register") {
      return;
    }

    // 🌟 2. Block default behavior only for our custom interactive panels
    const isSearchBtn = link.id === "search-button";
    const isProfileBtn = link.id === "profile-button";

    if (isSearchBtn || isProfileBtn) {
      e.preventDefault();
    }

    const currentUser = localStorage.getItem("currentUser");

    // --- 🔍 HANDLE SEARCH DROPDOWN ---
    if (isSearchBtn) {
      // Toggle the active class. It returns true if added, false if removed.
      const isSearchNowOpen = searchInputWrapper.classList.toggle("active");

      if (isSearchNowOpen) {
        searchInput.focus();
        searchIcon.style.opacity = 1;
        searchInput.style.opacity = 1;
      }

      // Cleanly close the other dropdown if it was open
      accountDropdown.classList.remove("active");
      loginDropdown.classList.remove("active");
      hideDropdown(accountDropdown);
      hideDropdown(loginDropdown);
    }

    // --- 👤 HANDLE PROFILE DROPDOWN ---
    if (isProfileBtn) {
      // Decide which dropdown element we are actually targeting based on auth status
      const targetDropdown = currentUser ? accountDropdown : loginDropdown;
      const otherDropdown = currentUser ? loginDropdown : accountDropdown;

      // Toggle its active class state
      const isMenuNowOpen = targetDropdown.classList.toggle("active");

      // Make sure the opposite menu is strictly closed
      otherDropdown.classList.remove("active");
      hideDropdown(otherDropdown);

      if (isMenuNowOpen) {
        // If logged in, update the text panel node dynamically
        showDropdown(targetDropdown);
      } else {
        // 🌟 FIXED: Cleanly hide it when the user clicks to close it!
        hideDropdown(targetDropdown);
      }

      // Cleanly close search bar if user opened profile menu
      searchInputWrapper.classList.remove("active");
    }
  });
});
if (cancelBtn) {
  cancelBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.setItem("cart", "");
    popup.classList.remove("active");
  });
}
if (confirmTicket) {
  confirmTicket.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Booking succeeded.");
    const a = JSON.parse(localStorage.getItem("cart"));
    console.log(a);
    addToCart(a.movieId, a.title, a.showTime, a.showDate, a.price);
    localStorage.setItem("cart", "");
    popup.classList.remove("active");
  });
}
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    logout();
  });
}
function showDropdown(element) {
  element.style.opacity = 1;
  element.style.visibility = "visible";
  element.style.pointerEvents = "auto";
}

function hideDropdown(element) {
  element.style.opacity = 0;
  element.style.visibility = "hidden";
  element.style.pointerEvents = "none";
}

// searchBtn.addEventListener("click", (e) => {
//   e.preventDefault();
//   searchIndex++;
//   const isSearchOpen = searchInputWrapper.classList.toggle(
//     "active",
//     searchIndex % 2 === 1,
//   );
//   if (isSearchOpen) {
//     searchInput.focus();
//     searchIcon.style.opacity = 1;
//     searchInput.style.opacity = 1;
//   }
// });
export function addToCart(id, title, time, date, price) {
  const accounts = JSON.parse(localStorage.getItem("users")) || [];
  const currentUsername = localStorage.getItem("currentUser");

  // 1. Safety Check: If no user is logged in, stop immediately
  if (!currentUsername) {
    console.error("No active user session found.");
    alert("Please log in to add items to your cart!");
    return;
  }

  // 2. Find the logged-in user account object within our array database
  const matchedUser = accounts.find((u) => u.username === currentUsername);

  // 3. Fallback: If the user session string exists but isn't found in our records
  if (!matchedUser) {
    console.error(
      "Username session data does not exist in the database system.",
    );
    return;
  }

  // 4. Ensure the cart property is structured as a valid, pushable array
  if (!Array.isArray(matchedUser.cart)) {
    matchedUser.cart = [];
  }

  // 5. Directly push the brand new item properties structure onto the array
  matchedUser.cart.push({
    id: id,
    title: title,
    time: time,
    date: date,
    price: price,
  });

  console.log("Added brand new ticket to user's cart:", title);

  // 6. Save the entire updated accounts directory back to local storage
  localStorage.setItem("users", JSON.stringify(accounts));
}
export function allReady() {
  setTimeout(function settime() {
    loading.classList.add("done");
    console.log("All systems ready!");
  }, 500);
}
export function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = `login.html`;
}
export function redirectTo(url) {
  window.location.href = url;
}
export function checkLoggedIn() {
  if (!localStorage.getItem("currentUser")) {
    logout();
    return false; // Stop right here
  }
  return true; // Safe to proceed
}
export function buttonLinkHandler(container, querySelector, link) {
  const btn = container.querySelector(querySelector);
  btn.addEventListener("click", () => {
    redirectTo(link);
  });
}
export function showPassword(obj) {
  const passwordInput = obj;
  if (passwordInput) {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
    } else {
      passwordInput.type = "password";
    }
  }
}
