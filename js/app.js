// Make sure db.js is loaded before this file in your HTML

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

        // Save customer first, get customerId
        let customerId;
        try {
            // Fetch all customers and check for existing one
            const custRes = await fetch('/api/customers');
            const customers = await custRes.json();
            // You can match by GST, or by name+phone, etc.
            let existing = customers.find(c =>
                c.gst === customer.gst
                // or: c.name === customer.name && c.phone === customer.phone
            );
            if (existing) {
                customerId = existing.id;
            } else {
                // Add new customer
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
        let itemsHtml = `<table class="table"><thead><tr>
          <th>Product ID</th>
          <th>Name</th>
          <th>Qty</th>
          <th>Tax %</th>
          <th>Price</th>
          <th>Item Total</th>
          <th>Item Tax</th>
        </tr></thead><tbody>`;
        items.forEach(item => {
          itemsHtml += `<tr>
            <td>${item.pid}</td>
            <td>${item.pname}</td>
            <td>${item.qty}</td>
            <td>${item.taxPercent}%</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>₹${item.itemTotal.toFixed(2)}</td>
            <td>₹${item.itemTax.toFixed(2)}</td>
          </tr>`;
        });
        itemsHtml += `</tbody></table>`;

        $('#billContent').html(`
          <strong>Customer:</strong> ${customer.name}<br>
          <strong>Phone:</strong> ${customer.phone}<br>
          <strong>GST:</strong> ${customer.gst}<br>
          ${itemsHtml}
          <strong>Total:</strong> ₹${total.toFixed(2)}<br>
          <strong>Total Tax:</strong> ₹${totalTax.toFixed(2)}<br>
          <strong>Final Amount:</strong> ₹${finalAmount.toFixed(2)}
        `);

        // Show bill summary and print button
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

    // Print bill summary
    $('#printBill').click(function () {
        // Only print the bill summary
        var printContents = document.getElementById('billContent').innerHTML;
        var originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        location.reload(); // Optional: reload to restore state
    });
});

// IndexedDB setup
let request = indexedDB.open("BillingDB", 1);

request.onupgradeneeded = function (e) {
    db = e.target.result;
    if (!db.objectStoreNames.contains("customers")) {
        db.createObjectStore("customers", { keyPath: "id", autoIncrement: true }); // Use id as private key
    }
    if (!db.objectStoreNames.contains("bills")) {
        db.createObjectStore("bills", { autoIncrement: true });
    }
};
request.onsuccess = function (e) {
    db = e.target.result;
};