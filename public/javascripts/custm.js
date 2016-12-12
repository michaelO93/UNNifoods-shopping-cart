
$(document).ready(function() {
    var currencies = {
        'NG': {'NGN': 'NGN', 'USD': 'USD', 'GBP': 'GBP', 'EUR': 'EUR'},
        'GH': {'GHS': 'GHS', 'USD': 'USD'},
        'US': {'USD': 'USD'},
        'KE': {'KES': 'KES', 'USD': 'USD'},
        'UK': {'GBP': 'GBP', 'USD': 'USD', 'EUR': 'EUR'}
    };

    populateCurrencies();

    $(function() {
        $('select[name="country"]').change(function() {
            $('select[name="currency"]').html('');
            populateCurrencies();
        });
    });

    function populateCurrencies() {
        var selectedCountry = $('select[name="country"]').val(),
            append = '<option value="" selected disabled>Currency</option>';

        $.each(currencies, function (country, currency) {
            if (selectedCountry === country) {
                $.each(currency, function (i, obj) {
                    append += '<option value="'+i+'">'+obj+'</option>';
                });
            }
        });

        $('select[name="currency"]').html(append);
    }

    $(function() {
        $('select[name="authmodel"]').change(function() {
            if ($('select[name="authmodel"]').val() === "NOAUTH") {
                $('.form-card').find('#authfield').prop({type: "hidden"}).prop({name: ""}).prop({placeholder: ""});
            } else if ($('select[name="authmodel"]').val() === "PIN") {
                $('.form-card').find('#authfield').prop({type: "text"}).prop({name: "pin"}).prop({placeholder: "Enter PIN"});
            } else if ($('select[name="authmodel"]').val() === "BVN") {
                $('.form-card').find('#authfield').prop({type: "text"}).prop({name: "bvn"}).prop({placeholder: "Enter BVN"});
            } else if ($('select[name="authmodel"]').val() === "RANDOM_DEBIT") {
                $('.form-card').find('#authfield').prop({type: "hidden"}).prop({name: ""}).prop({placeholder: ""});
            } else if ($('select[name="authmodel"]').val() === "VBVSECURECODE") {
                $('.form-card').find('#authfield').prop({type: "text"}).prop({name: "responseurl"}).prop({placeholder: "Enter Response URL"});
            } else {
                $('.form-card').find('#authfield').prop({type: "hidden"}).prop({name: ""}).prop({placeholder: ""});
            }
        });
    });



});