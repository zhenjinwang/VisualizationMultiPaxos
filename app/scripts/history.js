$("#loadHistory").on("click", function() {
        $('#sequenceChart').empty();
        $('#sequenceChart').append(
          "<pre id='data' class='code mscgen mscgen_js' data-language='mscgen'>"+
            localStorage.getItem('messageHistory')+"</pre>"+
            "<script src='https://sverweij.github.io/mscgen_js/mscgen-inpage.js'></script>"
        );
});
