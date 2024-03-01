document.addEventListener("DOMContentLoaded", () => {
  const menu = document.querySelector(".menu");
  const nav = document.getElementById("nav-list");
  const currentPage = window.location.href;
  const menuLinks = document.querySelectorAll("nav ul li a");

  menu.addEventListener("click", handleMenu);

  function handleMenu() {
    console.log("1", nav.style.display);
    if (nav.style.display == "flex") {
      nav.style.display = "none";
    } else {
      nav.style.display = "flex";
    }
    console.log("2", nav.style.display);
  }

  // Set the "active" class based on the current page
  menuLinks.forEach((link) => {
    // Check if the link's href matches the current page URL
    if (link.href === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
});
