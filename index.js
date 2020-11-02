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
const statusBarTop = 26;
const applicationBarBottom = 32;

const splitWindow = (xFrom, xTo, xParts, yFrom, yTo, yParts) => {
  const w = (displayWidth / xParts) * (xTo - xFrom + 1);
  const h =
    ((displayHeight - statusBarTop - applicationBarBottom) / yParts) *
    (yTo - yFrom + 1);
  const x = (displayWidth / xParts) * xFrom;
  const y =
    ((displayHeight - statusBarTop - applicationBarBottom) / yParts) * yFrom +
    statusBarTop;
  // console.log(`w=${w} h=${h}  x=${x}  y=${y}`);
  resizeAndMoveWindow(w, h, x, y);
};

myStreamDeck.on("down", (keyIndex) => {
  console.log("key %d down", keyIndex);

  if (keyIndex === 0) {
    decreaseBrightness();
  } else if (keyIndex === 1) {
    increaseBrightness();
  } else if (keyIndex === 2) {
    logAndRunExec("xdotool key XF86AudioPrev");
  } else if (keyIndex === 3) {
    logAndRunExec("xdotool key XF86AudioPlay");
  } else if (keyIndex === 4) {
    logAndRunExec("xdotool key XF86AudioNext");
  } else if (keyIndex === 5) {
    logAndRunExec("xdotool key XF86AudioMute");
  } else if (keyIndex === 6) {
    logAndRunExec("xdotool key XF86AudioLowerVolume");
  } else if (keyIndex === 7) {
    logAndRunExec("xdotool key XF86AudioRaiseVolume");
  } else if (keyIndex === 17) {
    resizeAndMoveWindow(1280, 1024, 1100, 460);
  } else if (keyIndex === 18) {
    resizeAndMoveWindow(1920, 1080, 960, 300);
  } else if (keyIndex === 26) {
    minimizeWindow();
  } else if (keyIndex === 24) {
    toggleWorking();
  } else if (keyIndex === 12) {
    splitWindow(0, 0, 3, 0, 0, 2);
  } else if (keyIndex === 13) {
    splitWindow(1, 1, 3, 0, 0, 2);
  } else if (keyIndex === 14) {
    splitWindow(2, 2, 3, 0, 0, 2);
  } else if (keyIndex === 19) {
    splitWindow(0, 0, 2, 0, 1, 2);
  } else if (keyIndex === 20) {
    splitWindow(0, 0, 3, 0, 1, 2);
  } else if (keyIndex === 21) {
    splitWindow(1, 1, 3, 0, 1, 2);
  } else if (keyIndex === 22) {
    splitWindow(2, 2, 3, 0, 1, 2);
  } else if (keyIndex === 23) {
    splitWindow(1, 1, 2, 0, 1, 2);
  } else if (keyIndex === 28) {
    splitWindow(0, 0, 3, 1, 1, 2);
  } else if (keyIndex === 29) {
    splitWindow(1, 1, 3, 1, 1, 2);
  } else if (keyIndex === 30) {
    splitWindow(2, 2, 3, 1, 1, 2);
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

myStreamDeck.fillColor(12, 255, 0, 0);
myStreamDeck.fillColor(13, 255, 0, 0);
myStreamDeck.fillColor(14, 255, 0, 0);
myStreamDeck.fillColor(19, 255, 0, 0);
myStreamDeck.fillColor(20, 255, 0, 0);
myStreamDeck.fillColor(21, 255, 0, 0);
myStreamDeck.fillColor(22, 255, 0, 0);
myStreamDeck.fillColor(23, 255, 0, 0);
myStreamDeck.fillColor(28, 255, 0, 0);
myStreamDeck.fillColor(29, 255, 0, 0);
myStreamDeck.fillColor(30, 255, 0, 0);
