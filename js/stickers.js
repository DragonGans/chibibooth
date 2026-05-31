(function () {
  const stickers = [
    { id: "heart", name: "Heart", emoji: "💖" },
    { id: "star", name: "Star", emoji: "⭐" },
    { id: "flower", name: "Flower", emoji: "🌸" },
    { id: "sparkle", name: "Sparkle", emoji: "✨" },
    { id: "ribbon", name: "Ribbon", emoji: "🎀" },
    { id: "cat", name: "Cat", emoji: "🐱" },
    { id: "bear", name: "Bear", emoji: "🐻" },
    { id: "kiss", name: "Kiss", emoji: "💋" },
    { id: "crown", name: "Crown", emoji: "👑" },
    { id: "butterfly", name: "Butterfly", emoji: "🦋" }
  ];

  const positionMap = {
    "top-left": { x: 0.15, y: 0.12, rotate: -10 },
    "top-right": { x: 0.85, y: 0.12, rotate: 10 },
    "bottom-left": { x: 0.15, y: 0.86, rotate: 9 },
    "bottom-right": { x: 0.85, y: 0.86, rotate: -9 }
  };

  function getSticker(id) {
    return stickers.find((sticker) => sticker.id === id) || stickers[0];
  }

  function drawSticker(ctx, stickerId, positionId, width, height) {
    const sticker = getSticker(stickerId);
    const position = positionMap[positionId] || positionMap["top-right"];
    const size = Math.min(width, height) * 0.095;
    const x = width * position.x;
    const y = height * position.y;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((position.rotate * Math.PI) / 180);
    ctx.fillStyle = "rgba(255,255,255,0.68)";
    ctx.strokeStyle = "rgba(255,127,171,0.22)";
    ctx.lineWidth = size * 0.08;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.74, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(sticker.emoji, 0, size * 0.02);
    ctx.restore();
  }

  window.ChibiStickers = {
    stickers,
    getSticker,
    drawSticker
  };
})();
