import { Vibrant } from "node-vibrant/browser";
import Granim from "granim";

const DEFAULT_IMG = "./assets/empty-album.png";

let pauseTimer;
let disconnectTimer;
let settings;

/* ============================== */
/*       Gradient Control         */
/* ============================== */

let prevSongColor1 = "#000000";
let prevSongColor2 = "#000000";
let currentSongColor1 = "#000000";
let currentSongColor2 = "#000000";

let gradientBg;

/* ============================== */
/*           HELPERS              */
/* ============================== */

// Get CSS variable from the body
function getVarFromBody(name) {
  return getComputedStyle(document.body).getPropertyValue(name);
}

// Retrieve settings from CSS variables
function getSettings() {
  return {
    maxGradOpacity: parseFloat(getVarFromBody("--max-grad-opacity")) || 1,
    fadeOnStop: getVarFromBody("--fade-on-stop") == 1,
    fadeOnDisconnect: getVarFromBody("--fade-on-disconnect") == 1,
    fadeDelay: parseInt(getVarFromBody("--fade-delay")) || 2000,
    fadeDisconnectDelay: parseInt(getVarFromBody("--fade-disconnect-delay")) || parseInt(getVarFromBody("--fade-delay")) || 2000,
    hideOnIdleConnect: getVarFromBody("--hide-on-idle-connect") == 1
  };
}

/* ============================== */
/*     WEBSOCKET CONNECTION       */
/* ============================== */

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function() {
    startWebSocket();
  }, 100);

  gradientBg = new Granim({
    element: "#gradbg",
    direction: "diagonal",
    states: {
      "default-state": {
        gradients: [
          [prevSongColor1, prevSongColor2]
        ],
        transitionSpeed: 2000
      },
      "next-song": {
        gradients: [
          [currentSongColor1, currentSongColor2]
        ],
        transitionSpeed: 2000
      }
    }
  });
});

let retryDelay = 1000;

function startWebSocket() {
  try {
    settings = getSettings();
    console.debug("[DEBUG] [Init] Configuring websocket connection...");

    const CiderApp = io("http://localhost:10767/", { transports: ["websocket"] });

    CiderApp.on("connect", () => {
      console.debug("[DEBUG] [Init] Socket.io connection established!");
      retryDelay = 1000; // Reset retry delay on successful connection
      clearUI();

      if (settings.hideOnIdleConnect) {
        document.getElementById("content").style.opacity = 0;
        //document.getElementById("gradbg").style.opacity = 0;
        document.body.style.setProperty("--current-grad-opacity", 0);
      }

      if (disconnectTimer) {
        clearTimeout(disconnectTimer);
        disconnectTimer = undefined;
        document.getElementById("content").style.opacity = 1;
        //document.getElementById("gradbg").style.opacity = 0.3;
        document.body.style.setProperty("--current-grad-opacity", settings.maxGradOpacity);
      }
    });

    CiderApp.on("API:Playback", ({ data, type }) => {
      if (!data) {
        console.error("[ERROR] Missing data in API:Playback event", type);
        return;
      }

      switch (type) {
        case "playbackStatus.playbackStateDidChange":
          handlePlaybackStateChange(data);
          break;
        case "playbackStatus.nowPlayingItemDidChange":
          updateComponents(data, true);
          break;
        case "playbackStatus.playbackTimeDidChange":
          updatePlaybackProgress(data);
          break;
        default:
          console.debug(type, data);
          break;
      }
    });

    CiderApp.on("disconnect", () => handleDisconnect());

    CiderApp.on("connect_error", (error) => {
      document.getElementById("albumimg").src = DEFAULT_IMG;
      console.debug("[DEBUG] [Init] Connect Error:", error);
      console.debug("[DEBUG] [Init] Retrying in", retryDelay / 1000, "seconds...");

      setTimeout(() => {
        retryDelay = Math.min(retryDelay * 2, 30000); // Exponential backoff, max 30s
        startWebSocket();
      }, retryDelay);
    });

  } catch (error) {
    console.debug("[DEBUG] [Init] Code error:", error);
    console.debug("[DEBUG] [Init] Retrying in", retryDelay / 1000, "seconds...");
    setTimeout(startWebSocket, retryDelay);
    retryDelay = Math.min(retryDelay * 2, 30000); // Exponential backoff
  }
}

/* ============================== */
/*          EVENT HANDLERS        */
/* ============================== */

// Clear UI elements on connection
function clearUI() {
  document.getElementById("title").innerText = "";
  document.getElementById("artist").innerText = "";
  document.getElementById("album").innerText = "";
}

// Handle playback state change (play/pause)
function handlePlaybackStateChange(data) {
  if (data.state === "paused" && !pauseTimer && settings.fadeOnStop) {
    pauseTimer = setTimeout(() => {
      document.getElementById("content").style.opacity = 0;
      //document.getElementById("gradbg").style.opacity = 0;
      document.body.style.setProperty("--current-grad-opacity", 0);
    }, settings.fadeDelay);
  } else if (data.state === "playing" && (pauseTimer || settings.hideOnIdleConnect)) {
    clearTimeout(pauseTimer);
    pauseTimer = undefined;
    document.getElementById("content").style.opacity = 1;
    //document.getElementById("gradbg").style.opacity = 0.3;
    document.body.style.setProperty("--current-grad-opacity", settings.maxGradOpacity);
  }

  //updateComponents(data.attributes, false);
}

// Handle playback progress update
function updatePlaybackProgress(data) {
  if (document.getElementById("artist").innerText === "Please pause and unpause the track to update track info.") {
    clearUI();
    document.getElementById("content").style.opacity = 1;
    //document.getElementById("gradbg").style.opacity = 0.3;
    document.body.style.setProperty("--current-grad-opacity", settings.maxGradOpacity);
  }

  document.getElementById("progressBar").style.width = (
    ((data.currentPlaybackTime / data.currentPlaybackDuration) * 100) + "%"
  );
}

// Handle disconnection
function handleDisconnect() {
  document.getElementById("title").innerText = "Disconnected. Retrying...";
  document.getElementById("artist").innerText = "";
  document.getElementById("album").innerText = "";
  document.getElementById("albumimg").src = DEFAULT_IMG;

  console.debug("[DEBUG] [Init] Socket.io connection closed!");
  console.debug("[DEBUG] [Init] Retrying automatically...");

  if (!disconnectTimer && settings.fadeOnDisconnect) {
    disconnectTimer = setTimeout(() => {
      document.getElementById("content").style.opacity = 0;
      //document.getElementById("gradbg").style.opacity = 0;
      document.body.style.setProperty("--current-grad-opacity", 0);
    }, settings.fadeDisconnectDelay);
  }
}

/* ============================== */
/*            UI UPDATES          */
/* ============================== */

// Update UI components with new track data
async function updateComponents(data) {
  document.getElementById("title").innerText = data.name;
  document.getElementById("artist").innerText = data.artistName;
  document.getElementById("album").innerText = data.albumName;

  let artworkUrl = data.artwork.url
    .replace("{w}", data.artwork.width)
    .replace("{h}", data.artwork.height);

  document.getElementById("albumimg").src = artworkUrl;

  Vibrant.from(artworkUrl).getPalette().then((palette) => {
    currentSongColor1 = palette.LightVibrant.hex;
    currentSongColor2 = palette.DarkVibrant.hex;

    console.debug("prev" + prevSongColor1);
    console.debug("prev" + prevSongColor2);
    console.debug("curr" + currentSongColor1);
    console.debug("curr" + currentSongColor2);

    console.debug("--------------------");

    gradientBg.destroy();

    gradientBg = new Granim({
      element: "#gradbg",
      direction: "diagonal",
      states: {
        "default-state": {
          gradients: [
            [prevSongColor1, prevSongColor2]
          ],
          transitionSpeed: 2000
        },
        "next-song": {
          gradients: [
            [currentSongColor1, currentSongColor2]
          ],
          transitionSpeed: 2000
        }
      }
    });

    gradientBg.changeState("next-song");

    prevSongColor1 = palette.LightVibrant.hex;
    prevSongColor2 = palette.DarkVibrant.hex;
  });
}