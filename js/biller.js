$(document).ready(function () {
  // Load existing biller details
  $.get('/api/biller', function(data) {
    if (data) {
      $('#companyName').val(data.companyName || '');
      $('#gstNumber').val(data.gstNumber || '');
      $('#hsnNumber').val(data.hsnNumber || '');
      if (data.logo) {
        $('#logoPreview').html(`<img src="${data.logo}" alt="Logo" style="max-width:150px;max-height:150px;">`);
      }
    }
  });

  // Preview logo image
  $('#logo').on('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        alert('Logo image size should be less than 1MB.');
        $('#logo').val('');
        $('#logoPreview').empty();
        return;
      }
      const reader = new FileReader();
      reader.onload = function (ev) {
        $('#logoPreview').html(`<img src="${ev.target.result}" alt="Logo" style="max-width:150px;max-height:150px;">`);
      };
      reader.readAsDataURL(file);
    } else {
      $('#logoPreview').empty();
    }
  });

  // Handle form submit
  $('#billerForm').on('submit', function (e) {
    e.preventDefault();

    const companyName = $('#companyName').val();
    const gstNumber = $('#gstNumber').val();
    const hsnNumber = $('#hsnNumber').val();
    const logoFile = $('#logo')[0].files[0];

    if (!companyName || !gstNumber || !hsnNumber) {
      alert('Please fill all required fields.');
      return;
    }

    // Read logo as base64
    if (logoFile) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        saveBillerDetails(companyName, gstNumber, hsnNumber, ev.target.result);
      };
      reader.readAsDataURL(logoFile);
    } else {
      // Use existing preview image if available
      const existingLogo = $('#logoPreview img').attr('src') || null;
      saveBillerDetails(companyName, gstNumber, hsnNumber, existingLogo);
    }
  });

  function saveBillerDetails(companyName, gstNumber, hsnNumber, logoBase64) {
    $.ajax({
      url: '/api/biller',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        companyName,
        gstNumber,
        hsnNumber,
        logo: logoBase64
      }),
      success: function (res) {
        alert('Biller details saved successfully!');
        window.location.href = "/";
      },
      error: function () {
        alert('Error saving biller details.');
      }
    });
  }
});