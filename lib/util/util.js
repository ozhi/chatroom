'use strict';

module.exports = {

    randomColor : function () {
        
        function randomHexDigit() {
            var hexDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B','C', 'D', 'E', 'F'];
            return hexDigits[Math.floor(Math.random() * hexDigits.length)]; //[0;16)
        }
        
        var hexColor = '#';
        for(var i=1; i<=6; i++)
            hexColor += randomHexDigit(); 
        
        return hexColor;
    }

};
