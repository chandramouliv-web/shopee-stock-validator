// ============================================
// validator.js
// COMPLETE FINAL WORKING VERSION
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

  const mpRow = mpData[0];
  const basicRow = basicData[0];
  const contentRow = contentData[0];
  const tcRow = tcData[0];
  const zecomRow = zecomData[0];
  const allRow = allData[0];

  // ============================================
  // MP FILE KEYS
  // ============================================

  const mpSkuKey =
    findKey(mpRow, [

      "SKU",
      "Seller SKU",
      "seller_sku"

    ]);

  const mpProductKey =
    findKey(mpRow, [

      "Product ID",
      "productId",
      "item_id"

    ]);

  const mpStockKey =
    findKey(mpRow, [

      "Stock",
      "MP Stock",
      "In stock"

    ]);

  // ============================================
  // BASIC INFO FILE KEYS
  // ============================================

  const basicProductKey =
    findKey(basicRow, [

      "Product ID",
      "productId",
      "ProductId",
      "Item ID",
      "item_id",
      "model_id"

    ]);

  console.log(
    "Basic Product Column:",
    basicProductKey
  );

  // ============================================
  // CONTENT FILE KEYS
  // ============================================

  const contentSkuKey =
    findKey(contentRow, [

      "SKU",
      "Seller SKU",
      "seller_sku"

    ]);

  const articleKey =
    findKey(contentRow, [

      "Article No",
      "Article"

    ]);

  // ============================================
  // ZECOM FILE KEYS
  // ============================================

  const zecomArticleKey =
    findKey(zecomRow, [

      "Article No",
      "Article"

    ]);

  const shopeeKey =
    findKey(zecomRow, [

      "Shopee"

    ]);

  // ============================================
  // TC FILE KEYS
  // ============================================

  const tcSkuKey =
    findKey(tcRow, [

      "SKU",
      "Seller SKU",
      "seller_sku"

    ]);

  const tcStatusKey =
    findKey(tcRow, [

      "Item status",
      "Status"

    ]);

  // ============================================
  // ALL FILE KEYS
  // ============================================

  const allSkuKey =
    findKey(allRow, [

      "sellerSKU",
      "Seller SKU",
      "SKU"

    ]);

  // ============================================
  // REGION STOCK COLUMN
  // ============================================

  let regionStockColumn = "";

  if (region === "MY") {

    regionStockColumn =
      "MyStock-YCH-MY quantity";

  }

  else if (region === "SG") {

    regionStockColumn =
      "MyStock-YCH-SG quantity";

  }

  else if (region === "PH") {

    regionStockColumn =
      "MyStock-PH quantity";

  }

  console.log(
    "Selected Region:",
    region
  );

  console.log(
    "Region Stock Column:",
    regionStockColumn
  );

  // ============================================
  // STOCK COLUMN
  // ============================================

  const allStockKey =
    findKey(allRow, [

      regionStockColumn

    ]);

  const allReservedKey =
    findKey(allRow, [

      "reservedQuantity",
      "Reserved Stock",
      "MyStock-YCH-MY reservedQuantity",
      "MyStock-YCH-SG reservedQuantity",
      "MyStock-PH reservedQuantity"

    ]);

  console.log(
    "Stock Column Found:",
    allStockKey
  );

  // ============================================
  // ACTIVE PRODUCT MAP
  // ============================================

  const activeProductMap = {};

  for (let r of basicData) {

    const productId =
      clean(
        r[basicProductKey]
      );

    if (
      productId &&
      productId !== ""
    ) {

      activeProductMap[
        clean(productId)
      ] = true;

    }

  }

  console.log(
    "Active Product Count:",
    Object.keys(
      activeProductMap
    ).length
  );

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

  // ============================================
  // ZECOM MAP
  // ============================================

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

  // ============================================
  // TC MAP
  // ============================================

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

  // ============================================
  // STOCK MAP
  // ============================================

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

  // ============================================
  // OUTPUT
  // ============================================

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

    // ============================================
    // MP STATUS
    // ============================================

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

    // ============================================
    // MP STOCK
    // ============================================

    const mpStock =
      num(
        r[mpStockKey]
      );

    // ============================================
    // TC STATUS
    // ============================================

    const tcStatus =
      tcMap[
        sellerSku
      ]?.tcStatus
      || "Inactive";

    // ============================================
    // TC STOCK
    // ============================================

    const tcStock =
      stockMap[
        sellerSku
      ]?.tcStock || 0;

    const reservedStock =
      stockMap[
        sellerSku
      ]?.reservedStock || 0;

    // ============================================
    // ECOM STATUS
    // ============================================

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
      ecomValue === "YES"
    ) {

      ecomStatus =
        "Active";

    }

    // ============================================
    // FINAL STATUS
    // ============================================

    let finalStatus = "";
    let remarks = "";

    // ECOM INACTIVE

    if (
      ecomStatus ===
      "Inactive"
    ) {

      finalStatus =
        "Inactive";

      remarks =
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

      remarks =
        "Due to 0 Stock";

    }

    // ACTIVE

    else {

      finalStatus =
        "Active";

      remarks =
        "Ecom Yes with Stock";

    }

    // ============================================
    // CHECKS
    // ============================================

    const finalCheck =

      mpStatus === finalStatus
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

    // STATUS UPDATE

    if (
      finalCheck ===
      "False"
    ) {

      action =
        "Update status to "
        + finalStatus;

    }

    // STOCK UPDATE

    if (
      stockCheck ===
      "False"
    ) {

      action +=
        " | Push Stock Update";

    }

    // PUSH 0 STOCK

    if (
      tcStock <= 0
      &&
      mpStock > 0
    ) {

      action +=
        " | Push 0 Stock";

    }

    // ============================================
    // OUTPUT
    // ============================================

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

  console.log(
    "Output Count:",
    output.length
  );

  return output;

}
