const dropZone = document.querySelector('.upload-card__dropzone');

dropZone.addEventListener('drop', dropHandler);

// Evita que ao arrastar um arquivo o navegador tente fazer o download dele ou abrir
window.addEventListener('drop', (e) => {
  if ([...e.dataTransfer.items].some((item) => item.kind === 'file')) {
    e.preventDefault();
  }
});

dropZone.addEventListener('dragover', (e) => {
  const filesItems = [...e.dataTransfer.items].filter(
    (item) => item.kind === 'file',
  );
  if (filesItems.length > 0) {
    e.preventDefault();
    const hasValidFile = filesItems.some(
      (item) =>
        item.type.startsWith('image/') || item.type === 'application/pdf',
    );

    if (hasValidFile) {
      e.dataTransfer.dropEffect = 'copy';
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  }
});

window.addEventListener('dragover', (e) => {
  const fileItems = [...e.dataTransfer.items].filter(
    (item) => item.kind === 'file',
  );
  if (fileItems.length > 0) {
    e.preventDefault();
    if (!dropZone.contains(e.target)) {
      e.dataTransfer.dropEffect = 'none';
    }
  }
});

const uploadCard = document.querySelector('.upload-card');
function displayImages(files) {
  const existingCard = uploadCard.querySelector('.upload-card__status');
  const existingButton = uploadCard.querySelector('.upload-card__button');

  if (existingCard) {
    existingCard.remove();
  }
  if (existingButton) {
    existingButton.remove();
  }

  const file = [...files].find(
    (f) => f.type.startsWith('image/') || f.type === 'application/pdf',
  );

  if (!file) return;

  const card = document.createElement('div');
  const details = document.createElement('div');
  const img = document.createElement('img');
  const span = document.createElement('span');
  const progressContainer = document.createElement('div');
  const progressBar = document.createElement('div');
  const sendButton = document.createElement('button');

  card.classList.add('upload-card__status');
  img.classList.add('upload-card__icon');
  span.classList.add('upload-card__filename');
  progressContainer.classList.add('upload-card__progress-wrapper');
  progressBar.classList.add('upload-card__progress');
  sendButton.classList.add('upload-card__button', 'button');
  details.classList.add('upload-card__details');

  img.src = '../public/icons/file-check.svg';
  img.alt = file.name;
  span.textContent = file.name;
  sendButton.addEventListener('click', uploadFile(file));
  sendButton.textContent = 'Enviar';

  details.append(img, span);
  card.append(details, progressContainer);
  progressContainer.append(progressBar);
  uploadCard.append(card, sendButton);
}

function dropHandler(e) {
  e.preventDefault();
  const files = [...e.dataTransfer.items]
    .map((item) => item.getAsFile())
    .filter((file) => file);
  displayImages(files);
}

const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', (e) => {
  displayImages(e.target.files);
});

function uploadFile(file) {
  let xhr = new XMLHttpRequest();
  const formData = new FormData();
  formData.append('file', file);
  xhr.upload.addEventListener('progress', (e) => {
    console.log(e);
    if (e.lengthComputable) {
      const percentage = Math.round((e.loaded / e.total) * 100);
      const progressBar = document.querySelector('.upload-card__progress');
      if (progressBar) {
        progressBar.style.width = percentage + '%';
      }
    }
    console.log('oi');
  });
  xhr.open('POST', 'endpoit');
  xhr.send(formData);
}
