'use strict';

$(document).ready(function() {
    $("[data-toggle='tooltip']").tooltip();
    $('#nicknameField').focus();
    $('#nicknameError').hide();
    $('#nicknameOk').hide();


    $('#nicknameField').keyup(function(event) {
        if(event.which == 13) //enter key
            return false;
        var s = $('#nicknameField').val();
        var validate = '';
        var nicknameOkMsg = 'Press enter to continue as <b>' + s + '</b>';

        if(s == '')
            validate = 'uninitialized nickname';

        else if(s.length > 20)
            validate = 'This nickname is too long';
        
        else if(!(/^[a-z0-9_]*$/gi).test(s))
            validate = 'No special characters are allowed';
        
        else
            $.ajax({
                type : 'GET',
                url  : '/isFree/' + s,
                success : function(data, status, xhr) {
                    if(data.msg != 'free') {
                        $('#nicknameOk').hide();
                        $('#nicknameError').text( 'This nickname is taken' );
                        $('#nicknameError').show();
                        $('#nicknameInputGroup').addClass('has-error');
                        $('#nicknameInputGroup').removeClass('has-success');
                    }
                    else {
                        $('#nicknameError').hide();
                        $('#nicknameOk').html( nicknameOkMsg );
                        $('#nicknameOk').show();
                        $('#nicknameInputGroup').addClass('has-success');
                        $('#nicknameInputGroup').removeClass('has-error');
                    }
                } 
            });

        if(validate == 'uninitialized nickname') {
            $('#nicknameOk').hide();
            $('#nicknameError').hide();
            $('#nicknameInputGroup').removeClass('has-error');
            $('#nicknameInputGroup').removeClass('has-success');
        }
        else if(validate) {
            $('#nicknameOk').hide();
            $('#nicknameError').text(validate);
            $('#nicknameError').show();
            $('#nicknameInputGroup').addClass('has-error');
            $('#nicknameInputGroup').removeClass('has-success');
        }
        else {
            $('#nicknameError').hide();
            $('#nicknameOk').html( nicknameOkMsg );
            $('#nicknameOk').show();
            $('#nicknameInputGroup').addClass('has-success');
            $('#nicknameInputGroup').removeClass('has-error');
        }
    });

    $('form').submit(function(event) {
        event.preventDefault();

        if(validateNickname($('#nicknameField').val()))
            return;
        
        $.ajax({
            type : 'POST',
            url  : '/',
            data : {
                nickname : $('#nicknameField').val()
            },
            success : function(data, status, xhr) {
                location.reload();
            } 
        });
    });
});

function validateNickname(s) { //is this function used anywhere?
    if(s == '')
        return ' ';

    if(s.length > 20)
        return 'too long';
    
    if(!(/^[a-z0-9_]*$/gi).test(s))
        return 'no special characters';
    
    $.ajax({
        type : 'GET',
        url  : '/isFree/' + s,
        success : function(data, status, xhr) {
            return data.msg;
        } 
    });
}