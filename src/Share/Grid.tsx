import { bedDataInterface } from "../app/interfaces";

interface bedPlantingGridInterface {
    bedData: bedDataInterface | null
};

const Grid: React.FC<bedPlantingGridInterface> = function({ bedData }) {
    function createBedGrid() {
        let bedInnards = [];
        let counter = 1;
        if (bedData) {
            for (let j = 0; j < bedData.length; j++) {
                let row = []
                for (let i = 0; i < bedData.width; i++) {
                    let classes = "grid-cell ";
                    const gridData = bedData?.gridmap[counter - 1];
                    if (gridData.selected) classes += "selected ";
                    if (gridData.horizontalwalkway || gridData.verticalwalkway || gridData.customwalkway) classes += "walkway ";
                    if (!gridData.selected && !gridData.horizontalwalkway && !gridData.verticalwalkway && !gridData.customwalkway) classes += "away";
                    if (gridData.plantId) classes += "planted";
                    
                    row.push(<div key={`${j}${i}`} className={classes} id={`cell-${counter}`} data-plant-id={gridData.plantId} data-plant-name={gridData.plantName} style={{backgroundColor: gridData.gridColor}} />);       
                    counter++;
                };
                bedInnards.push(
                    <div key={`row-${j}`} className="row">
                        {row}
                    </div>
                );
            };
        }
        return bedInnards;
    };

    return (
        <div className="bed-planting-grid">
            <div className="bed planting-bed">
                {createBedGrid()}
            </div>
        </div>
    ); 
};

export default Grid;