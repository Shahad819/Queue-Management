
// ===== STORAGE =====
let queue = JSON.parse(localStorage.getItem("queue")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

let alertShown = false;
let servedAlertShown = false;

// ===== GENERATE TOKEN =====
function generateToken(service) {
  const token = Math.floor(100 + Math.random() * 900);

  const user = {
    token,
    service,
    status: "Waiting"
  };

  queue.push(user);
  localStorage.setItem("queue", JSON.stringify(queue));

  localStorage.setItem("currentUser", JSON.stringify(user));

  alert("Token Generated: " + token);

  setTimeout(() => {
    window.location.href = "status.html";
  }, 300);
}

// ===== SHOW STATUS =====
function showStatus() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const queueData = JSON.parse(localStorage.getItem("queue")) || [];

  if (!user) {
    document.body.innerHTML = "<h2 style='text-align:center'>No active token</h2>";
    return;
  }

  let position = queueData.findIndex(u => u.token === user.token) + 1;

  if (position <= 0) position = "Served";

  document.getElementById("token").innerText = user.token;
  document.getElementById("service").innerText = user.service;
  document.getElementById("position").innerText = position;

  document.getElementById("time").innerText =
    typeof position === "number" ? position * 3 + " min" : "Done";
}

// ===== CANCEL =====
function cancelQueue() {
  let user = JSON.parse(localStorage.getItem("currentUser"));

  queue = queue.filter(u => u.token !== user.token);
  localStorage.setItem("queue", JSON.stringify(queue));

  localStorage.removeItem("currentUser");

  alert("Queue Cancelled");
  window.location.href = "index.html";
}

// ===== ADMIN: SERVE NEXT =====
function serveNext() {
  if (queue.length === 0) return;

  let served = queue.shift();
  history.push(served);

  localStorage.setItem("queue", JSON.stringify(queue));
  localStorage.setItem("history", JSON.stringify(history));

  alert("Now Serving: " + served.token);
}

// ===== LIVE WATCHER (SMART SYSTEM) =====
function startQueueWatcher() {
  setInterval(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const queueData = JSON.parse(localStorage.getItem("queue")) || [];

    if (!user) return;

    let position = queueData.findIndex(u => u.token === user.token) + 1;

    if (position > 1) {
      alertShown = false;
    }

    // 🔔 NEXT ALERT
    if (position === 1 && !alertShown) {
      alert("🔔 Your turn is next!");
      alertShown = true;
    }

    // 🎯 SERVED ALERT
    if (position === 0 && !servedAlertShown) {
      alert("🎉 You are being served now!");
      servedAlertShown = true;
    }

    showStatus();
  }, 3000);
}

// ===== SHOW QUEUE LIST (ADMIN STYLE) =====
function showQueue() {
  const container = document.getElementById("queueList");
  if (!container) return;

  const queueData = JSON.parse(localStorage.getItem("queue")) || [];

  container.innerHTML = "";

  queueData.forEach((q, index) => {
    container.innerHTML += `
      <div style="
        background:white;
        margin:5px;
        padding:10px;
        border-radius:8px;
        border-left:5px solid #2d6cdf;
      ">
        <b>#${q.token}</b> - ${q.service}
        <br>
        Position: ${index + 1}
      </div>
    `;
  });
}