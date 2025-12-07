// -------- Countdown --------
function updateCountdown() {
  // Target: December 14, 16:35 New York time (Eastern Time)
  const targetDate = new Date("December 14, 2025 16:35:00 GMT-0500"); // NY time
  const now = new Date();
  const diff = targetDate - now;

  const countdownEl = document.getElementById("countdown");
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
updateCountdown();
setInterval(updateCountdown, 1000);

// -------- Carousel --------
const container = document.querySelector(".carousel-container");
const carousel = document.getElementById("carousel");
let index = 0;
let images = [];

// Try to fetch auto-generated list from server-side (PHP)
// Fallback to a static JSON file if PHP isn't available
async function getImageList() {
  try {
    const res = await fetch("pics/list.php", { cache: "no-store" });
    if (!res.ok) throw new Error("list.php not available");
    return await res.json();
  } catch (e) {
    try {
      const res2 = await fetch("pics/images.json", { cache: "no-store" });
      if (!res2.ok) throw new Error("images.json not available");
      return await res2.json();
    } catch (e2) {
      console.warn("Could not load image list from server. Add pics/list.php or pics/images.json.", e2);
      return []; // no images
    }
  }
}

function buildSlides() {
  images.forEach((img) => {
    const slide = document.createElement("div");
    slide.className = "slide";
    const imageElement = document.createElement("img");
    imageElement.src = "pics/" + img;
    imageElement.alt = img;
    slide.appendChild(imageElement);
    carousel.appendChild(slide);
  });
  if (images.length > 0) updateCarousel();
}

function updateCarousel() {
  // Assign neighbor classes
  const slides = [...carousel.children];
  slides.forEach((el, i) => {
    el.classList.remove("active", "prev", "next");
    if (i === index) el.classList.add("active");
    else if (i === (index - 1 + slides.length) % slides.length) el.classList.add("prev");
    else if (i === (index + 1) % slides.length) el.classList.add("next");
  });

  // Center the active slide
  const active = slides[index];
  if (!active) return;
  const offset = active.offsetLeft - (container.clientWidth - active.clientWidth) / 2;
  carousel.style.transform = `translateX(-${offset}px)`;
}

function nextSlide() {
  if (images.length === 0) return;
  index = (index + 1) % images.length;
  updateCarousel();
}

function prevSlide() {
  if (images.length === 0) return;
  index = (index - 1 + images.length) % images.length;
  updateCarousel();
}

// Auto-rotate every 4 seconds
let rotateTimer = null;
function startAutoRotate() {
  if (rotateTimer) clearInterval(rotateTimer);
  rotateTimer = setInterval(nextSlide, 2500);
}

// Recenter on resize
window.addEventListener("resize", () => {
  updateCarousel();
});

// Init
(async function initCarousel() {
  images = await getImageList();
  buildSlides();
  startAutoRotate();
})();