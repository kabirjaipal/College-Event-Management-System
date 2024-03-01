document.addEventListener("DOMContentLoaded", () => {
  console.log("dashboard");
  const QrImage = document.getElementById("upiId");

  QrImage.addEventListener("click", copyToClipboard);

  function copyToClipboard() {
    navigator.clipboard
      .writeText(QrImage.alt)
      .then(() => {
        alert("copied to clipboard!");
      })
      .catch((err) => {
        alert("Unable to copy text: ");
      });
  }
});
