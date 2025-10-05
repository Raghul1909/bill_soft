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
    let total = 0, totalTax = 0;
    $('#billBody tr').each(function () {
      const pname = $(this).find('.pname').val();
      const qty = parseFloat($(this).find('.qty').val()) || 0;
      const taxPercent = parseFloat($(this).find('.item-tax').val()) || 0;
      const price = parseFloat($(this).find('.price').val()) || 0;
      if (pname && qty && price) {
        const itemTotal = qty * price;
        const itemTax = itemTotal * (taxPercent / 100);
        total += itemTotal;
        totalTax += itemTax;
        items.push({ pname, qty, taxPercent, price, itemTotal, itemTax });
      }
    });

    if (items.length === 0) {
      alert('Please add at least one bill item.');
      return;
    }

    const finalAmount = total + totalTax;
    const bill = {
      total,
      totalTax,
      finalAmount,
      date: new Date().toISOString(),
      customerId: null // Set after saving bill if needed
    };

    // 1. Save customer to DB
    let customerId;
    try {
      const custRes = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      });
      const custData = await custRes.json();
      customerId = custData.id || custData.customerId || custData.insertId;
      bill.customerId = customerId;
    } catch (err) {
      alert('Error saving customer!');
      return;
    }

    // 2. Save bill to DB
    try {
      const billRes = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          date: bill.date,
          total: bill.total,
          tax: bill.totalTax,
          finalAmount: bill.finalAmount,
          items
        })
      });
      const billData = await billRes.json();
      bill.id = billData.id || billData.billId || billData.insertId;
    } catch (err) {
      alert('Error saving bill!');
      return;
    }

    // Get biller details
    let biller = {};
    try {
      const billerRes = await fetch('/api/biller');
      biller = await billerRes.json();
    } catch (err) {
      biller = {};
    }

    // Render bill summary using bill_print.js
    $('#billContent').html(renderBillSummary(biller, customer, items, bill));
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

  // Print Bill button
  $('#printBill').click(function () {
    printBill('billContent');
  });

  // Show biller logo as user icon if available
  $(function() {
    $.get('/api/biller', function(data) {
      if (data && data.logo) {
        $('#billerIcon').attr('src', data.logo);
      }
    });
  });
});