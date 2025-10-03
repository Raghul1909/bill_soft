$(document).ready(function () {
  // Add row for bill item
  $('#addRow').click(function () {
    $('#billBody').append(`
      <tr>
        <td><input type="text" class="form-control pid" required></td>
        <td><input type="text" class="form-control pname" required></td>
        <td><input type="number" class="form-control qty" required></td>
        <td><input type="number" class="form-control item-tax" placeholder="Tax %" required></td>
        <td><input type="number" class="form-control price" required></td>
        <td><button type="button" class="btn btn-danger btn-sm removeRow">X</button></td>
      </tr>
    `);
  });

  // Remove bill item row
  $('#billBody').on('click', '.removeRow', function () {
    $(this).closest('tr').remove();
  });

  // Customer name suggestions (server API)
  $("#custName").on("keyup", function () {
    let query = $(this).val().toLowerCase();
    if (query.length >= 3) {
      fetch('/api/customers')
        .then(res => res.json())
        .then(customers => {
          let matches = customers.filter(c => c.name.toLowerCase().includes(query));
          let suggestions = $("#custSuggestions").empty();
          matches.forEach(c => {
            suggestions.append(`<a class="list-group-item list-group-item-action" 
              data-phone="${c.phone}" 
              data-gst="${c.gst}" 
              data-address="${c.address}" 
              data-email="${c.email}">${c.name}</a>`);
          });
        });
    } else {
      $("#custSuggestions").empty();
    }
  });

  // Fill customer fields when suggestion is clicked
  $(document).on("click", "#custSuggestions a", function () {
    $("#custName").val($(this).text());
    $("#custPhone").val($(this).data("phone"));
    $("#custGST").val($(this).data("gst"));
    $("#custAddress").val($(this).data("address"));
    $("#custEmail").val($(this).data("email"));
    $("#custSuggestions").empty();
  });

  // Hide suggestions when input loses focus (with delay for click)
  $("#custName").on("blur", function () {
    setTimeout(function () {
      $("#custSuggestions").empty();
    }, 200);
  });

  // Generate Bill
  $('#generateBill').click(async function () {
    // Collect customer data
    const customer = {
      name: $('#custName').val().trim(),
      phone: $('#custPhone').val().trim(),
      gst: $('#custGST').val().trim(),
      address: $('#custAddress').val().trim(),
      email: $('#custEmail').val().trim()
    };

    // Validate customer fields
    if (!customer.name || !customer.phone || !customer.gst) {
      alert('Please fill all required customer fields.');
      return;
    }

    // Collect bill items
    const items = [];
    let valid = true;
    let total = 0;
    let totalTax = 0;
    $('#billBody tr').each(function () {
      const pid = $(this).find('.pid').val().trim();
      const pname = $(this).find('.pname').val().trim();
      const qty = parseFloat($(this).find('.qty').val());
      const price = parseFloat($(this).find('.price').val());
      const taxPercent = parseFloat($(this).find('.item-tax').val()) || 0;
      if (!pid || !pname || isNaN(qty) || isNaN(price) || isNaN(taxPercent) || qty <= 0 || price <= 0) {
        valid = false;
      }
      const itemTotal = qty * price;
      const itemTax = itemTotal * (taxPercent / 100);
      total += itemTotal;
      totalTax += itemTax;
      items.push({ pid, pname, qty, price, taxPercent, itemTotal, itemTax });
    });
    if (!valid || items.length === 0) {
      alert('Please fill all required bill item fields with valid numbers.');
      return;
    }
    const finalAmount = total + totalTax;

    // Save customer first, get customerId (avoid duplicates)
    let customerId;
    try {
      const custRes = await fetch('/api/customers');
      const customers = await custRes.json();
      let existing = customers.find(c =>
        c.gst === customer.gst
      );
      if (existing) {
        customerId = existing.id;
      } else {
        const addRes = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customer)
        });
        const addData = await addRes.json();
        customerId = addData.id;
      }
    } catch (err) {
      alert('Error saving customer!');
      return;
    }

    // Save bill
    const bill = {
      customerId,
      items,
      total,
      totalTax,
      finalAmount,
      date: new Date().toISOString()
    };
    try {
      await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bill)
      });
    } catch (err) {
      alert('Error saving bill!');
      return;
    }

    // Show bill summary
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

    $('#billContent').html(`
      <strong>Bill Number:</strong> ${bill.customerId ? (bill.customerId + 10000) : ''}<br>
      <strong>Date:</strong> ${bill.date ? new Date(bill.date).toLocaleString() : new Date().toLocaleString()}<br>
      <strong>Customer:</strong> ${customer.name}<br>
      <strong>Phone:</strong> ${customer.phone}<br>
      <strong>GST:</strong> ${customer.gst}<br>
      <strong>Address:</strong> ${customer.address}<br>
      ${itemsHtml}
      <strong>Total:</strong> ₹${total.toFixed(2)}<br>
      <strong>Total Tax:</strong> ₹${totalTax.toFixed(2)}<br>
      <strong>Final Amount:</strong> ₹${finalAmount.toFixed(2)}
    `);

    $('#billSummary').show();
    $('#printBill').show();

    // Clear form for next entry
    $("#custName").val('');
    $("#custPhone").val('');
    $("#custGST").val('');
    $("#custAddress").val('');
    $("#custEmail").val('');
    $("#billBody").empty();
  });

  // Print Bill
  $('#printBill').click(function () {
    var printContents = document.getElementById('billContent').innerHTML;
    var originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    location.reload();
  });
});