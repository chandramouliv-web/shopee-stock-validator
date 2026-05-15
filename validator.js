// =========================
// validator.js
// =========================

function clean(value) {

  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");

}

function num(value) {

  return Number(value) || 0;

}

function findKey(row, possibleKeys) {

  const keys = Object.keys(row);

  for (let key of keys) {

    const normalized =
      clean(key).toLowerCase();

    for (let p of possibleKeys) {

      if (
        normalized ===
        p.toLowerCase()
      ) {

        return key;

      }

    }

  }

  return null;

}

function runValidation(
  mpData,
  basicData,
  contentData,
  tcData,
  zecomData,
  allData
) {

  // =========================
  // REGION SELECTION
  // =========================

  const region =
    document.getElementById(
      "regionSelect"
    )?.value || "MY";

  // =========================
  // HEADER DETECTION
  // =========================

  const mpRow = mpData[0];
  const basicRow = basicData[0];
  const contentRow = contentData[0];
  const tcRow = tcData[0];
  const zecomRow = zecomData[0];
  const allRow = allData[0];

  // =========================
  // MP FILE
  // =========================

  const mpSkuKey =
    findKey(mpRow, [
      "SKU",
      "Seller SKU"
    ]);

  const mpProductKey =
    findKey(mpRow, [
      "Product ID",
      "productId"
    ]);

  const mpStockKey =
    findKey(mpRow, [
      "Stock",
      "MP Stock",
      "In stock"
    ]);

  // =========================
  // BASIC INFO FILE
  // =========================

  const basicProductKey =
    findKey(basicRow, [
      "Product ID",
      "productId"
    ]);

  // =========================
  // CONTENT FILE
  // =========================

  const contentSkuKey =
    findKey(contentRow, [
      "SKU",
      "Seller SKU"
    ]);

  const articleKey =
    findKey(contentRow, [
      "Article No"
    ]);

  // =========================
  // zECOM FILE
  // =========================

  const zecomArticleKey =
    findKey(zecomRow, [
      "Article No"
    ]);

  const shopeeKey =
    findKey(zecomRow, [
      "Shopee"
    ]);

  // =========================
  // TC FILE
  // =========================

  const tcSkuKey =
    findKey(tcRow, [
      "SKU",
      "Seller SKU"
    ]);

  const tcStatusKey =
    findKey(tcRow, [
      "Item status"
    ]);

  // =========================
  // ALL FILE
  // =========================

  const allSkuKey =
    findKey(allRow, [
      "sellerSKU"
    ]);

  // REGION STOCK COLUMN
  let stockColumn = "";

  if (region === "MY") {

    stockColumn =
      "MyStock-YCH-MY quantity";

  } else if (region === "SG") {

    stockColumn =
      "MyStock-YCH-SG quantity";

  } else {

    stockColumn =
      "MyStock-PH quantity";

  }

  const allStockKey =
    findKey(allRow, [
      stockColumn
    ]);

  const allReservedKey =
    findKey(allRow, [
      "reservedQuantity",
      "Reserved Stock",
      "MyStock-YCH-MY reservedQuantity",
      "MyStock-YCH-SG reservedQuantity",
      "MyStock-PH reservedQuantity"
    ]);

  // =========================
  // ACTIVE PRODUCT MAP
  // =========================

  const activeProductMap = {};

  for (let r of basicData) {

    const productId =
      clean(r[basicProductKey]);

    activeProductMap[productId] =
      true;

  }

  // =========================
  // MAPPING
  // =========================

  const articleMap = {};
  const ecomMap = {};
  const tcMap = {};
  const stockMap = {};

  // CONTENT

  for (let r of contentData) {

    const sellerSku =
      clean(r[contentSkuKey]);

    articleMap[sellerSku] =
      clean(r[articleKey]);

  }

  // zECOM

  for (let r of zecomData) {

    const articleNo =
      clean(r[zecomArticleKey]);

    const shopee =
      clean(r[shopeeKey]);

    ecomMap[articleNo] =
      shopee;

  }

  // TC

  for (let r of tcData) {

    const sellerSku =
      clean(r[tcSkuKey]);

    tcMap[sellerSku] = {

      tcStatus:
        clean(r[tcStatusKey]) ===
        "ACTIVE"
        ? "Active"
        : "Inactive"

    };

  }

  // STOCK

  for (let r of allData) {

    const sellerSku =
      clean(r[allSkuKey]);

    stockMap[sellerSku] = {

      tcStock:
        num(r[allStockKey]),

      reservedStock:
        num(r[allReservedKey])

    };

  }

  // =========================
  // OUTPUT
  // =========================

  const output = [];

  for (let r of mpData) {

    const sellerSku =
      clean(r[mpSkuKey]);

    const productId =
      clean(r[mpProductKey]);

    // =========================
    // MP STATUS
    // =========================

    const mpStatus =
      activeProductMap[productId]
      ? "Active"
      : "Inactive";

    // =========================
    // MP STOCK
    // =========================

    const mpStock =
      num(r[mpStockKey]);

    // =========================
    // TC STATUS
    // =========================

    const tcStatus =
      tcMap[sellerSku]?.tcStatus ||
      "Inactive";

    // =========================
    // TC STOCK
    // =========================

    const tcStock =
      stockMap[sellerSku]
        ?.tcStock || 0;

    const reservedStock =
      stockMap[sellerSku]
        ?.reservedStock || 0;

    // =========================
    // ECOM STATUS
    // =========================

    const articleNo =
      articleMap[sellerSku];

    const ecomValue =
      clean(
        ecomMap[articleNo]
      ).toUpperCase();

    let ecomStatus =
      "Inactive";

    if (
      ecomValue === "YES"
    ) {

      ecomStatus = "Active";

    }

    // =========================
    // FINAL STATUS
    // =========================

    let finalStatus = "";
    let remarks = "";

    if (
      ecomStatus === "Inactive"
    ) {

      finalStatus =
        "Inactive";

      remarks =
        "Due to Ecom No";

    }

    else if (
      ecomStatus === "Active" &&
      tcStock <= 0
    ) {

      finalStatus =
        "Inactive";

      remarks =
        "Due to 0 Stock";

    }

    else if (
      ecomStatus === "Active" &&
      tcStock > 0
    ) {

      finalStatus =
        "Active";

      remarks =
        "Ecom Yes with Stock";

    }

    // =========================
    // CHECKS
    // =========================

    const finalCheck =
      (
        mpStatus ===
        finalStatus
      )
      ? "True"
      : "False";

    const stockCheck =
      (
        mpStock ===
        tcStock
      )
      ? "True"
      : "False";

    // =========================
    // ACTION
    // =========================

    let action =
      "All Good";

    if (
      finalCheck === "False"
    ) {

      action =
        "Update status to " +
        finalStatus;

    }

    if (
      stockCheck === "False"
    ) {

      action +=
        " | Push Stock Update";

    }

    // =========================
    // OUTPUT PUSH
    // =========================

    output.push({

      "Seller SKU":
        sellerSku,

      "Product ID":
        productId,

      "MP Status":
        mpStatus,

      "MP Stock":
        mpStock,

      "TC Status":
        tcStatus,

      "TC Stock":
        tcStock,

      "Reserved Stock":
        reservedStock,

      "Ecom Status":
        ecomStatus,

      "Final Status":
        finalStatus,

      "Remarks":
        remarks,

      "Final Check":
        finalCheck,

      "Stock Check":
        stockCheck,

      "Action":
        action

    });

  }

  return output;

}
