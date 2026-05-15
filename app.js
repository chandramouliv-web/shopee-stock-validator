let finalOutput = [];

const loaderContainer =
  document.getElementById(
    "loaderContainer"
  );

const loaderText =
  document.getElementById(
    "loaderText"
  );

document
  .getElementById("runBtn")
  .addEventListener("click", async () => {

    try {

      loaderContainer.style.display =
        "flex";

      updateLoader(
        "Reading MP File..."
      );

      const mpData =
        await readExcel("mpFile");

      updateLoader(
        "Reading Tracker File..."
      );

      const contentData =
        await readExcel("contentFile");

      updateLoader(
        "Reading TC File..."
      );

      const tcData =
        await readExcel("tcFile");

      updateLoader(
        "Reading zEcom File..."
      );

      const zecomData =
        await readExcel("zecomFile");

      updateLoader(
        "Reading All File..."
      );

      const allData =
        await readExcel("allFile");

      updateLoader(
        "Running Validation..."
      );

      await delay(100);

      finalOutput = runValidation(
        mpData,
        contentData,
        tcData,
        zecomData,
        allData
      );

      updateLoader(
        "Rendering Output..."
      );

      await delay(100);

      renderSummary(finalOutput);

      renderTable(finalOutput);

      updateLoader(
        "Completed Successfully ✅"
      );

      setTimeout(() => {

        loaderContainer.style.display =
          "none";

      }, 2000);

    } catch (err) {

      console.error(err);

      updateLoader(
        "Error while processing ❌"
      );

      alert(
        "Error while processing files.\nCheck browser console."
      );

    }

  });

function updateLoader(text) {

  loaderText.innerText = text;

}

function delay(ms) {

  return new Promise(resolve =>
    setTimeout(resolve, ms)
  );

}

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
    document.getElementById(
      "summary"
    );

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
    document.getElementById(
      "outputTable"
    );

  table.innerHTML = "";

  if (!data.length) return;

  const headers =
    Object.keys(data[0]);

  let html = "<tr>";

  headers.forEach(h => {

    html += `<th>${h}</th>`;

  });

  html += "</tr>";

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
  .getElementById(
    "downloadBtn"
  )
  .addEventListener("click", () => {

    if (!finalOutput.length) {

      alert("No output available.");
      return;

    }

    const worksheet =
      XLSX.utils.json_to_sheet(
        finalOutput
      );

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
