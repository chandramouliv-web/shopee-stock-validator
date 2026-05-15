let finalOutput = [];

document.getElementById("runBtn").addEventListener("click", async () => {

  const mpData = await readExcel("mpFile");
  const contentData = await readExcel("contentFile");
  const tcData = await readExcel("tcFile");
  const zecomData = await readExcel("zecomFile");
  const allData = await readExcel("allFile");

  finalOutput = runValidation(
    mpData,
    contentData,
    tcData,
    zecomData,
    allData
  );

  renderSummary(finalOutput);
  renderTable(finalOutput);

});

async function readExcel(id) {

  return new Promise((resolve) => {

    const file = document.getElementById(id).files[0];

    const reader = new FileReader();

    reader.onload = function(e) {

      const data = new Uint8Array(e.target.result);

      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const json = XLSX.utils.sheet_to_json(sheet);

      resolve(json);
    };

    reader.readAsArrayBuffer(file);

  });
}

function renderSummary(data) {

  const summary = document.getElementById("summary");

  const total = data.length;

  const mismatch = data.filter(x => x["Final Check"] === "False").length;

  const stockMismatch = data.filter(x => x["Stock Check"] === "False").length;

  const allGood = data.filter(x => x["Action"] === "All Good").length;

  summary.innerHTML = `
  
    <div class="summary-card">
      <h3>Total SKU</h3>
      <p>${total}</p>
    </div>

    <div class="summary-card">
      <h3>Status Mismatch</h3>
      <p>${mismatch}</p>
    </div>

    <div class="summary-card">
      <h3>Stock Mismatch</h3>
      <p>${stockMismatch}</p>
    </div>

    <div class="summary-card">
      <h3>All Good</h3>
      <p>${allGood}</p>
    </div>

  `;
}

function renderTable(data) {

  const table = document.getElementById("outputTable");

  table.innerHTML = "";

  if (data.length === 0) return;

  const headers = Object.keys(data[0]);

  let headerRow = "<tr>";

  headers.forEach(h => {
    headerRow += `<th>${h}</th>`;
  });

  headerRow += "</tr>";

  table.innerHTML += headerRow;

  data.forEach(row => {

    let rowClass = "";

    if (row["Final Check"] === "False") {
      rowClass = "red";
    } else if (row["Action"].includes("Reserved")) {
      rowClass = "yellow";
    } else {
      rowClass = "green";
    }

    let tr = `<tr class="${rowClass}">`;

    headers.forEach(h => {
      tr += `<td>${row[h]}</td>`;
    });

    tr += "</tr>";

    table.innerHTML += tr;

  });

}

document.getElementById("downloadBtn").addEventListener("click", () => {

  const worksheet = XLSX.utils.json_to_sheet(finalOutput);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Validation");

  XLSX.writeFile(workbook, "Shopee_Validation_Output.xlsx");

});
