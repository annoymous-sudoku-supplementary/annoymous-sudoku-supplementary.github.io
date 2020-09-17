let margin_side = {top: 25, right: 10, bottom: 10, left: 0};
var width_side_panel = (window.innerWidth) * 0.25 - margin_PCD.left - margin_PCD.right,
    height_side = (750 - margin_PCD.top - margin_PCD.bottom);
console.log("WIN", window.innerWidth, width_side_panel);
// var grid = d3.select("#grid").append("svg").attr("width", width_side_panel + margin_side.left + margin_side.right).attr("height", width_side_panel + margin_side.left + margin_side.right).attr("transform",
//     "translate(" + margin_side.left + "," + margin_side.top + ")");
var grid = d3.select("#grid").attr("width", width_side_panel + margin_side.left + margin_side.right).attr("height", width_side_panel + margin_side.left + margin_side.right).attr("transform",
    "translate(" + margin_side.left + "," + margin_side.top + ")");
//function gridData initially taken from https://bl.ocks.org/cagrimmett/07f8c8daea00946b9e704e3efcbd5739
var row_grid, lines, column;
var VISBLE_PATH_OPACITY =

cols = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
rows = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];

function setupScale() {
    centering_x = width_side_panel / 18;
    centering_y = (width_side_panel / 18);
    // centering_y = 0;
    x_scale = d3.scaleBand()
        .range([1, width_side_panel])
        .domain(cols);
    y_scale = d3.scaleBand().range([1, width_side_panel])
        .domain(rows);
}

function get_current_sudoku() {
    var sect = document.getElementById("sudoku_choice");
    var choice = sect.options[sect.selectedIndex].value;
    return choice;
}


function draw_current_sudoku_grid(update_now) {
    sudoku_id = get_current_sudoku();
    function get_data() {Promise.all([d3.csv("data/" + sudoku_id + "_sudoku.csv"), d3.csv("data/" + sudoku_id + ".csv")]).then(function (data) {
        //clean data, remove excess whitespace
        function processData() {
            Object.keys(data).forEach((file) => {
                Object.keys(data[file]).forEach((col) => {
                    Object.keys(data[file][col]).forEach((cell) => {
                            data[file][col][cell] = data[file][col][cell].trim();
                        }
                    );
                });
            });

            //split csvs into seperate variables.
            sudoku_raw = data[0];
            participant_data = data[1];
            vals = d3.keys(participant_data[0]).filter(function (d) {
                return d != "columns";
            });
            sudoku = [];
            Object.keys(sudoku_raw).forEach((row) => {
                Object.keys(sudoku_raw[row]).forEach((col) => {
                    if (row == "columns" || col == "") {
                        return;
                    }
                    sudoku.push([sudoku_raw[row][col], row, col]);
                });
            });


            gridData = gridDataCalc();
            lineData = lineDataCalc();
        }

        function gridDataCalc() {
            let data = [];
            let xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
            let ypos = 1;
            let width = width_side_panel / 9;
            let height = width_side_panel / 9;
            for (let row = 0; row < 9; row++) {
                data.push([]);

                // iterate for cells/columns inside rows
                for (let column = 0; column < 9; column++) {
                    data[row].push({
                        x: xpos,
                        y: ypos,
                        width: width,
                        height: height,
                        value: sudoku_raw[rows[row]][cols[column]],
                        cell: (cols[column].toUpperCase() + (row+1))
                    });
                    // increment the x position. I.e. move it over by 50 (width variable)
                    xpos += width;
                }
                // reset the x position after a row is complete
                xpos = 1;
                // increment the y position for the next row. Move it down 50 (height variable)
                ypos += height;

            }
            console.log("GRID", data);
            return data;
        }

        function sudoku_path(d) {
            pat = d3.line()(vals.reduce(function (result, element) {
                if (!d[element]) {
                    return result;
                }
                out = [x_scale(d[element][0].toLowerCase()) + width_side_panel / 9 / 2, y_scale((parseInt(d[element][1]) - 1).toString(10)) + width_side_panel / 9 / 2];
                if ((out[1] == undefined)) {
                    return result;
                }
                result.push(out);
                return result;
            }, []));

            return pat;
        }

        function lineDataCalc() {
            let data = [];
            for (let i = 0; i < 4; i++) {
                let pos = (i / 3) * width_side_panel;
                data.push([[pos, 1], [pos, width_side_panel]]);
                data.push([[1, pos], [width_side_panel, pos]]);
            }
            return data;
        }

        function makeGrid() {
            grid.attr("width", width_side_panel + margin_side.left + margin_side.right).attr("height", width_side_panel + margin_side.left + margin_side.right);

            row_grid = grid.selectAll(".row")
                .data(gridData)
                .enter().append("g")
                .attr("class", "row");
            column = row_grid.selectAll(".square")
                .data(function (d) {
                    return d;
                })
                .enter().append("rect")
                .attr("class", function(d){return "square cell_"+d["cell"]+ " row_"+d.cell[1] + " col_"+d.cell[0] + " box_"+ boxes[Math.floor((alphabet.indexOf(d.cell[0]))/3)+(Math.floor((d.cell[1]-1)/3)*3)].replace(" ", "_")})
                .attr("x", function (d) {
                    return d.x;
                })
                .attr("y", function (d) {
                    return d.y;
                })
                .attr("width", function (d) {
                    return d.width;
                })
                .attr("height", function (d) {
                    return d.height;
                })
                .style("fill", "#fff")
                .style("stroke", "#222");

            console.log("LINES", lineData);
            lines = grid.selectAll(".boxLines").data(lineData).enter().append("path").attr("d", function (d) {
                console.log(d);
                return d3.line()(d);
            }).attr("stroke-width", "2").attr("stroke", "black").attr("class", "boxLines");
            flatGrid = [].concat.apply([], gridData);
            console.log("data", flatGrid);
            // let numbers = grid.selectAll("text").data(flatGrid).enter();
            // number_groups = numbers.selectAll("text").data(sudoku).enter().append("g")
            numbers = grid.selectAll(".numbers").data(flatGrid).enter().append("text").text(function (d) {
                return d.value;
            }).attr("x", function (d) {
                return d.x + d.width / 2;
            }).attr("y", function (d) {
                return d.y + d.height / 2;
            }).attr("font-size", "20px").attr("text-anchor", "middle").attr("alignment-baseline", "middle").attr("class", function(d){return "numbers cellNo_"+d.cell}).attr("padding-top", "2px");
        }
        function arrowPos(d){
            console.log(d);
            Object.keys(d).forEach(function(key){
                if (key != "Participant_ID") {

                }
            });
            return ("translate("+horizontal+" " + vertical + ") rotate("+angle+")")
        }
        function draw() {
            processData();
            setupScale();
            makeGrid();
            if (d3.select("#showGridPaths").property("checked")){
                grid.selectAll(".progressPath").data(participant_data).enter().append("path").attr("d", sudoku_path)
                    .attr("fill", "none")
                    .attr("stroke-width", 2)
                    .attr("opacity", 0.4)
                    .attr("stroke", "blue").attr("class", function (d) {
                    return "sudokuPath progressPath ID" + d.Participant_ID ;
                }).attr("id", function (d) {return "pathid" + d.Participant_ID}).attr("marker-start", "url(#"+"markerArrow)");
                path_texts = grid.selectAll(".path_text").data(participant_data).enter().append("text").attr("class", "path_text");}
            // path_texts.selectAll(".markerArrows").data(participant_data).enter().append("textPath").attr("xlink:href", function(d){
            //     "#pathid" + d.Participant_ID;
            // }).attr("startOffset", "10%").text("➤");

            //grid.selectAll(".markerArrows").data(participant_data).enter().append("path").attr("d", "M2,2 L2,9 L15,6 L2,4").attr("fill" , "black").attr("stroke", "black").attr("transform", arrowPos)
        }

        function update() {
            update_now = true;
            updateGrid();
            draw();
        }



        function updateGrid() {
            width_side_panel = (window.innerWidth) * 0.25 - margin_PCD.left - margin_PCD.right;
            // grid.attr("width", width_side_panel + margin_side.left + margin_side.right).attr("height", width_side_panel + margin_side.left + margin_side.right);
            row_grid = grid.selectAll(".row").remove().exit();
            row_grid.selectAll(".square").remove().exit();
            grid.selectAll(".boxLines").remove().exit();
            grid.selectAll(".numbers").remove().exit();
            grid.selectAll(".progressPath").remove().exit();
            makeGrid();

        }
        if (update_now){
            processData();
            updateGrid();
        }
        function show_paths() {
            if(d3.select("#showGridPaths").property("checked")){
                draw()
            } else{
                grid.selectAll(".progressPath").remove().exit();
            }
        }
        window.addEventListener("resize", update);
        d3.select("#showGridPaths").on("change", show_paths);
        setupScale();
        draw();
    }).catch();}
    get_data()
}

draw_current_sudoku_grid(false);