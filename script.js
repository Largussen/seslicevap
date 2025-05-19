const API_KEY = 'K83815295788957'; 

const imageInput = document.getElementById('imageInput');
const btnProcess = document.getElementById('btnProcess');
const outputText = document.getElementById('outputText');

imageInput.addEventListener('change', () => {
  btnProcess.disabled = !imageInput.files.length;
});

function cleanAndParseAnswers(rawText) {
  rawText = rawText.replace(/5ST/gi, '51');
  rawText = rawText.replace(/71\..B/gi, '71 B');
  rawText = rawText.replace(/22-0/gi, '22 0');
  rawText = rawText.replace(/4AT/gi, '47');
  rawText = rawText.replace(/[|l]/g, '1');
  rawText = rawText.replace(/[,;]/g, ' ');

  const regex = /(\d{1,2})\s*[-.\s]?\s*([ABCDEF])/gi;
  const matches = [];
  let match;

  while ((match = regex.exec(rawText)) !== null) {
    let question = parseInt(match[1]);
    if (question >= 1 && question <= 80) {
      matches.push({ question: question, answer: match[2].toUpperCase() });
    }
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

  outputText.textContent = 'Görsel işleniyor, lütfen bekleyin...';

  const file = imageInput.files[0];
  const reader = new FileReader();
  reader.onload = e => {
    const base64img = e.target.result.split(',')[1]; // sadece base64 kısmı

    fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        apikey: API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `base64Image=data:image/png;base64,${base64img}&language=tur&isOverlayRequired=false`,
    })
      .then(res => res.json())
      .then(data => {
        if (data.IsErroredOnProcessing) {
          outputText.textContent = 'OCR Hatası: ' + data.ErrorMessage.join(' ');
          return;
        }
        const text = data.ParsedResults[0].ParsedText;
        outputText.textContent = 'OCR Sonucu:\n\n' + text;

        const answers = cleanAndParseAnswers(text);
        readAnswersSequentially(answers);
      })
      .catch(err => {
        outputText.textContent = 'API Hatası: ' + err.message;
      });
  };
  reader.readAsDataURL(file);
});
