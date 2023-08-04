import { bedDataInterface } from "../app/interfaces";

interface bedPlantingGridInterface {
    bedData: bedDataInterface | null,
    // either "active" or "inactive"
    interactive: string,
    // will be passed in if the grid is active (e.g., fx for toggling planting)
    handleCellClick?: (e: React.MouseEvent) => void,
};

const Grid: React.FC<bedPlantingGridInterface> = function({ bedData, interactive, handleCellClick }) {
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
                    
                    let gridPlantColor = "";
                    let gridPlantName = "";
                    if (gridData.plantId) {
                        classes += "planted";

                        const seedbasketMatch = bedData?.seedbasket?.find(plant => plant.id === gridData.plantId);
                        if (seedbasketMatch) {
                            gridPlantColor = seedbasketMatch.gridcolor;
                            gridPlantName = seedbasketMatch.name;
                        };
                    };
                    
                    row.push(<div key={`${j}${i}`} className={classes} id={`cell-${counter}`} data-plant-id={gridData.plantId} data-plant-name={gridPlantName} style={{backgroundColor: gridPlantColor}} onClick={handleCellClick} />);       
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
            <div className={`bed planting-bed ${interactive}`}>
                {createBedGrid()}
            </div>
        </div>
    ); 
};

export default Grid;