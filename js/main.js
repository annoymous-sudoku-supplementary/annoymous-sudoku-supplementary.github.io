d3.select('#sudoku_choice').on("change", function () {
    draw_current_sudoku();
    draw_current_sudoku_grid(true);
});
function openNav() {
    document.getElementById(
        "sidebar").style.display = "inline-block";
    width_percent = 0.75;
    draw_current_sudoku();
    document.getElementById("openSideBar").disabled = true;
}

/* Set the width of the sidebar
to 0 and the left margin of the
page content to 0 */
function closeNav() {
    document.getElementById(        "sidebar").style.display = "none";
    width_percent = 1;
    draw_current_sudoku();
    document.getElementById("openSideBar").disabled = false;
}
