// Banner controls (mouse-only handlers)
function hideBanner() {
  var b = document.getElementById("banner");
  if (b) b.style.display = "none";
}

function toggleBanner() {
  var b = document.getElementById("banner");
  if (!b) return;
  b.style.display = b.style.display === "none" ? "block" : "none";
}

// Menu image zoom (mouse-only, no keyboard support)
function zoom(img) {
  var overlay = document.getElementById("overlay");
  var oimg = document.getElementById("overlay-img");
  oimg.src = img.src;
  overlay.style.display = "flex";
}

function closeZoom() {
  document.getElementById("overlay").style.display = "none";
}

// Fake form submit
function fakeSubmit() {
  alert("Thanks! (This is a demo form and does not actually send anything.)");
  return false;
}
