import {
  formatText,
  fetchData,
  populateSelect,
  createParagraph,
  cleanHtlm,
  changeColorFieldRequired,
} from './utils.js';

// Variables globales
let templateData = [];
let linesData = [];

// Elementos del DOM
const form = document.getElementById('my-form');
const linesSelect = document.getElementById('lines');
const templateSelect = document.getElementById('template');
const dragImg = document.getElementById('dropFileImg');
const dragCsv = document.getElementById('dropFileCsv');
const previewImage = document.getElementById('previewImage');
const imageContainer = document.getElementById('imageContainer');
const imageComponent = document.getElementById('imageComponent');
const nameCampaingInput = document.getElementById('campaignName');

// API URLs
const templateApiUrl = 'templates.json';
const linesApiUrl = 'phones.json';

// Función para inicializar la aplicación
async function initializeApp() {
  linesData = await fetchData(linesApiUrl);
  templateData = await fetchData(templateApiUrl);
  populateSelect('lines', linesData, 'whatsapp_account', 'nombre_whatsapp');
  linesSelect.addEventListener('change', onChageLines);
  templateSelect.addEventListener('change', onChangeTemplate);
}

// Event listeners
window.addEventListener('load', initializeApp);
document
  .getElementById('csvFileInput')
  .addEventListener('change', handleCsvFileChange);
document
  .getElementById('imageFile')
  .addEventListener('change', handleImageFileChange);
dragImg.addEventListener('drop', handleImageDrop, false);
dragImg.addEventListener('dragover', handleDragOver, false);
dragImg.addEventListener('dragenter', changeCursor);
dragImg.addEventListener('dragleave', changeCursor);
dragCsv.addEventListener('dragenter', changeCursor);
dragCsv.addEventListener('dragleave', changeCursor);
dragCsv.addEventListener('dragover', handleDragOver, false);
dragCsv.addEventListener('drop', handleCsvFileDrop, false);
nameCampaingInput.addEventListener('focusout', checkField);
form.addEventListener('submit', onFormSubmit);

function onChageLines() {
  const selectedAccountId = linesSelect.value;
  const filteredTemplates = templateData.filter(
    (template) => template.cuenta === selectedAccountId
  );
  populateSelect(
    'template',
    filteredTemplates,
    'id_plantilla',
    'nombre_plantilla',
    true
  );
}

function onChangeTemplate() {
  const selectedTemplate = templateSelect.options[templateSelect.selectedIndex];
  const selectedLine = linesSelect.options[linesSelect.selectedIndex];
  const item = templateData.find(
    (i) => i.id_plantilla == selectedTemplate.value
  );

  const campaign = 'campaign: ' + selectedTemplate.text;
  const valor = ' Valor: ' + selectedTemplate.value;
  const texto = ' Texto: ' + selectedLine.text + ' ' + selectedLine.value;
  const result = campaign + valor + texto;
  resetImageInput();
  console.log(result);
  populateWhatsappChat(item);
}

function populateWhatsappChat(item) {
  previewImage.src = '';
  const content = document.getElementById('wsContent');
  cleanHtlm(content, false);

  const { botones } = item;
  const { header, body } = item.componentes[0];

  const pHeader = createParagraph(['text-sm', 'mt-1']);
  const pBody = createParagraph(['text-sm', 'mt-1']);
  const pTime = createParagraph([
    'text-right',
    'text-xs',
    'text-grey-dark',
    'mt-1',
  ]);
  const aBoton = createParagraph([
    'w-full',
    'text-center',
    'mt-2',
    'border-t',
    'font-bold',
    'text-sky-500',
    'p-2',
    'border-gray-400',
    'hover:cursor-pointer',
  ]);

  handleHeader(header, pHeader, content);
  handleImageComponent(header, body);
  handleBody(body, pBody, pTime, content);
  handleBotones(botones, aBoton, content);
}

function handleHeader(header, pHeader, content) {
  if (header) {
    const { type, text } = header;
    if (text) {
      pHeader.innerHTML = formatText(text);
      content.appendChild(pHeader);
    }

    if (type === 'IMAGE') {
      showImageComponent();
      if (!isImageValid()) {
        hideImageComponent();
      }
    } else {
      hideImageComponent();
    }
  } else {
    hideImageComponent();
  }
}

function handleImageComponent(header, body) {
  if (header && header.type === 'IMAGE') {
    showImageComponent();
    if (!isImageValid()) {
      imageContainer.style.display = 'none';
    }
  } else if (body && body.type === 'IMAGE') {
    showImageComponent();
    if (!isImageValid()) {
      imageContainer.style.display = 'none';
    }
  } else {
    hideImageComponent();
  }
}

function handleBody(body, pBody, pTime, content) {
  pBody.innerHTML = formatText(body);
  pTime.innerHTML = '9:45 pm';
  content.appendChild(pBody);
  content.appendChild(pTime);
}

function handleBotones(botones, aBoton, content) {
  if (botones) {
    aBoton.innerText = botones;
    content.appendChild(aBoton);
  }
}

function changeCursor(e) {
  e.preventDefault();
  e.currentTarget.classList.toggle('border-2');
}

function showImageComponent() {
  imageComponent.style.display = 'block';
  imageContainer.style.display = 'block';
}

function hideImageComponent() {
  imageContainer.style.display = 'none';
  imageComponent.style.display = 'none';
}

function isImageValid() {
  return previewImage.complete && previewImage.naturalWidth > 0;
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleImageDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  let dt = e.dataTransfer;
  let files = dt.files;
  uploadFile(files);
}

function handleCsvFileDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  let dt = e.dataTransfer;
  let files = dt.files;
  showTable(files[0]);
}

function handleCsvFileChange(e) {
  showTable(e.target.files[0]);
}

function handleImageFileChange(e) {
  uploadFile(e.target.files);
}

function uploadFile(files) {
  // Check if a file is selected
  if (files && files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImage.src = e.target.result;
      showImageComponent();
    };
    reader.readAsDataURL(files[0]);
  } else {
    hideImageComponent();
  }
}

function resetImageInput() {
  const imageFileInput = document.getElementById('imageFile');
  imageFileInput.value = ''; // Restablece el valor del input a vacío
}

function showTable(file) {
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const contents = e.target.result;
      const lines = contents.split('\n');
      const table = document.getElementById('csvTable');
      table.innerHTML = ''; // Clear previous table data

      if (lines.length > 0) {
        const headers = lines[0].split(/[,;]/);
        const headerRow = document.createElement('tr');
        headerRow.classList.add('text-xs', 'text-gray-700', 'uppercase');
        headerRow.style = 'position: sticky ; top:0';
        for (const header of headers) {
          const th = document.createElement('th');
          th.classList.add('p-3');
          th.textContent = header;
          headerRow.appendChild(th);
        }
        table.appendChild(headerRow);

        for (let i = 1; i < lines.length; i++) {
          const rowData = lines[i].split(/[,;]/);
          const row = document.createElement('tr');
          row.classList.add('even:bg-gray-300', 'odd:bg-white');
          for (const data of rowData) {
            const td = document.createElement('td');
            td.textContent = data;
            row.appendChild(td);
          }
          table.appendChild(row);
        }
      }
    };
    reader.readAsText(file);
  }
}

function checkField(event) {
  event.preventDefault();
  const inputElement = event.target;
  const inputElementParent = event.target.parentElement;
  if (!inputElement.checkValidity()) {
    cleanHtlm(inputElementParent, inputElement);
    changeColorFieldRequired(inputElement, true);
    addRequiredText(inputElementParent);
  } else {
    changeColorFieldRequired(inputElement, false);
    cleanHtlm(inputElementParent, inputElement);
  }
}

function addRequiredText(element) {
  const span = document.createElement('span');
  span.innerHTML = 'Campo requerido';
  span.classList.add('text-sm', 'text-red-500');
  element.appendChild(span);
}

async function postFetch(url, data) {
  const rawResponse = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const content = await rawResponse.json();

  return content;
}

async function onFormSubmit(event) {
  event.preventDefault();
  const data = new FormData(event.target);
  const dataObject = Object.fromEntries(data.entries());

  const requestData = {
    campa: dataObject.campaignName,
    linea: dataObject.lines,
    plantilla: dataObject.template,
    idImage: '',
  };

  //postFetch();
}
