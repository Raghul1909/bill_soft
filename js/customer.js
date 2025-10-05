$(document).ready(function () {
  let allCustomers = [];
  let currentSort = { key: 'id', asc: true };

  // Fetch customers
  fetch('/api/customers')
    .then(res => res.json())
    .then(customers => {
      allCustomers = customers;
      renderCustomers(allCustomers);
    });

  // Render customers with optional search
  function renderCustomers(customers, search = '') {
    let sorted = [...customers];
    sorted.sort((a, b) => {
      let valA = a[currentSort.key] || '';
      let valB = b[currentSort.key] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return currentSort.asc ? -1 : 1;
      if (valA > valB) return currentSort.asc ? 1 : -1;
      return 0;
    });

    $('#customerBody').empty();
    sorted.forEach(cust => {
      const searchStr = `${cust.id} ${cust.name} ${cust.phone} ${cust.gst} ${cust.address} ${cust.email}`.toLowerCase();
      if (search && !searchStr.includes(search.toLowerCase())) return;
      $('#customerBody').append(`
        <tr>
          <td>${cust.id}</td>
          <td>${cust.name}</td>
          <td>${cust.phone}</td>
          <td>${cust.gst || ''}</td>
          <td>${cust.address || ''}</td>
          <td>${cust.email || ''}</td>
          <td><button class="btn btn-danger btn-sm deleteCustomer" data-id="${cust.id}">Delete</button></td>
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
  $('#customerSearch').on('input', function () {
    const search = $(this).val();
    renderCustomers(allCustomers, search);
  });

  // Delete handler
  $('#customerBody').on('click', '.deleteCustomer', function () {
    const id = $(this).data('id');
    fetch(`/api/customers/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) location.reload();
        else alert('Failed to delete customer');
      });
  });

  // Sort handler
  $('#customerTable').on('click', '.sort-header', function () {
    const key = $(this).data('sort');
    if (currentSort.key === key) {
      currentSort.asc = !currentSort.asc;
    } else {
      currentSort.key = key;
      currentSort.asc = true;
    }
    const search = $('#customerSearch').val();
    renderCustomers(allCustomers, search);
  });
});