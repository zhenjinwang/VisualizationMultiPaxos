drawSequenceChart();
$("#loadHistory").on("click", function() {
        drawSequenceChart();
});
function drawSequenceChart(){
  $('#sequenceChart').empty();
  $('#sequenceChart').append(
    "<pre id='data' class='code mscgen mscgen_js' data-language='mscgen'>"+
      localStorage.getItem('messageHistory')+"</pre>"+
      "<script src='/bower_components/mscgen_js-inpage-package/mscgen-inpage.js'></script>"
  );
}
