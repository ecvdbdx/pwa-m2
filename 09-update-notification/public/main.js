import { Workbox } from "workbox-window";

if ("serviceWorker" in navigator) {
  const sw = new Workbox("/sw.js");

  window.addEventListener("load", () => {
    sw.register();

    sw.addEventListener("waiting", () => {
      const userAgreesToUpdate = window.confirm(
        "Une nouvelle version est disponible, cliquez ci-dessous pour profiter des mises à jour"
      );
      /* When a new service worker is found (meaning new content as the hashes of static assets will be different),
         ask the user to opt in for the updates, and reload the page */
      if (userAgreesToUpdate) {
        sw.addEventListener("controlling", () => {
          window.location.reload();
        });
      }
      sw.messageSW({ type: "SKIP_WAITING" });
    });
  });
}
