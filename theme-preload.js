(function () {
  try {
    var savedTheme = localStorage.getItem("theme") || "dark";
    var darkMode = savedTheme === "dark";
    var root = document.documentElement;

    root.classList.toggle("dark", darkMode);
    root.classList.toggle("light", !darkMode);

    if (document.getElementById("theme-preload-style")) {
      return;
    }

    var style = document.createElement("style");
    style.id = "theme-preload-style";
    style.textContent = darkMode ? [
      "body#body { background-color: rgb(17, 24, 39) !important; color: white !important; }",
      "#navbar { background-color: rgb(31, 41, 55) !important; color: white !important; }",
      "#navbar button, #navbar nav > div { background-color: rgb(17, 24, 39) !important; color: white !important; border-color: rgb(75, 85, 99) !important; }",
      "#navbar button span, #navbar nav span, #navbar nav select, #navbar nav i { color: white !important; }",
      ".bg-white { background-color: rgb(31, 41, 55) !important; }",
      ".text-gray-900 { color: white !important; }",
      ".text-gray-500 { color: rgb(209, 213, 219) !important; }",
      ".border-gray-300 { border-color: rgb(75, 85, 99) !important; }"
    ].join("\n") : "";

    document.head.appendChild(style);

    function clearThemePreloadStyle() {
      var preloadStyle = document.getElementById("theme-preload-style");
      if (preloadStyle) {
        preloadStyle.remove();
      }
    }

    window.clearThemePreloadStyle = clearThemePreloadStyle;
    document.addEventListener("DOMContentLoaded", function () {
      requestAnimationFrame(clearThemePreloadStyle);
    }, { once: true });
  } catch (error) {
    // Ignore preload issues and let the normal page script handle the theme.
  }
})();
