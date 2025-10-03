$(document).ready(function () {
  let customers = [];
  let currentSort = { key: 'id', asc: true };

  // Load customers from server
  function loadCustomers() {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        customers = data;
        renderCustomers();
      });
  }

  function renderCustomers() {
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
      $('#customerBody').append(`
        <tr>
          <td>${cust.id}</td>
          <td>${cust.name}</td>
          <td>${cust.phone}</td>
          <td>${cust.gst}</td>
          <td>${cust.address}</td>
          <td>${cust.email}</td>
          <td>
            <button class="btn btn-danger btn-sm deleteCustomer" data-id="${cust.id}">Delete</button>
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

  loadCustomers();

  // Delete customer handler
  $('#customerBody').on('click', '.deleteCustomer', function () {
    const id = $(this).data('id');
    fetch(`/api/customers/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) loadCustomers();
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
    renderCustomers();
  });
});