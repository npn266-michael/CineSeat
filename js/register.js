let form = document.getElementById("registerForm");
form.addEventListener("submit", function (event) {
  event.preventDefault();

  let username = document.getElementById("username").value.trim();
  let email = document.getElementById("email").value.trim();
  let password = document.getElementById("password").value.trim();
  let passwordConfirm = document.getElementById("verifyPassword").value.trim();

  // 1. Input Format Validation Rules
  if (username.length < 6) {
    alert("Username must be at least 6 characters long");
    return;
  }
  if (password.length < 6) {
    alert("Password must be at least 6 characters long");
    return;
  }
  if (!email.includes("@")) {
    alert("Invalid email format");
    return;
  }
  if (!password.match(/[A-Z]/)) {
    alert("Password must have at least 1 uppercase letter");
    return;
  }
  if (!password.match(/[0-9]/)) {
    alert("Password must have at least 1 number");
    return;
  }
  if (!password.match(/[@$!%*?&#]/)) {
    alert("Password must have at least 1 special character");
    return;
  }
  if (password !== passwordConfirm) {
    alert("Password confirmation does not match");
    return;
  }

  // 2. Fetch current DB state
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // 3. Check for Existing Username Account
  if (users.find((u) => u.username === username)) {
    alert("Username already exists");
    return;
  }
  const newUser = {
    email: email,
    username: username,
    password: password,
    cart: [],
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  alert("Account registered!");
  location.href = "login.html";
});
