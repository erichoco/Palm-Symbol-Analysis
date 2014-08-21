var symbols = [];

$(function() {
    var filepath = "../data/";
    // var filename0 = "shape/0-0.csv";
    // var filename1 = "shape/0-1.csv";

    // loadNewData(filepath, filename0);
    // loadNewData(filepath, "letter/1-0.csv");
    for (var i = 0; i < 5; i++) {
        // loadNewData(filepath, "letter/" + i + "-0.csv");
        // loadNewData(filepath, "shape/user3-4-" + i + ".csv");
        // loadNewData(filepath, "stroke/user3-" + i + "-0.csv");
        // loadNewData(filepath, "tri-" + i + ".csv");
        loadNewData(filepath, '0813/'+i+'-0.csv');
    };

    $('#diff-box').on('click', function(evt) {
        if ($(this).is(':checked')) {
            console.log('calculate diff...');
            var sampleSize = 64;
            calculateDiff(sampleSize);
        }
        else {
            console.log('cleaning diff...');
            clearDiff();
        }
    });
    $('#shape-btn').on('click', function(evt) {
        selectShapeVert = true;
        var $this = $(this);
        $('#shape-done-btn').attr('disabled', false);
        $this.attr('disabled', true);
        $this.parent().children('span').html('');
        clearVert();
    })
    $('#shape-done-btn').on('click', function(evt) {
        selectShapeVert = false;
        var $this = $(this);
        $('#shape-btn').attr('disabled', false);
        $this.attr('disabled', true);
        $this.parent().children('span')
            .html('Shape difference: ' + vertDist.toFixed(3) + 'mm');
    })

    function loadNewData(filepath, filename) {
        var newData = {
            "trial": filename,
        };
        d3.csv(filepath + filename, function(error, data) {
            if (0 === data.length) {
                return;
            }
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

    function clearDiff() {
        drawDiff([]);
    }

});

