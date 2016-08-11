$(document).ready(function() {
    var socket = io('http://localhost:3000/chat');

    var roomName = $('#roomName').text();
    socket.emit('room join', roomName);

    $('#submitMessage').submit(function() {
        if($('#m').val() && $('#m').val().length<=300)
            socket.emit('chat message', escapeHtml($('#m').val()));

        $('#m').val('');
        return false;
    });

    socket.on('onlineUsers change', function(onlineUsers) {
        $('#onlineUsers').text('');
        for(var u in onlineUsers)
            $('#onlineUsers').append("<span style='color:" + onlineUsers[u] + ";'><b>" + u + "</b></span> ");
    });

    socket.on('chat message', function(obj) {
        $('#chat').append("<tr> <td style='color:" + obj.color + ";'><b>" + obj.nickname + "</b> </td><td>" + obj.msg + "</td></tr>");
        $('#chatWrap').scrollTop($('#chatWrap')[0].scrollHeight);
    });
});

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }