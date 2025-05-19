const imageInput = document.getElementById('imageInput');
const btnProcess = document.getElementById('btnProcess');
const outputText = document.getElementById('outputText');
let ocrResult = '';

imageInput.addEventListener('change', () => {
  btnProcess.disabled = !imageInput.files.length;
});

function parseAnswers(text) {
  // "1-A 2-C 3-B" gibi ifadeleri ayırır
  const regex = /(\d+)\s*[-.]?\s*([ABCDEF])/gi;
  const matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({ question: match[1], answer: match[2].toUpperCase() });
  }
  return matches;
}

function readAnswersSequentially(answers) {
  if (!answers.length) {
    alert('Cevap bulunamadı!');
    return;
  }
  let index = 0;
  function speakNext() {
    if (index >= answers.length) {
      console.log('Okuma tamamlandı.');
      return;
    }
    const item = answers[index];
    const utterance = new SpeechSynthesisUtterance(`Soru ${item.question}, cevap ${item.answer}`);
    utterance.lang = 'tr-TR';
    utterance.onend = () => {
      index++;
      speakNext();
    };
    speechSynthesis.speak(utterance);
  }
  speakNext();
}

btnProcess.addEventListener('click', () => {
  if (!imageInput.files.length) return;

  outputText.textContent = 'OCR işlemi yapılıyor, lütfen bekleyin...';

  Tesseract.recognize(
    imageInput.files[0],
    'tur',
    { logger: m => console.log(m) }
  ).then(({ data: { text } }) => {
    ocrResult = text;
    outputText.textContent = 'OCR Sonucu:\n\n' + ocrResult;

    const answers = parseAnswers(ocrResult);
    readAnswersSequentially(answers);
  }).catch(err => {
    outputText.textContent = 'OCR sırasında hata: ' + err.message;
  });
});
