(function () {
  const frames = [
    {
      id: "pink-hearts",
      name: "Pink Hearts",
      tagline: "sweet memories",
      swatch: "linear-gradient(135deg, #ffd6e8, #ff9fbd)"
    },
    {
      id: "bear-cute",
      name: "Bear Cute",
      tagline: "beary cute",
      swatch: "linear-gradient(135deg, #fff0c8, #ffd8bd)"
    },
    {
      id: "cloud-pastel",
      name: "Cloud Pastel",
      tagline: "dreamy day",
      swatch: "linear-gradient(135deg, #ccecff, #e7dcff)"
    },
    {
      id: "romantic-rose",
      name: "Romantic Rose",
      tagline: "love moment",
      swatch: "linear-gradient(135deg, #ffc0d8, #ff86ad)"
    },
    {
      id: "love-letter",
      name: "Love Letter",
      tagline: "dear memories",
      swatch: "linear-gradient(135deg, #ffd8bd, #fff2d5)"
    },
    {
      id: "lavender-dream",
      name: "Lavender Dream",
      tagline: "soft dream",
      swatch: "linear-gradient(135deg, #d9c8ff, #b8d9ff)"
    },
    {
      id: "birthday-party",
      name: "Birthday Party",
      tagline: "happy day",
      swatch: "linear-gradient(135deg, #fff2b8, #ffd6e8)"
    },
    {
      id: "bestie-mode",
      name: "Bestie Mode",
      tagline: "bestie forever",
      swatch: "linear-gradient(135deg, #ffd6e8, #ccecff)"
    }
  ];

  function getFrame(id) {
    return frames.find((frame) => frame.id === id) || frames[0];
  }

  function fillBackground(ctx, width, height, colors) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    colors.forEach((color, index) => {
      gradient.addColorStop(index / Math.max(colors.length - 1, 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function drawHeart(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 32, size / 32);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.bezierCurveTo(-18, -8, -32, 10, 0, 30);
    ctx.bezierCurveTo(32, 10, 18, -8, 0, 9);
    ctx.fill();
    ctx.restore();
  }

  function drawStar(ctx, x, y, radius, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let index = 0; index < 10; index += 1) {
      const angle = (Math.PI / 5) * index - Math.PI / 2;
      const pointRadius = index % 2 === 0 ? radius : radius * 0.46;
      ctx.lineTo(Math.cos(angle) * pointRadius, Math.sin(angle) * pointRadius);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawSparkle(ctx, x, y, size, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(4, size * 0.12);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.moveTo(x - size, y);
    ctx.lineTo(x + size, y);
    ctx.stroke();
    ctx.restore();
  }

  function drawCloud(ctx, x, y, scale, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(-34, 6, 27, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(-8, -18, 33, Math.PI, Math.PI * 1.85);
    ctx.arc(30, -7, 29, Math.PI * 1.2, Math.PI * 2);
    ctx.arc(48, 12, 24, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawFlower(ctx, x, y, size, petal, center) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = petal;
    for (let index = 0; index < 6; index += 1) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.ellipse(0, -size * 0.45, size * 0.22, size * 0.44, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = center;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawEnvelope(ctx, x, y, width, color) {
    const height = width * 0.62;
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color;
    ctx.fillStyle = "rgba(255,255,255,0.46)";
    ctx.lineWidth = Math.max(5, width * 0.05);
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.roundRect(-width / 2, -height / 2, width, height, 16);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-width / 2, -height / 2);
    ctx.lineTo(0, 4);
    ctx.lineTo(width / 2, -height / 2);
    ctx.moveTo(-width / 2, height / 2);
    ctx.lineTo(-5, 0);
    ctx.moveTo(width / 2, height / 2);
    ctx.lineTo(5, 0);
    ctx.stroke();
    drawHeart(ctx, width * 0.22, height * 0.1, width * 0.18, color);
    ctx.restore();
  }

  function drawBalloon(ctx, x, y, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = "rgba(255,255,255,0.78)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.64, size * 0.78, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.78);
    ctx.quadraticCurveTo(x - size * 0.28, y + size * 1.18, x + size * 0.1, y + size * 1.55);
    ctx.stroke();
    ctx.restore();
  }

  function drawSmiley(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(5, size * 0.08);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-size * 0.18, -size * 0.1, size * 0.03, 0, Math.PI * 2);
    ctx.arc(size * 0.18, -size * 0.1, size * 0.03, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, size * 0.04, size * 0.25, 0.12 * Math.PI, 0.88 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  function drawBearEars(ctx, width) {
    ctx.save();
    ctx.fillStyle = "rgba(166, 111, 81, 0.25)";
    ctx.strokeStyle = "rgba(255,255,255,0.72)";
    ctx.lineWidth = 10;
    [
      { x: 145, y: 155, rotate: -0.25 },
      { x: width - 145, y: 155, rotate: 0.25 }
    ].forEach((ear) => {
      ctx.save();
      ctx.translate(ear.x, ear.y);
      ctx.rotate(ear.rotate);
      ctx.beginPath();
      ctx.arc(0, 0, 82, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255, 205, 190, 0.44)";
      ctx.beginPath();
      ctx.arc(0, 8, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();
  }

  function drawFrameBackground(ctx, width, height, frame) {
    switch (frame.id) {
      case "bear-cute":
        fillBackground(ctx, width, height, ["#fff7dc", "#ffe7c9", "#fffaf0"]);
        drawBearEars(ctx, width);
        [
          [170, 360], [900, 300], [130, 1520], [930, 1640], [830, 1120]
        ].forEach(([x, y], index) => drawStar(ctx, x, y, 24 + index * 3, "rgba(255,183,90,0.54)"));
        break;
      case "cloud-pastel":
        fillBackground(ctx, width, height, ["#ccecff", "#e7dcff", "#fff6fb"]);
        [
          [165, 180, 0.9], [850, 260, 0.75], [135, 1550, 0.8], [865, 1700, 0.92]
        ].forEach(([x, y, scale]) => drawCloud(ctx, x, y, scale, "rgba(255,255,255,0.76)"));
        [
          [900, 500], [160, 840], [900, 1220]
        ].forEach(([x, y]) => drawStar(ctx, x, y, 24, "rgba(255, 221, 128, 0.72)"));
        break;
      case "romantic-rose":
        fillBackground(ctx, width, height, ["#ffd1df", "#ff9fbd", "#fff0f6"]);
        [
          [140, 240], [890, 360], [130, 1510], [890, 1640]
        ].forEach(([x, y]) => drawFlower(ctx, x, y, 78, "rgba(255,255,255,0.66)", "rgba(255,127,171,0.66)"));
        [
          [825, 170], [190, 640], [930, 930], [150, 1290]
        ].forEach(([x, y]) => drawHeart(ctx, x, y, 46, "rgba(255,255,255,0.58)"));
        break;
      case "love-letter":
        fillBackground(ctx, width, height, ["#ffd8bd", "#fff2d5", "#ffe7e8"]);
        drawEnvelope(ctx, 178, 230, 150, "rgba(208,105,125,0.66)");
        drawEnvelope(ctx, 890, 1570, 138, "rgba(208,105,125,0.58)");
        ctx.save();
        ctx.strokeStyle = "rgba(183,118,85,0.25)";
        ctx.lineWidth = 5;
        ctx.setLineDash([18, 16]);
        for (let y = 360; y < height - 260; y += 260) {
          ctx.beginPath();
          ctx.moveTo(90, y);
          ctx.lineTo(width - 90, y + 34);
          ctx.stroke();
        }
        ctx.restore();
        break;
      case "lavender-dream":
        fillBackground(ctx, width, height, ["#d9c8ff", "#ccecff", "#fff3fb"]);
        ctx.save();
        ctx.fillStyle = "rgba(255,255,255,0.64)";
        ctx.beginPath();
        ctx.arc(860, 205, 68, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#d9c8ff";
        ctx.beginPath();
        ctx.arc(890, 180, 68, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        [
          [170, 220], [880, 580], [160, 1080], [870, 1500], [520, 1680]
        ].forEach(([x, y]) => drawSparkle(ctx, x, y, 34, "rgba(255,255,255,0.72)"));
        break;
      case "birthday-party":
        fillBackground(ctx, width, height, ["#fff2b8", "#ffd6e8", "#ccecff"]);
        drawBalloon(ctx, 155, 230, 78, "rgba(255,127,171,0.64)");
        drawBalloon(ctx, 905, 260, 72, "rgba(169,137,238,0.58)");
        drawBalloon(ctx, 145, 1600, 68, "rgba(108,207,255,0.56)");
        ctx.save();
        const confetti = ["#ff7fab", "#a989ee", "#6ccfff", "#ffbf69"];
        for (let index = 0; index < 58; index += 1) {
          const x = 80 + ((index * 157) % (width - 160));
          const y = 120 + ((index * 239) % (height - 240));
          ctx.fillStyle = confetti[index % confetti.length];
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(index);
          ctx.fillRect(-9, -4, 18, 8);
          ctx.restore();
        }
        ctx.restore();
        break;
      case "bestie-mode": {
        fillBackground(ctx, width, height, ["#ffd6e8", "#ccecff", "#fff8e8"]);
        [
          [155, 220], [890, 330], [165, 1560], [870, 1650]
        ].forEach(([x, y]) => drawSmiley(ctx, x, y, 80, "rgba(95,83,139,0.42)"));
        [
          [520, 140], [925, 930], [140, 920]
        ].forEach(([x, y]) => drawHeart(ctx, x, y, 42, "rgba(255,255,255,0.6)"));
        break;
      }
      case "pink-hearts":
      default:
        fillBackground(ctx, width, height, ["#ffd6e8", "#ffb7d0", "#fff0f6"]);
        [
          [150, 210], [900, 260], [150, 610], [920, 870], [150, 1260], [900, 1530], [520, 1700]
        ].forEach(([x, y], index) => drawHeart(ctx, x, y, 38 + (index % 3) * 12, "rgba(255,255,255,0.58)"));
        break;
    }
  }

  function drawFrameForeground(ctx, width, height, frame) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.82)";
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.roundRect(42, 42, width - 84, height - 84, 54);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.64)";
    ctx.beginPath();
    ctx.roundRect(width / 2 - 250, height - 124, 500, 64, 32);
    ctx.fill();

    ctx.fillStyle = "rgba(103,68,96,0.76)";
    ctx.font = '700 36px "Fredoka", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(frame.tagline, width / 2, height - 91);
    ctx.restore();
  }

  window.ChibiFrames = {
    frames,
    getFrame,
    drawFrameBackground,
    drawFrameForeground
  };
})();
