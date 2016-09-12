/**
 * Created by michael-prime on 8/21/16.
 */
//stripe apk keys
Stripe.setPublishableKey('pk_test_vB14RruaWy3XdEcWqRRA48kI');

var $form = $('#checkout-form');

$form.submit(function (event) {
    $form.find('button').prop('disabled', true);
    Stripe.card.createToken({
        number:$('#card-number').val(),
        exp_month: $('#card-expiration-month').val(),
        exp_year: $('#card-expiration-year').val(),
        cvc: $('#card-cvc').val(),
        name: $('#card-name').val()
    }, stripeResponseHandler);
    return false;
});

function stripeResponseHandler(status, response) {
    if(response.error)
    {
        $('#charge-error').text(response.error.message);
        $('#charge-error').removeClass('hidden');
        $form.find('button').prop('disabled', false);
    }
    else
    {
        var token = response.id;
        $form.append($('<input type="hidden" class="stripeToken"/>').val(token));
        $form.get(0).submit();
    }
}