// ============================================
// app.js
// COMPLETE OPTIMIZED FINAL VERSION
// ============================================

let finalOutput = [];

// ============================================
// READ EXCEL
// ============================================

function readExcel(
  file,
  skipRows = 0
) {

  return new Promise((resolve) => {

    const reader =
      new FileReader();

    reader.onload = (e) => {

      try {

        const data =
          new Uint8Array(
            e.target.result
          );

        const workbook =
          XLSX.read(data, {
            type: "array"
          });

        const sheetName =
          workbook.SheetNames[0];

        const sheet =
          workbook.Sheets[sheetName];

        const json =
          XLSX.utils.sheet_to_json(
            sheet,
            {
              range: skipRows,
              defval: "",
              raw: false
            }
          );

        resolve(json);

      }

      catch (err) {

        console.error(err);

        alert(
          "Error reading file: "
          + file.name
        );

      }

    };

    reader.readAsArrayBuffer(file);

  });

}

// ============================================
// LOADER
// ============================================

function updateLoader(text) {

  const loader =
    document.getElementById(
      "loaderText"
    );

  if (loader) {

    loader.innerText =
      text;

  }

}

function showLoader() {

  const loader =
    document.getElementById(
      "loaderContainer"
    );

  if (loader) {

    loader.style.display =
      "flex";

  }

}

function hideLoader() {

  const loader =
    document.getElementById(
      "loaderContainer"
    );

  if (loader) {

    loader.style.display =
      "none";

  }

}

// ============================================
// RUN BUTTON
// ============================================

document
  .getElementById("runBtn")
  .addEventListener(
    "click",
    async () => {

      try {

        showLoader();

        // ============================================
        // FILES
        // ============================================

        const mpFile =
          document.getElementById(
            "mpFile"
          ).files[0];

        const basicFile =
          document.getElementById(
            "basicFile"
          ).files[0];

        const contentFile =
          document.getElementById(
            "contentFile"
          ).files[0];

        const tcFile =
          document.getElementById(
            "tcFile"
          ).files[0];

        const zecomFile =
          document.getElementById(
            "zecomFile"
          ).files[0];

        const allFile =
          document.getElementById(
            "allFile"
          ).files[0];

        // ============================================
        // CHECK FILES
        // ============================================

        if (
          !mpFile ||
          !basicFile ||
          !contentFile ||
          !tcFile ||
          !zecomFile ||
          !allFile
        ) {

          alert(
            "Please upload all files"
          );

          hideLoader();

          return;

        }

        // ============================================
        // READ FILES
        // ============================================

        updateLoader(
          "Reading MP File..."
        );

        const mpData =
          await readExcel(
            mpFile
          );

        updateLoader(
          "Reading Basic Info File..."
        );

        const basicData =
          await readExcel(
            basicFile
          );

        updateLoader(
          "Reading Tracker File..."
        );

        const contentData =
          await readExcel(
            contentFile
          );

        updateLoader(
          "Reading TC File..."
        );

        const tcData =
          await readExcel(
            tcFile
          );

        updateLoader(
          "Reading zEcom File..."
        );

        const zecomData =
          await readExcel(
            zecomFile,
            2
          );

        updateLoader(
          "Reading All File..."
        );

        const allData =
          await readExcel(
            allFile
          );

        // ============================================
        // VALIDATION
        // ============================================

        updateLoader(
          "Running Validation..."
        );

        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              100
            )
        );

        finalOutput =
          runValidation(
            mpData,
            basicData,
            contentData,
            tcData,
            zecomData,
            allData
          );

        // ============================================
        // TABLE
        // ============================================

        updateLoader(
          "Rendering Output..."
        );

        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              100
            )
        );

        renderTable(
          finalOutput
        );

        // ============================================
        // SUMMARY
        // ============================================

        renderSummary(
          finalOutput
        );

        // ============================================
        // COMPLETE
        // ============================================

        updateLoader(
          "Completed Successfully ✅"
        );

        setTimeout(() => {

          hideLoader();

        }, 1000);

      }

      catch (err) {

        console.error(err);

        alert(
          "Error Processing Files"
        );

        hideLoader();

      }

    }

  );

// ============================================
// SUMMARY
// ============================================

function renderSummary(data) {

  const summary =
    document.getElementById(
      "summary"
    );

  if (!summary) return;

  const total =
    data.length;

  const statusIssues =
    data.filter(
      x =>
        x["Final Check"] ===
        "False"
    ).length;

  const stockIssues =
    data.filter(
      x =>
        x["Stock Check"] ===
        "False"
    ).length;

  const allGood =
    data.filter(
      x =>
        x["Action"] ===
        "All Good"
    ).length;

  summary.innerHTML = `

    <div class="summary-card">
      <h3>Total</h3>
      <h2>${total}</h2>
    </div>

    <div class="summary-card">
      <h3>Status Issues</h3>
      <h2>${statusIssues}</h2>
    </div>

    <div class="summary-card">
      <h3>Stock Issues</h3>
      <h2>${stockIssues}</h2>
    </div>

    <div class="summary-card">
      <h3>All Good</h3>
      <h2>${allGood}</h2>
    </div>

  `;

}

// ============================================
// TABLE
// ============================================

function renderTable(data) {

  const table =
    document.getElementById(
      "outputTable"
    );

  if (!table) return;

  table.innerHTML = "";

  if (!data.length) {

    table.innerHTML =
      "<tr><td>No Data Found</td></tr>";

    return;

  }

  // ============================================
  // HEADERS
  // ============================================

  const headers =
    Object.keys(data[0]);

  let html =
    "<thead><tr>";

  headers.forEach(h => {

    html +=
      `<th>${h}</th>`;

  });

  html +=
    "</tr></thead><tbody>";

  // ============================================
  // ROWS
  // ============================================

  for (
    let i = 0;
    i < data.length;
    i++
  ) {

    const row =
      data[i];

    let rowClass =
      "green";

    if (
      row["Final Check"] ===
      "False"
    ) {

      rowClass =
        "red";

    }

    else if (
      row["Stock Check"] ===
      "False"
    ) {

      rowClass =
        "yellow";

    }

    html +=
      `<tr class="${rowClass}">`;

    headers.forEach(h => {

      html +=
        `<td>${row[h] ?? ""}</td>`;

    });

    html +=
      "</tr>";

  }

  html +=
    "</tbody>";

  // ============================================
  // SINGLE DOM UPDATE
  // ============================================

  table.innerHTML =
    html;

}

// ============================================
// DOWNLOAD
// ============================================

document
  .getElementById(
    "downloadBtn"
  )
  .addEventListener(
    "click",
    () => {

      if (
        !finalOutput.length
      ) {

        alert(
          "No Output Found"
        );

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
        "Output"
      );

      XLSX.writeFile(
        workbook,
        "Shopee_Validation_Output.xlsx"
      );

    }

  );
