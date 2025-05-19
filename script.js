const imageInput = document.getElementById("imageInput");
const processBtn = document.getElementById("processBtn");
const textOutput = document.getElementById("textOutput");
const playBtn = document.getElementById("playBtn");
const speedRange = document.getElementById("speedRange");
const speedValue = document.getElementById("speedValue");
const lessonSelect = document.getElementById("lessonSelect");

let filteredAnswers = "";

imageInput.addEventListener("change", () => {
  processBtn.disabled = imageInput.files.length === 0;
});

processBtn.addEventListener("click", () => {
  if (imageInput.files.length === 0) return;

  processBtn.disabled = true;
  playBtn.disabled = true;
  textOutput.textContent = "OCR işlemi yapılıyor, lütfen bekleyin...";

  const file = imageInput.files[0];

  Tesseract.recognize(file, "tur", {
    logger: m => {}
  })
    .then(({ data: { text } }) => {
      const cleanedText = text.replace(/\s+/g, ' ');
      const selectedLesson = lessonSelect.value.toUpperCase();
      filteredAnswers = extractLessonAnswers(cleanedText, selectedLesson);
      textOutput.textContent = filteredAnswers || "Seçilen derse ait cevaplar bulunamadı.";
      processBtn.disabled = false;
      playBtn.disabled = filteredAnswers.length === 0;
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
  if (!filteredAnswers) return;
  const utterance = new SpeechSynthesisUtterance(filteredAnswers);
  utterance.rate = parseFloat(speedRange.value);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
});

// Cevapları ayıklayan fonksiyon
function extractLessonAnswers(text, lessonTitle) {
  const pattern = new RegExp(`${lessonTitle}\\s*([\\s\\S]+?)(?=(TÜRKÇE|TEMEL MATEMATİK|FEN BİLİMLERİ|SOSYAL BİLİMLERİ|$))`, "i");
  const match = text.match(pattern);
  if (!match) return "";

  const answersRaw = match[1];
  const answers = answersRaw.match(/\d+\s*[-–]?\s*[A-Eİ]/gi); // sadece cevapları al
  return answers ? answers.join(" ") : "";
}
