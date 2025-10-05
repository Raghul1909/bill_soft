$('#navbar-placeholder').load('navbar.html', function() {
    $.get('/api/biller', function(data) {
    if (data && data.logo) {
        $('#billerIcon').attr('src', data.logo);
    }
    });
});