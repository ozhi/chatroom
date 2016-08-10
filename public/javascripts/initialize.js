$(document).ready(function() {
    $('#nicknameField').focus();

    $('#nicknameField').keyup(function() {
        $('#validNickname').text( isValidNickname($('#nicknameField').val()) ? '' : 'not valid' );
    });

    $('form').submit(function(event) {
        event.preventDefault();

        if(!isValidNickname($('#nicknameField').val()))
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

function isValidNickname(s) {
    return ( s.toLowerCase()!='system' && s.length <= 20 && (/^[a-z_][a-z0-9_]*$/gi).test(s) );
}