(function () {
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
      const radii = typeof radius === "number" ? { tl: radius, tr: radius, br: radius, bl: radius } : radius;
      const tl = radii.tl || 0;
      const tr = radii.tr || 0;
      const br = radii.br || 0;
      const bl = radii.bl || 0;

      this.moveTo(x + tl, y);
      this.lineTo(x + width - tr, y);
      this.quadraticCurveTo(x + width, y, x + width, y + tr);
      this.lineTo(x + width, y + height - br);
      this.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
      this.lineTo(x + bl, y + height);
      this.quadraticCurveTo(x, y + height, x, y + height - bl);
      this.lineTo(x, y + tl);
      this.quadraticCurveTo(x, y, x + tl, y);
      return this;
    };
  }

  const OUTPUTS = {
    story: { width: 1080, height: 1920 },
    square: { width: 1080, height: 1080 }
  };

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  function drawImageCover(ctx, image, x, y, width, height) {
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const targetRatio = width / height;
    let sourceWidth = image.naturalWidth;
    let sourceHeight = image.naturalHeight;
    let sourceX = 0;
    let sourceY = 0;

    if (imageRatio > targetRatio) {
      sourceWidth = image.naturalHeight * targetRatio;
      sourceX = (image.naturalWidth - sourceWidth) / 2;
    } else {
      sourceHeight = image.naturalWidth / targetRatio;
      sourceY = (image.naturalHeight - sourceHeight) / 2;
    }

    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  }

  function getPhotoRects(count, width, height, mode) {
    const photoCount = Math.max(1, count);

    if (mode === "square") {
      if (photoCount === 1) {
        return [{ x: 150, y: 140, width: 780, height: 650, radius: 46, polaroid: true }];
      }

      if (photoCount === 2) {
        return [
          { x: 130, y: 130, width: 820, height: 360, radius: 44 },
          { x: 130, y: 540, width: 820, height: 360, radius: 44 }
        ];
      }

      if (photoCount === 3) {
        return [
          { x: 140, y: 120, width: 800, height: 330, radius: 42 },
          { x: 115, y: 505, width: 390, height: 330, radius: 40 },
          { x: 575, y: 505, width: 390, height: 330, radius: 40 }
        ];
      }

      return [
        { x: 110, y: 130, width: 410, height: 330, radius: 40 },
        { x: 560, y: 130, width: 410, height: 330, radius: 40 },
        { x: 110, y: 505, width: 410, height: 330, radius: 40 },
        { x: 560, y: 505, width: 410, height: 330, radius: 40 }
      ];
    }

    if (photoCount === 1) {
      return [{ x: 140, y: 270, width: 800, height: 920, radius: 54, polaroid: true }];
    }

    if (photoCount === 2) {
      return [
        { x: 125, y: 260, width: 830, height: 560, radius: 52 },
        { x: 125, y: 900, width: 830, height: 560, radius: 52 }
      ];
    }

    if (photoCount === 3) {
      return [
        { x: 185, y: 250, width: 710, height: 385, radius: 48 },
        { x: 185, y: 715, width: 710, height: 385, radius: 48 },
        { x: 185, y: 1180, width: 710, height: 385, radius: 48 }
      ];
    }

    return [
      { x: 215, y: 190, width: 650, height: 320, radius: 46 },
      { x: 215, y: 545, width: 650, height: 320, radius: 46 },
      { x: 215, y: 900, width: 650, height: 320, radius: 46 },
      { x: 215, y: 1255, width: 650, height: 320, radius: 46 }
    ];
  }

  function combineFilters(filter, beautify) {
    const baseFilter = filter && filter !== "none" ? filter : "";
    const beautyFilter = beautify ? "brightness(1.07) contrast(1.02) saturate(1.08)" : "";
    const combined = `${baseFilter} ${beautyFilter}`.trim();
    return combined || "none";
  }

  function drawPhotoSlot(ctx, image, rect, filter, index) {
    const matte = rect.polaroid ? 42 : 20;
    const bottomExtra = rect.polaroid ? 150 : 20;
    const cardX = rect.x - matte;
    const cardY = rect.y - matte;
    const cardWidth = rect.width + matte * 2;
    const cardHeight = rect.height + matte + bottomExtra;
    const cardRadius = rect.radius + 18;

    ctx.save();
    ctx.shadowColor = "rgba(94, 54, 91, 0.20)";
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 16;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(rect.x, rect.y, rect.width, rect.height, rect.radius);
    ctx.clip();
    ctx.filter = filter;
    drawImageCover(ctx, image, rect.x, rect.y, rect.width, rect.height);
    ctx.filter = "none";

    ctx.fillStyle = "rgba(255, 185, 208, 0.08)";
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.84)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(rect.x, rect.y, rect.width, rect.height, rect.radius);
    ctx.stroke();

    if (rect.polaroid) {
      ctx.fillStyle = "rgba(111, 74, 98, 0.62)";
      ctx.font = '700 38px "Fredoka", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`photo ${index + 1}`, rect.x + rect.width / 2, rect.y + rect.height + 72);
    }
    ctx.restore();
  }

  function drawCenteredText(ctx, text, x, y, maxWidth, requestedSize, color) {
    if (!text) return;

    let fontSize = requestedSize;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.shadowColor = "rgba(255,255,255,0.86)";
    ctx.shadowBlur = 10;
    ctx.lineWidth = Math.max(8, fontSize * 0.15);
    ctx.strokeStyle = "rgba(255,255,255,0.72)";

    do {
      ctx.font = `800 ${fontSize}px "Fredoka", "Quicksand", sans-serif`;
      if (ctx.measureText(text).width <= maxWidth || fontSize <= 40) break;
      fontSize -= 4;
    } while (fontSize > 40);

    ctx.strokeText(text, x, y, maxWidth);
    ctx.fillText(text, x, y, maxWidth);
    ctx.restore();
  }

  function drawMetaText(ctx, width, height, frame) {
    const date = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    ctx.save();
    ctx.fillStyle = "rgba(103,68,96,0.66)";
    ctx.font = '700 28px "Quicksand", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${date} • ${frame.name}`, width / 2, height - 158);
    ctx.restore();
  }

  function getTextY(position, width, height, mode) {
    if (position === "top") return mode === "square" ? 88 : 128;
    if (position === "middle") return height / 2;
    return mode === "square" ? height - 112 : height - 220;
  }

  function drawSoftVignette(ctx, width, height) {
    const gradient = ctx.createRadialGradient(width / 2, height / 2, width * 0.1, width / 2, height / 2, height * 0.75);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(1, "rgba(255,127,171,0.10)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  async function render(canvas, options) {
    const mode = options.mode === "square" ? "square" : "story";
    const output = OUTPUTS[mode];
    const photos = Array.isArray(options.photos) ? options.photos : [];
    const frame = window.ChibiFrames.getFrame(options.frameId);
    const filter = window.ChibiFilters.getFilter(options.filterId);
    const canvasFilter = combineFilters(filter.canvasFilter, options.beautify);

    canvas.width = output.width;
    canvas.height = output.height;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    window.ChibiFrames.drawFrameBackground(ctx, width, height, frame);

    if (photos.length) {
      const images = await Promise.all(photos.map(loadImage));
      const rects = getPhotoRects(images.length, width, height, mode);

      rects.forEach((rect, index) => {
        const image = images[index];
        if (!image) return;
        drawPhotoSlot(ctx, image, rect, canvasFilter, index);
      });
    } else {
      drawCenteredText(ctx, "Belum ada foto nih", width / 2, height / 2, width - 180, 72, "#6f4a62");
    }

    drawSoftVignette(ctx, width, height);
    window.ChibiFrames.drawFrameForeground(ctx, width, height, frame);
    drawMetaText(ctx, width, height, frame);

    drawCenteredText(
      ctx,
      options.customText || "ChibiBooth Memories",
      width / 2,
      getTextY(options.textPosition, width, height, mode),
      width - 170,
      Number(options.textSize) || 72,
      options.textColor || "#6f4a62"
    );

    if (options.stickerId && options.stickerId !== "none") {
      window.ChibiStickers.drawSticker(ctx, options.stickerId, options.stickerPosition, width, height);
    }

    return canvas;
  }

  async function createExportCanvas(options, mode) {
    const canvas = document.createElement("canvas");
    await render(canvas, { ...options, mode });
    return canvas;
  }

  window.ChibiCanvas = {
    render,
    createExportCanvas
  };
})();
