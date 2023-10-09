let templateData = [];
let linesData = [];
const dragImg = document.getElementById('dropFileImg');
const imagePreview = document.getElementById('imagePreview');

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
/*************************************/
// API URLs
const templateApiUrl = 'templates.json';
const linesApiUrl = 'phones.json';

// Fetch data and populate select elements when the page loads
window.addEventListener('load', async () => {
  linesData = await fetchData(linesApiUrl);
  populateSelect('lines', linesData, 'whatsapp_account', 'nombre_whatsapp');

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

    console.log(result);
  });

  // Load template data initially
  templateData = await fetchData(templateApiUrl);
});

// Function to handle CSV file upload and display
document.getElementById('csvFileInput').addEventListener('change', showTable);

dragImg.addEventListener('drop', dropFile, false);
dragImg.addEventListener('dragover', prevent, false);

dragImg.addEventListener('dragenter', changeCursor);
dragImg.addEventListener('dragleave', changeCursor);

function changeCursor(e) {
  e.preventDefault();
  e.currentTarget.classList.toggle('border-2');
}

function prevent(e) {
  e.preventDefault();
}

function dropFile(e) {
  console.log('dropeado');
  e.preventDefault();
  e.stopPropagation();

  let dt = e.dataTransfer;
  let files = dt.files;
  uploadFile(files);
}
function handleFiles(files) {
  [...files].forEach(uploadFile);
}

function uploadFile(files) {
  // Check if a file is selected
  if (files && files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      // Set the source of the preview image to the selected file's data URL
      previewImage.src = e.target.result;

      // Show the image preview container
      imagePreview.style.display = 'block';
    };

    // Read the selected file as a data URL
    reader.readAsDataURL(files[0]);
  } else {
    // Hide the image preview container if no file is selected
    imagePreview.style.display = 'none';
  }
}

// Function to trigger file input when the button is clicked

function showTable(event) {
  e.preventDefault();
  const file = event.target.files[0];
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
        headerRow.style = 'position: sticky ; top:0';
        for (const header of headers) {
          const th = document.createElement('th');
          th.textContent = header;

          headerRow.appendChild(th);
        }
        table.appendChild(headerRow);

        // Create table rows for data
        for (let i = 1; i < lines.length; i++) {
          const rowData = lines[i].split(/[,;]/);
          const row = document.createElement('tr');
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
