function clean(value) {
  return String(value || "").trim();
}

function num(value) {
  return Number(value) || 0;
}

function runValidation(mpData, contentData, tcData, zecomData, allData) {

  let articleMap = {};
  let ecomMap = {};
  let tcMap = {};
  let stockMap = {};

  // =========================
  // TRACKER / CONTENT FILE
  // =========================
  // Seller SKU -> Article No

  contentData.forEach(r => {

    let sellerSku =
      clean(r["Seller SKU"] || r["SKU"]);

    let articleNo =
      clean(r["Article No"]);

    articleMap[sellerSku] = articleNo;

  });

  // =========================
  // zECOM FILE
  // =========================

  zecomData.forEach(r => {

    let articleNo =
      clean(r["Article No"]);

    let ecom =
      clean(r["e-com"]);

    ecomMap[articleNo] = ecom;

  });

  // =========================
  // TC FILE
  // shopee-MY - TC.csv
  // =========================

  tcData.forEach(r => {

    let sellerSku =
      clean(r["SKU"]);

    tcMap[sellerSku] = {

      tcStatus:
        clean(r["Item status"]) === "ACTIVE"
        ? "Active"
        : "Inactive",

      max0:
        num(r["Max Quantity"]) <= 0
        ? "Yes"
        : "No"

    };

  });

  // =========================
  // ALL FILE
  // =========================

  allData.forEach(r => {

    let sellerSku =
      clean(r["sellerSKU"]);

    stockMap[sellerSku] = {

      tcStock:
        num(r["MyStock-YCH-MY quantity"]),

      reservedStock:
        num(r["MyStock-YCH-MY reservedQuantity"])

    };

  });

  // =========================
  // CONSOLIDATED STOCK
  // =========================

  let productStockMap = {};
  let dualStatusMap = {};

  mpData.forEach(r => {

    let sellerSku =
      clean(r["SKU"] || r["Column1"]);

    let productId =
      clean(r["productId"] || r["Column4"]);

    let tcStock =
      stockMap[sellerSku]?.tcStock || 0;

    if (!productStockMap[productId]) {
      productStockMap[productId] = 0;
    }

    productStockMap[productId] += tcStock;

    let articleNo =
      articleMap[sellerSku];

    let ecom =
      ecomMap[articleNo];

    if (!dualStatusMap[productId]) {
      dualStatusMap[productId] = new Set();
    }

    dualStatusMap[productId].add(ecom);

  });

  // =========================
  // FINAL OUTPUT
  // =========================

  let output = [];

  mpData.forEach(r => {

    let sellerSku =
      clean(r["SKU"] || r["Column1"]);

    let productId =
      clean(r["productId"] || r["Column4"]);

    let mpStatus =
      clean(r["Item status"] || r["Column6"]) === "ACTIVE"
      ? "Active"
      : "Inactive";

    let mpStock =
      num(r["In stock"] || r["Column11"]);

    let tcStatus =
      tcMap[sellerSku]?.tcStatus || "Inactive";

    let max0 =
      tcMap[sellerSku]?.max0 || "No";

    let tcStock =
      stockMap[sellerSku]?.tcStock || 0;

    let reservedStock =
      stockMap[sellerSku]?.reservedStock || 0;

    let articleNo =
      articleMap[sellerSku];

    let ecom =
      ecomMap[articleNo];

    let ecomStatus =
      ecom === "Yes"
      ? "Active"
      : "Inactive";

    let dualStatus =
      dualStatusMap[productId]?.size >= 2
      ? 2
      : 1;

    let consolidatedStock =
      productStockMap[productId] || 0;

    let finalStatus = "";
    let remarks = "";

    // =========================
    // DUAL STATUS = 1
    // =========================

    if (dualStatus === 1) {

      if (ecomStatus === "Inactive") {

        finalStatus = "Inactive";
        remarks = "Due to Ecom No";

      } else if (consolidatedStock === 0) {

        finalStatus = "Inactive";
        remarks = "Due to 0 Stock";

      } else {

        finalStatus = "Active";
        remarks = "Ecom Yes with Stock";

      }

    }

    // =========================
    // DUAL STATUS = 2
    // =========================

    else {

      if (consolidatedStock === 0) {

        finalStatus = "Inactive";
        remarks = "Due to 0 Stock";

      } else if (ecomStatus === "Active") {

        finalStatus = "Active";
        remarks = "Ecom Yes with Stock";

      } else {

        finalStatus = "Active";
        remarks = "Set max";

      }

    }

    // =========================
    // CHECKS
    // =========================

    let finalCheck =
      (mpStatus === tcStatus &&
       tcStatus === finalStatus)
      ? "True"
      : "False";

    let stockCheck =
      (mpStock === tcStock)
      ? "True"
      : "False";

    let action = "All Good";

    if (finalCheck === "False") {

      action =
        "Update status to " + finalStatus;

    }

    // =========================
    // PUSH 0 STOCK
    // =========================

    if (
      tcStock <= 0 &&
      mpStock > 0
    ) {

      action += " | Push 0 stock update";

    }

    // =========================
    // MAX LOGIC
    // =========================

    if (
      (remarks === "Due to Ecom No" ||
       remarks === "Set max") &&
      max0 === "No"
    ) {

      action += " | Set max";

    }

    if (
      remarks === "Ecom Yes with Stock" &&
      max0 === "Yes"
    ) {

      action += " | Remove max";

    }

    // =========================
    // OUTPUT
    // =========================

    output.push({

      "Seller SKU": sellerSku,
      "Product ID": productId,
      "MP Status": mpStatus,
      "MP Stock": mpStock,
      "TC Status": tcStatus,
      "TC Stock": tcStock,
      "Reserved Stock": reservedStock,
      "Ecom Status": ecomStatus,
      "Dual Status": dualStatus,
      "Final Status": finalStatus,
      "Remarks": remarks,
      "Final Check": finalCheck,
      "Stock Check": stockCheck,
      "Action": action

    });

  });

  console.log(output);

  return output;

}
