var main = function(){
    $.get('text/ch01.txt', function(text){
        var stats = getStats(text);
        console.log(stats);
        $('#wordStats').text(stats.wordsWithCounts);
        drawCloud(stats.wordCounts, stats.words);
    });

};

var getStats = function(text){
    var arrLines = text.split(/\n/);
    var wordCounts = {};
    var words = [];
    var lineIdx = 0;
    for(lineIdx = 0; lineIdx < arrLines.length; lineIdx++){
        var line = arrLines[lineIdx].replace(/^\s+/, '');
        if(line.startsWith('#')) {
            continue;
        }
        if(line.length==0){
            continue;
        }
        var wordsInLine=line.split(/\s+/);
        var wordIdx = 0;
        for(wordIdx=0; wordIdx<wordsInLine.length; wordIdx++){
            var word = wordsInLine[wordIdx];
            if(wordCounts[word]){
                wordCounts[word]++;
            }else{
                wordCounts[word]=1;
                words.push(word);
            }
        }
    }
    words.sort((a, b)=>{ 
        if(wordCounts[a] < wordCounts[b]){
            return 1;
        }
        if(wordCounts[a] > wordCounts[b]){
            return -1;
        }
        return 0;
    })
    var wordsWithCounts = [];
    var wordIdx = 0;
    for(wordIdx = 0; wordIdx<words.length; wordIdx++){
        wordsWithCounts.push(words[wordIdx]+'('+wordCounts[words[wordIdx]]+')');
    }
    return {
        'wordsWithCounts': wordsWithCounts,
        'wordCounts': wordCounts,
        'words': words
    };
};

var drawCloud = function(wordCounts, words){

    //Based on https://github.com/jasondavies/d3-cloud/blob/master/examples/browserify.js
    var drawInternal = function(words){
        d3.select("#cloud").append("svg")
            .attr("width", layout.size()[0])
            .attr("height", layout.size()[1])
            .append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
                    .style("font-size", function(d) { return d.size + "px"; })
                    .style("font-family", "Impact")
                    .style('fill', function(d){return randomColor();})
                    .attr("text-anchor", "middle")
                    .attr("transform", function(d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .text(function(d) { return d.text; })
                    .append('svg:title').text(function(d){return d.count;})
                    ;
    };
    var layout = d3.layout.cloud()
                .size(['500', '500'])
                .words(words.map(function(d) {
                    return {text: d, size: 10 + 5*wordCounts[d], count: wordCounts[d]};
                }))
                .padding(5)
                .rotate(function() { return 0; })
                .fontSize(function(d) { return d.size; })
                .on("end", drawInternal);
    layout.start();
}

$(document).ready(main);



//From http://bl.ocks.org/jdarling/06019d16cb5fd6795edf
// Adapted from http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/

var randomColor = (function(){
  var golden_ratio_conjugate = 0.618033988749895;
  var h = Math.random();

  var hslToRgb = function (h, s, l){
      var r, g, b;

      if(s == 0){
          r = g = b = l; // achromatic
      }else{
          function hue2rgb(p, q, t){
              if(t < 0) t += 1;
              if(t > 1) t -= 1;
              if(t < 1/6) return p + (q - p) * 6 * t;
              if(t < 1/2) return q;
              if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
              return p;
          }

          var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          var p = 2 * l - q;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
      }

      return '#'+Math.round(r * 255).toString(16)+Math.round(g * 255).toString(16)+Math.round(b * 255).toString(16);
  };
  
  return function(){
    h += golden_ratio_conjugate;
    h %= 1;
    return hslToRgb(h, 0.6, 0.50);
  };
})();