var symbols = [];
var filepath = "../data/";

$(function() {
    initDOMElements();

    // var filename0 = "shape/0-0.csv";
    // var filename1 = "shape/0-1.csv";

    // loadNewData(filepath, filename0);
    // loadNewData(filepath, "letter/1-0.csv");
    for (var i = 0; i < 2; i++) {
        // loadNewData(filepath, "letter/" + i + "-0.csv");
        // loadNewData(filepath, "shape/user3-4-" + i + ".csv");
        // loadNewData(filepath, "stroke/user3-" + i + "-0.csv");
        // loadNewData(filepath, "tri-" + i + ".csv")
        loadNewData(filepath, '0813/temp3/3-'+i+'.csv');
    };

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
    };

});

function initDOMElements() {

    /**** Step 1 elements ****/
    // Get user list
    $.getJSON('user/all', function(data) {
        createOptions('#user-select', data);
    });

    $('#user-select').on('change', function() {
        var $this = $(this);
        var $next = $this.next(); // #user-symbol-select
        var $option = $('<option>')
                        .attr('disabled', 'disabled')
                        .html('loading');

        $next.show().empty().append($option)
            .next().empty();

        // Get symbol category list of this user
        $.getJSON('user/' + $this.val(), function(data) {
            if (data.errno) {
                console.error(data);
            }
            else {
                createOptions('#user-symbol-select', data);
            }
        });
    });

    $('#user-symbol-select').on('change', function() {
        var $this = $(this);
        var $prev = $this.prev(); // user-select
        var $next = $this.next(); // #symbol-container
        // var $all = $('<label>')
        // .html('<input type="checkbox" name="symbol-box" value="all" />All');
        // $next.show().empty().append($all);
        $next.show().empty();

        // get symbol data in this category
        $.getJSON('user/' + $prev.val() + ',' + $this.val(), function(data) {
            if (data.errno) {
                console.error(data);
            }
            else {
                for (var i = 0, len = data.length; i < len; i++) {
                    var dataName = data[i].substring(0, data[i].length - 4);
                    var $lbl = $('<label>')
                        .html(
                            '<input type="checkbox" name="symbol-box" value="' +
                            dataName + '" />' + dataName)
                        .appendTo($next);
                }
            }
        });
    });

    // Delegate click handler to future checkboxes
    $('#symbol-container').on('click', 'input[name="symbol-box"]', function() {
        var $this = $(this);
        if ($this.is(':checked')) {
            if ('all' === $this.val()) {

            }
            else {
                loadNewData(
                    $('#user-select').find(':selected').text() + '/' +
                    $('#user-symbol-select').find(':selected').text() + '/' +
                    $this.val() + '.csv');
            }
        }
        else {
            if ('all' === $this.val()) {

            }
            else {
                removeData(
                    $('#user-select').find(':selected').text() + '/' +
                    $('#user-symbol-select').find(':selected').text() + '/' +
                    $this.val() + '.csv');
            }
        }
    });

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
    });

    $('#shape-done-btn').on('click', function(evt) {
        selectShapeVert = false;
        var $this = $(this);
        $('#shape-btn').attr('disabled', false);
        $this.attr('disabled', true);
        $this.parent().children('span')
            .html('<strong>shape difference:</strong> ' + vertDist.toFixed(3) + 'mm');
    });

    $('#area-btn').on('click', function() {
        var polyArea = calArea();
        var $this = $(this);
        $this.parent().children('span').html(function() {
            var str = '';
            for (var i = 0, len = symbols.length; i < len; i++) {
                str +=
                    ('<strong>'+ symbols[i].trial + ':</strong> ' +
                     Math.abs(polyArea[i]).toFixed(3) + 'mm<sup>2</sup>  ');
            };
            return str;
        });
    });
}

function createOptions(selectId, optionLi) {
    var $user = $(selectId);
    $user.children('option').first().html('- select user data -');
    for (var i = 0, len = optionLi.length; i < len; i++) {
        $('<option>')
            .attr('value', optionLi[i])
            .html(optionLi[i])
            .appendTo($user);
    };
}

function loadNewData(filename) {
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
};

function removeData(filename) {
    symbols = $.grep(symbols, function(e) {
        return e.trial !== filename;
    });
    drawSymbol(symbols);
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