let templateData = [];
let linesData = [];
// Function to fetch data from an API
async function fetchData(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data: ", error);
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
  select.innerHTML = "";
  if (defaultValue) {
    const option = document.createElement("option");
    option.text = "Selecciona una opcion";
    select.appendChild(option);
  }
  data.forEach((item) => {
    const option = document.createElement("option");
    option.value = item[optionKey];
    option.text = item[optionValue];
    select.appendChild(option);
  });
}
/*************************************/
// API URLs
const templateApiUrl = "templates.json";
const linesApiUrl = "phones.json";

// Fetch data and populate select elements when the page loads
window.addEventListener("load", async () => {
  linesData = await fetchData(linesApiUrl);
  populateSelect("lines", linesData, "whatsapp_account", "nombre_whatsapp");

  // Add event listener to lines select element
  const linesSelect = document.getElementById("lines");
  linesSelect.addEventListener("change", () => {
    const selectedAccountId = linesSelect.value;

    // Filter templateData based on the selected account ID
    const filteredTemplates = templateData.filter(
      (template) => template.cuenta === selectedAccountId
    );
    document.getElementById("imageComponent").style.display = "none";
    // Populate the template select element with filtered data
    populateSelect(
      "template",
      filteredTemplates,
      "id_plantilla",
      "nombre_plantilla",
      true
    );
  });

  // Add event listener to template select element
  const templateSelect = document.getElementById("template");
  templateSelect.addEventListener("change", () => {
    const selectedTemplate =
      templateSelect.options[templateSelect.selectedIndex];
    const selectedLine = linesSelect.options[linesSelect.selectedIndex];
    console.log(selectedTemplate.value);

    const item = templateData.find(
      (i) => i.id_plantilla == selectedTemplate.value
    );
    if (item.componentes[0]?.header?.type === "IMAGE") {
      document.getElementById("imageComponent").style.display = "block"; // Show the component
    } else {
      document.getElementById("imageComponent").style.display = "none"; // Hide the component
    }
    const campaign = "campaign: " + selectedTemplate.text;
    const valor = " Valor: " + selectedTemplate.value;
    const texto = " Texto: " + selectedLine.text + " " + selectedLine.value;
    const result = campaign + valor + texto;

    console.log(result);
  });

  // Load template data initially
  templateData = await fetchData(templateApiUrl);
});

// Function to handle CSV file upload and display
document
  .getElementById("csvFileInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        console.log("el result", e.target.result);
        const contents = e.target.result;
        const lines = contents.split("\n");
        const table = document.getElementById("csvTable");
        table.innerHTML = ""; // Clear previous table data

        if (lines.length > 0) {
          // Split the first line (headers) by comma to get column names
          const headers = lines[0].split(/[,;]/);

          // Create table header row
          const headerRow = document.createElement("tr");
          headerRow.style = "position: sticky ; top:0";
          for (const header of headers) {
            const th = document.createElement("th");
            th.textContent = header;

            headerRow.appendChild(th);
          }
          table.appendChild(headerRow);

          // Create table rows for data
          for (let i = 1; i < lines.length; i++) {
            const rowData = lines[i].split(/[,;]/);
            const row = document.createElement("tr");
            for (const data of rowData) {
              const td = document.createElement("td");
              td.textContent = data;
              row.appendChild(td);
            }
            table.appendChild(row);
          }
        }
      };
      reader.readAsText(file);
    }
  });
// Function to handle drag-and-drop image
const dropZoneImg = document.getElementById("dropZone");
dropZoneImg.addEventListener("dragover", function (e) {
  e.preventDefault();
  dropZoneImg.classList.add("highlight");
});

dropZoneImg.addEventListener("dragleave", function (e) {
  e.preventDefault();
  dropZoneImg.classList.remove("highlight");
});

dropZoneImg.addEventListener("drop", function (e) {
  e.preventDefault();
  dropZoneImg.classList.remove("highlight");
  const file = e.dataTransfer.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const contents = e.target.result;
    };
    reader.readAsText(file);
  }
});
// Function to handle drag-and-drop csv
const dropZoneCsv = document.getElementById("dropZone");
dropZoneCsv.addEventListener("dragover", function (e) {
  e.preventDefault();
  dropZoneCsv.classList.add("highlight");
});

dropZoneCsv.addEventListener("dragleave", function (e) {
  e.preventDefault();
  dropZoneCsv.classList.remove("highlight");
});
dropZoneCsv.addEventListener('dragenter', handlerFunction, false)
dropZoneCsv.addEventListener("drop", function (e) {
  e.preventDefault();
  dropZoneCsv.classList.remove("highlight");
  const file = e.dataTransfer.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const contents = e.target.result;
    };
    reader.readAsText(file);
  }
});


const csvFileInput = document.getElementById("csvFileInput");

// Prevent the default behavior of the drop event
dropZoneCsv.addEventListener("dragover", function (e) {
    e.preventDefault();
    dropZoneCsv.style.border = "2px dashed #007bff"; // Highlight the drop zone
});

dropZoneCsv.addEventListener("dragleave", function () {
    dropZoneCsv.style.border = "2px dashed #ccc"; // Remove the highlight when the mouse leaves
});

dropZoneCsv.addEventListener("drop", function (e) {
    e.preventDefault();
    dropZoneCsv.style.border = "2px dashed #ccc"; // Remove the highlight on drop
    const file = e.dataTransfer.files[0];

    if (file) {
        // Handle the dropped file as needed
        console.log("Dropped file:", file);
        // You can also trigger the input field programmatically
        csvFileInput.files = e.dataTransfer.files;
    }
});

// Alternatively, you can trigger file selection by clicking the button
const uploadButton = document.getElementById("uploadButton");
uploadButton.addEventListener("click", function () {
    csvFileInput.click(); // Trigger the file input's click event
});
// Function to trigger file input when the button is clicked
document.getElementById("uploadButton").addEventListener("click", function (e) {
  e.preventDefault();
  document.getElementById("csvFileInput").click();
});

const imageFileInput = document.getElementById("image-file-upload");
const imagePreview = document.getElementById("imagePreview");
const previewImage = document.getElementById("previewImage");

// Listen for changes in the file input
imageFileInput.addEventListener("change", function () {
  // Check if a file is selected
  if (this.files && this.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      // Set the source of the preview image to the selected file's data URL
      previewImage.src = e.target.result;

      // Show the image preview container
      imagePreview.style.display = "block";
    };

    // Read the selected file as a data URL
    reader.readAsDataURL(this.files[0]);
  } else {
    // Hide the image preview container if no file is selected
    imagePreview.style.display = "none";
  }
});

