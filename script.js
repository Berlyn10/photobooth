const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const snapButton = document.getElementById('snap');
const retakeButton = document.getElementById('retake');
const downloadLink = document.getElementById('downloadLink');
const countdownEl = document.getElementById('countdown');
const gallery = document.getElementById('gallery');
const liveFilterOverlay = document.getElementById('liveFilterOverlay');
const confirmationMessage = document.getElementById('confirmationMessage');
const guestMessageInput = document.getElementById('guestMessage');
const filterThumbs = document.querySelectorAll('.filter-thumb');
const toast = document.getElementById('toast');

let selectedFilter = 'my-filter.png';

// 🚀 Start webcam
navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 540 },
    height: { ideal: 960 },
    facingMode: "user"
  }
})
.then(stream => {
  video.srcObject = stream;
})
.catch(err => {
  console.error("Camera access error:", err);
  alert("Please allow camera access to use the photobooth.");
});

// 🖼 Handle filter selection
filterThumbs.forEach(thumb => {
  thumb.addEventListener('click', () => {
    filterThumbs.forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
    selectedFilter = thumb.dataset.src;
    liveFilterOverlay.src = selectedFilter;
  });
});

// ⏱ Countdown logic
function startCountdown(callback) {
  let count = 3;
  countdownEl.style.display = "block";
  countdownEl.textContent = count;

  const interval = setInterval(() => {
    count--;
    countdownEl.textContent = count;
    if (count === 0) {
      clearInterval(interval);
      countdownEl.style.display = "none";
      callback();
    }
  }, 1000);
}

// 📢 Show animated toast
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// 📸 Take photo
snapButton.addEventListener('click', () => {
  confirmationMessage.style.display = "none";

  startCountdown(() => {
    const context = canvas.getContext('2d');

    // Flip video (mirror) and draw
    context.save();
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    context.restore();

    const overlayImage = new Image();
    overlayImage.src = selectedFilter;

    overlayImage.onload = () => {
      context.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);

      const photoData = canvas.toDataURL('image/png');
      downloadLink.href = photoData;

      video.style.display = "none";
      liveFilterOverlay.style.display = "none";
      canvas.style.display = "block";
      snapButton.style.display = "none";
      downloadLink.style.display = "inline-block";
      retakeButton.style.display = "inline-block";
      confirmationMessage.style.display = "block";

      const imgContainer = document.createElement('div');
      imgContainer.classList.add('gallery-item');

      const img = document.createElement('img');
      img.src = photoData;

      const msg = document.createElement('p');
      msg.textContent = guestMessageInput.value || "(No message)";

      imgContainer.appendChild(img);
      imgContainer.appendChild(msg);
      gallery.appendChild(imgContainer);
      img.scrollIntoView({ behavior: "smooth", block: "start" });

      guestMessageInput.value = "";

      showToast("✅ Your photo was added to the gallery!");
    };
  });
});

// 🔁 Retake
retakeButton.addEventListener('click', () => {
  canvas.style.display = "none";
  video.style.display = "block";
  liveFilterOverlay.style.display = "block";
  snapButton.style.display = "inline-block";
  downloadLink.style.display = "none";
  retakeButton.style.display = "none";
  confirmationMessage.style.display = "none";
});
