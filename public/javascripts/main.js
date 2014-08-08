(function() {
    var symbols = [];
    var filename0 = "tri-0.csv";
    var filename1 = "tri-1.csv";

    $('#diff-btn').on('click', function(evt) {
        console.log('calculate diff...');
        var sampleSize = 64;
        calculateDiff(sampleSize);
    })

    loadNewData(filename0);
    loadNewData(filename1);

    function loadNewData(filename) {
        var newData = {
            "trial": filename,
        };
        d3.csv("../data/" + filename, function(error, data) {
            newData["coord"] = [];
            data.forEach(function(d) {
                // change string (from CSV) into number format
                d.x = +d.x;
                d.y = +d.y;
                if (d.x > scaleMax) scaleMax = d.x;
                if (d.x < scaleMin) scaleMin = d.x;
                if (d.y > scaleMax) scaleMax = d.y;
                if (d.y < scaleMin) scaleMin = d.y;
                newData.coord.push({
                    "x": d.x,
                    "y": d.y
                });
            });
            symbols.push(newData);
            drawSymbol(symbols);
        });
    }

    function calculateDiff(sampleSize) {
        if (symbols.length < 2) {
            console.info('symbol not enough...');
            return;
        }

        var sample = [];
        // var len0 = symbols[0],
        //     len1 = symbols[1];
        var interval0 = symbols[0].coord.length/sampleSize,
            interval1 = symbols[1].coord.length/sampleSize;
        var err = 0;

        for (var i = 0; i < sampleSize; i++) {
            var val = [symbols[0].coord[Math.round(interval0 * i)],
                       symbols[1].coord[Math.round(interval1 * i)]];
            sample.push(val);
            err += Math.sqrt(Math.pow((val[0].x - val[1].x), 2) + Math.pow((val[0].y - val[1].y), 2));
        }

        console.log("Avg err =", err/sampleSize);
        drawDiff(sample);
    }

})();

