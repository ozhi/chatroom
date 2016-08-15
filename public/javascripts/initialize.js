$(document).ready(function() {
    $('#nicknameField').focus();

    $('#nicknameField').keyup(function() {
        $('#validateNickname').text( validateNickname($('#nicknameField').val()) );
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
                if(data.nicknameIsFree == 'false')
                    $('#validateNickname').text( 'taken' );
                
                else if(data.nicknameIsFree == 'true')
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
    
    return '';
}