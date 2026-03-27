function generateToken() {
  let number = Math.floor(Math.random() * 100) + 1;
  document.getElementById("token").innerText = "Your Token Number: " + number;
}