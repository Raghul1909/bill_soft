$(document).ready(function () {
  let allBills = [];
  let allCustomers = [];
  let billerData = {};
  let currentSort = { key: 'id', asc: true };

  // Fetch biller, bills, and customers
  Promise.all([
    fetch('/api/biller').then(res => res.json()),
    fetch('/api/bills').then(res => res.json()),
    fetch('/api/customers').then(res => res.json())
  ]).then(([biller, bills, customers]) => {
    billerData = biller;
    allBills = bills;
    allCustomers = customers;
    renderBills(allBills, allCustomers);
  });

  // Render bills with optional filter
  function renderBills(bills, customers, search = '', dateFilter = '') {
    let sorted = [...bills];
    sorted.sort((a, b) => {
      let valA = a[currentSort.key] || '';
      let valB = b[currentSort.key] || '';
      // For date, compare as string or Date
      if (currentSort.key === 'date') {
        valA = valA || '';
        valB = valB || '';
      }
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return currentSort.asc ? -1 : 1;
      if (valA > valB) return currentSort.asc ? 1 : -1;
      return 0;
    });

    $('#billBody').empty();
    sorted.forEach(bill => {
      let items = [];
      try {
        items = typeof bill.items === 'string' ? JSON.parse(bill.items) : bill.items;
      } catch (e) {
        items = [];
      }

      // Find customer details
      const cust = customers.find(c => c.id === bill.customerId) || {};
      const custName = cust.name || '';
      const custGST = cust.gst || '';
      const custAddress = cust.address || '';

      // Search filter
      const searchStr = `${bill.id} ${custName} ${custGST}`.toLowerCase();
      if (search && !searchStr.includes(search.toLowerCase())) return;

      // Date filter
      if (dateFilter) {
        const billDate = bill.date ? bill.date.split('T')[0] : '';
        if (billDate !== dateFilter) return;
      }

      // Unique print content id for each bill
      const printId = `printBill${bill.id}`;

      // Use renderBillSummary from bill_print.js for print content
      const printHtml = renderBillSummary(
        billerData,
        { name: custName, gst: custGST, address: custAddress, phone: cust.phone || '', email: cust.email || '' },
        items,
        bill
      );

      let itemsHtml = (items || []).map(item =>
        `${item.pname} `
      ).join('<br>');

      $('#billBody').append(`
        <tr>
          <td>${bill.id}</td>
          <td>${bill.customerId}</td>
          <td>${bill.date ? new Date(bill.date).toLocaleString() : ''}</td>
          <td>₹${(typeof bill.finalAmount === 'number' ? bill.finalAmount.toFixed(2) : '0.00')}</td>
          <td>${itemsHtml}</td>
          <td>
            <strong>Name:</strong> ${custName}<br>
            <strong>GST:</strong> ${custGST}<br>
            <strong>Address:</strong> ${custAddress}<br>
          </td>
          <td>
            <button class="btn btn-primary btn-sm printBill" data-printid="${printId}">Print</button>
            <button class="btn btn-danger btn-sm deleteBill" data-id="${bill.id}">Delete</button>
            <div id="${printId}" style="display:none;">
              ${printHtml}
            </div>
          </td>
        </tr>
      `);
    });

    // Update sort icons
    $('.sort-header i').removeClass('fa-sort-up fa-sort-down').addClass('fa-sort');
    $(`.sort-header[data-sort="${currentSort.key}"] i`)
      .removeClass('fa-sort')
      .addClass(currentSort.asc ? 'fa-sort-up' : 'fa-sort-down');
  }

  // Search handler
  $('#billSearch').on('input', function () {
    const search = $(this).val();
    const dateFilter = $('#billDateSearch').val();
    renderBills(allBills, allCustomers, search, dateFilter);
  });
  $('#billDateSearch').on('change', function () {
    const search = $('#billSearch').val();
    const dateFilter = $(this).val();
    renderBills(allBills, allCustomers, search, dateFilter);
  });

  $('#billBody').on('click', '.deleteBill', function () {
    const id = $(this).data('id');
    fetch(`/api/bills/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) location.reload();
        else alert('Failed to delete bill');
      });
  });

  // Print handler using printBill from bill_print.js
  $('#billBody').on('click', '.printBill', function () {
    const printId = $(this).data('printid');
    printBill(printId);
  });

  // Sort handler
  $('#billTable').on('click', '.sort-header', function () {
    const key = $(this).data('sort');
    if (currentSort.key === key) {
      currentSort.asc = !currentSort.asc;
    } else {
      currentSort.key = key;
      currentSort.asc = true;
    }
    const search = $('#billSearch').val();
    const dateFilter = $('#billDateSearch').val();
    renderBills(allBills, allCustomers, search, dateFilter);
  });
});