let templateData = [];
let linesData = [];
const dragImg = document.getElementById('dropFileImg');
const dragCsv = document.getElementById('dropFileCsv');
const previewImage = document.getElementById('previewImage');
const imageContainer = document.getElementById('imageContainer');
const nameCampaingInput = document.getElementById('campaignName');
let csvInfo = [];
/*************************************/
// API URLs
const templateApiUrl = 'templates.json';
const linesApiUrl = 'phones.json';
// Fetch data and populate select elements when the page loads
window.addEventListener('load', async () => {
  linesData = await fetchData(linesApiUrl);
  populateSelect('lines', linesData, 'whatsapp_account', 'nombre_whatsapp');
  // Load template data initially
  templateData = await fetchData(templateApiUrl);
  // Add event listener to lines select element
  const linesSelect = document.getElementById('lines');
  linesSelect.addEventListener('change', () => {
    const selectedAccountId = linesSelect.value;

    // Filter templateData based on the selected account ID
    const filteredTemplates = templateData.filter(
      (template) => template.cuenta === selectedAccountId
    );
    document.getElementById('imageComponent').style.display = 'none';
    // Populate the template select element with filtered data
    populateSelect(
      'template',
      filteredTemplates,
      'id_plantilla',
      'nombre_plantilla',
      true
    );
  });

  // Add event listener to template select element
  const templateSelect = document.getElementById('template');
  templateSelect.addEventListener('change', () => {
    const selectedTemplate =
      templateSelect.options[templateSelect.selectedIndex];
    const selectedLine = linesSelect.options[linesSelect.selectedIndex];
    console.log(selectedTemplate.value);

    const item = templateData.find(
      (i) => i.id_plantilla == selectedTemplate.value
    );
    if (item.componentes[0]?.header?.type === 'IMAGE') {
      document.getElementById('imageComponent').style.display = 'block'; // Show the component
    } else {
      document.getElementById('imageComponent').style.display = 'none'; // Hide the component
    }
    const campaign = 'campaign: ' + selectedTemplate.text;
    const valor = ' Valor: ' + selectedTemplate.value;
    const texto = ' Texto: ' + selectedLine.text + ' ' + selectedLine.value;
    const result = campaign + valor + texto;

    populateWhatsappChat(item);
  });
});

// Function to handle CSV file upload and display
document.getElementById('csvFileInput').addEventListener('change', (e) => {
  showTable(e.target.files[0]);
});
document.getElementById('image-file-upload').addEventListener('change', (e) => {
  uploadFile(e.target.files);
});

dragImg.addEventListener('drop', dropFile, false);
dragImg.addEventListener('dragover', prevent, false);

dragImg.addEventListener('dragenter', changeCursor);
dragImg.addEventListener('dragleave', changeCursor);

dragCsv.addEventListener('dragenter', changeCursor);
dragCsv.addEventListener('dragleave', changeCursor);
dragCsv.addEventListener('dragover', prevent, false);
dragCsv.addEventListener('drop', dropFileCsv, false);
nameCampaingInput.addEventListener('focusout', checkField);

function populateWhatsappChat(item) {
  const { botones } = item;
  const { header, body } = item.componentes[0];
  const chat = document.getElementById('wsChat');
  const content = document.getElementById('wsContent');
  const pHeader = document.createElement('p');
  const pBody = document.createElement('p');
  const pTime = document.createElement('p');
  const aBoton = document.createElement('button');

  cleanHtlm(content, false);
  pTime.classList.add('text-right', 'text-xs', 'text-grey-dark', 'mt-1');
  pHeader.classList.add('text-sm', 'mt-1');
  pBody.classList.add('text-sm', 'mt-1');

  if (header) {
    const { type } = header;

    if (type === 'TEXT') {
      pHeader.innerText = header.text;
      content.appendChild(pHeader);
    }
  }
  pBody.innerText = body;
  pTime.innerText = '9:45 pm';
  content.appendChild(pBody);
  content.appendChild(pTime);
  if (botones) {
    aBoton.classList.add(
      'w-full',
      'text-center',
      'mt-2',
      'border-t',
      'font-bold',
      'text-sky-500',
      'p-2',
      'border-gray-400'
    );
    aBoton.innerText = botones;
    content.appendChild(aBoton);
  }
}

function changeCursor(e) {
  e.preventDefault();
  e.currentTarget.classList.toggle('border-2');
}

function prevent(e) {
  e.preventDefault();
}

function dropFile(e) {
  e.preventDefault();
  e.stopPropagation();

  let dt = e.dataTransfer;
  let files = dt.files;
  uploadFile(files);
}

function dropFileCsv(e) {
  e.preventDefault();
  e.stopPropagation();

  let dt = e.dataTransfer;
  let files = dt.files;
  showTable(files[0]);
}
function handleFiles(files) {
  [...files].forEach(uploadFile);
}

/* ************************************** */
/* Function for image preview */
function uploadFile(files) {
  console.log('Upload');
  // Check if a file is selected
  if (files && files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      // Set the source of the preview image to the selected file's data URL
      previewImage.src = e.target.result;

      // Show the image preview container
      imageContainer.style.display = 'block';
    };

    // Read the selected file as a data URL
    reader.readAsDataURL(files[0]);
  } else {
    // Hide the image preview container if no file is selected
    imageContainer.style.display = 'none';
  }
}
// Function to trigger file input when the button is clicked

function showTable(file) {
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      console.log('el result', e.target.result);
      const contents = e.target.result;
      const lines = contents.split('\n');
      const table = document.getElementById('csvTable');
      table.innerHTML = ''; // Clear previous table data

      if (lines.length > 0) {
        // Split the first line (headers) by comma to get column names
        const headers = lines[0].split(/[,;]/);

        // Create table header row
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

        // Create table rows for data
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

function validateForm() {
  var campaignName = document.getElementById('campaignName').value;
  var lines = document.getElementById('lines').value;
  var template = document.getElementById('template').value;
  var csvFile = document.getElementById('csvFileInput').value;

  var errorMessage = document.getElementById('error-message');
  errorMessage.textContent = ''; // Clear previous error message

  if (
    campaignName === '' ||
    lines === 'Seleccione una opcion' ||
    template === 'Seleccione una opcion' ||
    !csvFile
  ) {
    errorMessage.textContent = 'All fields are required!';
    return false; // Prevent form submission
  }

  return true; // Allow form submission if all fields are filled
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
  console.log(span);
  span.classList.add('text-sm', 'text-red-500');
  element.appendChild(span);
}

function cleanHtlm(element, firtsElement) {
  while (element.lastChild && element.lastChild !== firtsElement) {
    element.removeChild(element.lastChild);
  }
}

function changeColorFieldRequired(element, isEmpty) {
  if (isEmpty) {
    element.classList.add('ring-2', 'ring-red-600');
  } else {
    element.classList.remove('ring-2', 'ring-red-600');
  }
}

// Function to fetch data from an API
async function fetchData(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data: ', error);
  }
}

// Function to populate a select element with options
function populateSelect(
  selectId,
  data,
  optionKey,
  optionValue,
  defaultValue = false
) {
  const select = document.getElementById(selectId);
  select.innerHTML = '';
  if (defaultValue) {
    const option = document.createElement('option');
    option.text = 'Selecciona una opcion';
    select.appendChild(option);
  }
  data.forEach((item) => {
    const option = document.createElement('option');
    option.value = item[optionKey];
    option.text = item[optionValue];
    select.appendChild(option);
  });
}
