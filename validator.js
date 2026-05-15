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

  return Number(value) || 0;

}

function findKey(row, possibleKeys) {

  if (!row) return null;

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

  const region =
    document.getElementById(
      "regionSelect"
    )?.value || "MY";

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
      "SKU"
    ]);

  const mpProductKey =
    findKey(mpRow, [
      "Product ID",
      "item_id"
    ]);

  const mpStockKey =
    findKey(mpRow, [
      "Stock"
    ]);

  // =========================
  // BASIC INFO
  // =========================

  const basicProductKey =
    findKey(basicRow, [
      "Product ID",
      "item_id",
      "Item ID"
    ]);

  // =========================
  // CONTENT
  // =========================

  const contentSkuKey =
    findKey(contentRow, [
      "Seller SKU",
      "SKU"
    ]);

  const articleKey =
    findKey(contentRow, [
      "Article No"
    ]);

  // =========================
  // ZECOM
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
  // TC
  // =========================

  const tcSkuKey =
    findKey(tcRow, [
      "SKU"
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

  let regionStockColumn = "";

  if (region === "MY") {

    regionStockColumn =
      "MyStock-YCH-MY quantity";

  }

  else if (region === "SG") {

    regionStockColumn =
      "MyStock-YCH-SG quantity";

  }

  else {

    regionStockColumn =
      "MyStock-PH quantity";

  }

  const allStockKey =
    findKey(allRow, [
      regionStockColumn
    ]);

  const allReservedKey =
    findKey(allRow, [
      "MyStock-YCH-MY reservedQuantity",
      "MyStock-YCH-SG reservedQuantity",
      "MyStock-PH reservedQuantity"
    ]);

  // =========================
  // ACTIVE PRODUCTS
  // =========================

  const activeProductMap = {};

  for (let r of basicData) {

    const productId =
      clean(
        r[basicProductKey]
      );

    if (productId) {

      activeProductMap[
        clean(productId)
      ] = true;

    }

  }

  // =========================
  // MAPS
  // =========================

  const articleMap = {};
  const ecomMap = {};
  const tcMap = {};
  const stockMap = {};

  // CONTENT

  for (let r of contentData) {

    const sellerSku =
      clean(
        r[contentSkuKey]
      );

    const articleNo =
      clean(
        r[articleKey]
      );

    articleMap[
      sellerSku
    ] = articleNo;

  }

  // ZECOM

  for (let r of zecomData) {

    const articleNo =
      clean(
        r[zecomArticleKey]
      );

    const shopee =
      clean(
        r[shopeeKey]
      );

    ecomMap[
      articleNo
    ] = shopee;

  }

  // TC

  for (let r of tcData) {

    const sellerSku =
      clean(
        r[tcSkuKey]
      );

    const status =
      clean(
        r[tcStatusKey]
      );

    tcMap[
      sellerSku
    ] = {

      tcStatus:
        status === "ACTIVE"
        ? "Active"
        : "Inactive"

    };

  }

  // STOCK

  for (let r of allData) {

    const sellerSku =
      clean(
        r[allSkuKey]
      );

    stockMap[
      sellerSku
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

  // =========================
  // OUTPUT
  // =========================

  const output = [];

  for (let r of mpData) {

    const sellerSku =
      clean(
        r[mpSkuKey]
      );

    const productId =
      clean(
        r[mpProductKey]
      );

    // =========================
    // MP STATUS
    // =========================

    let mpStatus =
      "Inactive";

    if (
      activeProductMap[
        clean(productId)
      ]
    ) {

      mpStatus =
        "Active";

    }

    // =========================
    // MP STOCK
    // =========================

    const mpStock =
      num(
        r[mpStockKey]
      );

    // =========================
    // TC STATUS
    // =========================

    const tcStatus =
      tcMap[
        sellerSku
      ]?.tcStatus
      || "Inactive";

    // =========================
    // TC STOCK
    // =========================

    const tcStock =
      stockMap[
        sellerSku
      ]?.tcStock || 0;

    const reservedStock =
      stockMap[
        sellerSku
      ]?.reservedStock || 0;

    // =========================
    // ECOM STATUS
    // =========================

    const articleNo =
      articleMap[
        sellerSku
      ];

    const ecomValue =
      clean(
        ecomMap[
          articleNo
        ]
      );

    let ecomStatus =
      "Inactive";

    if (
      ecomValue ===
      "YES"
    ) {

      ecomStatus =
        "Active";

    }

    // =========================
    // FINAL STATUS
    // =========================

    let finalStatus = "";
    let remarks = "";

    if (
      ecomStatus ===
      "Inactive"
    ) {

      finalStatus =
        "Inactive";

      remarks =
        "Due to Ecom No";

    }

    else if (
      ecomStatus ===
      "Active"
      &&
      tcStock <= 0
    ) {

      finalStatus =
        "Inactive";

      remarks =
        "Due to 0 Stock";

    }

    else {

      finalStatus =
        "Active";

      remarks =
        "Ecom Yes with Stock";

    }

    // =========================
    // CHECKS
    // =========================

    const finalCheck =

      mpStatus === finalStatus
      ? "True"
      : "False";

    const stockCheck =

      mpStock === tcStock
      ? "True"
      : "False";

    // =========================
    // ACTION
    // =========================

    let action =
      "All Good";

    if (
      finalCheck ===
      "False"
    ) {

      action =
        "Update status to "
        + finalStatus;

    }

    if (
      stockCheck ===
      "False"
    ) {

      action +=
        " | Push Stock Update";

    }

    if (
      tcStock <= 0
      &&
      mpStock > 0
    ) {

      action +=
        " | Push 0 Stock";

    }

    // =========================
    // OUTPUT
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
