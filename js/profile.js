import { showPassword, allReady, logout } from "./general.js";
let users = JSON.parse(localStorage.getItem("users")) || [];
const username = localStorage.getItem("currentUser") || "";
const user = users.find((u) => u.username == username);
const usernameLabel = document.getElementById("username");
const emailLabel = document.getElementById("email");
const form = document.getElementById("profile-form");
const editUsernameInput = document.getElementById("username-input");
const editEmailInput = document.getElementById("email-input");
const editPasswordInput = document.getElementById("password-input");
const passwordInput = document.getElementById("password-input");
const passwordHide = document.getElementById("passwordHide");
const del = document.querySelector(".del-btn");
passwordHide.onclick = function () {
  showPassword(passwordInput);
};
if (user) {
  usernameLabel.textContent = username;
  emailLabel.textContent = user.email;
  editUsernameInput.value = username;
  editEmailInput.value = user.email;
  editPasswordInput.value = user.password;
  allReady();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  user.username = editUsernameInput.value;
  user.email = editEmailInput.value;
  user.password = editPasswordInput.value;
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", user.username);
  usernameLabel.textContent = editUsernameInput.value;
  emailLabel.textContent = "Email: " + editEmailInput.value;
  alert("Profile updated successfully!");
});
del.addEventListener("click", (e) => {
  e.preventDefault();
  del_account();
  logout();
});
function del_account() {
  if (!user) {
    return;
  }
  users = users.filter((u) => u.username !== user.username);
  localStorage.setItem("users", JSON.stringify(users));
  alert("Account deleted.");
}
