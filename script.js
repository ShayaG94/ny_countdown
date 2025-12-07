// Countdown
function updateCountdown() {
  const targetDate = new Date("December 14, 2025 16:35:00 GMT-0500"); // NY time
  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    document.getElementById("countdown").innerHTML = "Time's up!";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById("countdown").innerHTML =
    `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(updateCountdown, 1000);

// Carousel
const carousel = document.getElementById("carousel");
let index = 0;

function loadImages() {
  // Assuming pics/ contains images named 1.jpg, 2.jpg, 3.jpg...
  const images = ["1.jpg", "2.jpg", "3.jpg"]; // replace with your actual filenames
  images.forEach(img => {
    const imageElement = document.createElement("img");
    imageElement.src = "pics/" + img;
    carousel.appendChild(imageElement);
  });
}

function rotateCarousel() {
  const images = carousel.children.length;
  index = (index + 1) % images;
  carousel.style.transform = `translateX(-${index * 100}%)`;
}

loadImages();
setInterval(rotateCarousel, 3000);