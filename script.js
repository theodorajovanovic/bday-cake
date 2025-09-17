// Modified script.js — automatically adds 25 candles on load
// and disables adding candles by clicking (so your boyfriend can't add them).
// Copy this entire file into your project's script.js (replace existing script.js).

document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;

  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
    candleCountDisplay.textContent = activeCandles;
  }

  function addCandle(left, top) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    cake.appendChild(candle);
    candles.push(candle);
    updateCandleCount();
  }

  // To prevent the other person from adding candles by clicking,
  // set ALLOW_CLICK_ADD = false. If you later want clicks to add candles,
  // change it to true.
  const ALLOW_CLICK_ADD = false;
  if (ALLOW_CLICK_ADD) {
    cake.addEventListener("click", function (event) {
      const rect = cake.getBoundingClientRect();
      const left = event.clientX - rect.left;
      const top = event.clientY - rect.top;
      addCandle(left, top);
    });
  }

  function isBlowing() {
    if (!analyser) return false;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    let average = sum / bufferLength;

    // Threshold: you can tweak the 40 value if blow detection is too sensitive
    return average > 40;
  }

  function blowOutCandles() {
    let blownOut = 0;

    if (isBlowing()) {
      candles.forEach((candle) => {
        if (!candle.classList.contains("out") && Math.random() > 0.5) {
          candle.classList.add("out");
          blownOut++;
        }
      });
    }

    if (blownOut > 0) {
      updateCandleCount();
    }
  }

  // Place N candles automatically across the cake width
  function addCandlesAutomatically(n) {
    const rect = cake.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // If cake isn't laid out yet, try again shortly
    if (width === 0 || height === 0) {
      setTimeout(() => addCandlesAutomatically(n), 50);
      return;
    }

    for (let i = 0; i < n; i++) {
      // Spread them evenly across the width with tiny horizontal jitter
      const frac = (i + 1) / (n + 1);
      const left = Math.round(frac * width + (Math.random() - 0.5) * (width / (n * 3)));
      // Put candles near the top part of the cake (adjust 0.18/0.06 to fine tune)
      const top = Math.round(height * 0.18 + Math.random() * height * 0.06);
      addCandle(left, top);
    }
  }

  // === MAIN ===
  // Add 25 candles automatically on page load
  addCandlesAutomatically(25);

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
      })
      .catch(function (err) {
        console.log("Unable to access microphone: " + err);
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }
});
