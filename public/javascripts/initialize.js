$(document).ready(function() {
    $('#nicknameField').focus();

    $('#nicknameField').keyup(function() {
        var s = $('#nicknameField').val();
        var validate = '';

        if(s == '')
            validate = ' ';

        else if(s.length > 20)
            validate = 'too long';
        
        else if(!(/^[a-z_]$/gi).test(s[0]))
            validate = 'must begin with letter or underscore';
        
        else if(!(/^[a-z_][a-z0-9_]*$/gi).test(s))
            validate = 'no special characters';
        
        else
            $.ajax({
                type : 'GET',
                url  : '/isFree/' + s,
                success : function(data, status, xhr) {
                    if(data.msg != 'free')
                        $('#validateNickname').text( data.msg );
                } 
            });

        $('#validateNickname').text( validate );
    });

    $('form').submit(function(event) {
        event.preventDefault();

        if(validateNickname($('#nicknameField').val()))
            return;
        
        $.ajax({
            type : 'POST',
            url  : '/',
            data : {
                nickname : $('#nicknameField').val(),
                color :    $('[name=colorField]:checked').val()
            },
            success : function(data, status, xhr) {
                location.reload();
            } 
        });
    });
});

function validateNickname(s) {
    if(s == '')
        return ' ';

    if(s.length > 20)
        return 'too long';
    
    if(!(/^[a-z_]$/gi).test(s[0]))
        return 'must begin with letter or underscore';
    
    if(!(/^[a-z_][a-z0-9_]*$/gi).test(s))
        return 'no special characters';
    
    $.ajax({
        type : 'GET',
        url  : '/isFree/' + s,
        success : function(data, status, xhr) {
            return data.msg;
        } 
    });
}