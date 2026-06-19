import { fetchData } from "./config.js";
import {
  logout,
  checkLoggedIn,
  redirectTo,
  allReady,
  addToCart,
} from "./general.js";

const appData = await fetchData();
function loadTickets() {
  const movieData = appData.products;
  const accounts = JSON.parse(localStorage.getItem("users")) || [];
  const usernameSession = localStorage.getItem("currentUser");
  console.log(accounts);
  // 2. Safety Check: If no user string is logged in, stop right here
  if (!usernameSession) {
    console.error("No active user session found. Please log in.");
    alert("Please log in to add items to your cart!");
  }

  // 3. Find the matching user object within our account list array
  const matchedUser = accounts.find((u) => u.username === usernameSession);
  let data = matchedUser.cart;
  const ticketContainer = document.querySelector(".ticket-container");
  ticketContainer.innerHTML = "";

  if (data == "") {
    ticketContainer.innerHTML = "<p>No tickets here.</p>";
  } else {
    data.forEach((t) => {
      console.log(t.title);
      const ticket = document.createElement("div");
      ticket.className = "ticket";
      ticket.innerHTML = `
            <h4 class="ticket-name">${t.title}</h4>
            <div class="ticket-info-container">
              <div class="infobox">
                <p>Total Price</p>
                <h4>$${t.price}</h4>
              </div>
              <div class="infobox">
                <p>Date</p>
                <h4>${t.date}</h4>
              </div>
              <div class="infobox"  style="width: 60px !important">
                <p>Time</p>
                <h4>${t.time}</h4>
              </div>
            </div>
            <button class="del-btn" id=${t.id}>
              <i class="fa-regular fa-trash-can del-i"></i>
            </button>`;
      ticketContainer.appendChild(ticket);
      const del_btn = document.getElementById(t.id);

      del_btn.addEventListener("click", (e) => {
        e.preventDefault();
        alert("Canceling ticket succeeded.");
        data = data.filter((item) => item.id !== t.id);
        matchedUser.cart = data;
        console.log(accounts);
        localStorage.setItem("users", JSON.stringify(accounts));
        loadTickets();
      });
    });
  }
  allReady();
}
loadTickets();
