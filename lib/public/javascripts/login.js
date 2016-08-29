'use strict';

$(document).ready(function() {
    $('#fbLogin').tooltip();
    $('#githubBox').tooltip();
    $('#nicknameField').focus();
    $('#nicknameError').hide();
    $('#nicknameOk').hide();


    $('#nicknameField').keyup(function() {
        var s = $('#nicknameField').val();
        var validate = '';
        var nicknameOkMsg = 'Press enter to continue as <b>' + s + '</b>';

        if(s == '')
            validate = 'uninitialized';

        else if(s.length > 20)
            validate = 'too long';
        
        else if(!(/^[a-z0-9_]*$/gi).test(s))
            validate = 'no special characters';
        
        else
            $.ajax({
                type : 'GET',
                url  : '/isFree/' + s,
                success : function(data, status, xhr) {
                    if(data.msg != 'free') {
                        $('#nicknameOk').hide();
                        $('#nicknameError').text( 'This nickname is taken' );
                        $('#nicknameError').show();
                    }
                    else {
                        $('#nicknameError').hide();
                        $('#nicknameOk').html( nicknameOkMsg );
                        $('#nicknameOk').show();
                    }
                } 
            });

        if(validate == 'uninitialized') {
            $('#nicknameOk').hide();
            $('#nicknameError').hide();
        }
        else if(validate) {
            $('#nicknameOk').hide();
            $('#nicknameError').text(validate);
            $('#nicknameError').show();
        }
        else {
            $('#nicknameError').hide();
            $('#nicknameOk').html( nicknameOkMsg );
            $('#nicknameOk').show();
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