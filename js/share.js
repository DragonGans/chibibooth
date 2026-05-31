(function () {
  function getDateSlug() {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 5).replace(":", "");
    return `${date}-${time}`;
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas gagal diexport."));
        }
      }, "image/png", 1);
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function downloadCanvas(canvas, suffix) {
    const blob = await canvasToBlob(canvas);
    const filename = `chibibooth-memory-${suffix || getDateSlug()}.png`;
    downloadBlob(blob, filename);
  }

  async function shareCanvas(canvas, caption) {
    const blob = await canvasToBlob(canvas);
    const filename = `chibibooth-memory-${getDateSlug()}.png`;
    const file = new File([blob], filename, { type: "image/png" });
    const shareData = {
      title: "ChibiBooth Memory",
      text: caption || "Made with ChibiBooth ✨ cekrek dulu, kenangan kemudian 💖",
      files: [file]
    };

    if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
      await navigator.share(shareData);
      return;
    }

    window.alert("Browser belum mendukung share langsung, file akan didownload.");
    downloadBlob(blob, filename);
  }

  async function copyCaption(caption) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(caption);
      return true;
    }

    const textarea = document.createElement("textarea");
    textarea.value = caption;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  }

  window.ChibiShare = {
    canvasToBlob,
    downloadCanvas,
    shareCanvas,
    copyCaption
  };
})();
