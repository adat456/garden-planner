import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetBedsQuery, useUpdateSeedBasketMutation } from "../app/apiSlice";
import { bedDataInterface, plantPickDataInterface, gridMapInterface } from "../app/interfaces";

interface bedPlantingGridInterface {
    curPlantPick: plantPickDataInterface | null,
};

const BedPlantingGrid: React.FC<bedPlantingGridInterface> = function({ curPlantPick }) {
    const { bedid } = useParams();

    const bedObject = useGetBedsQuery(undefined, {
        selectFromResult: ({ data }) => ({
            bed: data?.find(bed => bed.id === Number(bedid))
        }),
    });
    const bed = bedObject.bed;

    const [ lastTen, setLastTen ] = useState<gridMapInterface[][]>([]);
    // JSON.parse(JSON.stringify(bed?.gridmap))
    const [ counter, setCounter ] = useState(1);
    const [ updateGridStatus, setUpdateGridStatus ] = useState("idle");

    function createBedGrid() {
        let bedInnards = [];
        let counter = 1;
        if (bed) {
            for (let j = 0; j < bed.length; j++) {
                let row = []
                for (let i = 0; i < bed.width; i++) {
                    let classes = "grid-cell ";
                    const gridData = bed?.gridmap[counter - 1];
                    if (gridData.selected) classes += "selected ";
                    if (gridData.walkway) classes += "walkway ";
                    if (!gridData.selected && !gridData.walkway) classes += "away";
                    if (gridData.plantId) classes += "planted";
                    
                    row.push(<div key={`${j}${i}`} className={classes} id={`cell-${counter}`} data-plant-id={gridData.plantId} data-plant-name={gridData.plantName} style={{backgroundColor: gridData.gridColor}} onClick={togglePlant} />);       
                    counter++;
                };
                bedInnards.push(
                    <div key={`row-${j}`} className="row">
                        {row}
                    </div>
                );
            };
        };
        return bedInnards;
    };

    function togglePlant(e: React.MouseEvent) {
        const cell = e.target as HTMLDivElement;

        // if a cell is a selected cell and NOT a walkway cell
        if (cell.classList.contains("selected")) {
            const cellNum = Number(cell.getAttribute("id")?.slice(5));
            // if it has already been planted, determine whether the cell's plant ID matches the current plant pick's ID
            if (cell.classList.contains("planted")) {
                // if they do match, remove the planted class and replace the corresponding cell data with scrubbed cell data
                if (cell.getAttribute("data-plant-id") === curPlantPick?.id.toString()) {
                    cell.classList.remove("planted");
                    let gridMapCopy = [...bed?.gridmap];
                    if (gridMapCopy) {
                        let cellCopy = gridMapCopy[cellNum - 1];
                        gridMapCopy?.splice((cellNum - 1), 1, {
                            num: cellCopy.num,
                            selected: cellCopy.selected,
                            walkway: cellCopy.walkway,
                            plantId: 0,
                            plantName: "",
                            gridColor: "",
                        });
                        if (gridMapCopy && bed?.id) {
                            updateBedData(gridMapCopy, bed.id, true)
                        }; 
                    };
                } else {
                    // if they don't match, keep the planted class but replace the cell data with updated plant ID and name
                    let gridMapCopy = [...bed?.gridmap];
                    if (gridMapCopy && curPlantPick) {
                        let cellCopy = gridMapCopy[cellNum - 1];
                        gridMapCopy?.splice((cellNum - 1), 1, {
                            num: cellCopy.num,
                            selected: cellCopy.selected,
                            walkway: cellCopy.walkway,
                            plantId: curPlantPick.id,
                            plantName: curPlantPick.name,
                            gridColor: curPlantPick.gridcolor,
                        });
                        if (gridMapCopy && bed?.id) {
                            updateBedData(gridMapCopy, bed.id, true)
                        }; 
                    };
                };
            } else {
                // if the cell has not yet been planted, just replace the cell with plant ID and name data included
                cell.classList.add("planted");
                let gridMapCopy = [...bed?.gridmap];
                if (gridMapCopy && curPlantPick) {
                    let cellCopy = gridMapCopy[cellNum - 1];
                    gridMapCopy?.splice((cellNum - 1), 1, {
                        num: cellCopy.num,
                        selected: cellCopy.selected,
                        walkway: cellCopy.walkway,
                        plantId: curPlantPick.id,
                        plantName: curPlantPick.name,
                        gridColor: curPlantPick.gridcolor
                    });
                    if (gridMapCopy && bed?.id) {
                        updateBedData(gridMapCopy, bed.id, true)
                    }; 
                };
            };
        };
    };

    function handleUndo() {
        console.log(counter);
        if (counter <= lastTen.length - 1) {
            if (bed?.id) {
                updateBedData(lastTen[counter], bed.id, false);
            }; 
            if (counter < lastTen.length - 1) setCounter(counter + 1);
        };
    };

    function handleRedo() {
        console.log(counter);
        if (counter >= 1) {
            if (bed?.id) {
                updateBedData(lastTen[counter-1], bed.id, false);
            }; 
            if (counter > 1) setCounter(counter - 1);
        };
    };

    function clearAll() {
        const clearedGridMap = bed?.gridmap.map(grid => {
            return ({
                num: grid.num,
                selected: grid.selected,
                walkway: grid.walkway,
                plantId: 0,
                plantName: "",
                gridColor: ""
            });
        });
        if (clearedGridMap && bed?.id) {
            updateBedData(clearedGridMap, bed.id, true)
        };    
    };

    async function updateBedData(gridmap: gridMapInterface[], bedid: number, addToLastTen: boolean) {
        if (updateGridStatus === "idle") {
            try {
                // setUpdateGridStatus("pending");
                // await dispatch(updateGrid({
                //     gridmap, bedid
                // })).unwrap();
            } catch(err) {
                console.error("Unable to update grid:", err.message);
            } finally {
                setUpdateGridStatus("pending");
            };
        };
                
        if (addToLastTen) {
            let lastTenCopy = lastTen;
            let gridMapCopy = JSON.parse(JSON.stringify(bed?.gridmap));
            if (lastTenCopy.length < 10) {
                // adds most recent gridmap instance to index 0 if there are less than 10 instances
                lastTenCopy = [gridMapCopy, ...lastTenCopy];
            } else {
                // if there are 10 instances, remove the last instance before adding the newest
                lastTenCopy = lastTenCopy.slice(0, lastTenCopy.length - 1);
                lastTenCopy = [gridMapCopy, ...lastTenCopy];
            };
            setLastTen(lastTenCopy);

            setCounter(1);
        };
    };

    useEffect(() => {
        setCounter(1);
    }, [bedid]);

    useEffect(() => console.log(lastTen), [lastTen]);

    return (
        <div className="bed-planting-grid">
            <div className="bed planting-bed">
                {createBedGrid()}
            </div>
            <div className="button-cluster">
                <button type="button" onClick={handleUndo}>Undo</button>
                <button type="button" onClick={handleRedo}>Redo</button>
                <button type="button" onClick={clearAll}>Clear</button>
            </div>
        </div>
    ); 
};

export default BedPlantingGrid;