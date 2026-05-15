// ============================================
// validator.js
// COMPLETE FINAL VERSION
// ============================================

function clean(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }

  return String(value)
    .trim()
    .replace(/\.0$/, "")
    .replace(/\s+/g, "")
    .toUpperCase();

}

function num(value) {

  const n =
    Number(value);

  return isNaN(n)
    ? 0
    : n;

}

function findKey(
  row,
  possibleKeys
) {

  if (!row) return null;

  const keys =
    Object.keys(row);

  for (let key of keys) {

    const normalized =
      clean(key);

    for (let p of possibleKeys) {

      if (
        normalized ===
        clean(p)
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

  // ============================================
  // REGION
  // ============================================

  const region =
    document.getElementById(
      "regionSelect"
    )?.value || "MY";

  // ============================================
  // SAMPLE ROWS
  // ============================================

  const mpRow =
    mpData[0];

  const contentRow =
    contentData[0];

  const tcRow =
    tcData[0];

  const zecomRow =
    zecomData[0];

  const allRow =
    allData[0];

  // ============================================
  // MP FILE
  // ============================================

  const mpSkuKey =
    findKey(mpRow, [
      "SKU",
      "Seller SKU"
    ]);

  const mpStatusKey =
    findKey(mpRow, [
      "Status"
    ]);

  const mpStockKey =
    findKey(mpRow, [
      "Stock"
    ]);

  // ============================================
  // CONTENT FILE
  // ============================================

  const contentSkuKey =
    findKey(contentRow, [
      "Seller SKU",
      "SKU"
    ]);

  const articleKey =
    findKey(contentRow, [
      "Article No",
      "Article"
    ]);

  // ============================================
  // TC FILE
  // ============================================

  const tcSkuKey =
    findKey(tcRow, [
      "SKU",
      "Seller SKU"
    ]);

  const tcStatusKey =
    findKey(tcRow, [
      "Status",
      "Item status"
    ]);

  const tcMax0Key =
    findKey(tcRow, [
      "Max 0",
      "Max0"
    ]);

  // ============================================
  // ZECOM FILE
  // ============================================

  const zecomArticleKey =
    findKey(zecomRow, [

      "Style#",
      "Style #",
      "Style",
      "Article No"

    ]);

  const shopeeKey =
    findKey(zecomRow, [
      "Shopee"
    ]);

  // ============================================
  // ALL FILE
  // ============================================

  const allSkuKey =
    findKey(allRow, [
      "sellerSKU",
      "SKU"
    ]);

  let stockColumn = "";
  let reservedColumn = "";

  // ============================================
  // REGION STOCK
  // ============================================

  if (region === "MY") {

    stockColumn =
      "MyStock-YCH-MY quantity";

    reservedColumn =
      "MyStock-YCH-MY reservedQuantity";

  }

  else if (
    region === "SG"
  ) {

    stockColumn =
      "MyStock-YCH-SG quantity";

    reservedColumn =
      "MyStock-YCH-SG reservedQuantity";

  }

  else {

    stockColumn =
      "MyStock-PH quantity";

    reservedColumn =
      "MyStock-PH reservedQuantity";

  }

  const allStockKey =
    findKey(allRow, [
      stockColumn
    ]);

  const allReservedKey =
    findKey(allRow, [
      reservedColumn
    ]);

  // ============================================
  // MAPS
  // ============================================

  const articleMap = {};
  const ecomMap = {};
  const tcMap = {};
  const stockMap = {};

  // ============================================
  // CONTENT MAP
  // ============================================

  for (let r of contentData) {

    const sku =
      clean(
        r[contentSkuKey]
      );

    const article =
      clean(
        r[articleKey]
      )
      .replace(/-/g, "")
      .replace(/\s/g, "");

    articleMap[
      sku
    ] = article;

  }

  // ============================================
  // ZECOM MAP
  // ============================================

  for (let r of zecomData) {

    const article =
      clean(
        r[zecomArticleKey]
      )
      .replace(/-/g, "")
      .replace(/\s/g, "");

    const shopee =
      clean(
        r[shopeeKey]
      );

    ecomMap[
      article
    ] = shopee;

  }

  // ============================================
  // TC MAP
  // ============================================

  for (let r of tcData) {

    const sku =
      clean(
        r[tcSkuKey]
      );

    tcMap[
      sku
    ] = {

      tcStatus:
        clean(
          r[tcStatusKey]
        ),

      max0:
        clean(
          r[tcMax0Key]
        )

    };

  }

  // ============================================
  // STOCK MAP
  // ============================================

  for (let r of allData) {

    const sku =
      clean(
        r[allSkuKey]
      );

    stockMap[
      sku
    ] = {

      tcStock:
        num(
          r[allStockKey]
        ),

      reservedStock:
        num(
          r[allReservedKey]
        )

    };

  }

  // ============================================
  // OUTPUT
  // ============================================

  const output = [];

  for (
    let i = 0;
    i < mpData.length;
    i++
  ) {

    const r =
      mpData[i];

    const sku =
      clean(
        r[mpSkuKey]
      );

    // ============================================
    // MP
    // ============================================

    const mpStatus =
      clean(
        r[mpStatusKey]
      );

    const mpStock =
      num(
        r[mpStockKey]
      );

    // ============================================
    // TC
    // ============================================

    const tcStatus =
      clean(
        tcMap[sku]
          ?.tcStatus
      ) || "INACTIVE";

    const max0 =
      clean(
        tcMap[sku]
          ?.max0
      ) || "NO";

    // ============================================
    // STOCK
    // ============================================

    const tcStock =
      stockMap[sku]
        ?.tcStock || 0;

    const reservedStock =
      stockMap[sku]
        ?.reservedStock || 0;

    // ============================================
    // ECOM
    // ============================================

    const article =
      articleMap[sku];

    const ecom =
      clean(
        ecomMap[
          article
        ]
      );

    let ecomStatus =
      "Inactive";

    if (
      ecom === "YES"
    ) {

      ecomStatus =
        "Active";

    }

    // ============================================
    // FINAL STATUS
    // ============================================

    let finalStatus =
      "Inactive";

    let comments =
      "";

    // ECOM NO

    if (
      ecomStatus ===
      "Inactive"
    ) {

      finalStatus =
        "Inactive";

      comments =
        "Due to Ecom No";

    }

    // 0 STOCK

    else if (
      ecomStatus ===
      "Active"
      &&
      tcStock <= 0
    ) {

      finalStatus =
        "Inactive";

      comments =
        "Due to 0 Stock";

    }

    // ACTIVE

    else if (
      ecomStatus ===
      "Active"
      &&
      tcStock > 0
    ) {

      finalStatus =
        "Active";

      comments =
        "Ecom Yes with Stock";

    }

    // ============================================
    // CHECKS
    // ============================================

    const finalCheck =

      clean(mpStatus) ===
      clean(tcStatus)
      &&
      clean(tcStatus) ===
      clean(finalStatus)

      ? "True"
      : "False";

    const stockCheck =

      mpStock === tcStock
      ? "True"
      : "False";

    // ============================================
    // ACTION
    // ============================================

    let action =
      "All Good";

    // ============================================
    // FINAL CHECK FALSE
    // ============================================

    if (
      finalCheck ===
      "False"
    ) {

      if (
        ecomStatus ===
        "Active"
      ) {

        action =
          "Change to Active";

      }

      else {

        action =
          "Change to Inactive";

      }

    }

    // ============================================
    // STOCK CHECK FALSE
    // ============================================

    else if (
      finalCheck ===
      "True"
      &&
      stockCheck ===
      "False"
    ) {

      // ACTIVE + RESERVED

      if (
        finalStatus ===
        "Active"
        &&
        reservedStock > 0
      ) {

        action =
          "Due to Reserved Stock";

      }

      // ACTIVE + NO RESERVED

      else if (
        finalStatus ===
        "Active"
        &&
        reservedStock === 0
      ) {

        action =
          "Make Impact";

      }

      // INACTIVE

      else {

        action =
          "Stock not pushed due to Inactive Status";

      }

    }

    // ============================================
    // MAX 0 LOGIC
    // ============================================

    // SET MAX 0

    if (
      comments ===
      "Due to Ecom No"
      &&
      max0 === "NO"
    ) {

      action +=
        " | Set max 0";

    }

    // REMOVE MAX

    if (
      (
        comments ===
        "Due to 0 Stock"
        ||
        comments ===
        "Ecom Yes with Stock"
      )
      &&
      max0 === "YES"
    ) {

      action +=
        " | Remove max";

    }

    // ============================================
    // PUSH 0 STOCK
    // ============================================

    if (
      (
        tcStock <= 0
        ||
        tcStock === "N/A"
      )
      &&
      mpStock > 0
    ) {

      action +=
        " | Push 0 stock update";

    }

    // ============================================
    // OUTPUT
    // ============================================

    output.push({

      "SKU":
        sku,

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

      "Max 0":
        max0,

      "Ecom Status":
        ecomStatus,

      "Final Status":
        finalStatus,

      "Comments":
        comments,

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
