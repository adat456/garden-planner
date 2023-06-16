import { useEffect, useState } from "react";
import { bedDataInterface } from "./interfaces";

const BedPlantingGrid: React.FC = function() {
    const [loading, setLoading] = useState(true);
    const [bedData, setBedData] = useState<bedDataInterface | null>(null);

    useEffect(() => {
        async function pullBedData() {
            try {
                const req = await fetch("http://localhost:3000/retrieve-bed/2");
                const res = await req.json();
                if (req.ok) {
                    setBedData(res[0]);
                    setLoading(false);
                };
            } catch(err) {
                console.log(err.message);
            };
        };
        pullBedData();
    }, []);

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
                    if (gridData.walkway) classes += "walkway ";
                    row.push(<div key={`${j}${i}`} className={classes} id={`cell-${counter}`} />);       
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
        <div className="bed">
            {loading ? 
                <p>Loading garden bed details...</p> :
                createBedGrid()
            }
        </div>
    );
};

export default BedPlantingGrid;