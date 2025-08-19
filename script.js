// ✅ 1. Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDk1cdxUbRo86se2c7utCoBs3ynXkApxWQ",
  authDomain: "imageopti-19413.firebaseapp.com",
  projectId: "imageopti-19413",
  storageBucket: "imageopti-19413.appspot.com", // ✅ fixed
  messagingSenderId: "928486020237",
  appId: "1:928486020237:web:cac0647a036f55cf9c3ec4",
  measurementId: "G-P1ZX5BCG7G"
};

// ✅ 2. Initialize Firebase (compat)
firebase.initializeApp(firebaseConfig);
firebase.analytics();   // ✅ fixed

// ✅ 3. DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const uploadBtn = document.getElementById('uploadBtn');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const qualityControls = document.getElementById('qualityControls');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const savingsBadge = document.getElementById('savingsBadge');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const downloadBtn = document.getElementById('downloadBtn');

// ✅ Login Modal Elements
const loginIcon = document.getElementById('loginIcon');
const loginModal = document.getElementById('loginModal');
const closeModal = document.getElementById('closeModal');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('passwordInput');
const forgotPassword = document.getElementById('forgotPassword');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');

let currentFile = null;
let originalFileSize = 0;
let compressedBlobUrl = null;

// ✅ Upload Events
browseBtn.addEventListener('click', () => fileInput.click());
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-active');
});
dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-active');
});
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-active');
  if (e.dataTransfer.files.length) {
    handleFileSelect({ target: { files: e.dataTransfer.files } });
  }
});

qualitySlider.addEventListener('input', updateQuality);
downloadBtn.addEventListener('click', downloadImage);

// ✅ Modal Login Events
loginIcon.addEventListener('click', () => {
  loginModal.style.display = 'flex';
});
closeModal.addEventListener('click', () => {
  loginModal.style.display = 'none';
});
window.addEventListener('click', (e) => {
  if (e.target === loginModal) loginModal.style.display = 'none';
});
togglePassword.addEventListener('click', () => {
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    togglePassword.classList.add('fa-eye-slash');
  } else {
    passwordInput.type = 'password';
    togglePassword.classList.remove('fa-eye-slash');
  }
});
forgotPassword.addEventListener('click', () => {
  const email = document.getElementById('emailInput').value;
  if (!email) {
    alert("Enter your email to reset password");
    return;
  }
  firebase.auth().sendPasswordResetEmail(email)
    .then(() => alert("Password reset email sent!"))
    .catch(err => alert(err.message));
});

// ✅ Login & Signup Handlers
loginBtn.addEventListener('click', login);
signupBtn.addEventListener('click', signup);

function login() {
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById('authMessage').innerText = "Login successful!";
      loginModal.style.display = 'none';
    })
    .catch(err => {
      document.getElementById('authMessage').innerText = err.message;
    });
}

function signup() {
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById('authMessage').innerText = "Account created!";
    })
    .catch(err => {
      document.getElementById('authMessage').innerText = err.message;
    });
}

// ✅ Image Handling Functions
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file || !file.type.match('image.*')) return;

  currentFile = file;
  originalFileSize = file.size;

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      compressImage(img, qualitySlider.value);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function compressImage(image, quality) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  const qualityDecimal = quality / 100;
  canvas.toBlob(
    (blob) => {
      if (compressedBlobUrl) URL.revokeObjectURL(compressedBlobUrl);
      compressedBlobUrl = URL.createObjectURL(blob);

      previewImage.src = compressedBlobUrl;
      previewSection.style.display = 'block';
      qualityControls.style.display = 'flex';

      updateSizeInfo(originalFileSize, blob.size);
    },
    'image/jpeg',
    qualityDecimal
  );
}

function updateQuality() {
  const quality = qualitySlider.value;
  qualityValue.textContent = quality;

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      compressImage(img, quality);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(currentFile);
}

function updateSizeInfo(originalBytes, compressedBytes) {
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const savings = ((originalBytes - compressedBytes) / originalBytes * 100).toFixed(1);

  originalSize.textContent = formatSize(originalBytes);
  compressedSize.textContent = formatSize(compressedBytes);
  savingsBadge.textContent = `${savings}% smaller`;

  if (savings > 30) {
    savingsBadge.style.background = '#51cf66'; // green
  } else if (savings > 15) {
    savingsBadge.style.background = '#fcc419'; // yellow
  } else {
    savingsBadge.style.background = '#ff6b6b'; // red
  }
}

function downloadImage() {
  if (!compressedBlobUrl) return;

  const link = document.createElement('a');
  link.download = `optimized-${currentFile.name}`;
  link.href = compressedBlobUrl;
  link.click();
}
