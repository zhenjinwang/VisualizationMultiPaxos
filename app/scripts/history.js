//initial sequence chart with ratio 1
drawSequenceChart(1);

// load sequence chart
$("#loadHistory").on("click", function() {
    drawSequenceChart(1);
});

// back to top
$("#back_to_top").on("click", function() {
    window.scrollTo(0,0);
});

// draw sequence chart
function drawSequenceChart(zoomRatio){
  $('#sequenceChart').empty();
  $('#sequenceChart').append(
    "<pre id='data' class='code mscgen mscgen_js' data-language='mscgen' style='zoom:"+zoomRatio+"'>"+
      localStorage.getItem('messageHistory')+"</pre>"+
      "<script src='/bower_components/mscgen_js-inpage-package/mscgen-inpage.js'></script>"
  );
}

//Jquery element for zooming  ratio
var ratio=$("#zooming");

// zooming ratio slider
$("#zoomSlider").slider({
    range: false,
    value:1,
    min: 0.05,
    max: 4,
    step: 0.01,
    slide: function(event, ui) {
        // update zooming ratio
        ratio.html(ui.value);
        // update sequence chart
        $("#data").css("zoom",ui.value);
    }
});
