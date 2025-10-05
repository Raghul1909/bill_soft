/**
 * Renders bill summary HTML including biller, customer, and items.
 * @param {Object} biller - Biller details object
 * @param {Object} customer - Customer details object
 * @param {Array} items - Array of bill items
 * @param {Object} bill - Bill details object (total, totalTax, finalAmount, date, customerId)
 * @returns {string} - HTML string for bill summary
 */
function renderBillSummary(biller, customer, items, bill) {
  let billerHtml = '';
  if (biller && biller.companyName) {
    billerHtml += `<div style="margin-bottom:10px;">`;
    if (biller.logo) {
      billerHtml += `<img src="${biller.logo}" alt="Logo" style="max-width:80px;max-height:80px;float:right;">`;
    }
    billerHtml += `<strong>${biller.companyName}</strong><br>`;
    billerHtml += biller.gstNumber ? `GST No: ${biller.gstNumber}<br>` : '';
    billerHtml += biller.hsnNumber ? `HSN No: ${biller.hsnNumber}<br>` : '';
    billerHtml += `</div>`;
  }

  let itemsHtml = `<table style="width:100%;border-collapse:collapse;margin-bottom:10px;">
    <thead>
      <tr>
        <th style="border-bottom:1px solid #000;text-align:left;">Name</th>
        <th style="border-bottom:1px solid #000;text-align:right;">Qty</th>
        <th style="border-bottom:1px solid #000;text-align:right;">Tax %</th>
        <th style="border-bottom:1px solid #000;text-align:right;">Price</th>
        <th style="border-bottom:1px solid #000;text-align:right;">Item Total</th>
        <th style="border-bottom:1px solid #000;text-align:right;">Item Tax</th>
      </tr>
    </thead>
    <tbody>`;
  items.forEach(item => {
    itemsHtml += `<tr>
      <td>${item.pname}</td>
      <td style="text-align:right;">${item.qty}</td>
      <td style="text-align:right;">${item.taxPercent}%</td>
      <td style="text-align:right;">₹${item.price}</td>
      <td style="text-align:right;">₹${item.itemTotal.toFixed(2)}</td>
      <td style="text-align:right;">₹${item.itemTax.toFixed(2)}</td>
    </tr>`;
  });
  itemsHtml += `</tbody></table>`;

  // Safely handle null/undefined values for totals
  const total = (bill.total !== undefined && bill.total !== null) ? bill.total : 0;
  const totalTax = (bill.totalTax !== undefined && bill.totalTax !== null) ? bill.totalTax : 0;
  const finalAmount = (bill.finalAmount !== undefined && bill.finalAmount !== null) ? bill.finalAmount : 0;

  return `
    ${billerHtml}
    <strong>Bill Number:</strong> ${bill.customerId ? (bill.customerId + 10000) : ''}<br>
    <strong>Date:</strong> ${bill.date ? new Date(bill.date).toLocaleString() : new Date().toLocaleString()}<br>
    <strong>Customer:</strong> ${customer.name}<br>
    <strong>Phone:</strong> ${customer.phone}<br>
    <strong>GST:</strong> ${customer.gst}<br>
    <strong>Address:</strong> ${customer.address}<br>
    ${itemsHtml}
    <strong>Total:</strong> ₹${Number(total).toFixed(2)}<br>
    <strong>Total Tax:</strong> ₹${Number(totalTax).toFixed(2)}<br>
    <strong>Final Amount:</strong> ₹${Number(finalAmount).toFixed(2)}
  `;
}

/**
 * Prints the bill summary from a given element.
 * @param {string} elementId - The ID of the element containing bill HTML
 */
function printBill(elementId) {
  var printContents = document.getElementById(elementId).innerHTML;
  var originalContents = document.body.innerHTML;
  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;
  location.reload();
}

// Export functions for use in other scripts
// If using ES modules, you can use: export { renderBillSummary, printBill };