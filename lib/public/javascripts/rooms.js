'use strict';

$(document).ready(function() {

    $("[data-toggle='tooltip']").tooltip();

    makeTableRowsClickable();
    
    var socket = io('http://localhost:3000/'); //socket namespace, not to be confused with server endpoint

    $('#newRoomForm').on('submit', function(event) {
        var roomName   = $("[name='newRoomNameField']").val();
        var maxMembers = $("[name='newRoomMaxMembersField']").val() || 10;
        
        $("[name='newRoomMaxMembersField']").val(maxMembers);

        if( !isValidRoomName(roomName) ) {
            event.preventDefault();
            alert("Room name not valid.");
        }
    });

    socket.on('room removed', function(roomName) {
        $("#roomsList tr[id='" + roomName + "']").remove();//room name and id can contain spaces
    });
    
    socket.on('room updated', function(room) {
        $("#roomsList tr[id='" + room.name + "']").html( toTableRowContent(room) );
        
        $("#roomsList tr[id='" + room.name + "']").addClass("success");
        setTimeout(function() {
            $("#roomsList tr[id='" + room.name + "']").removeClass("success");
        }, 2000);

        $("[data-toggle='tooltip']").tooltip();
        makeTableRowsClickable();
    });

    socket.on('room created', function(room) {
        $('#roomsList tbody').append(toTableRow(room));

        $("#roomsList tr[id='" + room.name + "']").addClass("success");
        setTimeout(function() {
            $("#roomsList tr[id='" + room.name + "']").removeClass("success");
        }, 2000);

        $("[data-toggle='tooltip']").tooltip();
        makeTableRowsClickable();
    });
});

function makeTableRowsClickable() {
    $('.table tr[data-href]').each(function(){ //adds the clickable table row functionality
        $(this).css('cursor','pointer').hover(
            function(){ 
                $(this).addClass('active'); 
            },  
            function(){ 
                $(this).removeClass('active'); 
            }).click( function(){ 
                document.location = $(this).attr('data-href'); 
            }
        );
    });
}

function toTableRowContent(room) {
    var passwordIcon = "";
    if(room.password == 'protected')
        passwordIcon = "<span class='fa fa-lock' data-toggle='tooltip' title='Private'></span> ";
    else
        passwordIcon = "<span class='fa fa-unlock' data-toggle='tooltip' title='Public'></span> ";

    var members =
        "<div class='progress' data-toggle='tooltip' title='" + room.curMembers + " / " + room.maxMembers + "'>" +
            "<div class='progress-bar' role='progressbar' " +
                "aria-valuenow=" + room.curMembers + " aria-valuemin='0' aria-valuemax='" + room.maxMembers + "'" +
                "style='width:" + 1.0*room.curMembers/room.maxMembers*100 + "%'>" +
            "</div>" +
        "</div>";

    var tableRow = "";
    tableRow += "<td>" + passwordIcon + room.name + "</td>";
    tableRow += "<td>" + members                  + "</td>";

    return tableRow;
}

function toTableRow(room) {
    return "<tr id='" + room.name + "' data-href='/rooms/" + room.name + "' class='normal'>" + toTableRowContent(room) + "</tr>";
}

function isValidRoomName(s) {
    return ( s.length >=1 && s.length <= 20 && (/^[a-z][a-z0-9 _-]*$/gi).test(s) );
}
