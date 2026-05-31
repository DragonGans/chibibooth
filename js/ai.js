(function () {
  const aiStyles = [
    { id: "anime", name: "Anime", description: "Bright cute" },
    { id: "chibi", name: "Chibi", description: "Soft gemoy" },
    { id: "cartoon", name: "Cartoon", description: "Bold color" },
    { id: "ghibli-soft", name: "Ghibli-inspired soft anime", description: "Dreamy" },
    { id: "manga-bw", name: "Manga black and white", description: "Ink look" },
    { id: "pixel-art", name: "Pixel art", description: "Tiny blocky" },
    { id: "cute-sticker", name: "Cute sticker style", description: "Pop" },
    { id: "romantic-illustration", name: "Romantic illustration", description: "Rosy" }
  ];

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  function getTargetSize(image) {
    const maxSide = 1400;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    return {
      width: Math.round(image.naturalWidth * scale),
      height: Math.round(image.naturalHeight * scale)
    };
  }

  function quantize(canvas, step) {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let index = 0; index < data.length; index += 4) {
      data[index] = Math.round(data[index] / step) * step;
      data[index + 1] = Math.round(data[index + 1] / step) * step;
      data[index + 2] = Math.round(data[index + 2] / step) * step;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  function mangaEffect(canvas) {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let index = 0; index < data.length; index += 4) {
      const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
      const value = gray > 178 ? 255 : gray > 112 ? 188 : gray > 72 ? 72 : 18;
      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  function addOverlay(canvas, color, alpha) {
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  function addStickerBorder(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = Math.max(18, canvas.width * 0.025);
    ctx.lineJoin = "round";
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, canvas.width - ctx.lineWidth, canvas.height - ctx.lineWidth);
    ctx.restore();
  }

  async function pixelArtEffect(image) {
    const size = getTargetSize(image);
    const smallWidth = Math.max(48, Math.round(size.width / 18));
    const smallHeight = Math.max(48, Math.round(size.height / 18));
    const smallCanvas = document.createElement("canvas");
    smallCanvas.width = smallWidth;
    smallCanvas.height = smallHeight;
    const smallCtx = smallCanvas.getContext("2d");
    smallCtx.imageSmoothingEnabled = false;
    smallCtx.drawImage(image, 0, 0, smallWidth, smallHeight);

    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(smallCanvas, 0, 0, size.width, size.height);
    quantize(canvas, 36);
    return canvas.toDataURL("image/png");
  }

  async function demoAIStyle(imageDataUrl, styleId) {
    const image = await loadImage(imageDataUrl);

    if (styleId === "pixel-art") {
      return pixelArtEffect(image);
    }

    const size = getTargetSize(image);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");

    const filterMap = {
      anime: "brightness(1.16) contrast(1.08) saturate(1.55)",
      chibi: "brightness(1.2) contrast(1.02) saturate(1.35) hue-rotate(-6deg)",
      cartoon: "brightness(1.08) contrast(1.28) saturate(1.65)",
      "ghibli-soft": "brightness(1.12) contrast(0.92) saturate(1.18) sepia(0.08)",
      "manga-bw": "grayscale(1) contrast(1.6)",
      "cute-sticker": "brightness(1.18) contrast(1.18) saturate(1.7)",
      "romantic-illustration": "brightness(1.14) contrast(0.96) saturate(1.28) hue-rotate(-8deg)"
    };

    ctx.filter = filterMap[styleId] || filterMap.anime;
    ctx.drawImage(image, 0, 0, size.width, size.height);
    ctx.filter = "none";

    if (styleId === "manga-bw") {
      mangaEffect(canvas);
    } else if (styleId === "cartoon" || styleId === "anime") {
      quantize(canvas, styleId === "cartoon" ? 26 : 20);
    } else if (styleId === "cute-sticker") {
      quantize(canvas, 22);
      addStickerBorder(canvas);
    } else if (styleId === "chibi") {
      addOverlay(canvas, "#ffd6e8", 0.18);
      quantize(canvas, 24);
    } else if (styleId === "ghibli-soft") {
      addOverlay(canvas, "#fff2c8", 0.22);
    } else if (styleId === "romantic-illustration") {
      addOverlay(canvas, "#ff9fbd", 0.2);
      quantize(canvas, 28);
    }

    return canvas.toDataURL("image/png");
  }

  async function callRealAIAPI(imageDataUrl, selectedStyle) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2500);

    try {
      /*
       * Endpoint ini perlu dibuat di backend/serverless agar API key aman.
       * Jangan pernah menaruh API key langsung di file frontend.
       */
      const response = await fetch("/api/ai-style", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          image: imageDataUrl,
          style: selectedStyle
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`AI API belum tersedia: ${response.status}`);
      }

      const data = await response.json();
      if (!data.resultImage) {
        throw new Error("Response AI tidak memiliki resultImage.");
      }

      return data.resultImage;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function generateAIStyle(imageDataUrl, selectedStyle) {
    try {
      const resultImage = await callRealAIAPI(imageDataUrl, selectedStyle);
      return {
        resultImage,
        mode: "real",
        message: "AI asli selesai. Foto kamu sudah makin gemoy."
      };
    } catch (error) {
      console.info("Falling back to demo AI style:", error);
      const resultImage = await demoAIStyle(imageDataUrl, selectedStyle);
      return {
        resultImage,
        mode: "demo",
        message: "Mode AI asli belum aktif. Saat ini menggunakan demo style dulu."
      };
    }
  }

  window.ChibiAI = {
    aiStyles,
    generateAIStyle,
    demoAIStyle
  };
})();
