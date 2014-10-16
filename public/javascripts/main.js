var symbols = [];
var filepath = "../data/";
var trimmedSymbols = [];

$(function() {
    initDOMElements();
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

    /**** Step 2 ****/
    $('.trim-btn').on('click', function(evt) {
        var hint = 'QQ';
        switch(evt.target.id) {
            case "trim-head-btn":
                isTrimmingHead = !isTrimmingHead;
                hint = 'Select the starting point of the symbol.';
                break;
            case "trim-tail-btn":
                isTrimmingTail = !isTrimmingTail;
                hint = 'Select the ending point of the symbol.';
                break;
            case "trim-body-btn":
                isTrimmingBody = !isTrimmingBody;
                hint = 'Select two points that indicate the segment to trim.';
                break;
        }

        var $this = $(this);
        $this.toggleClass('btn-primary').toggleClass('btn-default');

        if ($this.hasClass('btn-primary')) {
            $this.siblings('.trim-btn').attr('disabled', true);
            $this.siblings('#trim-reset-btn').attr('disabled', false);
            $this.siblings('p').html(hint);
        }
        else {
            $this.siblings('.trim-btn').attr('disabled', false);
            $this.siblings('#trim-reset-btn').attr('disabled', true);
            $this.siblings('p').html('');

            for (var i = 0, len = symbols.length; i < len; i++) {
                for (var j = 0, len_t = trimmedSymbols.length; j < len_t; j++) {
                    if (trimmedSymbols[j].trial === symbols[i].trial) {
                        symbols[i] = trimmedSymbols[j];
                    }
                }
            }
            trimmedSymbols = [];
        }

    });
    $('#trim-reset-btn').on('click', function(evt) {
        trimmedSymbols = [];
        drawSymbol(symbols);
    });

    /**** Step 3 ****/
    $('.vert-btn').on('click', function(evt) {
        isSelectingVert = true;
        var $this = $(this);
        $this.siblings('.vert-done-btn').attr('disabled', false);
        $this.attr('disabled', true);
        $this.parent().children('p').html('');
        clearVert();
    });

    $('.vert-done-btn').on('click', function(evt) {
        isSelectingVert = false;
        var $this = $(this);
        $this.siblings('.vert-btn').attr('disabled', false);
        $this.attr('disabled', true);
        $this.parent().children('p')
            .html('<strong>vertices difference:</strong> ' + vertDist.toFixed(3) + 'mm');
    });

    $('#area-btn').on('click', function() {
        var polyArea = calArea();
        var $this = $(this);
        $this.parent().children('p').html(function() {
            var str = '';
            for (var i = 0, len = symbols.length; i < len; i++) {
                str +=
                    ('<strong>'+ symbols[i].trial + ':</strong> ' +
                     Math.abs(polyArea[i]).toFixed(3) + 'mm<sup>2</sup>  ');
            };
            return str;
        });
    });

    $('#export-btn').on('click', function() {
        for (var i = 0, len = symbols.length; i < len; i++) {
            var csvData = [];
            csvData.push('x,y');
            for (var j = 0, len_c = symbols[i].coord.length; j < len_c; j++) {
                csvData.push(
                    [symbols[i].coord[j].x, symbols[i].coord[j].y].join(','));
            }
            var csvContent = 'data:text/csv;charset=utf-8,' + csvData.join('\n');

            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", symbols[i].trial.replace(/\//g, '_'));
            link.click();
        }
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
    var exist = $.grep(symbols, function(e) {
        return e.trail === filename;
    });
    if (0 !== exist.length) {
        console.log('symbol already loaded...');
        return;
    }

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
    trimmedSymbols = $.grep(trimmedSymbols, function(e) {
        return e.trial !== filename;
    });
    drawSymbol(symbols);
}
