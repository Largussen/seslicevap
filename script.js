const imageInput = document.getElementById('imageInput');
const btnProcess = document.getElementById('btnProcess');
const outputText = document.getElementById('outputText');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let ocrResult = '';

const API_KEY = 'K83815295788957'; // OCR.space API key

imageInput.addEventListener('change', () => {
  btnProcess.disabled = !imageInput.files.length;
});

// Görseli kontrast ve parlaklık artırmak için işleme
function preprocessImage(imageDataURL, callback) {
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imgData.data;

    const contrast = 1.2;
    const brightness = 15;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      let newColor = contrast * (avg - 128) + 128 + brightness;
      newColor = Math.min(255, Math.max(0, newColor));
      data[i] = data[i + 1] = data[i + 2] = newColor;
    }

    ctx.putImageData(imgData, 0, 0);
    const finalBase64 = canvas.toDataURL('image/png'); // PNG formatında base64 üret
    callback(finalBase64);
  };
  img.src = imageDataURL;
}

// OCR sonrası temizleme ve parse işlemi
function cleanAndParseAnswers(rawText) {
  rawText = rawText.replace(/5ST/gi, '51')
                   .replace(/71\..?B/gi, '71 B')
                   .replace(/2200/gi, '22 00')
                   .replace(/4T/gi, '47')
                   .replace(/[|l]/g, '1')
                   .replace(/[,;]/g, ' ');

  const regex = /(\d{1,2})\s*[-.\s]?\s*([ABCDEF])/gi;
  const matches = [];
  let match;

  while ((match = regex.exec(rawText)) !== null) {
    let question = parseInt(match[1]);
    if (question >= 1 && question <= 80) {
      matches.push({ question, answer: match[2].toUpperCase() });
    }
  }
  return matches;
}

// Sesli okuma
function readAnswersSequentially(answers) {
  if (!answers.length) {
    alert('Cevap bulunamadı!');
    return;
  }
  let index = 0;
  function speakNext() {
    if (index >= answers.length) return;
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

// OCR işlemini başlat
btnProcess.addEventListener('click', () => {
  if (!imageInput.files.length) return;

  outputText.textContent = 'Görsel işleniyor, lütfen bekleyin...';

  const file = imageInput.files[0];
  const reader = new FileReader();

  reader.onload = e => {
    const base64Data = e.target.result; // data:image/png;base64,...

    preprocessImage(base64Data, processedImage => {
      outputText.textContent = 'OCR işlemi yapılıyor...';

      fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
          apikey: API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `base64Image=${encodeURIComponent(processedImage)}&language=tur&isOverlayRequired=false`
      })
        .then(res => res.json())
        .then(data => {
          if (data.IsErroredOnProcessing) {
            outputText.textContent = 'OCR Hatası: ' + data.ErrorMessage.join(' ');
            return;
          }

          ocrResult = data.ParsedResults[0].ParsedText;
          outputText.textContent = 'OCR Sonucu:\n\n' + ocrResult;

          const answers = cleanAndParseAnswers(ocrResult);
          readAnswersSequentially(answers);
        })
        .catch(err => {
          outputText.textContent = 'API Hatası: ' + err.message;
        });
    });
  };

  reader.readAsDataURL(file);
});
