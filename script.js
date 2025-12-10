// Theme toggle
(function themeInit() {
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const icon = document.getElementById("themeIcon");
  const saved = localStorage.getItem("theme") || "dark";
  root.classList.toggle("light", saved === "light");
  icon.className = saved === "light" ? "ri-moon-line" : "ri-sun-line";

  toggle.addEventListener("click", () => {
    const isLight = root.classList.toggle("light");
    localStorage.setItem("theme", isLight ? "light" : "dark");
    icon.className = isLight ? "ri-moon-line" : "ri-sun-line";
  });
})();

// Countdown
(function countdownInit() {
  const countdownEl = document.getElementById("countdown");
  const targetDate = new Date("December 14, 2025 16:35:00 GMT-0500");

  function tick() {
    const now = new Date();
    const diff = targetDate - now;
    if (diff <= 0) {
      countdownEl.textContent = "Arrived!";
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    countdownEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  tick();
  setInterval(tick, 1000);
})();

// Carousel
const carouselEl = document.getElementById("carousel");
const dotsEl = document.getElementById("carouselDots");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let images = [];
let index = 0;
let autoTimer = null;

async function loadImages() {
  try {
    const res = await fetch("images.json", { cache: "no-store" });
    images = await res.json();
    buildCarousel();
  } catch (e) {
    console.error("Failed to load images.json", e);
  }
}

function buildCarousel() {
  carouselEl.innerHTML = "";
  dotsEl.innerHTML = "";
  index = 0;

  // Clone first and last images for infinite loop
  const extendedImages = [images[images.length - 1], ...images, images[0]];

  extendedImages.forEach((name, i) => {
    const card = document.createElement("div");
    card.className = "card";
    const img = document.createElement("img");
    img.src = "pics/" + name;
    img.alt = name;
    img.loading = "lazy";
    img.addEventListener("load", () => img.classList.add("loaded"));
    card.appendChild(img);
    carouselEl.appendChild(card);
  });

  // Build dots for original images only
  images.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => goTo(i));
    dotsEl.appendChild(dot);
  });

  // Start at index 1 (the first real image, after the cloned last)
  index = 1;
  updateCarousel(false);
  startAuto();
}

function updateCarousel(animate = true) {
  const cards = [...carouselEl.children];
  const dots = [...dotsEl.children];

  dots.forEach((d, i) => d.classList.toggle("active", i === (index - 1 + images.length) % images.length));

  const activeCard = cards[index];
  if (activeCard) {
    const containerWidth = carouselEl.parentElement.clientWidth;
    const offset = activeCard.offsetLeft - (containerWidth - activeCard.clientWidth) / 2;
    carouselEl.style.transition = animate ? "transform 0.5s ease" : "none";
    carouselEl.style.transform = `translateX(-${offset}px)`;
  }

  // Handle infinite loop reset
  carouselEl.addEventListener("transitionend", () => {
    if (index === 0) {
      index = images.length;
      updateCarousel(false);
    } else if (index === images.length + 1) {
      index = 1;
      updateCarousel(false);
    }
  }, { once: true });
}

function next() {
  if (!images.length) return;
  index++;
  updateCarousel();
}
function prev() {
  if (!images.length) return;
  index--;
  updateCarousel();
}
function goTo(i) {
  index = i + 1; // offset by 1 because of cloned first slide
  updateCarousel();
}

function startAuto() {
  stopAuto();
  autoTimer = setInterval(next, 4000);
}
function stopAuto() {
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = null;
}

// Wire up buttons
nextBtn.addEventListener("click", next);
prevBtn.addEventListener("click", prev);

// Keyboard and touch
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") prev();
});
let startX = null;
carouselEl.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
carouselEl.addEventListener("touchend", (e) => {
  if (startX == null) return;
  const dx = e.changedTouches[0].clientX - startX;
  if (dx > 40) prev();
  else if (dx < -40) next();
  startX = null;
});
carouselEl.addEventListener("mouseenter", stopAuto);
carouselEl.addEventListener("mouseleave", startAuto);
window.addEventListener("resize", () => updateCarousel(false));

// Upload
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const uploadStatus = document.getElementById("uploadStatus");

uploadBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async () => {
  if (!fileInput.files || !fileInput.files.length) return;
  const formData = new FormData();
  for (const file of fileInput.files) formData.append("file", file);

  uploadStatus.textContent = "Uploading…";
  try {
    const res = await fetch("/upload", { method: "POST", body: formData });
    const result = await res.json();
    if (result.status === "success") {
      uploadStatus.textContent = "Uploaded: " + result.saved.join(", ");
      await loadImages(); // refresh carousel
    } else {
      uploadStatus.textContent = "Error: " + (result.message || "Upload failed");
    }
  } catch (err) {
    uploadStatus.textContent = "Upload failed.";
  } finally {
    fileInput.value = "";
  }
});

// Init
loadImages();