(function () {
  const filters = [
    {
      id: "normal",
      name: "Normal",
      description: "Asli",
      canvasFilter: "none",
      previewFilter: "none"
    },
    {
      id: "warm",
      name: "Warm",
      description: "Peach glow",
      canvasFilter: "brightness(1.05) contrast(1.02) saturate(1.16) sepia(0.12)",
      previewFilter: "brightness(1.05) contrast(1.02) saturate(1.16) sepia(0.12)"
    },
    {
      id: "soft-pink",
      name: "Soft Pink",
      description: "Rosy",
      canvasFilter: "brightness(1.08) contrast(0.96) saturate(1.18) sepia(0.08) hue-rotate(-8deg)",
      previewFilter: "brightness(1.08) contrast(0.96) saturate(1.18) sepia(0.08) hue-rotate(-8deg)"
    },
    {
      id: "black-white",
      name: "Black & White",
      description: "Classic",
      canvasFilter: "grayscale(1) contrast(1.08)",
      previewFilter: "grayscale(1) contrast(1.08)"
    },
    {
      id: "vintage",
      name: "Vintage",
      description: "Old film",
      canvasFilter: "sepia(0.38) contrast(0.95) brightness(1.05) saturate(0.9)",
      previewFilter: "sepia(0.38) contrast(0.95) brightness(1.05) saturate(0.9)"
    },
    {
      id: "bright",
      name: "Bright",
      description: "Clean",
      canvasFilter: "brightness(1.18) contrast(1.03) saturate(1.05)",
      previewFilter: "brightness(1.18) contrast(1.03) saturate(1.05)"
    },
    {
      id: "dreamy",
      name: "Dreamy",
      description: "Soft haze",
      canvasFilter: "brightness(1.12) contrast(0.9) saturate(1.12) blur(0.35px)",
      previewFilter: "brightness(1.12) contrast(0.9) saturate(1.12) blur(0.35px)"
    },
    {
      id: "chibi-soft",
      name: "Chibi Soft",
      description: "Gemoy",
      canvasFilter: "brightness(1.14) contrast(1.08) saturate(1.35) sepia(0.06)",
      previewFilter: "brightness(1.14) contrast(1.08) saturate(1.35) sepia(0.06)"
    }
  ];

  function getFilter(id) {
    return filters.find((filter) => filter.id === id) || filters[0];
  }

  window.ChibiFilters = {
    filters,
    getFilter
  };
})();
