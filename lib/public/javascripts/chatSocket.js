'use strict';

$(document).ready(function() {

    $("[data-toggle='tooltip']").tooltip();
    $("input[id=chatMessageField]").focus();

    var socket = io('chatroom-ozhi.rhcloud.com:8000');

    var roomName = $('#roomName').text();
    socket.emit('room join', roomName);

    socket.on('chat message', function(obj) {
        $('#chat').append("<tr> <td style='color:" + obj.color + ";'><b>" + obj.nickname + "</b> </td><td>" + obj.msg + "</td></tr>");
        $('#chatWrap').scrollTop($('#chatWrap')[0].scrollHeight);
    });
    
    socket.on('system message', function(obj) {
        if(obj.type == 'join')
            $('#chat').append("<tr> <td style='color:" + obj.color + ";'><b>" + obj.nickname + "</b> </td><td class='alert alert-success'> joined </td></tr>");
        if(obj.type == 'leave')
            $('#chat').append("<tr> <td style='color:" + obj.color + ";'><b>" + obj.nickname + "</b> </td><td class='alert alert-danger'> left </td></tr>");
        
        $('#chatWrap').scrollTop($('#chatWrap')[0].scrollHeight);
    });

    socket.on('room leave', function(nickname) {
        if(nickname == $('#nickname').text())
            window.location.href = "/rooms";
    });

    socket.on('add member', function(user) {
        $("#membersBox [id='" + user.nickname + "']").remove();
        $('#membersBox').append("<span id='" + user.nickname + "' class='roomMember' style='color:" + user.color + "'> " + user.nickname + " </span>");
    });

    socket.on('remove member', function(nickname) {
        $("#membersBox [id='" + nickname + "']").remove();
    });


    $('#chatMessageForm').submit(function() {
        if($('#chatMessageField').val() && $('#chatMessageField').val().length<=300)
            socket.emit('chat message', escapeHtml($('#chatMessageField').val()));

        $('#chatMessageField').val('');
        return false;
    });

    $('#btnLeaveRoom').click(function() {
        socket.emit('room leave');
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