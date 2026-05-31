(function () {
  const STORAGE_PHOTOS = "chibibooth.photos";
  const STORAGE_META = "chibibooth.photoMeta";

  const video = document.getElementById("cameraPreview");
  const cameraStage = document.getElementById("cameraStage");
  const statusEl = document.getElementById("cameraStatus");
  const countdownEl = document.getElementById("countdown");
  const flashEl = document.getElementById("flash");
  const enableCameraButton = document.getElementById("enableCameraButton");
  const captureButton = document.getElementById("captureButton");
  const switchCameraButton = document.getElementById("switchCameraButton");
  const retakeButton = document.getElementById("retakeButton");
  const fullscreenButton = document.getElementById("fullscreenButton");
  const mirrorToggle = document.getElementById("mirrorToggle");
  const timerSelect = document.getElementById("timerSelect");
  const photoCountSelect = document.getElementById("photoCountSelect");
  const shotPanel = document.getElementById("shotPanel");
  const shotList = document.getElementById("shotList");
  const progressLabel = document.getElementById("progressLabel");
  const continueButton = document.getElementById("continueButton");
  const shotNote = document.getElementById("shotNote");

  let stream = null;
  let facingMode = "user";
  let capturedPhotos = [];
  let isCapturing = false;

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function setStatus(message, isWarning) {
    statusEl.textContent = message;
    statusEl.classList.toggle("is-warning", Boolean(isWarning));
  }

  function persistShots() {
    if (!capturedPhotos.length) {
      sessionStorage.removeItem(STORAGE_PHOTOS);
      sessionStorage.removeItem(STORAGE_META);
      return;
    }

    sessionStorage.setItem(STORAGE_PHOTOS, JSON.stringify(capturedPhotos));
    sessionStorage.setItem(STORAGE_META, JSON.stringify({
      count: capturedPhotos.length,
      createdAt: new Date().toISOString()
    }));
  }

  function renderShotList() {
    const targetCount = Number(photoCountSelect.value);
    shotPanel.classList.toggle("hidden", capturedPhotos.length === 0);
    progressLabel.textContent = `${capturedPhotos.length} / ${targetCount} foto`;
    continueButton.disabled = capturedPhotos.length !== targetCount;

    if (capturedPhotos.length === 0) {
      shotList.innerHTML = "";
      shotNote.textContent = "Hasil foto akan muncul di sini setelah kamu ambil gambar.";
      return;
    }

    shotNote.textContent = capturedPhotos.length === targetCount
      ? "Kalau semua sudah oke, lanjut edit. Kalau ada yang jelek, hapus lalu ambil foto lagi."
      : "Masih ada slot kosong. Hapus yang jelek lalu ambil foto lagi sampai penuh.";

    shotList.innerHTML = "";
    capturedPhotos.forEach((dataUrl, index) => {
      const item = document.createElement("article");
      item.className = "shot-thumb";
      item.innerHTML = `
        <img src="${dataUrl}" alt="Foto ${index + 1} ChibiBooth">
        <button class="shot-remove" type="button" data-remove-index="${index}" aria-label="Hapus foto ${index + 1}">Hapus</button>
      `;
      shotList.appendChild(item);
    });
  }

  function setControlsDisabled(disabled) {
    [enableCameraButton, captureButton, switchCameraButton, retakeButton, timerSelect, photoCountSelect, mirrorToggle].forEach((control) => {
      control.disabled = disabled;
    });
  }

  function isLocalHost() {
    return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  }

  function canRequestCamera() {
    return window.isSecureContext || isLocalHost();
  }

  function updateCameraControls() {
    const hasStream = Boolean(stream);
    enableCameraButton.hidden = hasStream;
    captureButton.textContent = hasStream ? "Ambil Foto" : "Aktifkan & Ambil Foto";
    switchCameraButton.disabled = !hasStream || isCapturing;
  }

  function stopStream() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    stream = null;
    video.srcObject = null;
    cameraStage.classList.remove("has-stream");
    updateCameraControls();
  }

  async function requestCameraStream(constraints) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      if (error.name !== "OverconstrainedError" && error.name !== "NotFoundError") {
        throw error;
      }

      return navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
      });
    }
  }

  async function startCamera() {
    if (!canRequestCamera()) {
      setStatus("Izin kamera di HP hanya muncul lewat HTTPS. Buka versi HTTPS/deploy dulu ya.", true);
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus("Browser ini belum bisa membuka kamera. Coba pakai Chrome/Safari terbaru lewat HTTPS.", true);
      return;
    }

    stopStream();
    setStatus("Membuka kamera...");

    try {
      stream = await requestCameraStream({
        audio: false,
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 960 }
        }
      });

      video.srcObject = stream;
      await video.play();
      cameraStage.classList.add("has-stream");
      updateMirrorMode();
      updateCameraControls();
      setStatus("Kamera siap. Pilih timer, lalu cekrek!");
    } catch (error) {
      console.error("Camera error:", error);
      stopStream();
      if (error.name === "NotAllowedError" || error.name === "SecurityError") {
        setStatus("Kamera belum diizinkan. Tap ikon gembok/browser lalu aktifkan izin kamera.", true);
        return;
      }

      setStatus("Kamera belum bisa dibuka. Pastikan izin kamera aktif dan halaman dibuka lewat HTTPS.", true);
    }
  }

  function updateMirrorMode() {
    const shouldMirror = mirrorToggle.checked && facingMode === "user";
    video.classList.toggle("is-mirrored", shouldMirror);
  }

  function triggerFlash() {
    flashEl.classList.remove("is-active");
    void flashEl.offsetWidth;
    flashEl.classList.add("is-active");
  }

  function playShutterSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.12);
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.22, audioContext.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.14);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.16);
      window.setTimeout(() => audioContext.close(), 240);
    } catch (error) {
      console.warn("Shutter sound skipped:", error);
    }
  }

  async function runCountdown(seconds) {
    countdownEl.classList.add("is-visible");

    for (let remaining = seconds; remaining > 0; remaining -= 1) {
      countdownEl.textContent = remaining;
      await wait(1000);
    }

    countdownEl.textContent = "Smile!";
    await wait(280);
    countdownEl.classList.remove("is-visible");
  }

  function takeSnapshot() {
    if (!video.videoWidth || !video.videoHeight) {
      throw new Error("Video belum siap untuk dipotret.");
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    const shouldMirror = mirrorToggle.checked && facingMode === "user";

    if (shouldMirror) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.94);
  }

  function resetShots() {
    capturedPhotos = [];
    persistShots();
    renderShotList();
    setStatus("Foto diulang. Pose baru, aura baru.");
  }

  async function goToEditor() {
    if (capturedPhotos.length !== Number(photoCountSelect.value)) {
      setStatus("Lengkapi dulu jumlah fotonya sebelum lanjut edit.", true);
      return;
    }

    persistShots();
    setStatus("Foto tersimpan sementara. Membuka editor...");
    stopStream();
    await wait(650);
    window.location.href = "editor.html";
  }

  async function captureSequence() {
    if (isCapturing) return;
    if (!stream) {
      await startCamera();
      if (!stream) return;
    }

    const timerSeconds = Number(timerSelect.value);
    const totalPhotos = Number(photoCountSelect.value);
    const remainingPhotos = Math.max(0, totalPhotos - capturedPhotos.length);

    if (remainingPhotos === 0) {
      setStatus("Jumlah foto sudah penuh. Hapus dulu kalau mau ambil ulang sebagian.", true);
      return;
    }

    isCapturing = true;
    setControlsDisabled(true);

    try {
      for (let index = 1; index <= remainingPhotos; index += 1) {
        const currentIndex = capturedPhotos.length + 1;
        setStatus(`Siap-siap foto ${currentIndex} dari ${totalPhotos}. Jangan lupa senyum gemoy.`);
        await runCountdown(timerSeconds);
        triggerFlash();
        playShutterSound();

        const dataUrl = takeSnapshot();
        capturedPhotos.push(dataUrl);
        renderShotList();
        await wait(520);
      }

      persistShots();
      setStatus(capturedPhotos.length === totalPhotos
        ? "Semua foto sudah siap. Cek dulu hasilnya di samping, lalu lanjut edit."
        : "Foto masuk. Masih ada slot kosong kalau mau tambah lagi.");
    } catch (error) {
      console.error("Capture error:", error);
      setStatus("Oops, foto gagal diambil. Coba ulangi yaa.", true);
    } finally {
      isCapturing = false;
      setControlsDisabled(false);
      updateCameraControls();
    }
  }

  async function switchCamera() {
    facingMode = facingMode === "user" ? "environment" : "user";
    await startCamera();
  }

  async function requestFullscreenCamera() {
    try {
      if (!document.fullscreenElement) {
        await cameraStage.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      setStatus("Fullscreen belum bisa aktif di browser ini.", true);
    }
  }

  function bindEvents() {
    enableCameraButton.addEventListener("click", startCamera);
    captureButton.addEventListener("click", captureSequence);
    switchCameraButton.addEventListener("click", switchCamera);
    retakeButton.addEventListener("click", resetShots);
    continueButton.addEventListener("click", goToEditor);
    fullscreenButton.addEventListener("click", requestFullscreenCamera);
    mirrorToggle.addEventListener("change", updateMirrorMode);
    photoCountSelect.addEventListener("change", () => {
      const targetCount = Number(photoCountSelect.value);
      if (capturedPhotos.length > targetCount) {
        capturedPhotos = capturedPhotos.slice(0, targetCount);
        persistShots();
        setStatus("Jumlah foto disesuaikan dengan pilihan baru.");
      }
      renderShotList();
    });

    shotList.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-index]");
      if (!removeButton) return;

      const index = Number(removeButton.getAttribute("data-remove-index"));
      capturedPhotos.splice(index, 1);
      persistShots();
      renderShotList();
      setStatus("Foto dihapus. Ambil lagi kalau mau ganti hasilnya.");
    });

    window.addEventListener("beforeunload", stopStream);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && !isCapturing) {
        stopStream();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    renderShotList();
    updateCameraControls();
  });
})();
