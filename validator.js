function runValidation(mpData, contentData, tcData, zecomData, allData) {

  let articleMap = {};
  let ecomMap = {};
  let tcMap = {};
  let stockMap = {};

  contentData.forEach(r => {
    articleMap[r["SKU"]] = r["Article No"];
  });

  zecomData.forEach(r => {
    ecomMap[r["Article No"]] = r["e-com"];
  });

  tcData.forEach(r => {

    tcMap[r["Seller SKU"]] = {
      tcStatus: r["TC Status"],
      max0: r["Max 0"]
    };

  });

  allData.forEach(r => {

    stockMap[r["Seller SKU"]] = {
      tcStock: Number(r["TC Stock"]) || 0,
      reservedStock: Number(r["Reserved Stock"]) || 0
    };

  });

  let productStockMap = {};
  let dualStatusMap = {};

  mpData.forEach(r => {

    let sellerSku = r["Seller SKU"];
    let productId = r["Product ID"];

    let tcStock = stockMap[sellerSku]?.tcStock || 0;

    if (!productStockMap[productId]) {
      productStockMap[productId] = 0;
    }

    productStockMap[productId] += tcStock;

    let articleNo = articleMap[sellerSku];
    let ecom = ecomMap[articleNo];

    if (!dualStatusMap[productId]) {
      dualStatusMap[productId] = new Set();
    }

    dualStatusMap[productId].add(ecom);

  });

  let output = [];

  mpData.forEach(r => {

    let sellerSku = r["Seller SKU"];
    let productId = r["Product ID"];

    let mpStatus = r["MP Status"];
    let mpStock = Number(r["MP Stock"]) || 0;

    let tcStatus = tcMap[sellerSku]?.tcStatus || "Inactive";
    let max0 = tcMap[sellerSku]?.max0 || "No";

    let tcStock = stockMap[sellerSku]?.tcStock || 0;
    let reservedStock = stockMap[sellerSku]?.reservedStock || 0;

    let articleNo = articleMap[sellerSku];
    let ecom = ecomMap[articleNo];

    let ecomStatus = ecom === "Yes"
      ? "Active"
      : "Inactive";

    let dualStatus =
      dualStatusMap[productId].size >= 2 ? 2 : 1;

    let consolidatedStock =
      productStockMap[productId];

    let finalStatus = "";
    let remarks = "";

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

    } else {

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

    let finalCheck =
      (mpStatus === tcStatus &&
       tcStatus === finalStatus)
      ? "True"
      : "False";

    let stockCheck =
      (mpStock === tcStock)
      ? "True"
      : "False";

    let action = "";

    if (finalCheck === "False") {

      action = `Update status to ${finalStatus}`;

    } else if (
      finalCheck === "True" &&
      stockCheck === "False"
    ) {

      if (
        finalStatus === "Active" &&
        remarks === "Ecom Yes with Stock" &&
        reservedStock !== 0
      ) {

        action = "Due to Reserved Stock";

      } else if (
        finalStatus === "Active" &&
        remarks === "Ecom Yes with Stock" &&
        reservedStock === 0
      ) {

        action = "Make Impact";

      } else if (
        finalStatus === "Active" &&
        remarks === "Set max"
      ) {

        action = "Set max product";

      } else {

        action = "Stock not pushed due to Inactive Status";
      }

    } else {

      action = "All Good";

    }

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

    if (remarks === "Due to 0 Stock") {

      if (
        ecom === "Yes" &&
        max0 === "Yes"
      ) {

        action += " | Remove max";

      } else if (
        (ecom === "No" || ecom == null) &&
        max0 === "No"
      ) {

        action += " | Set max";

      }

    }

    if (
      tcStock <= 0 &&
      mpStock > 0
    ) {

      action += " | Push 0 stock update";

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

  return output;

}
