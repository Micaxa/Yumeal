// SELECT ELEMENTS
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

// TOGGLE MOBILE NAVIGATION
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");

    menuToggle.setAttribute("aria-expanded", isOpen);

    menuToggle.textContent = isOpen ? "✕" : "☰";
  });

  // CLOSE MENU WHEN A LINK IS CLICKED
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("is-open");

      menuToggle.setAttribute("aria-expanded", "false");

      menuToggle.textContent = "☰";
    });
  });

  // CLOSE MENU WHEN ESCAPE IS PRESSED
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      navLinks.classList.remove("is-open");

      menuToggle.setAttribute("aria-expanded", "false");

      menuToggle.textContent = "☰";
    }
  });

  // CLOSE MENU WHEN THE SCREEN BECOMES WIDE
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      navLinks.classList.remove("is-open");

      menuToggle.setAttribute("aria-expanded", "false");

      menuToggle.textContent = "☰";
    }
  });
}