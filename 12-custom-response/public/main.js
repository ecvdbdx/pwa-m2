import { Workbox } from "workbox-window";

if ("serviceWorker" in navigator) {
  const sw = new Workbox("/sw.js");

  window.addEventListener("load", () => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }

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

/* Post form */

const form = document.forms[0];

const responseWrapper = document.getElementById("responseWrapper");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const formData = new FormData(this);

  const body = [];

  for (const formElement of formData) {
    const key = formElement[0];
    const value = formElement[1];

    body.push({ [key]: value });
  }

  fetch("/answers", {
    headers: { "Content-type": "application/json; charset=UTF-8" },
    method: "POST",
    body: JSON.stringify(body),
  })
    .then((response) => {
      return response.json();
    })
    .then((jsonResponse) => {
      responseWrapper.innerText = jsonResponse.data;
    });
});
