if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js", { scope: "/" })
    .then(() => {
      console.log("[DOCUMENT] - Service worker registered");
    })
    .catch((error) => {
      console.log(error);
    });
}
