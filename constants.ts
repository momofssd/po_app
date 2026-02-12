
export const PO_PROMPT = `
You are analyzing a purchase order document. If the document includes multiple lines with repeated quantities, material numbers, and different delivery dates, treat each line as a separate purchase order line.
Each line must be extracted and output as a separate flat JSON object in a JSON array.

Each object in the array must include the following fields, even if repeated:
  • Customer Name (key: customerName)
  • Purchase Order Number (key: purchaseOrderNumber) If a trailing revision appears after a space exclude everything after the space.
  • Required Delivery Date (key: requiredDeliveryDate) - MUST be in ISO 8601 format (YYYY-MM-DD)
  • Material Number (key: materialNumber) - Extract the item identifier. Look for labels such as 'Item Number', 'Our Ref', 'Material Number', 'Part Number', 'Reference Number', 'SKU', or 'Part 
    EVER return values associated with: 'Vendor', 'Description', 'Invoice', 'Billing', 'Remit To', 'PO Box', or labels like 'Mailing Ref', 'Your material number', 'Your reference'.
    
  • Order Quantity (key: orderQuantity)
  • Unit of Measure (key: unitOfMeasure)
  • Delivery Address (key: deliveryAddress)

Important Rules:
1. DO NOT group multiple items into one object.
2. DO NOT use nested objects.
3. Delivery Address must be a single line with no line breaks.
4. If the document contains 14 such line items, return an array of 14 flat JSON objects.
5. Output only valid JSON.
`;