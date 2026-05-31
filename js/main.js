(function () {
  const THEME_KEY = "chibibooth.theme";

  function applyTheme(theme) {
    const nextTheme = theme === "moon" ? "moon" : "sun";
    document.documentElement.dataset.theme = nextTheme === "moon" ? "moon" : "";
    localStorage.setItem(THEME_KEY, nextTheme);

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.textContent = nextTheme === "moon" ? "Light Pastel" : "Pastel Mode";
      button.setAttribute("aria-label", nextTheme === "moon" ? "Aktifkan light pastel mode" : "Aktifkan dark pastel mode");
    });
  }

  function initThemeToggle() {
    const savedTheme = localStorage.getItem(THEME_KEY) || "sun";
    applyTheme(savedTheme);

    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const currentTheme = localStorage.getItem(THEME_KEY) || "sun";
        applyTheme(currentTheme === "moon" ? "sun" : "moon");
      });
    });
  }

  function initAnchorButtons() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const target = document.querySelector(link.getAttribute("href"));
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initThemeToggle();
    initAnchorButtons();
  });
})();
