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

  const mpRow = mpData[0];
  const basicRow = basicData[0];
  const contentRow = contentData[0];
  const tcRow = tcData[0];
  const zecomRow = zecomData[0];
  const allRow = allData[0];

  const mpSkuKey =
    findKey(mpRow, [
      "SKU",
      "Seller SKU"
    ]);

  const mpProductKey =
    findKey(mpRow, [
      "productId",
      "Product ID"
    ]);

  const mpStockKey =
    findKey(mpRow, [
      "In stock",
      "MP Stock"
    ]);

  const basicProductKey =
    findKey(basicRow, [
      "Product ID",
      "productId"
    ]);

  const contentSkuKey =
    findKey(contentRow, [
      "SKU",
      "Seller SKU"
    ]);

  const articleKey =
    findKey(contentRow, [
      "Article No"
    ]);

  const zecomArticleKey =
    findKey(zecomRow, [
      "Article No"
    ]);

  const ecomKey =
    findKey(zecomRow, [
      "e-com"
    ]);

  const tcSkuKey =
    findKey(tcRow, [
      "SKU",
      "Seller SKU"
    ]);

  const tcStatusKey =
    findKey(tcRow, [
      "Item status"
    ]);

  const tcMaxKey =
    findKey(tcRow, [
      "Max Quantity"
    ]);

  const allSkuKey =
    findKey(allRow, [
      "sellerSKU"
    ]);

  const allStockKey =
    findKey(allRow, [
      "MyStock-YCH-MY quantity"
    ]);

  const allReservedKey =
    findKey(allRow, [
      "MyStock-YCH-MY reservedQuantity"
    ]);

  const activeProductMap = {};

  for (let r of basicData) {

    const productId =
      clean(r[basicProductKey]);

    activeProductMap[productId] =
      true;

  }

  const articleMap = {};
  const ecomMap = {};
  const tcMap = {};
  const stockMap = {};

  for (let r of contentData) {

    const sellerSku =
      clean(r[contentSkuKey]);

    articleMap[sellerSku] =
      clean(r[articleKey]);

  }

  for (let r of zecomData) {

    const articleNo =
      clean(r[zecomArticleKey]);

    ecomMap[articleNo] =
      clean(r[ecomKey]);

  }

  for (let r of tcData) {

    const sellerSku =
      clean(r[tcSkuKey]);

    tcMap[sellerSku] = {

      tcStatus:
        clean(r[tcStatusKey]) ===
        "ACTIVE"
        ? "Active"
        : "Inactive",

      max0:
        num(r[tcMaxKey]) <= 0
        ? "Yes"
        : "No"

    };

  }

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

  const productStockMap = {};
  const dualStatusMap = {};

  for (let r of mpData) {

    const sellerSku =
      clean(r[mpSkuKey]);

    const productId =
      clean(r[mpProductKey]);

    const tcStock =
      stockMap[sellerSku]?.tcStock || 0;

    if (!productStockMap[productId]) {

      productStockMap[productId] = 0;

    }

    productStockMap[productId] +=
      tcStock;

    const articleNo =
      articleMap[sellerSku];

    const ecom =
      ecomMap[articleNo];

    if (!dualStatusMap[productId]) {

      dualStatusMap[productId] =
        new Set();

    }

    dualStatusMap[productId]
      .add(ecom);

  }

  const output = [];

  for (let r of mpData) {

    const sellerSku =
      clean(r[mpSkuKey]);

    const productId =
      clean(r[mpProductKey]);

    const mpStatus =
      activeProductMap[productId]
      ? "Active"
      : "Inactive";

    const mpStock =
      num(r[mpStockKey]);

    const tcStatus =
      tcMap[sellerSku]?.tcStatus ||
      "Inactive";

    const tcStock =
      stockMap[sellerSku]?.tcStock ||
      0;

    const reservedStock =
      stockMap[sellerSku]
        ?.reservedStock || 0;

    const articleNo =
      articleMap[sellerSku];

    const ecom =
      ecomMap[articleNo];

    const ecomStatus =
      ecom === "Yes"
      ? "Active"
      : "Inactive";

    const dualStatus =
      dualStatusMap[productId]
        ?.size >= 2
      ? 2
      : 1;

    const consolidatedStock =
      productStockMap[productId] || 0;

    let finalStatus = "";
    let remarks = "";

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

    const finalCheck =
      (mpStatus === tcStatus &&
       tcStatus === finalStatus)
      ? "True"
      : "False";

    const stockCheck =
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

  }

  return output;

}
