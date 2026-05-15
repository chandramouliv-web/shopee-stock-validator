// ======================================
// app.js
// COMPLETE VERSION
// ======================================

let finalOutput = [];

// ======================================
// READ EXCEL
// ======================================

function readExcel(file) {

  return new Promise((resolve) => {

    const reader = new FileReader();

    reader.onload = (e) => {

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
          sheet
        );

      resolve(json);

    };

    reader.readAsArrayBuffer(file);

  });

}

// ======================================
// UPDATE LOADER TEXT
// ======================================

function updateLoader(text) {

  document.getElementById(
    "loaderText"
  ).innerText = text;

}

// ======================================
// SHOW LOADER
// ======================================

function showLoader() {

  document.getElementById(
    "loaderContainer"
  ).style.display = "flex";

}

// ======================================
// HIDE LOADER
// ======================================

function hideLoader() {

  document.getElementById(
    "loaderContainer"
  ).style.display = "none";

}

// ======================================
// RUN BUTTON
// ======================================

document
  .getElementById("runBtn")
  .addEventListener(
    "click",
    async () => {

      try {

        showLoader();

        // ======================================
        // GET FILES
        // ======================================

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

        // ======================================
        // VALIDATION
        // ======================================

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

        // ======================================
        // READ MP FILE
        // ======================================

        updateLoader(
          "Reading MP File..."
        );

        const mpData =
          await readExcel(
            mpFile
          );

        // ======================================
        // READ BASIC FILE
        // ======================================

        updateLoader(
          "Reading Basic Info File..."
        );

        const basicData =
          await readExcel(
            basicFile
          );

        // ======================================
        // READ CONTENT FILE
        // ======================================

        updateLoader(
          "Reading Tracker / Content File..."
        );

        const contentData =
          await readExcel(
            contentFile
          );

        // ======================================
        // READ TC FILE
        // ======================================

        updateLoader(
          "Reading TC File..."
        );

        const tcData =
          await readExcel(
            tcFile
          );

        // ======================================
        // READ ZECOM FILE
        // ======================================

        updateLoader(
          "Reading zEcom File..."
        );

        const zecomData =
          await readExcel(
            zecomFile
          );

        // ======================================
        // READ ALL FILE
        // ======================================

        updateLoader(
          "Reading All File..."
        );

        const allData =
          await readExcel(
            allFile
          );

        // ======================================
        // RUN VALIDATION
        // ======================================

        updateLoader(
          "Running Validation..."
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

        // ======================================
        // RENDER TABLE
        // ======================================

        updateLoader(
          "Preparing Output..."
        );

        renderTable(
          finalOutput
        );

        renderSummary(
          finalOutput
        );

        // ======================================
        // COMPLETE
        // ======================================

        updateLoader(
          "Completed Successfully ✅"
        );

        setTimeout(() => {

          hideLoader();

        }, 1500);

      }

      catch (err) {

        console.error(err);

        alert(
          "Error while processing files"
        );

        hideLoader();

      }

    }

  );

// ======================================
// RENDER SUMMARY
// ======================================

function renderSummary(data) {

  const summary =
    document.getElementById(
      "summary"
    );

  const total =
    data.length;

  const issues =
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
      <h2>${issues}</h2>
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

// ======================================
// RENDER TABLE
// ======================================

function renderTable(data) {

  const table =
    document.getElementById(
      "outputTable"
    );

  table.innerHTML = "";

  if (!data.length) {

    table.innerHTML =
      "<tr><td>No Data</td></tr>";

    return;

  }

  // HEADER

  const headers =
    Object.keys(data[0]);

  let headerHTML =
    "<tr>";

  headers.forEach(h => {

    headerHTML +=
      `<th>${h}</th>`;

  });

  headerHTML +=
    "</tr>";

  table.innerHTML +=
    headerHTML;

  // ROWS

  data.forEach(row => {

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

    let tr =
      `<tr class="${rowClass}">`;

    headers.forEach(h => {

      tr +=
        `<td>${row[h]}</td>`;

    });

    tr +=
      "</tr>";

    table.innerHTML +=
      tr;

  });

}

// ======================================
// DOWNLOAD OUTPUT
// ======================================

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
