const { exec } = require("child_process");
const path = require("path");
const { openStreamDeck } = require("elgato-stream-deck");
const sharp = require("sharp");

const myStreamDeck = openStreamDeck();

let brightness = 30;

const decreaseBrightness = () => {
  brightness = brightness > 10 ? brightness - 10 : 0;
  myStreamDeck.setBrightness(brightness);
};

const increaseBrightness = () => {
  brightness = brightness < 90 ? brightness + 10 : 100;
  myStreamDeck.setBrightness(brightness);
};

let workStarted = null;
let workedInMs = 0;
let workingInterval = null;

const logWorked = () => {
  const allMs = workedInMs + workStarted ? Date.now() - workStarted : 0;
  const h = Math.floor(allMs / 1000 / 60 / 60);
  const m = Math.floor((allMs / 1000 / 60) % 60);
  const s = Math.floor((allMs / 1000) % 60);
  console.log("worked", h, m, s);
};

const toggleWorking = () => {
  if (!workStarted) {
    workStarted = Date.now();
    workingInterval = setInterval(logWorked, 1000);
    myStreamDeck.fillColor(24, 255, 0, 0);
  } else {
    workedInMs += Date.now() - workStarted;
    workStarted = null;
    clearInterval(workingInterval);
    workingInterval = null;
    logWorked();
    myStreamDeck.fillColor(24, 255, 255, 0);
  }
};

const logAndRunExec = (command) => {
  console.log(command);
  exec(command);
};

const resizeWindow = (w, h) =>
  logAndRunExec(`xdotool getactivewindow windowsize ${w} ${h}`);
const moveWindow = (x, y) =>
  logAndRunExec(`xdotool getactivewindow windowmove ${x} ${y}`);
const resizeAndMoveWindow = (w, h, x, y) =>
  logAndRunExec(
    `xdotool getactivewindow windowsize ${w} ${h} windowmove ${x} ${y}`
  );
const minimizeWindow = () =>
  logAndRunExec("xdotool getactivewindow windowminimize");

const displayWidth = 3840;
const displayHeight = 1600;
const statusBarTop = 32;
const applicationBarBottom = 42;

const splitWindow = (xFrom, xTo, xParts, yFrom, yTo, yParts) => {
  const w = (displayWidth / xParts) * (xTo - xFrom + 1) - 10;
  const h =
    ((displayHeight - statusBarTop - applicationBarBottom) / yParts) *
    (yTo - yFrom + 1) - 10;
  const x = (displayWidth / xParts) * xFrom + 10;
  const y =
    ((displayHeight - statusBarTop - applicationBarBottom) / yParts) * yFrom +
    statusBarTop + 10;
  console.log(`w=${w} h=${h}  x=${x}  y=${y}`);
  resizeAndMoveWindow(w, h, x, y);
};

myStreamDeck.on("down", (keyIndex) => {
  console.log("key %d down", keyIndex);

  switch (keyIndex) {
    case 0: decreaseBrightness(); break;
    case 1: increaseBrightness(); break;

    case 2: logAndRunExec("xdotool key XF86AudioPrev"); break;
    case 3: logAndRunExec("xdotool key XF86AudioPlay"); break;
    case 4: logAndRunExec("xdotool key XF86AudioNext"); break;
    case 5: logAndRunExec("xdotool key XF86AudioMute"); break;
    case 6: logAndRunExec("xdotool key XF86AudioLowerVolume"); break;
    case 7: logAndRunExec("xdotool key XF86AudioRaiseVolume"); break;

    case 17: resizeAndMoveWindow(1280, 1024, 1100, 460); break;
    case 18: resizeAndMoveWindow(1920, 1080, 960, 300); break;

    case 24: toggleWorking(); break;
    case 26: minimizeWindow(); break;

    case 11: splitWindow(0, 0, 2, 0, 0, 2); break;
    case 12: splitWindow(0, 0, 3, 0, 0, 2); break;
    case 13: splitWindow(1, 1, 3, 0, 0, 2); break;
    case 14: splitWindow(2, 2, 3, 0, 0, 2); break;
    case 15: splitWindow(2, 2, 2, 0, 0, 2); break;

    case 19: splitWindow(0, 0, 2, 0, 1, 2); break;
    case 20: splitWindow(0, 0, 3, 0, 1, 2); break;
    case 21: splitWindow(1, 1, 3, 0, 1, 2); break;
    case 22: splitWindow(2, 2, 3, 0, 1, 2); break;
    case 23: splitWindow(1, 1, 2, 0, 1, 2); break;

    case 27: splitWindow(0, 0, 2, 1, 1, 2); break;
    case 28: splitWindow(0, 0, 3, 1, 1, 2); break;
    case 29: splitWindow(1, 1, 3, 1, 1, 2); break;
    case 30: splitWindow(2, 2, 3, 1, 1, 2); break;
    case 31: splitWindow(2, 2, 2, 1, 1, 2); break;
  }
});

myStreamDeck.on("up", (keyIndex) => {
  console.log("key %d up", keyIndex);
});

myStreamDeck.on("error", (error) => {
  console.error(error);
});

const loadIcon = (keyIndex, filename) => {
  const fullPath = path.resolve(__dirname, "icons", filename);
  return sharp(fullPath)
    .flatten()
    .resize(myStreamDeck.ICON_SIZE, myStreamDeck.ICON_SIZE)
    .raw()
    .toBuffer()
    .then((buffer) => {
      myStreamDeck.fillImage(keyIndex, buffer);
    })
    .catch((err) => {
      console.error(`Could not load icon "${filename}"`, err);
    });
};

myStreamDeck.clearAllKeys();
myStreamDeck.setBrightness(brightness);

loadIcon(0, "brightness_decrease.png");
loadIcon(1, "brightness_increase.png");
loadIcon(2, "media_prev.png");
loadIcon(3, "media_play_pause.png");
loadIcon(4, "media_next.png");
loadIcon(5, "media_mute.png");
loadIcon(6, "media_volume_down.png");
loadIcon(7, "media_volume_up.png");

myStreamDeck.fillColor(17, 255, 0, 0); // full hd
myStreamDeck.fillColor(18, 255, 0, 0); // full hd
myStreamDeck.fillColor(26, 255, 0, 0); // minimize window

myStreamDeck.fillColor(24, 255, 255, 0); // working

myStreamDeck.fillColor(11, 0, 82, 33);
myStreamDeck.fillColor(12, 107, 0, 0);
myStreamDeck.fillColor(13, 107, 0, 0);
myStreamDeck.fillColor(14, 107, 0, 0);
myStreamDeck.fillColor(15, 0, 82, 33);

myStreamDeck.fillColor(19, 65, 169, 76);
myStreamDeck.fillColor(20, 255, 0, 0);
myStreamDeck.fillColor(21, 255, 0, 0);
myStreamDeck.fillColor(22, 255, 0, 0);
myStreamDeck.fillColor(23, 65, 169, 76);

myStreamDeck.fillColor(27, 0, 82, 33);
myStreamDeck.fillColor(28, 107, 0, 0);
myStreamDeck.fillColor(29, 107, 0, 0);
myStreamDeck.fillColor(30, 107, 0, 0);
myStreamDeck.fillColor(31, 0, 82, 33);
