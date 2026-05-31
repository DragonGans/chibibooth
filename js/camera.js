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
    sessionStorage.removeItem(STORAGE_PHOTOS);
    sessionStorage.removeItem(STORAGE_META);
    setStatus("Foto diulang. Pose baru, aura baru.");
  }

  async function captureSequence() {
    if (isCapturing) return;
    if (!stream) {
      await startCamera();
      if (!stream) return;
    }

    const timerSeconds = Number(timerSelect.value);
    const totalPhotos = Number(photoCountSelect.value);

    isCapturing = true;
    setControlsDisabled(true);
    resetShots();

    try {
      for (let index = 1; index <= totalPhotos; index += 1) {
        setStatus(`Siap-siap foto ${index}. Jangan lupa senyum gemoy.`);
        await runCountdown(timerSeconds);
        triggerFlash();
        playShutterSound();

        const dataUrl = takeSnapshot();
        capturedPhotos.push(dataUrl);
        await wait(520);
      }

      sessionStorage.setItem(STORAGE_PHOTOS, JSON.stringify(capturedPhotos));
      sessionStorage.setItem(STORAGE_META, JSON.stringify({
        count: capturedPhotos.length,
        createdAt: new Date().toISOString()
      }));

      setStatus("Foto tersimpan sementara. Membuka editor...");
      stopStream();
      await wait(650);
      window.location.href = "editor.html";
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
    fullscreenButton.addEventListener("click", requestFullscreenCamera);
    mirrorToggle.addEventListener("change", updateMirrorMode);

    window.addEventListener("beforeunload", stopStream);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && !isCapturing) {
        stopStream();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    updateCameraControls();
  });
})();
