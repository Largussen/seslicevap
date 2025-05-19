const imageInput = document.getElementById("imageInput");
const processBtn = document.getElementById("processBtn");
const textOutput = document.getElementById("textOutput");
const playBtn = document.getElementById("playBtn");
const speedRange = document.getElementById("speedRange");
const speedValue = document.getElementById("speedValue");

let ocrText = "";

imageInput.addEventListener("change", () => {
  if (imageInput.files.length > 0) {
    processBtn.disabled = false;
  } else {
    processBtn.disabled = true;
  }
});

processBtn.addEventListener("click", () => {
  if (imageInput.files.length === 0) return;

  processBtn.disabled = true;
  playBtn.disabled = true;
  textOutput.textContent = "OCR işlemi yapılıyor, lütfen bekleyin...";

  const file = imageInput.files[0];

  Tesseract.recognize(file, "tur", {
    logger: m => {
      // console.log(m);
    }
  })
    .then(({ data: { text } }) => {
      ocrText = text.trim();

      // Filtreleme: sadece "sayı - cevap harfi" formatındaki bölümleri al
      const cevaplar = ocrText.match(/\d+\s*[-\.]?\s*[A-E]/gi);
      if (cevaplar && cevaplar.length > 0) {
        ocrText = cevaplar.join(" ");
      } else {
        ocrText = "Cevap anahtarı formatında metin bulunamadı.";
      }

      textOutput.textContent = ocrText;
      processBtn.disabled = false;
      playBtn.disabled = false;
    })
    .catch(err => {
      textOutput.textContent = "OCR sırasında hata oluştu: " + err.message;
      processBtn.disabled = false;
    });
});

// Hızı güncelle
speedRange.addEventListener("input", () => {
  speedValue.textContent = speedRange.value;
});

playBtn.addEventListener("click", () => {
  let textToRead = textOutput.textContent.trim();
  if (!textToRead) return;

  const utterance = new SpeechSynthesisUtterance(textToRead);
  utterance.rate = parseFloat(speedRange.value);
  window.speechSynthesis.cancel(); // varsa öncekini durdur
  window.speechSynthesis.speak(utterance);
});
