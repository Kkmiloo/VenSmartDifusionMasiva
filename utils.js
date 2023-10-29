/**
 * Llena un elemento select con opciones basadas en un conjunto de datos.
 * @param {string} selectId - El ID del elemento select que se llenará con opciones.
 * @param {Array} data - Un arreglo de objetos que contiene los datos para las opciones.
 * @param {string} optionKey - La clave en los objetos de datos que se usará como el valor de las opciones.
 * @param {string} optionValue - La clave en los objetos de datos que se usará como el texto visible de las opciones.
 * @param {boolean} [defaultValue=false] - Determina si se debe agregar una opción predeterminada al principio del select.
 */
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

/**
 * Realiza una solicitud HTTP GET para obtener datos desde una URL de API y devuelve los datos en formato JSON.
 *
 * @param {string} apiUrl - La URL de la API desde la cual se deben recuperar los datos.
 * @returns {Promise} Una promesa que se resuelve con los datos obtenidos de la API en formato JSON.
 * @throws {Error} Si hay un error al realizar la solicitud o al procesar la respuesta JSON.
 */
async function fetchData(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data: ', error);
    throw error;
  }
}

function formatText(text) {
  return text
    .replace(/(?:\*)([^*<\n]+)(?:\*)/g, '<strong>$1</strong>')
    .replace(/(?:_)([^_<\n]+)(?:_)/g, '<i>$1</i>')
    .replace(/(?:~)([^~<\n]+)(?:~)/g, '<s>$1</s>')
    .replace(/(?:```)([^```<\n]+)(?:```)/g, '<tt>$1</tt>');
}

function createParagraph(classList) {
  const p = document.createElement('p');
  p.classList.add(...classList);
  return p;
}
/* 
function createFakeButton(classList) {
  const aBoton = document.createElement('p');
  aBoton.classList.add(...classList);
  return aBoton;
} */

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

export {
  formatText,
  fetchData,
  populateSelect,
  createParagraph,
  cleanHtlm,
  changeColorFieldRequired,
};
