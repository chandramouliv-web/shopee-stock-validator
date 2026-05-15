let finalOutput = [];

function readExcel(
  file,
  skipRows = 0
) {

  return new Promise((resolve) => {

    const reader =
      new FileReader();

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
          sheet,
          {
            range: skipRows
          }
        );

      resolve(json);

    };

    reader.readAsArrayBuffer(file);

  });

}

function updateLoader(text) {

  document.getElementById(
    "loaderText"
  ).innerText = text;

}

function showLoader() {

  document.getElementById(
    "loaderContainer"
  ).style.display = "flex";

}

function hideLoader() {

  document.getElementById(
    "loaderContainer"
  ).style.display = "none";

}

document
  .getElementById("runBtn")
  .addEventListener(
    "click",
    async () => {

      try {

        showLoader();

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

        renderTable(
          finalOutput
        );

        updateLoader(
          "Completed Successfully"
        );

        setTimeout(() => {

          hideLoader();

        }, 1500);

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
