const imageInput = document.getElementById('imageInput');
const btnProcess = document.getElementById('btnProcess');
const outputText = document.getElementById('outputText');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let ocrResult = '';

imageInput.addEventListener('change', () => {
  btnProcess.disabled = !imageInput.files.length;
});

function preprocessImage(image, callback) {
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
      const avg = (data[i] + data[i+1] + data[i+2]) / 3;
      let newColor = contrast * (avg - 128) + 128 + brightness;
      newColor = Math.min(255, Math.max(0, newColor));

      data[i] = data[i+1] = data[i+2] = newColor;
    }

    ctx.putImageData(imgData, 0, 0);

    callback(canvas.toDataURL());
  };
  img.src = image;
}

function cleanAndParseAnswers(rawText) {
  rawText = rawText.replace(/5ST/gi, '51');
  rawText = rawText.replace(/71.xB/gi, '71 B');
  rawText = rawText.replace(/2200/gi, '22 00');
  rawText = rawText.replace(/4T/gi, '47');
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
    const imgDataUrl = e.target.result;

    preprocessImage(imgDataUrl, processedImage => {
      outputText.textContent = 'OCR işlemi yapılıyor, lütfen bekleyin...';

      Tesseract.recognize(
        processedImage,
        'tur',
        { logger: m => console.log(m) }
      ).then(({ data: { text } }) => {
        ocrResult = text;
        outputText.textContent = 'OCR Sonucu:\n\n' + ocrResult;

        const answers = cleanAndParseAnswers(ocrResult);
        readAnswersSequentially(answers);
      }).catch(err => {
        outputText.textContent = 'OCR sırasında hata: ' + err.message;
      });
    });
  };
  reader.readAsDataURL(file);
});
