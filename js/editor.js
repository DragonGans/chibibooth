(function () {
  const STORAGE = {
    photos: "chibibooth.photos",
    frame: "chibibooth.lastFrame",
    filter: "chibibooth.lastFilter",
    text: "chibibooth.lastText",
    textColor: "chibibooth.lastTextColor",
    textSize: "chibibooth.lastTextSize"
  };

  const cuteCaptions = [
    "ChibiBooth Memories",
    "our memories",
    "best day ever",
    "with you",
    "soft little moments",
    "gemoy forever",
    "tiny joy, big memory",
    "love in pastel",
    "bestie sparkle mode",
    "cekrek dulu, kangen kemudian"
  ];

  const state = {
    originalPhotos: [],
    photos: [],
    pendingAIPhotos: null,
    frameId: localStorage.getItem(STORAGE.frame) || "pink-hearts",
    filterId: localStorage.getItem(STORAGE.filter) || "normal",
    customText: localStorage.getItem(STORAGE.text) || "ChibiBooth Memories",
    textColor: localStorage.getItem(STORAGE.textColor) || "#6f4a62",
    textSize: Number(localStorage.getItem(STORAGE.textSize)) || 72,
    textPosition: "bottom",
    stickerId: "heart",
    stickerPosition: "top-right",
    aiStyleId: "anime",
    beautify: false,
    mode: "story"
  };

  const elements = {};
  let renderToken = 0;

  function getElement(id) {
    return document.getElementById(id);
  }

  function readPhotosFromStorage() {
    try {
      const photos = JSON.parse(sessionStorage.getItem(STORAGE.photos) || "[]");
      return Array.isArray(photos) ? photos.filter((photo) => typeof photo === "string" && photo.startsWith("data:image/")) : [];
    } catch (error) {
      console.warn("Failed to parse stored photos:", error);
      return [];
    }
  }

  function getRenderOptions(mode) {
    return {
      photos: state.photos,
      frameId: state.frameId,
      filterId: state.filterId,
      customText: state.customText,
      textColor: state.textColor,
      textSize: state.textSize,
      textPosition: state.textPosition,
      stickerId: state.stickerId,
      stickerPosition: state.stickerPosition,
      beautify: state.beautify,
      mode: mode || state.mode
    };
  }

  async function renderPreview() {
    const token = ++renderToken;
    const offscreenCanvas = document.createElement("canvas");
    await window.ChibiCanvas.render(offscreenCanvas, getRenderOptions());

    if (token !== renderToken) return;

    elements.canvas.width = offscreenCanvas.width;
    elements.canvas.height = offscreenCanvas.height;
    elements.canvas.getContext("2d").drawImage(offscreenCanvas, 0, 0);
  }

  function persistEditorChoices() {
    localStorage.setItem(STORAGE.frame, state.frameId);
    localStorage.setItem(STORAGE.filter, state.filterId);
    localStorage.setItem(STORAGE.text, state.customText);
    localStorage.setItem(STORAGE.textColor, state.textColor);
    localStorage.setItem(STORAGE.textSize, String(state.textSize));
  }

  function setActiveButtons(attribute, value) {
    document.querySelectorAll(`[${attribute}]`).forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute(attribute) === value);
    });
  }

  function requestRender() {
    persistEditorChoices();
    setActiveButtons("data-frame-id", state.frameId);
    setActiveButtons("data-filter-id", state.filterId);
    setActiveButtons("data-sticker-id", state.stickerId);
    setActiveButtons("data-ai-style-id", state.aiStyleId);
    renderPreview();
  }

  function createOptionButton({ label, sublabel, attribute, value, className, content, onClick }) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `option-button ${className || ""}`.trim();
    button.setAttribute(attribute, value);
    button.innerHTML = content || `<strong>${label}</strong><span>${sublabel || ""}</span>`;
    button.addEventListener("click", onClick);
    return button;
  }

  function buildFrameControls() {
    elements.frameList.innerHTML = "";

    window.ChibiFrames.frames.forEach((frame) => {
      const button = createOptionButton({
        label: frame.name,
        sublabel: frame.tagline,
        attribute: "data-frame-id",
        value: frame.id,
        content: `
          <span class="frame-swatch" style="background:${frame.swatch}"></span>
          <strong>${frame.name}</strong>
          <span>${frame.tagline}</span>
        `,
        onClick: () => {
          state.frameId = frame.id;
          requestRender();
        }
      });
      elements.frameList.appendChild(button);
    });
  }

  function buildFilterControls() {
    elements.filterList.innerHTML = "";

    window.ChibiFilters.filters.forEach((filter) => {
      const button = createOptionButton({
        label: filter.name,
        sublabel: filter.description,
        attribute: "data-filter-id",
        value: filter.id,
        content: `
          <span class="frame-swatch" style="background:linear-gradient(135deg, #ffd6e8, #ccecff); filter:${filter.previewFilter};"></span>
          <strong>${filter.name}</strong>
          <span>${filter.description}</span>
        `,
        onClick: () => {
          state.filterId = filter.id;
          requestRender();
        }
      });
      elements.filterList.appendChild(button);
    });
  }

  function buildStickerControls() {
    elements.stickerList.innerHTML = "";

    window.ChibiStickers.stickers.forEach((sticker) => {
      const button = createOptionButton({
        label: sticker.name,
        attribute: "data-sticker-id",
        value: sticker.id,
        content: `
          <strong>${sticker.name}</strong>
          <span>sticker</span>
          <b class="sticker-emoji">${sticker.emoji}</b>
        `,
        onClick: () => {
          state.stickerId = sticker.id;
          requestRender();
        }
      });
      elements.stickerList.appendChild(button);
    });
  }

  function buildAIControls() {
    elements.aiStyleList.innerHTML = "";

    window.ChibiAI.aiStyles.forEach((style) => {
      const button = createOptionButton({
        label: style.name,
        sublabel: style.description,
        attribute: "data-ai-style-id",
        value: style.id,
        onClick: () => {
          state.aiStyleId = style.id;
          requestRender();
        }
      });
      elements.aiStyleList.appendChild(button);
    });
  }

  function bindInputs() {
    elements.customTextInput.value = state.customText;
    elements.textColorInput.value = state.textColor;
    elements.textSizeInput.value = state.textSize;

    elements.customTextInput.addEventListener("input", (event) => {
      state.customText = event.target.value || "ChibiBooth Memories";
      requestRender();
    });

    elements.textColorInput.addEventListener("input", (event) => {
      state.textColor = event.target.value;
      requestRender();
    });

    elements.textSizeInput.addEventListener("input", (event) => {
      state.textSize = Number(event.target.value);
      requestRender();
    });

    elements.textPositionSelect.addEventListener("change", (event) => {
      state.textPosition = event.target.value;
      requestRender();
    });

    elements.stickerPositionSelect.addEventListener("change", (event) => {
      state.stickerPosition = event.target.value;
      requestRender();
    });

    elements.beautifyToggle.addEventListener("change", (event) => {
      state.beautify = event.target.checked;
      requestRender();
    });
  }

  function bindActionButtons() {
    elements.randomFrameButton.addEventListener("click", () => {
      const frame = window.ChibiFrames.frames[Math.floor(Math.random() * window.ChibiFrames.frames.length)];
      state.frameId = frame.id;
      requestRender();
    });

    elements.randomCaptionButton.addEventListener("click", () => {
      const caption = cuteCaptions[Math.floor(Math.random() * cuteCaptions.length)];
      state.customText = caption;
      elements.customTextInput.value = caption;
      requestRender();
    });

    elements.downloadButton.addEventListener("click", async () => {
      await window.ChibiShare.downloadCanvas(elements.canvas);
    });

    elements.downloadSquareButton.addEventListener("click", async () => {
      const exportCanvas = await window.ChibiCanvas.createExportCanvas(getRenderOptions("square"), "square");
      await window.ChibiShare.downloadCanvas(exportCanvas, `square-${new Date().toISOString().slice(0, 10)}`);
    });

    elements.downloadStoryButton.addEventListener("click", async () => {
      const exportCanvas = await window.ChibiCanvas.createExportCanvas(getRenderOptions("story"), "story");
      await window.ChibiShare.downloadCanvas(exportCanvas);
    });

    elements.shareButton.addEventListener("click", async () => {
      await window.ChibiShare.shareCanvas(elements.canvas, elements.captionInput.value);
    });

    elements.copyCaptionButton.addEventListener("click", async () => {
      const copied = await window.ChibiShare.copyCaption(elements.captionInput.value);
      elements.copyCaptionButton.textContent = copied ? "Caption tersalin" : "Gagal copy";
      window.setTimeout(() => {
        elements.copyCaptionButton.textContent = "Copy caption";
      }, 1400);
    });

    elements.retakeLink.addEventListener("click", () => {
      sessionStorage.removeItem(STORAGE.photos);
    });
  }

  async function generateAIForPhotos() {
    elements.generateAIButton.disabled = true;
    elements.aiActions.classList.add("hidden");
    elements.aiStatus.textContent = "AI lagi bikin fotomu jadi gemoy...";

    try {
      const results = await Promise.all(
        state.originalPhotos.map((photo) => window.ChibiAI.generateAIStyle(photo, state.aiStyleId))
      );
      state.pendingAIPhotos = results.map((result) => result.resultImage);
      state.photos = state.pendingAIPhotos;
      elements.aiStatus.textContent = results.some((result) => result.mode === "real")
        ? "AI asli selesai. Kamu bisa pakai hasil ini atau balik ke foto asli."
        : "Mode AI asli belum aktif. Saat ini menggunakan demo style dulu.";
      elements.aiActions.classList.remove("hidden");
      requestRender();
    } catch (error) {
      console.error("AI generation failed:", error);
      elements.aiStatus.textContent = "AI demo gagal diproses. Coba style lain dulu yaa.";
    } finally {
      elements.generateAIButton.disabled = false;
    }
  }

  function bindAIButtons() {
    elements.generateAIButton.addEventListener("click", generateAIForPhotos);

    elements.useAIButton.addEventListener("click", () => {
      if (state.pendingAIPhotos) {
        state.photos = state.pendingAIPhotos;
        elements.aiStatus.textContent = "Hasil AI dipakai di canvas.";
        requestRender();
      }
    });

    elements.useOriginalButton.addEventListener("click", () => {
      state.photos = state.originalPhotos;
      elements.aiStatus.textContent = "Kembali ke foto asli.";
      requestRender();
    });
  }

  function collectElements() {
    [
      "emptyState",
      "editorShell",
      "resultCanvas",
      "frameList",
      "filterList",
      "stickerList",
      "aiStyleList",
      "customTextInput",
      "textColorInput",
      "textSizeInput",
      "textPositionSelect",
      "stickerPositionSelect",
      "beautifyToggle",
      "randomFrameButton",
      "randomCaptionButton",
      "downloadButton",
      "downloadSquareButton",
      "downloadStoryButton",
      "shareButton",
      "copyCaptionButton",
      "captionInput",
      "generateAIButton",
      "aiStatus",
      "aiActions",
      "useAIButton",
      "useOriginalButton",
      "retakeLink"
    ].forEach((id) => {
      const key = id === "resultCanvas" ? "canvas" : id;
      elements[key] = getElement(id);
    });
  }

  function showEmptyState() {
    elements.emptyState.classList.remove("hidden");
    elements.editorShell.classList.add("hidden");
  }

  function initEditor() {
    collectElements();

    state.originalPhotos = readPhotosFromStorage();
    state.photos = [...state.originalPhotos];

    if (!state.photos.length) {
      showEmptyState();
      return;
    }

    buildFrameControls();
    buildFilterControls();
    buildStickerControls();
    buildAIControls();
    bindInputs();
    bindActionButtons();
    bindAIButtons();
    requestRender();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(renderPreview);
    }
  }

  document.addEventListener("DOMContentLoaded", initEditor);
})();
