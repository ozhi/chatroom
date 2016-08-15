$(document).ready(function() {
    
    var socket = io('http://localhost:3000/'); //socket namespace, not to be confused with server endpoint

    socket.on('room removed', function(roomName) {
        $("#roomsList tr[id='" + roomName + "']").remove();//because room name and id can contain spaces
    });
    
    socket.on('room updated', function(room) {
        $("#roomsList tr[id='" + room.name + "']").html( toTableRow(room) );
    });

    socket.on('room created', function(room) {
        $('#roomsList tbody').append("<tr id='"+room.name+"'>" + toTableRow(room) + "</tr>");
    });
});

function toTableRow(room) {
    var hasPassword = room.password ? "&#9745;" : "&#9744;";
    var members = room.curMembers + "/" + room.maxMembers;
    var tableRow = "";

    tableRow += "<td> <a href='/rooms/" + room.name + "'> " + room.name   + " </a> </td>";
    tableRow += "<td>"                                  + hasPassword +       "</td>";
    tableRow += "<td>"                                  + members     +       "</td>";

    return tableRow;
}
