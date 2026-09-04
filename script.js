// CountLife - Core Application Logic

// DOM Elements
const settingsIcon = document.getElementById("settingsIcon");
const settingsModal = document.getElementById("settingsModal");
const modalClose = document.getElementById("modalClose");
const saveSettingsButton = document.getElementById("saveSettings");
const countdownTitleElement = document.getElementById("countdownTitle");
const gridContainer = document.getElementById("gridContainer");
const tabLifespan = document.getElementById("tabLifespan");
const tabEvent = document.getElementById("tabEvent");
const errorMessage = document.getElementById("errorMessage");

const dobInput = document.getElementById("dobInput");
const eventTitleInput = document.getElementById("eventTitle");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");

// Photo Elements
const userPhotoFrame = document.getElementById("userPhotoFrame");
const userPhotoImg = document.getElementById("userPhotoImg");
const photoInput = document.getElementById("photoInput");
const removePhotoBtn = document.getElementById("removePhotoBtn");

const yearsSpan = document.getElementById("years");
const monthsSpan = document.getElementById("months");
const daysSpan = document.getElementById("days");
const hoursSpan = document.getElementById("hours");
const minutesSpan = document.getElementById("minutes");
const secondsSpan = document.getElementById("seconds");
const millisecondsSpan = document.getElementById("milliseconds");

// State & Intervals
let countdownInterval = null;
let millisecondsInterval = null;
let currentSettings = null;
let lastUpdatedSquare = 0;

// Unified Storage (chrome.storage.sync with localStorage fallback)
function getStoredSettings(callback) {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get("settings", (data) => {
      callback(data ? data.settings : null);
    });
  } else {
    try {
      const raw = localStorage.getItem("countlife_settings");
      callback(raw ? JSON.parse(raw) : null);
    } catch (e) {
      callback(null);
    }
  }
}

function setStoredSettings(settings, callback) {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.set({ settings }, () => {
      if (callback) callback();
    });
  } else {
    try {
      localStorage.setItem("countlife_settings", JSON.stringify(settings));
    } catch (e) {}
    if (callback) callback();
  }
}

// Date conversion helpers
function formatDateToInput(timestamp) {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value) {
  const parts = value.split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
}

// Modal Control
function openModal() {
  settingsModal.classList.add("active");
  resetErrorStyles();
}

function closeModal() {
  settingsModal.classList.remove("active");
  resetErrorStyles();
}

settingsIcon.addEventListener("click", openModal);
if (modalClose) {
  modalClose.addEventListener("click", closeModal);
}

window.addEventListener("click", (event) => {
  if (event.target === settingsModal) {
    closeModal();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && settingsModal.classList.contains("active")) {
    closeModal();
  }
});

// Tab Switching
function openTab(tabName) {
  const contents = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < contents.length; i++) {
    contents[i].style.display = "none";
  }

  tabLifespan.classList.remove("active");
  tabEvent.classList.remove("active");

  if (tabName === "Lifespan") {
    document.getElementById("Lifespan").style.display = "block";
    tabLifespan.classList.add("active");
  } else if (tabName === "Event") {
    document.getElementById("Event").style.display = "block";
    tabEvent.classList.add("active");
    // Pre-fill start date with today if not set
    if (!startDateInput.value) {
      startDateInput.value = formatDateToInput(Date.now());
    }
  }
  resetErrorStyles();
}

tabLifespan.addEventListener("click", () => openTab("Lifespan"));
tabEvent.addEventListener("click", () => openTab("Event"));

// Reset error styles
function resetErrorStyles() {
  errorMessage.style.display = "none";
  errorMessage.innerText = "Please fill in all fields.";
  dobInput.style.borderColor = "#ccc";
  eventTitleInput.style.borderColor = "#ccc";
  startDateInput.style.borderColor = "#ccc";
  endDateInput.style.borderColor = "#ccc";
  if (photoInput) photoInput.style.borderColor = "#ccc";
}

// Enter key submission on input fields
[dobInput, eventTitleInput, startDateInput, endDateInput].forEach((input) => {
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        saveSettingsButton.click();
      }
    });
  }
});

// Save Settings using exact automatic lifespan logic
saveSettingsButton.addEventListener("click", () => {
  const settings = {};
  let totalSquares = 80; // Default for lifespan
  let isValid = true;
  resetErrorStyles();

  const isLifespanTab = document.getElementById("Lifespan").style.display === "block";

  if (isLifespanTab) {
    const dob = dobInput.value;
    if (dob) {
      const dobTimestamp = parseDateInput(dob);
      if (dobTimestamp > Date.now()) {
        errorMessage.innerText = "Date of Birth must be in the past.";
        dobInput.style.borderColor = "red";
        isValid = false;
      } else {
        // Set lifespan countdown automatically
        settings.type = "lifespan";
        settings.dob = dobTimestamp;
        totalSquares = 80; // Fixed at 80 years automatic
      }
    } else {
      dobInput.style.borderColor = "red";
      isValid = false;
    }
  } else {
    const eventTitle = eventTitleInput.value.trim();
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (!eventTitle) {
      eventTitleInput.style.borderColor = "red";
      isValid = false;
    }
    if (!startDate) {
      startDateInput.style.borderColor = "red";
      isValid = false;
    }
    if (!endDate) {
      endDateInput.style.borderColor = "red";
      isValid = false;
    }

    if (eventTitle && startDate && endDate) {
      const startTimestamp = parseDateInput(startDate);
      const endTimestamp = parseDateInput(endDate);

      if (endTimestamp <= startTimestamp) {
        errorMessage.innerText = "End Date must be after Start Date.";
        endDateInput.style.borderColor = "red";
        isValid = false;
      } else {
        // Set event deadline countdown
        settings.type = "event";
        settings.title = eventTitle;
        settings.startDate = startTimestamp;
        settings.endDate = endTimestamp;

        const startObj = new Date(startTimestamp);
        const endObj = new Date(endTimestamp);
        const totalMonths = (endObj.getFullYear() - startObj.getFullYear()) * 12 + (endObj.getMonth() - startObj.getMonth());
        totalSquares = Math.max(1, totalMonths);
      }
    }
  }

  if (!isValid) {
    errorMessage.style.display = "block";
    return;
  }

  settings.totalSquares = totalSquares;
  clearIntervals();
  setStoredSettings(settings, () => {
    closeModal();
    lastUpdatedSquare = 0;
    loadSettings();
  });
});

// Load and apply settings
function loadSettings() {
  renderUserPhoto();

  getStoredSettings((settings) => {
    if (settings) {
      currentSettings = settings;
      renderUserPhoto();
      const totalSquares = settings.totalSquares || 80;
      createGrid(totalSquares);

      if (settings.type === "lifespan") {
        const lifespan = settings.dob + 80 * 365 * 24 * 60 * 60 * 1000;
        startCountdown(lifespan, settings.dob);
        countdownTitleElement.innerText = "Your Lifespan Countdown";
        updateGrid(Date.now(), settings.dob, lifespan, totalSquares);

        dobInput.value = formatDateToInput(settings.dob);
        openTab("Lifespan");
      } else if (settings.type === "event") {
        startCountdown(settings.endDate, settings.startDate, settings.title);
        countdownTitleElement.innerText = settings.title;
        updateGrid(Date.now(), settings.startDate, settings.endDate, totalSquares);

        eventTitleInput.value = settings.title || "";
        startDateInput.value = formatDateToInput(settings.startDate);
        endDateInput.value = formatDateToInput(settings.endDate);
        openTab("Event");
      }
    } else {
      // First visit experience
      countdownTitleElement.innerText = "Set Your Countdown";
      createGrid(80);
      openModal();
    }
  });
}

// Countdown Loop
function startCountdown(targetDate, startDate, title) {
  clearIntervals();

  function updateTicks() {
    const now = Date.now();
    const remainingTime = targetDate - now;

    if (remainingTime <= 0) {
      countdownTitleElement.innerText = "Countdown Complete!";
      yearsSpan.innerText = "00";
      monthsSpan.innerText = "00";
      daysSpan.innerText = "00";
      hoursSpan.innerText = "00";
      minutesSpan.innerText = "00";
      secondsSpan.innerText = "00";
      millisecondsSpan.innerText = "000";
      if (currentSettings) {
        updateGrid(targetDate, startDate, targetDate, currentSettings.totalSquares);
      }
      clearIntervals();
      return;
    }

    const years = Math.floor(remainingTime / (365 * 24 * 60 * 60 * 1000));
    const months = Math.floor(
      (remainingTime % (365 * 24 * 60 * 60 * 1000)) / (30 * 24 * 60 * 60 * 1000)
    );
    const days = Math.floor(
      (remainingTime % (30 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000)
    );
    const hours = Math.floor(
      (remainingTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
    );
    const minutes = Math.floor(
      (remainingTime % (60 * 60 * 1000)) / (60 * 1000)
    );
    const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

    yearsSpan.innerText = String(years).padStart(2, "0");
    monthsSpan.innerText = String(months).padStart(2, "0");
    daysSpan.innerText = String(days).padStart(2, "0");
    hoursSpan.innerText = String(hours).padStart(2, "0");
    minutesSpan.innerText = String(minutes).padStart(2, "0");
    secondsSpan.innerText = String(seconds).padStart(2, "0");

    if (currentSettings) {
      updateGrid(now, startDate, targetDate, currentSettings.totalSquares);
    }
  }

  updateTicks();
  countdownInterval = setInterval(updateTicks, 1000);

  // High precision milliseconds interval
  millisecondsInterval = setInterval(() => {
    const now = Date.now();
    const remainingTime = targetDate - now;
    if (remainingTime > 0) {
      const milliseconds = remainingTime % 1000;
      millisecondsSpan.innerText = String(milliseconds).padStart(3, "0");
    } else {
      millisecondsSpan.innerText = "000";
    }
  }, 16);
}

// Create Fullscreen Grid
function createGrid(totalSquares) {
  gridContainer.innerHTML = "";
  lastUpdatedSquare = 0;

  const screenRatio = window.innerWidth / window.innerHeight;
  const columns = Math.ceil(Math.sqrt(totalSquares * screenRatio));
  const rows = Math.ceil(totalSquares / columns);

  gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < totalSquares; i++) {
    const square = document.createElement("div");
    square.classList.add("square");
    square.style.backgroundColor = "#333";
    fragment.appendChild(square);
  }
  gridContainer.appendChild(fragment);
}

// Update Grid with Forest Green #044f1e for passed time (No hover effect)
function updateGrid(now, startDate, targetDate, totalSquares) {
  const squares = gridContainer.children;
  if (!squares || squares.length === 0) return;

  const totalDuration = targetDate - startDate;
  const timePassed = Math.max(0, now - startDate);
  const timePassedRatio = totalDuration > 0 ? Math.min(1, Math.max(0, timePassed / totalDuration)) : 0;
  const squaresPassed = Math.floor(timePassedRatio * totalSquares);

  for (let i = 0; i < squares.length; i++) {
    if (i < squaresPassed) {
      squares[i].style.backgroundColor = "#044f1e";
    } else {
      squares[i].style.backgroundColor = "#333";
    }
  }
  lastUpdatedSquare = squaresPassed;
}

// Clear active intervals
function clearIntervals() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  if (millisecondsInterval) {
    clearInterval(millisecondsInterval);
    millisecondsInterval = null;
  }
}

// Draggable 1:1 Photo Frame Logic & Persistence

function renderUserPhoto() {
  const photoData = localStorage.getItem("countlife_user_photo");
  if (photoData) {
    userPhotoImg.src = photoData;
    userPhotoFrame.style.display = "block";
    removePhotoBtn.style.display = "block";

    // Restore saved coordinates or set default
    const savedPos = localStorage.getItem("countlife_photo_pos");
    if (savedPos) {
      try {
        const pos = JSON.parse(savedPos);
        const left = Math.max(10, Math.min(window.innerWidth - 130, pos.leftRatio * window.innerWidth));
        const top = Math.max(10, Math.min(window.innerHeight - 130, pos.topRatio * window.innerHeight));
        userPhotoFrame.style.left = `${left}px`;
        userPhotoFrame.style.top = `${top}px`;
      } catch (e) {
        setDefaultPhotoPos();
      }
    } else {
      setDefaultPhotoPos();
    }
  } else {
    userPhotoFrame.style.display = "none";
    userPhotoImg.src = "";
    removePhotoBtn.style.display = "none";
  }
}

function setDefaultPhotoPos() {
  userPhotoFrame.style.left = `${Math.max(20, window.innerWidth - 160)}px`;
  userPhotoFrame.style.top = "60px";
}

// Handle Photo File Upload (< 10MB limit with auto 1:1 square compression)
if (photoInput) {
  photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size limit: max 10MB
    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      errorMessage.innerText = "Image must be less than 10 MB.";
      errorMessage.style.display = "block";
      photoInput.style.borderColor = "red";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Offscreen canvas: auto-crop to 1:1 square (300x300px)
        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext("2d");

        // Center square crop calculations
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 300, 300);

        // Compressed JPEG Base64 (~30KB) - safe from storage quotas
        const optimizedBase64 = canvas.toDataURL("image/jpeg", 0.88);
        try {
          localStorage.setItem("countlife_user_photo", optimizedBase64);
          renderUserPhoto();
          resetErrorStyles();
        } catch (err) {
          errorMessage.innerText = "Storage full. Could not save photo.";
          errorMessage.style.display = "block";
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Remove Photo
if (removePhotoBtn) {
  removePhotoBtn.addEventListener("click", () => {
    localStorage.removeItem("countlife_user_photo");
    localStorage.removeItem("countlife_photo_pos");
    if (photoInput) photoInput.value = "";
    renderUserPhoto();
  });
}

// Dragging Mechanics
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let initialLeft = 0;
let initialTop = 0;

if (userPhotoFrame) {
  userPhotoFrame.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return; // Left click only
    isDragging = true;
    userPhotoFrame.classList.add("dragging");
    dragStartX = e.clientX;
    dragStartY = e.clientY;

    const rect = userPhotoFrame.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;
    e.preventDefault();
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    let newLeft = initialLeft + dx;
    let newTop = initialTop + dy;

    // Constrain within viewport bounds
    const maxLeft = window.innerWidth - userPhotoFrame.offsetWidth - 10;
    const maxTop = window.innerHeight - userPhotoFrame.offsetHeight - 10;

    newLeft = Math.max(10, Math.min(newLeft, maxLeft));
    newTop = Math.max(10, Math.min(newTop, maxTop));

    userPhotoFrame.style.left = `${newLeft}px`;
    userPhotoFrame.style.top = `${newTop}px`;
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    userPhotoFrame.classList.remove("dragging");

    // Save relative position ratio so it adapts across screen sizes
    const rect = userPhotoFrame.getBoundingClientRect();
    const pos = {
      leftRatio: rect.left / window.innerWidth,
      topRatio: rect.top / window.innerHeight
    };
    localStorage.setItem("countlife_photo_pos", JSON.stringify(pos));
  });
}

// Handle window resize dynamically
let resizeTimeout = null;
window.addEventListener("resize", () => {
  if (resizeTimeout) clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Re-clamp photo position to stay visible on screen
    if (userPhotoFrame && userPhotoFrame.style.display !== "none") {
      const savedPos = localStorage.getItem("countlife_photo_pos");
      if (savedPos) {
        try {
          const pos = JSON.parse(savedPos);
          const left = Math.max(10, Math.min(window.innerWidth - 130, pos.leftRatio * window.innerWidth));
          const top = Math.max(10, Math.min(window.innerHeight - 130, pos.topRatio * window.innerHeight));
          userPhotoFrame.style.left = `${left}px`;
          userPhotoFrame.style.top = `${top}px`;
        } catch (e) {}
      }
    }

    if (currentSettings) {
      const totalSquares = currentSettings.totalSquares || 80;
      createGrid(totalSquares);
      if (currentSettings.type === "lifespan") {
        const lifespan = currentSettings.dob + 80 * 365 * 24 * 60 * 60 * 1000;
        updateGrid(Date.now(), currentSettings.dob, lifespan, totalSquares);
      } else if (currentSettings.type === "event") {
        updateGrid(Date.now(), currentSettings.startDate, currentSettings.endDate, totalSquares);
      }
    } else {
      createGrid(80);
    }
  }, 150);
});

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", loadSettings);
