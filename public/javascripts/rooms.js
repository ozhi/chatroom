$(document).ready(function() {
    var socket = io('http://localhost:3000/roomsList'); //socket namespace, not to be confused with server endpoint

    socket.emit('roomsList change'); // to fill the table initially

    $('#newRoomBtn').click(function() {
        socket.emit('roomsList change');
    });

    $('#deleteRoomBtn').click(function() {
        socket.emit('roomsList change');
    });

    socket.on('roomsList change', function(roomsList) {
        $('#roomsList tbody').text('');
        for(var i=0; i<roomsList.length; i++) {
            $('#roomsList tbody').append("<tr>");
            $('#roomsList tbody').append("<td> <a href='/rooms/" + roomsList[i].name + "'>" +  roomsList[i].name   + "</a></td>");
            $('#roomsList tbody').append("<td>" + roomsList[i].password   + "</td>");
            $('#roomsList tbody').append("<td>?/" + roomsList[i].maxMembers + "</td>");
            $('#roomsList tbody').append("</tr>");
        }
    });
});
