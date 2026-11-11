// Permet de gérer la persistance du thème sombre entre toutes les pages
const savedTheme = localStorage.getItem("CL - Net-theme");
const isDarkMode = savedTheme === "dark";
document.documentElement.classList.toggle("dark-mode", isDarkMode);

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("dark-mode-toggle");
  if (!toggle) return;

  toggle.checked = isDarkMode;
  document.body.classList.toggle("dark-mode", isDarkMode);
  document.body.classList.toggle("light-mode", savedTheme === "light");

  toggle.addEventListener("change", () => {
    document.documentElement.classList.toggle("dark-mode", toggle.checked);
    document.body.classList.toggle("dark-mode", toggle.checked);
    document.body.classList.toggle("light-mode", !toggle.checked);

    if (toggle.checked) {
      localStorage.setItem("CL - Net-theme", "dark");
    } else {
      localStorage.setItem("CL - Net-theme", "light");
    }
  });
});