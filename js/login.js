import { showPassword } from "./general.js";
const password = document.getElementById("password");
const passwordHide = document.getElementById("passwordHide");

// Wrap the call inside an anonymous function
passwordHide.onclick = function () {
  showPassword(password);
};
let form = document.getElementById("loginForm");
if (localStorage.getItem("currentUser") !== null) {
  localStorage.removeItem("currentUser");
}
form.addEventListener("submit", function (event) {
  event.preventDefault();

  let username = document.getElementById("username").value.trim();
  let password = document.getElementById("password").value.trim();
  if (username === "" || password === "") {
    alert("Please enter both username and password");
    return;
  }
  if (localStorage.getItem("users") === null) {
    alert("No accounts found. Please register first.");
    return;
  } else {
    const users = JSON.parse(localStorage.getItem("users"));
    const user = users.find(
      (u) => u.username === username && u.password === password,
    );
    if (user) {
      alert("Login successful");

      localStorage.setItem("currentUser", user.username);
      location.href = `index.html`;
    } else {
      alert("Invalid username or password");
    }
  }
});
