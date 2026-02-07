const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const copyBtn = document.querySelector("[data-copy]");
const revealItems = document.querySelectorAll("[data-reveal]");

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const savedTheme = localStorage.getItem("theme");
const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

function setTheme(theme) {
  root.setAttribute("data-theme", theme);
  if (themeToggle) {
    const label = theme === "dark" ? "Dark" : "Light";
    themeToggle.textContent = `Theme: ${label}`;
    themeToggle.setAttribute("aria-pressed", theme === "dark");
  }
  localStorage.setItem("theme", theme);
}

setTheme(initialTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(next);
  });
}

if (copyBtn) {
  const email = copyBtn.dataset.email || "";
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      copyBtn.textContent = "Copied";
      setTimeout(() => {
        copyBtn.textContent = "Copy email";
      }, 1600);
    } catch (error) {
      window.location.href = `mailto:${email}`;
    }
  });
}

if (revealItems.length > 0) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => observer.observe(item));
}
