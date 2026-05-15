function clean(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function num(value) {
  return Number(value) || 0;
}

function findKey(row, possibleKeys) {

  let keys = Object.keys(row);

  for (let key of keys) {

    let normalizedKey =
      clean(key).toLowerCase();

    for (let possible of possibleKeys) {

      if (
        normalizedKey ===
        possible.toLowerCase()
      ) {
        return key;
      }

    }

  }

  return null;
}

function runValidation(
  mpData,
  contentData,
  tcData,
  zecomData,
  allData
) {

  if (
    !mpData.length ||
    !contentData.length ||
    !tcData.length ||
    !zecomData.length ||
    !allData.length
  ) {

    alert("One or more files are empty.");

    return [];
  }

  // =========================
  // DETECT HEADERS
  // =========================

  let mpRow = mpData[0];
  let contentRow = contentData[0];
  let tcRow = tcData[0];
  let zecomRow = zecomData[0];
  let allRow = allData[0];

  // MP FILE
  const mpSkuKey =
    findKey(mpRow, ["SKU", "Seller SKU"]);

  const mpProductKey =
    findKey(mpRow, ["productId", "Product ID"]);

  const mpStatusKey =
    findKey(mpRow, ["Item status", "MP Status"]);

  const mpStockKey =
    findKey(mpRow, ["In stock", "MP Stock"]);

  // CONTENT FILE
  const contentSkuKey =
    findKey(contentRow, ["SKU", "Seller SKU"]);

  const articleKey =
    findKey(contentRow, ["Article No"]);

  // zECOM FILE
  const zecomArticleKey =
    findKey(zecomRow, ["Article No"]);

  const ecomKey =
    findKey(zecomRow, ["e-com"]);

  // TC FILE
  const tcSkuKey =
    findKey(tcRow, ["SKU", "Seller SKU"]);

  const tcStatusKey =
    findKey(tcRow, ["Item status"]);

  const tcMaxKey =
    findKey(tcRow, ["Max Quantity"]);

  // ALL FILE
  const allSkuKey =
    findKey(allRow, ["sellerSKU"]);

  const allStockKey =
    findKey(allRow, [
      "MyStock-YCH-MY quantity"
    ]);

  const allReservedKey =
    findKey(allRow, [
      "MyStock-YCH-MY reservedQuantity"
    ]);

  console.log({
    mpSkuKey,
    mpProductKey,
    mpStatusKey,
    mpStockKey,
    contentSkuKey,
    articleKey,
    zecomArticleKey,
    ecomKey,
    tcSkuKey,
    tcStatusKey,
    tcMaxKey,
    allSkuKey,
    allStockKey,
    allReservedKey
  });

  // =========================
  // MAPS
  // =========================

  let articleMap = {};
  let ecomMap = {};
  let tcMap = {};
  let stockMap = {};

  // CONTENT
  contentData.forEach(r => {

    let sellerSku =
      clean(r[contentSkuKey]);

    let articleNo =
      clean(r[articleKey]);

    articleMap[sellerSku] =
      articleNo;

  });

  // zECOM
  zecomData.forEach(r => {

    let articleNo =
      clean(r[zecomArticleKey]);

    let ecom =
      clean(r[ecomKey]);

    ecomMap[articleNo] = ecom;

  });

  // TC
  tcData.forEach(r => {

    let sellerSku =
      clean(r[tcSkuKey]);

    tcMap[sellerSku] = {

      tcStatus:
        clean(r[tcStatusKey]) === "ACTIVE"
        ? "Active"
        : "Inactive",

      max0:
        num(r[tcMaxKey]) <= 0
        ? "Yes"
        : "No"

    };

  });

  // ALL
  allData.forEach(r => {

    let sellerSku =
      clean(r[allSkuKey]);

    stockMap[sellerSku] = {

      tcStock:
        num(r[allStockKey]),

      reservedStock:
        num(r[allReservedKey])

    };

  });

  // =========================
  // STOCK CONSOLIDATION
  // =========================

  let productStockMap = {};
  let dualStatusMap = {};

  mpData.forEach(r => {

    let sellerSku =
      clean(r[mpSkuKey]);

    let productId =
      clean(r[mpProductKey]);

    let tcStock =
      stockMap[sellerSku]?.tcStock || 0;

    if (!productStockMap[productId]) {
      productStockMap[productId] = 0;
    }

    productStockMap[productId] +=
      tcStock;

    let articleNo =
      articleMap[sellerSku];

    let ecom =
      ecomMap[articleNo];

    if (!dualStatusMap[productId]) {
      dualStatusMap[productId] =
        new Set();
    }

    dualStatusMap[productId].add(
      ecom
    );

  });

  // =========================
  // OUTPUT
  // =========================

  let output = [];

  mpData.forEach(r => {

    let sellerSku =
      clean(r[mpSkuKey]);

    let productId =
      clean(r[mpProductKey]);

    let mpStatus =
      clean(r[mpStatusKey]) ===
      "ACTIVE"
      ? "Active"
      : "Inactive";

    let mpStock =
      num(r[mpStockKey]);

    let tcStatus =
      tcMap[sellerSku]?.tcStatus ||
      "Inactive";

    let max0 =
      tcMap[sellerSku]?.max0 ||
      "No";

    let tcStock =
      stockMap[sellerSku]?.tcStock ||
      0;

    let reservedStock =
      stockMap[sellerSku]
        ?.reservedStock || 0;

    let articleNo =
      articleMap[sellerSku];

    let ecom =
      ecomMap[articleNo];

    let ecomStatus =
      ecom === "Yes"
      ? "Active"
      : "Inactive";

    let dualStatus =
      dualStatusMap[productId]
        ?.size >= 2
      ? 2
      : 1;

    let consolidatedStock =
      productStockMap[productId] ||
      0;

    let finalStatus = "";
    let remarks = "";

    // =========================

    if (dualStatus === 1) {

      if (ecomStatus === "Inactive") {

        finalStatus = "Inactive";
        remarks = "Due to Ecom No";

      } else if (
        consolidatedStock === 0
      ) {

        finalStatus = "Inactive";
        remarks = "Due to 0 Stock";

      } else {

        finalStatus = "Active";
        remarks =
          "Ecom Yes with Stock";

      }

    } else {

      if (
        consolidatedStock === 0
      ) {

        finalStatus = "Inactive";
        remarks = "Due to 0 Stock";

      } else if (
        ecomStatus === "Active"
      ) {

        finalStatus = "Active";
        remarks =
          "Ecom Yes with Stock";

      } else {

        finalStatus = "Active";
        remarks = "Set max";

      }

    }

    // =========================

    let finalCheck =
      (mpStatus === tcStatus &&
       tcStatus === finalStatus)
      ? "True"
      : "False";

    let stockCheck =
      mpStock === tcStock
      ? "True"
      : "False";

    let action = "All Good";

    if (finalCheck === "False") {

      action =
        "Update status to " +
        finalStatus;

    }

    if (
      tcStock <= 0 &&
      mpStock > 0
    ) {

      action +=
        " | Push 0 stock update";

    }

    if (
      (remarks ===
        "Due to Ecom No" ||
       remarks === "Set max") &&
      max0 === "No"
    ) {

      action += " | Set max";

    }

    if (
      remarks ===
        "Ecom Yes with Stock" &&
      max0 === "Yes"
    ) {

      action += " | Remove max";

    }

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
