$(document).ready(function() {
    $('#nicknameField').focus();

    $('#nicknameField').keyup(function() {
        $('#validNickname').text( validNickname($('#nicknameField').val()) );
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

function isValidNickname(s) { //aloows duplicate nicknames, they are stored in user sessions, not db
    if(s.toLowerCase()!='system')
        return 'forbidden';

    if(s.length > 20)
        return 'too long';
    
    if(!(/^[a-z_][a-z0-9_]*$/gi).test(s))
        return 'no special characters';
}