import { parseCsv } from "./csv.js";
import { CUSTOMER_TARGET, suggestMappings } from "./targets.js";

const DEMO_FILE = "/samples/clientes-historico.csv";

const demoButton = document.querySelector("#demo-button");
const fileInput = document.querySelector("#file-input");
const errorNode = document.querySelector("#error");
const preview = document.querySelector("#preview");
const empty = document.querySelector("#empty");
const fileName = document.querySelector("#file-name");
const fileStats = document.querySelector("#file-stats");
const tableHead = document.querySelector("#table-head");
const tableBody = document.querySelector("#table-body");
const tableHint = document.querySelector("#table-hint");
const targetName = document.querySelector("#target-name");
const targetDescription = document.querySelector("#target-description");
const fieldList = document.querySelector("#field-list");
const mappingList = document.querySelector("#mapping-list");
const mappingEmpty = document.querySelector("#mapping-empty");
const nextButton = document.querySelector("#next-button");

targetName.textContent = CUSTOMER_TARGET.name;
targetDescription.textContent = CUSTOMER_TARGET.description;

for (const field of CUSTOMER_TARGET.fields) {
  const item = document.createElement("li");
  const label = document.createElement("strong");
  const hint = document.createElement("span");
  label.textContent = field.label;
  hint.textContent = field.hint;
  item.append(label, hint);
  fieldList.append(item);
}

demoButton.addEventListener("click", () => {
  void loadDemo();
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  fileInput.value = "";
  if (file) void loadFile(file);
});

async function loadDemo() {
  demoButton.disabled = true;
  demoButton.textContent = "Abriendo demostración…";
  clearError();
  try {
    const response = await fetch(DEMO_FILE);
    if (!response.ok) throw new Error("No se pudo abrir el archivo de demostración.");
    showTable(parseCsv("clientes-historico.csv", await response.text()));
  } catch (cause) {
    showError(cause instanceof Error ? cause.message : "No se pudo leer el archivo.");
  } finally {
    demoButton.disabled = false;
    demoButton.textContent = "Usar CSV de demostración";
  }
}

async function loadFile(file) {
  clearError();
  const table = parseCsv(file.name, await file.text());
  if (table.headers.length === 0 || table.rows.length === 0) {
    hideTable();
    showError("El CSV necesita una fila de títulos y al menos un cliente.");
    return;
  }
  showTable(table);
}

function showTable(table) {
  fileName.textContent = table.fileName;
  fileStats.textContent = `${table.rows.length} filas · ${table.headers.length} columnas`;

  tableHead.replaceChildren();
  const headRow = document.createElement("tr");
  for (const header of table.headers) {
    const cell = document.createElement("th");
    cell.textContent = header;
    headRow.append(cell);
  }
  tableHead.append(headRow);

  tableBody.replaceChildren();
  for (const row of table.rows.slice(0, 8)) {
    const bodyRow = document.createElement("tr");
    for (const header of table.headers) {
      const cell = document.createElement("td");
      cell.textContent = row[header] ?? "";
      bodyRow.append(cell);
    }
    tableBody.append(bodyRow);
  }

  tableHint.hidden = table.rows.length <= 8;
  tableHint.textContent = `Se muestran las primeras 8 filas. La migración usará las ${table.rows.length}.`;

  mappingList.replaceChildren();
  for (const mapping of suggestMappings(table.headers, CUSTOMER_TARGET)) {
    const field = CUSTOMER_TARGET.fields.find((item) => item.key === mapping.targetKey);
    const item = document.createElement("li");
    const source = document.createElement("span");
    const arrow = document.createElement("em");
    const target = document.createElement("strong");
    source.textContent = mapping.sourceColumn ?? "Sin columna";
    arrow.textContent = "→";
    target.textContent = field?.label ?? mapping.targetKey;
    item.append(source, arrow, target);
    mappingList.append(item);
  }

  preview.hidden = false;
  empty.hidden = true;
  mappingList.hidden = false;
  mappingEmpty.hidden = true;
  nextButton.disabled = false;
}

function hideTable() {
  preview.hidden = true;
  empty.hidden = false;
  mappingList.hidden = true;
  mappingEmpty.hidden = false;
  nextButton.disabled = true;
}

function showError(message) {
  errorNode.hidden = false;
  errorNode.textContent = message;
}

function clearError() {
  errorNode.hidden = true;
  errorNode.textContent = "";
}
