document.addEventListener("DOMContentLoaded", () => {
  const search = document.getElementById("search");

  search.addEventListener("input", OnSearch);

  function OnSearch() {
    const searchInput = document.getElementById("search");
    const filter = searchInput.value.trim().toLowerCase(); // Trim and convert to lowercase
    const users = document.querySelectorAll(".user");

    users.forEach((user) => {
      const userName = user.querySelector(".user_name").innerText.toLowerCase(); // Convert to lowercase
      const userEmail = user
        .querySelector(".user_email")
        .innerText.toLowerCase(); // Convert to lowercase
      const userContainer = user;

      if (userName.includes(filter) || userEmail.includes(filter)) {
        userContainer.style.display = "";
      } else {
        userContainer.style.display = "none";
      }
    });
  }
});
