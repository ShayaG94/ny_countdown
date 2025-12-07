// Countdown
function updateCountdown() {
  const targetDate = new Date("December 14, 2025 16:35:00 GMT-0500");
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
setInterval(updateCountdown, 1000);

// Carousel
const container = document.querySelector(".carousel-container");
const carousel = document.getElementById("carousel");
let index = 0;
let images = [];

async function getImageList() {
  const res = await fetch("images.json", { cache: "no-store" });
  return await res.json();
}

function buildSlides() {
  images.forEach((img) => {
    const slide = document.createElement("div");
    slide.className = "slide";
    const imageElement = document.createElement("img");
    imageElement.src = "pics/" + img;
    slide.appendChild(imageElement);
    carousel.appendChild(slide);
  });
  updateCarousel();
}

function updateCarousel() {
  const slides = [...carousel.children];
  slides.forEach((el, i) => {
    el.classList.remove("active", "prev", "next");
    if (i === index) el.classList.add("active");
    else if (i === (index - 1 + slides.length) % slides.length) el.classList.add("prev");
    else if (i === (index + 1) % slides.length) el.classList.add("next");
  });

  const active = slides[index];
  if (!active) return;
  const offset = active.offsetLeft - (container.clientWidth - active.clientWidth) / 2;
  carousel.style.transform = `translateX(-${offset}px)`;
}

function nextSlide() {
  index = (index + 1) % images.length;
  updateCarousel();
}

setInterval(nextSlide, 2500);

(async function initCarousel() {
  images = await getImageList();
  buildSlides();
})();

// Upload form handler
const uploadForm = document.getElementById("uploadForm");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const uploadStatus = document.getElementById("uploadStatus");

uploadBtn.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", async () => {
  const formData = new FormData();
  for (const file of fileInput.files) {
    formData.append("file", file);
  }

  try {
    const res = await fetch("/upload", {
      method: "POST",
      body: formData
    });
    const result = await res.json();
    if (result.status === "success") {
      uploadStatus.textContent = "Uploaded: " + result.saved.join(", ");
    } else {
      uploadStatus.textContent = "Error: " + result.message;
    }
  } catch (err) {
    uploadStatus.textContent = "Upload failed.";
  }
  // Refresh the carousel after upload
  images = await getImageList();
  carousel.innerHTML = "";
  buildSlides();
});