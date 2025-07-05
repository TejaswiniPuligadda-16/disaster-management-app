// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCPr8Aljbn8e8Q3SHsyqgf4LjAjAM9MrK8",
  authDomain: "disaster-management-50465.firebaseapp.com",
  databaseURL: "https://disaster-management-50465-default-rtdb.firebaseio.com",
  projectId: "disaster-management-50465",
  storageBucket: "disaster-management-50465.appspot.com",
  messagingSenderId: "1022358263574",
  appId: "1:1022358263574:web:3638027e128a12c0bc2237"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// ✅ Persistent Login
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
function login() {
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("✅ Login successful!");
      window.location.href = "dashboard.html";
    })
    .catch(err => {
      alert("❌ Login failed: " + err.message);
    });
}

// ✅ DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  // SOS Button opens modal
  const sosBtn = document.getElementById("sosBtn");
  if (sosBtn) {
    sosBtn.addEventListener("click", () => {
      const user = auth.currentUser;
      if (!user) return alert("You must be logged in to send SOS.");
      document.getElementById("sosContactModal")?.classList.remove("hidden");
    });
  }

  loadAlerts();
});

// ✅ Load Alerts from Firebase
function loadAlerts() {
  const alertsContainer = document.getElementById("alerts");
  if (!alertsContainer) return;

  db.ref("alerts").on("value", (snapshot) => {
    if (!snapshot.exists()) {
      alertsContainer.innerHTML = "<p class='text-gray-500'>No active alerts</p>";
      return;
    }

    let alertsHTML = "";
    snapshot.forEach((childSnapshot) => {
      const alert = childSnapshot.val();

      // Handle string alerts (old format)
      if (typeof alert === "string") {
        alertsHTML += `
          <div class="p-2 mb-2 border-l-4 border-red-500 bg-red-50">
            <strong class="block text-red-700">Alert</strong>
            <p class="text-sm text-gray-800">${alert}</p>
          </div>
        `;
      } else {
        alertsHTML += `
          <div class="p-2 mb-2 border-l-4 border-red-500 bg-red-50">
            <strong class="block text-red-700">${alert.title || "Alert"}</strong>
            <p class="text-sm text-gray-800">${alert.message || "No details provided"}</p>
            <small class="text-xs text-gray-500">${alert.timestamp ? new Date(alert.timestamp).toLocaleString() : ""}</small>
          </div>
        `;
      }
    });

    alertsContainer.innerHTML = alertsHTML;
  });
}



// ✅ Submit SOS
function submitSOS() {
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in.");

  const name = document.getElementById("sosName")?.value.trim();
  const phone = document.getElementById("sosPhone")?.value.trim();
  const message = document.getElementById("sosMessage")?.value.trim();

  if (!name || !phone || !message) {
    alert("Please fill in all fields.");
    return;
  }

  if (!navigator.onLine) {
    alert("📴 You're offline. Cannot send SOS.");
    return;
  }

  navigator.vibrate?.([200, 100, 200]);
  playAlertSound();

  const handlePush = (location) => {
    const sosData = {
      email: user.email,
      name,
      phone,
      message,
      time: new Date().toLocaleString(),
      location
    };

    db.ref("sosAlerts").push(sosData)
      .then(() => {
        closeContactModal();
        document.getElementById("sosConfirmationModal")?.classList.remove("hidden");
      })
      .catch((err) => {
        console.error("Firebase Push Error:", err.message);
        alert("Error sending SOS: " + err.message);
      });
  };

  // Get user's location
  if (!navigator.geolocation) {
    handlePush("Geolocation not supported");
  } else {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        handlePush(`Lat: ${lat}, Lng: ${lng}`);
      },
      () => handlePush("Location not available"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }
}

// ✅ Close Modals
function closeContactModal() {
  document.getElementById("sosContactModal")?.classList.add("hidden");
}

function closeConfirmationModal() {
  document.getElementById("sosConfirmationModal")?.classList.add("hidden");
}

// ✅ Play Alert Sound
function playAlertSound() {
  const audio = document.getElementById("alertSound");
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch((e) => console.warn("Audio play failed:", e));
  }
}

// ✅ Logout
function logout() {
  auth.signOut()
    .then(() => {
      window.location.href = "login.html";
    })
    .catch((e) => alert("Logout error: " + e.message));
}
























