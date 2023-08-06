import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetBedData } from "../../app/customHooks";
import { bedDataInterface } from "../../app/interfaces";

interface BedGridInterface {
    length: number,
    width: number,
    whole: boolean,
};

const BedGrid: React.FC<BedGridInterface> = function({length, width, whole}) {
    const [arrowVis, setArrowVis] = useState(false);
    const [addPlot, setAddPlot] = useState(true);

    const { bedid } = useParams();
    const bed = useGetBedData(Number(bedid)) as bedDataInterface;

    // different classes for bed cells/plots: all should have .grid-cell; may also have .selected, .custom-walkway, or .vertical-walkway and/or .horizontal-walkway

    function toggleSelectedPlots(e: React.MouseEvent) {
        const plot = e.target as HTMLTableCellElement;
        // prefer using className to explicitly spell out classes over classList.add/remove, so as to prevent plots from being both selected and walkways
        if (addPlot) {
            if (plot.classList.contains("selected")) {
                plot.className = "grid-cell";
            } else {
                plot.className = "selected grid-cell";
            };
        } else {
            // toggles walkway regardless of what kind (but will ultimately replace w/ custom)
            if (plot.classList.contains("custom-walkway") || plot.classList.contains("horizontal-walkway") || plot.classList.contains("vertical-walkway")) {
                plot.className = "grid-cell selected";
            } else {
                plot.className = "custom-walkway grid-cell";
            };
        };
    };

    // function toggleWalkwayMarkerStyle(e: React.MouseEvent) {
    //     const arrowCell = e.target as HTMLTableCellElement;
    //     arrowCell.classList.toggle("clicked");
    // };

    function toggleWalkwayRowPlacement(line: number, direction: string) {
        // grab all the grid cells in an array
        const allCells = [...document.querySelectorAll(".grid-cell")];
        // find the cells within the row or column by...
        const lineCells = allCells.filter(cell => {
            // ...pulling each grid cell's number and performing operations to determine which cells qualify
            const cellId = Number(cell.getAttribute("id")?.slice(5));
            if (direction === "vertical") {
                if ((cellId - line) % width === 0) {
                    return cell;
                };
            };
            if (direction === "horizontal") {
                if (cellId > (line * width) && cellId <= ((line + 1) * width)) {
                    return cell;
                };
            };
        });
        // then toggle the classes (need to be separate even though they have the same style, otherwise adding a horizontal walkway could interfere with a vertical walkway that was already placed)
        if (direction === "vertical") {
            let dings = 0;
            lineCells.forEach(cell => {
                if (cell.classList.contains("vertical-walkway") || cell.classList.contains("custom-walkway")) {
                    dings++;
                };
            });
            
            if (dings < length) {
                lineCells.forEach(cell => {
                    cell.classList.add("vertical-walkway");
                    cell.classList.remove("custom-walkway", "selected");
                });
            } else if (dings === length) {
                lineCells.forEach(cell => {
                    cell.classList.remove("vertical-walkway", "custom-walkway");
                    if (whole) cell.classList.add("selected");
                });
            };
        };
        if (direction === "horizontal") {
            let dings = 0;
            lineCells.forEach(cell => {
                if (cell.classList.contains("horizontal-walkway") || cell.classList.contains("custom-walkway")) {
                    dings++;
                };
            });
            
            if (dings < width) {
                lineCells.forEach(cell => {
                    cell.classList.add("horizontal-walkway");
                    cell.classList.remove("custom-walkway", "selected");
                });
            } else if (dings === width) {
                lineCells.forEach(cell => {
                    cell.classList.remove("horizontal-walkway", "custom-walkway");
                    if (whole) cell.classList.add("selected");
                });
            };
        };
    };

    function fillSpace(className: string) {
        const allCells = [...document.querySelectorAll(".grid-cell")];
        allCells.forEach(cell => {
            if (!cell.classList.contains("selected") && !cell.classList.contains("horizontal-walkway") && !cell.classList.contains("vertical-walkway") && !cell.classList.contains("custom-walkway")) cell.classList.add(className);
        });
    };

    function clearAllWalkways() {
        const allCells = [...document.querySelectorAll(".grid-cell")];
        allCells.forEach(cell => {
            cell.classList.remove("horizontal-walkway", "vertical-walkway", "custom-walkway");
            if (whole) cell.classList.add("selected");
        });
        // const allMarkers = [...document.querySelectorAll(".arrow")];
        // allMarkers.forEach(marker => marker.classList.remove("clicked"));
    };

    function clearAllSelectedPlots() {
        const allCells = [...document.querySelectorAll(".grid-cell")];
        allCells.forEach(cell => {
            cell.classList.remove("selected");
        });
    };

    function clearAll() {
        const allCells = [...document.querySelectorAll(".grid-cell")];
        allCells.forEach(cell => {
            cell.className = "grid-cell";
        });
    };

    function createBedGrid() {
        let bedInnards = [];
        let counter = 1;
        let lengthCounter = 0;
        let widthCounter = 1;
        for (let j = 0; j <= length; j++) {
            let row = []
            for (let i = 0; i <= width; i++) {
                // first two conditions generate walkway markers
                if (j === 0 && i >= 1) {
                    const width = widthCounter;
                    row.push(<div key={`${j}${i}`} className="arrow-cell">
                        <div key={i} className={arrowVis ? "arrow arrow-down" : "arrow arrow-down hidden"} onClick={(e) => {toggleWalkwayRowPlacement(width, "vertical");}} />
                    </div>);
                    widthCounter++;
                } else if (j >= 1 && i === 0) {
                    const length = lengthCounter;
                    row.push(<div key={`${j}${i}`} className="arrow-cell">
                        <div key={i} className={arrowVis ? "arrow arrow-right" : "arrow arrow-right hidden"} onClick={(e) => {toggleWalkwayRowPlacement(length, "horizontal");}} />
                    </div>);
                    lengthCounter++;
                // renders the very first cell w/ invisible borders
                } else if (j === 0 && i === 0) {
                    row.push(<div key={`${j}${i}`} className="arrow-cell" />);
                // renders all other cells
                } else {
                    let classes = "grid-cell ";
                    if (bed) {
                        const gridData = bed?.gridmap[counter - 1];

                        if (gridData?.selected) classes += "selected ";

                        if (gridData?.horizontalwalkway) classes += "horizontal-walkway ";
                        if (gridData?.verticalwalkway) classes += "vertical-walkway ";
                        if (gridData?.customwalkway) classes += "custom-walkway ";

                        if (gridData?.plantId) classes += "planted";
                    } else {
                        // by default, all cell start off selected
                        classes += "selected";
                    };
                    row.push(<div key={`${j}${i}`} className={classes} id={`cell-${counter}`} onClick={toggleSelectedPlots}  />);
                    counter++;
                };
            };
            bedInnards.push(
                <div key={`row-${j}`} className="row">
                    {row}
                </div>
            );
        };
        return bedInnards;
    };

    useEffect(() => {
        const allCells = [...document.querySelectorAll(".grid-cell")];
        if (whole) {
            allCells.forEach(cell => {
                cell.setAttribute("inert", "true");
            });
        } else {
            allCells.forEach(cell => {
                cell.removeAttribute("inert");
            });
        };
    }, [whole]);

    return (
        <div>
            <div className="bed">
                {createBedGrid()}
            </div>
            <section className="bed-finetuning">
                <h2>CUSTOMIZE</h2>
                <div>
                    <button type="button" className="arrow-toggle-button" onClick={() => setArrowVis(!arrowVis)}>{arrowVis ? "Remove" : "Show"}</button>
                    <p>walkway markers</p>
                </div>
                {whole ?
                    <div>
                        <p>Toggle individual</p>
                        <button type="button" disabled>{addPlot ? "bed" : "walkway"}</button>
                        <p>cells</p>
                    </div> :
                    <div>
                        <p>Toggle individual</p>
                        <button type="button" onClick={() => setAddPlot(!addPlot)}>{addPlot ? "bed" : "walkway"}</button>
                        <p>cells</p>
                    </div>
                }
                <div>
                    <p>Fill empty space with:</p>
                    <button type="button" onClick={() => fillSpace("custom-walkway")}>walkway cells</button>
                    <button type="button" onClick={() => fillSpace("selected")}>bed cells</button>
                </div>
                <div>
                    <p>Clear all:</p>
                    <button type="button" onClick={clearAllWalkways}>walkway cells</button>
                    {whole ?
                        <button type="button" disabled>bed cells</button> :
                        <button type="button" onClick={clearAllSelectedPlots}>bed cells</button>
                    }
                    {whole ?
                        <button type="button" disabled>all cells</button> :
                        <button type="button" onClick={clearAll}>all cells</button>
                    }
                </div>
            </section>
        </div>
    );
};

export default BedGrid;