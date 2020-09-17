width_percent = 0.75;
let margin_PCD = {top: 30, right: 10, bottom: 10, left: 31},
    width_PCD = (window.innerWidth) * width_percent - margin_PCD.left - margin_PCD.right,
    height = (750 - margin_PCD.top - margin_PCD.bottom);
//console.log("WIN!", window.innerWidth, width_PCD)
var dataviz = d3.select("#my_dataviz");

alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
boxes = ["Top Left", "Top Center", "Top Right", "Center Left", "Center Center", "Center Right", "Base Right", "Base Center", "Base Left"];
let current_sudoku = "Q2";
//console.log(svg);
const DEFAULT_LINE_COLOUR = "black";
const ONLINE_SOLVER_COLOUR = "red";
const FIRST_SOLVER_COLOUR = "blue";
const DEFAULT_LINE_OPACITY = "0.4";
const SOLVER_LINE_OPACITY = "0.6";
const FADED_LINE_OPACITY = "0";
const DEFAULT_LINE_WIDTH = "2";
const HIGHLIGHT_LINE_WIDTH = "2.5";
const CIRCLE_SIZE_ADJUSTMENT = 2;
const MIN_CIRCLE_SIZE = 2;
let allCells = false;
let scaleCircles = false;
var getAllCells = function () {
    cells = [];
    alphabet.forEach(function (letter) {
        for (var i = 1; i < 10; i++) {
            cells.append(letter + i);
        }
    });
    return cells;
};
svg2 = dataviz.append("svg")
    .attr("width", width_PCD + margin_PCD.left + margin_PCD.right)
    .attr("height", height + margin_PCD.top + margin_PCD.bottom).attr("display", "block")
    .append("g")
    .attr("transform",
        "translate(" + margin_PCD.left + "," + margin_PCD.top + ")").attr("fill", "red");

var get_default_colour = function (d) {
    if (typeof d["Participant_ID"] == 'undefined') return DEFAULT_LINE_COLOUR;
    if (d["Participant_ID"].slice(-2) == "WS") return ONLINE_SOLVER_COLOUR;
    if (d["Participant_ID"].slice(-2)=="FS") return FIRST_SOLVER_COLOUR;
    else return DEFAULT_LINE_COLOUR;
};
var get_default_opacity = function (d) {
    if (typeof d["Participant_ID"] == 'undefined') return DEFAULT_LINE_OPACITY;
    if (d["Participant_ID"].substring(0, 1) == "S") return SOLVER_LINE_OPACITY;
    else return DEFAULT_LINE_OPACITY;
};
var getBoxNo = function (cell) {
    col = cell[0];
    row = cell[1];
    adjust = 0;
    if (row > 3 && row < 7) {
        adjust = 1;
    }
    if (row > 7) {
        adjust = 2;
    }
    if (col == "A" || col == "B" || col == "C") {
        return 1 + 3 * adjust;
    }
    if (col == "D" || col == "E" || col == "F") {
        return 2 + 3 * adjust;
    }
    if (col == "G" || col == "H" || col == "I") {
        return 3 + 3 * adjust;
    }
};
var getSolver = function (data) {
    solverData = {};

    data.forEach(function (participant) {
        if (participant["Participant_ID"] && participant["Participant_ID"].substring(0, 1) == "S") {
            Object.keys(participant).forEach((step) => {
                if (step == "Participant_ID" || participant[step] == "") {
                } else if (!(participant[step] in solverData)) {
                    solverData[participant[step]] = [parseInt(step), 1, parseInt(step)];
                } else {
                    solverData[participant[step]] = [solverData[participant[step]][0] + parseInt(step), solverData[participant[step]][1] + 1, (solverData[participant[step]][0] + parseInt(step)) / solverData[participant[step]][1] + 1];
                }
            });
        }
    });

    return solverData;
};
var group = function (grouping, cellData) {

    switch (grouping) {
        case "ROW":
            return group_by_row(cellData);
        case "COL":
            return group_by_col(cellData);
        case "BOX":
            return group_by_box(cellData);
    }
};

var group_by_row = function (cellData) {
    return ["1", "2", "3", "4", "5", "6", "7", "8", "9"].reverse();
};
var group_by_col = function (cellData) {
    return ["A", "B", "C", "D", "E", "F", "G", "H", "I"].reverse();
};
var group_by_box = function (cellData) {
    return ["Top Left", "Top Center", "Top Right", "Center Left", "Center Center", "Center Right", "Base Right", "Base Center", "Base Left"].reverse();
};
var sortCellsByAverage = function (cellData) {
    cells = [];
    Object.keys(cellData).forEach(function (cell) {
        cells.push([cell, cellData[cell][2]]);
    });
    cells.sort(function (a, b) {
        return b[1] - a[1];
    });
    cells = cells.map(function (d) {
        return d[0];
    });
    return cells;
};
var sortCellsBySolver = function (solverData) {

    cells = [];
    Object.keys(solverData).forEach(function (cell) {
        cells.push([cell, solverData[cell][2]]);
    });
    cells.sort(function (a, b) {
        return b[1] - a[1];
    });
    cells = cells.map(function (d) {
        return d[0];
    });

    return cells;
};
var sortCellsByBox = function (cellData) {
    cells = Object.keys(cellData);
    cells.sort(function (cell1, cell2) {
        box1 = getBoxNo(cell1);
        box2 = getBoxNo(cell2);
        if (box1 == box2) {
            if (cell1[1] == cell2[1]) {
                //console.log("I am here!", cell1, cell2, alphabet.indexOf(cell1[0]), alphabet.indexOf(cell2[0]))
                return alphabet.indexOf(cell2[0]) - alphabet.indexOf(cell1[0]);
            } else {
                return cell2[1] - cell1[1];
            }
        } else {
            return box2 - box1;
        }
    });
    return cells;
};
var sortCellsByRow = function (cellData) {
    cells = Object.keys(cellData);
    cells.sort(function (cell1, cell2) {
        if (cell1[1] == cell2[1]) {
            return alphabet.indexOf(cell2[0]) - alphabet.indexOf(cell1[0]);
        } else {
            return cell2[1] - cell1[1];
        }
    });
    return cells;
};
var sortCellsByCol = function (cellData) {
    cells = Object.keys(cellData);
    cells.sort(function (cell1, cell2) {
        if (cell1[0] == cell2[0]) {
            return cell2[1] - cell1[1];
        } else {
            return alphabet.indexOf(cell2[0]) - alphabet.indexOf(cell1[0]);
        }
    });
    return cells;
};


var getCells = function (data) {
    // let cells = getAllCells()
    let cells = {};
    Object.values(data).forEach(function (participant) {
        if (!(participant[0] == "Participant_ID")) {
            Object.keys(participant).forEach(function (step) {
                if (step == "Participant_ID" || participant[step] == "") {
                } else if (!(participant[step] in cells)) {
                    cells[participant[step]] = [parseInt(step), 1, parseInt(step)];
                } else {
                    cells[participant[step]] = [cells[participant[step]][0] + parseInt(step), cells[participant[step]][1] + 1, (cells[participant[step]][0] + parseInt(step)) / cells[participant[step]][1] + 1];
                }
            });
        }
    });
    return cells;
};

grouping = false;
solverLines = true;
GROUPING = "ROW";
var draw = function (sudoku_id) {

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    function ordering(cellData, update_axes) {
        var sect = document.getElementById("inds");
        var choice = sect.options[sect.selectedIndex].value;
        switch (choice) {
            case "Avg":
                cells = sortCellsByAverage(cellData);
                update_axes();
                break;
            case "Box":
                cells = sortCellsByBox(cellData);
                update_axes();
                break;
            case "Row":
                cells = sortCellsByRow(cellData);
                update_axes();
                break;
            case "Col":
                cells = sortCellsByCol(cellData);

                update_axes();
                break;
            case "Solver":
                cells = sortCellsBySolver(solverData);

                update_axes();
                break;
        }
    }

    function getMax(participant_list, flatData) {
        Object.keys(participant_list).forEach(function (step) {
            Object.keys(participant_list[step]).forEach((cell) => {
                noSolver = participant_list[step][cell].filter(participant => participant.substring(0, 1) != "S");

                if (solverLines || noSolver.length>0)
{                flatData.push([step, cell, noSolver.length, participant_list[step][cell]]);}

                if (max < noSolver.length) max = noSolver.length;
            });
        });
    }

    d3.csv("data/" + sudoku_id + ".csv").then(function (data) {
        //clean data, remove excess whitespace
        new_data = []

        Object.keys(data).forEach((participant) => {
            participant_list = {}
            add = true
            Object.keys(data[participant]).forEach((cell) => {
                if (data[participant][cell].trim().startsWith('-')){ add = false}
                else{
                    if (data[participant][cell].trim() !== '')
                    {participant_list[cell] = data[participant][cell].trim();}}
                }
            );
            if (add){
                new_data.push(participant_list)
            }
        });
        data = new_data;
        cellDataRaw = getCells(data);
        solverData = getSolver(data);
        let cellData = cellDataRaw;

        if (grouping) {
            d3.select("#inds").attr("disabled", "true");
            cells = group(GROUPING, cellData);
        } else {
            d3.select("#inds").attr("enabled", "true");
            d3.select("#inds").attr("disabled", null);
            cells = sortCellsByAverage(cellData);
        }

        raw_data = data;

        if (grouping) {
            data = [];
            index = 0;
            switch (GROUPING) {
                case "ROW":
                    index = 1;
                    break;
                case "COL":
                    index = 0;
                    break;
                case "BOX":
                    Object.keys(raw_data).forEach((participant) => {
                        if (participant == "columns") {
                            data[participant] = raw_data[participant];
                        } else {
                            data.push({});
                            Object.keys(raw_data[participant]).forEach((step) => {
                                if (step == "Participant_ID" || raw_data[participant][step] == "") {
                                    data[participant][step] = raw_data[participant][step];
                                } else {
                                    data[participant][step] = boxes[Math.floor((alphabet.indexOf(raw_data[participant][step][0])) / 3) + (Math.floor((raw_data[participant][step][1] - 1) / 3) * 3)];
                                }
                            });
                        }
                    });
            }
            if (GROUPING == "ROW" || GROUPING == "COL") {
                Object.keys(raw_data).forEach((participant) => {
                    if (participant == "columns") {
                        data[participant] = raw_data[participant];
                    } else {
                        data.push({});
                        Object.keys(raw_data[participant]).forEach((step) => {
                            if (step == "Participant_ID" || raw_data[participant][step] == "") {
                                data[participant][step] = raw_data[participant][step];
                            } else {
                                data[participant][step] = raw_data[participant][step][index];
                            }
                        });
                    }

                });
            }

        }

        nested_data = d3.nest().key(function (d) {
            return d["Participant_ID"];
        }).entries(data);
        dimensions = d3.keys(data[0]).filter(function (d) {
            return d != "Participant_ID";
        });
        var get_radius = function (d) {
            if (scaleCircles) return circleScale(d[2]);
            else return 4;

        };
        var y = {};
        x = d3.scaleBand()
            .range([width_PCD / (dimensions.length), width_PCD])
            .domain(dimensions);
        y = d3.scaleBand().range([height, 0]).domain(cells);

        function path(d) {
            y = d3.scaleBand().range([height, 0]).domain(cells);
            if(!solverLines && d["Participant_ID"]&&d["Participant_ID"].substring(0,1) == "S"){return null;}
            try {
                pat = d3.line()(dimensions.map(function (p) {
                    out = [x(p), y(d[p]) + (height / cells.length) / 2];
                    if ((out[1] == undefined)) {
                        return [x(p), height];
                    }
                    return out;
                }));
                return pat;
            } catch(e){
                return null;
            }
        }

        var update_circle_size = function () {
            scaleCircles = d3.select("#CircleScaleBox").property("checked");
            svg2.selectAll(".circle").transition().duration(200).attr("r", get_radius);
        };
        d3.select('#inds').on("change", function () {
            ordering(cellData, update_axes);
        });

        d3.select("#CircleScaleBox").on("change", update_circle_size);
        make_PC_chart = function () {
            y = d3.scaleBand().range([height, 0]).domain(cells);
            dataviz.selectAll("svg").remove();
            svg2 = dataviz.append("svg")
                .attr("width", width_PCD + margin_PCD.left + margin_PCD.right)
                .attr("height", height + margin_PCD.top + margin_PCD.bottom).attr("display", "block")
                .append("g")
                .attr("transform",
                    "translate(" + margin_PCD.left + "," + margin_PCD.top + ")").attr("fill", "red");
            var groups = svg2
                .selectAll("line")
                .data(nested_data)
                .enter().append("g");
            // Draw the axis:
            groups.selectAll("line").data(function (d) {
                return d.values;
            }).enter().append("path").attr("d", path)
                .attr("fill", "none")
                .attr("stroke-width", DEFAULT_LINE_WIDTH)
                .attr("opacity", get_default_opacity)
                .attr("stroke", get_default_colour).attr("class", function (d) {
                return "line sudokuPath ID" + d.Participant_ID;
            }).on("mouseover", function (d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.Participant_ID + "<br/>")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
                .on("mouseout", function (d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
            svg2.data([0]).append("g").each(function (d) {
                d3.select(this).call(d3.axisLeft(y).tickSize(0));
            }).attr("id", "PCDLabels").style("font-size",16).selectAll(".tick text").call(wrap, 10);//.attr("transform", "translate(-5)");
            function wrap(text, width) {
                text.each(function () {
                    var text = d3.select(this);
                    if (text.text().length <= 4) {
                        return;
                    }
                    var words = text.text().split(/\s+/).reverse(),
                        word,
                        line = [],
                        lineNumber = 0,
                        lineHeight = 1.1, // ems
                        y = text.attr("y"),
                        dy = parseFloat(text.attr("dy"));
                    tspan = text.text(null).append("tspan").attr("x", 0).attr("y", 0).attr("dy", -dy + "em");
                    while (word = words.pop()) {
                        line.push(word);
                        tspan.text(line.join(" "));
                        if (tspan.node().getComputedTextLength() > width) {
                            line.pop();
                            tspan.text(line.join(" "));
                            line = [word];
                            tspan = text.append("tspan").attr("x", -2).attr("y", 0).attr("dy", ++lineNumber * lineHeight + -1.1 + "em").text(word);
                        }
                    }
                });
            }

            axis_group = svg2.append("g").attr("id", "PCD_Axes");//.attr("transform", "translate(10)");
            axis_group.selectAll("myAxis")
            // For each dimension of the dataset I add a 'g' element:
                .data(dimensions).enter()
                .append("g")
                // I translate this element to its right position on the x axis
                .attr("transform", function (d) {
                    return "translate(" + x(d) + ")";
                })
                // And I build the axis with the call function
                .each(function (d) {
                    // if (d == 1) {
                    //     d3.select(this).call(d3.axisLeft(y).tickSize(1));
                    //     d3.select(this).attr("class", "cellAxis");
                    // } else
                    d3.select(this).call(d3.axisLeft(y).tickSize(1).tickFormat(""));
                })
                .append("text")
                .style("text-anchor", "middle")
                .style("font-size", 15)
                .attr("y", -9)
                .text(function (d) {
                    return d;
                })
                .style("fill", DEFAULT_LINE_COLOUR);
            svg2.selectAll("myCircles").data(flatData).enter().append("circle").attr("cx", function (d) {
                return x(d[0]);
            }).attr("cy", function (d) {
                return y(d[1]) + (height / cells.length) / 2;
            }).attr("r", function (d) {
                return get_radius(d);
            }).attr("highlighted", false)
                .style("fill", "SlateBlue")
                .attr("class", function (d) {
                    //console.log("VAL", d);
                    return "circle VAL" + d[0] + "_" + d[1].replace(" ", "_");
                })
                .on("mousedown", highlighting).on("mouseover", onCircleHover).on("mouseout", onCircleNoHover);

        };
        var update_axes = function () {
            let time = 500;
            y = d3.scaleBand().range([height, 0]).domain(cells);
            let paths = svg2.selectAll(".line").transition().duration(time).attr("d", path);
            let circles = svg2.selectAll(".circle").transition().duration(time).attr("cy", function (d) {
                return y(d[1]) + (height / cells.length) / 2;
            });
            svg2.select("#PCDLabels").transition().duration(time).call(d3.axisLeft(y).tickSize(1));
        };

        var update_data = function () {
            let time = 500;
            y = d3.scaleBand().range([height, 0]).domain(cells);
        };

        var participant_list = {};
        var flatData = [];
        currently_highlighted_circles = {};
        dimensions.forEach(function (step) {
            participant_list[step] = {};
            cells.forEach(function (cell) {
                participant_list[step][cell] = [];
            });
        });
        // console.log(JSON.parse(JSON.stringify(participant_list)));
        data.forEach(function (participant) {
            Object.keys(participant).forEach(function (step) {
                if (step != "Participant_ID" && participant[step] != "" && participant["Participant_ID"] &&  participant_list[step]) {
                    participant_list[step][participant[step]].push(participant["Participant_ID"]);
                }
            });
        });
        // Object.keys(participant_list).forEach(function(d){
        //     console.log(d, Object.keys(participant_list[d]), Object.values(participant_list[d]))
        // })
        dimensions.forEach(function (step) {
            cells.forEach(function (cell) {
                if (participant_list[step][cell].length == 0) {
                    delete participant_list[step][cell];
                }
            });
        });

        max = 0;
        getMax(participant_list, flatData);


        let circleScale = d3.scaleLinear().range([1, (width_PCD / dimensions.length) < (height / cells.length) ? (width_PCD / dimensions.length) / 2 : (height / cells.length) / 2]).domain([0, max]);
        var highlightCircles = function () {
            all_participants = [];
            first = true;
            if (Object.values(currently_highlighted_circles).length == 0) return;
            Object.values(currently_highlighted_circles).forEach(function (d) {
                if (all_participants.length == 0 && first) {
                    first = false;
                    all_participants = [...participant_list[d[0]][d[1]]];
                } else {
                    all_participants = all_participants.filter(value => participant_list[d[0]][d[1]].includes(value));
                }
            });

            all_participants.forEach(function (participant) {
                d3.selectAll(".ID" + participant)
                    .transition().duration(200)
                    .style("stroke", get_default_colour)
                    .style("stroke-width", DEFAULT_LINE_WIDTH)
                    .style("opacity", get_default_opacity);
            });
            d3.selectAll(".circle").transition().duration(200).style("opacity", (d) => {
                opacity = "0";
                d3.forEach((participant) => {
                    if (all_participants.includes(participant)) opacity = 1;
                });
                return opacity;
            });
        };
        var onCircleClick = function (d) {

            d.highlighted = true;
            currently_highlighted_circles[d[0] + d[1]] = d;
            d3.selectAll(".VAL" + d[0] + "_" + d[1].replace(" ", "_"))
                .attr("stroke", get_default_colour).attr("stroke-width", DEFAULT_LINE_WIDTH);
            d3.selectAll(".sudokuPath")
                .transition().duration(200)
                .style("stroke", "lightgrey")
                .style("opacity", "0")
                .style("stroke-width", DEFAULT_LINE_WIDTH);
            svg2.selectAll(".circle")
                .transition().duration(200)
                .style("opacity", "0.2");
            highlightCircles(d);
        };
        var reset = function () {
            d3.selectAll(".sudokuPath")
                .transition().duration(250).delay(0)
                .style("stroke", get_default_colour)
                .style("opacity", get_default_opacity)
                .style("stroke-width", DEFAULT_LINE_WIDTH);
            d3.selectAll(".circle")
                .transition().duration(200)
                .style("opacity", "1");
        };
        var onCircleNoClick = function (d) {
            d.highlighted = false;
            d3.selectAll(".VAL" + d[0] + "_" + d[1].replace(" ", "_")).attr("stroke", undefined).attr("stroke-width", 0);
            delete currently_highlighted_circles[d[0] + d[1]];
            if (Object.keys(currently_highlighted_circles).length == 0)
                reset();
            else
                svg2.selectAll(".sudokuPath")
                    .transition().duration(200)
                    .style("stroke", "lightgrey")
                    .style("opacity", "0")
                    .style("stroke-width", HIGHLIGHT_LINE_WIDTH);
            highlightCircles();


        };
        var highlighting = function (d) {
            if (d.highlighted)
                onCircleNoClick(d);
            else
                onCircleClick(d);
        };

        function onCircleHover(d) {

            if (grouping) {
                let selection = null;

                switch (GROUPING) {
                    case "ROW":
                        selection = d3.selectAll(".row_" + d[1]);
                        break;
                    case "COL":
                        selection = d3.selectAll(".col_" + d[1]);
                        break;
                    case "BOX":
                        selection = d3.selectAll(".box_" + d[1].replace(" ", "_"));
                        break;
                }
                selection.transition().duration(50).style("fill", "blue").style("opacity", 0.3);
            } else {
                d3.selectAll(".cell_" + d[1]).transition().duration(50).style("fill", "blue").style("opacity", 0.3);
            }

        }

        function onCircleNoHover(d) {
            if (grouping) {
                let selection = null;
                switch (GROUPING) {
                    case "ROW":
                        selection = d3.selectAll(".row_" + d[1]);
                        break;
                    case "COL":
                        selection = d3.selectAll(".col_" + d[1]);
                        break;
                    case "BOX":
                        selection = d3.selectAll(".box_" + d[1].replace(" ", "_"));
                        break;
                }
                selection.transition().duration(50).style("fill", "white").style("opacity", 0.3);
            } else {
                d3.selectAll(".cell_" + d[1]).transition().duration(50).style("fill", "white").style("opacity", 0.3);
            }
        }

        if (!grouping) {
            ordering(cellData, update_axes);
        }

        make_PC_chart();

        // Add axis title


    });
};

var draw_current_sudoku = function () {
    width_PCD = window.innerWidth * width_percent - margin_PCD.left - margin_PCD.right;
    var sect = document.getElementById("sudoku_choice");
    var choice = sect.options[sect.selectedIndex].value;
    draw(choice);
};
d3.select('#grouping').on("change", function () {
    var sect = document.getElementById("grouping");
    var choice = sect.options[sect.selectedIndex].value;
    if (choice == "NA") {
        grouping = false;
    } else {
        grouping = true;
        GROUPING = choice;
    }
    draw_current_sudoku();
});
d3.select("#SolverLineBox").on("change", function () {

    solverLines = d3.select("#SolverLineBox").property("checked");

    draw_current_sudoku();
});
draw_current_sudoku();