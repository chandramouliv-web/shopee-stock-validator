let finalOutput = [];

document
  .getElementById("runBtn")
  .addEventListener("click", async () => {

    try {

      document.getElementById("runBtn").innerText =
        "Processing...";

      // Read files one by one
      const mpData =
        await readExcel("mpFile");

      const contentData =
        await readExcel("contentFile");

      const tcData =
        await readExcel("tcFile");

      const zecomData =
        await readExcel("zecomFile");

      const allData =
        await readExcel("allFile");

      console.log("Files Loaded");

      // Run validation
      finalOutput = runValidation(
        mpData,
        contentData,
        tcData,
        zecomData,
        allData
      );

      console.log(finalOutput);

      // Render
      renderSummary(finalOutput);

      renderTable(finalOutput);

      document.getElementById("runBtn").innerText =
        "🚀 Run Validation";

    } catch (err) {

      console.error(err);

      alert(
        "Error while processing files.\nCheck browser console."
      );

      document.getElementById("runBtn").innerText =
        "🚀 Run Validation";
    }

  });

async function readExcel(id) {

  return new Promise((resolve, reject) => {

    const file =
      document.getElementById(id).files[0];

    if (!file) {

      reject(`Missing file: ${id}`);
      return;

    }

    const reader = new FileReader();

    reader.onload = function(e) {

      try {

        const data =
          new Uint8Array(e.target.result);

        const workbook =
          XLSX.read(data, {
            type: "array"
          });

        const sheet =
          workbook.Sheets[
            workbook.SheetNames[0]
          ];

        const json =
          XLSX.utils.sheet_to_json(sheet, {
            defval: ""
          });

        resolve(json);

      } catch (error) {

        reject(error);

      }

    };

    reader.onerror = reject;

    reader.readAsArrayBuffer(file);

  });

}

function renderSummary(data) {

  const summary =
    document.getElementById("summary");

  const total = data.length;

  const mismatch =
    data.filter(
      x => x["Final Check"] === "False"
    ).length;

  const stockMismatch =
    data.filter(
      x => x["Stock Check"] === "False"
    ).length;

  const allGood =
    data.filter(
      x => x["Action"] === "All Good"
    ).length;

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

  const table =
    document.getElementById("outputTable");

  table.innerHTML = "";

  if (!data.length) return;

  const headers =
    Object.keys(data[0]);

  // Header
  let html = "<tr>";

  headers.forEach(h => {
    html += `<th>${h}</th>`;
  });

  html += "</tr>";

  // LIMIT RENDER
  // Prevent browser freeze

  const limitedData =
    data.slice(0, 3000);

  limitedData.forEach(row => {

    let rowClass = "";

    if (
      row["Final Check"] === "False"
    ) {

      rowClass = "red";

    } else if (
      row["Action"].includes("Reserved")
    ) {

      rowClass = "yellow";

    } else {

      rowClass = "green";

    }

    html += `<tr class="${rowClass}">`;

    headers.forEach(h => {

      html += `<td>${row[h]}</td>`;

    });

    html += "</tr>";

  });

  table.innerHTML = html;

}

document
  .getElementById("downloadBtn")
  .addEventListener("click", () => {

    if (!finalOutput.length) {

      alert("No output available.");
      return;

    }

    const worksheet =
      XLSX.utils.json_to_sheet(finalOutput);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Validation"
    );

    XLSX.writeFile(
      workbook,
      "Shopee_Validation_Output.xlsx"
    );

  });
