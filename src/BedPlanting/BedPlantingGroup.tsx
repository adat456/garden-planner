import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { plantPickDataInterface } from "../Shared/interfaces";
import BedPlantingGrid from './BedPlantingGrid';
import PlantPick from "./PlantPick";
import PlantSearch from './PlantSearch';

const BedPlantingGroup: React.FC = function() {
    const [ plantPicks, setPlantPicks ] = useState<plantPickDataInterface[]>([]);
    const [ curPlantPick, setCurPlantPick ] = useState<plantPickDataInterface | null>(null);
    const [ abbrPlantPicksVis, setAbbrPlantPicksVis ] = useState(false);

    const { bedId } = useParams();

    function generatePlantPicks() {
        const plantPicksArr = plantPicks.map(plant => {
            return (
                <PlantPick key={`plant-pick-${plant.id}`} plant={plant} plantPicks={plantPicks} setPlantPicks={setPlantPicks} setCurPlantPick={setCurPlantPick} abbreviated={false} />
            );
        });
        return plantPicksArr;
    };

    function generateAbbrPlantPicks() {
        const abbrPlantPicksArr = plantPicks.map(plant => {
            return (
                <PlantPick key={`plant-pick-${plant.id}`} plant={plant} plantPicks={plantPicks} setPlantPicks={setPlantPicks} setCurPlantPick={setCurPlantPick} abbreviated={true} />
            );
        });
        return abbrPlantPicksArr;
    };

    useEffect(() => {
        async function updateSeedBasket() {
            const reqOptions: RequestInit = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ seedBasket: plantPicks, bedId }),
                credentials: "include"
            };

            try {
                const req = await fetch("http://localhost:3000/update-seed-basket", reqOptions);
                const res = await req.json();
                if (req.ok) {
                    console.log(res);
                } else {
                    throw new Error(res);
                };
            } catch(err) {
                console.log(err.message);
            };
        };
        updateSeedBasket();
    }, [plantPicks]);

    return (
        <div className="bed-planting-group">
            <BedPlantingGrid curPlantPick={curPlantPick} />
            <section className="seed-basket">
                <h2>SEED BASKET</h2>
                <hr />
                <ul>
                    {generatePlantPicks()}
                </ul>
            </section>
            <section className="abbr-seed-basket">
                {abbrPlantPicksVis ?
                    <ul>
                        {generateAbbrPlantPicks()}
                    </ul> : null
                }
                <div onClick={() => setAbbrPlantPicksVis(!abbrPlantPicksVis)}>
                    <h2>{`SEED BASKET (${plantPicks.length})`}</h2>
                    {abbrPlantPicksVis ?
                        <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8.72798 15.795L3.72798 7.795C3.10356 6.79593 3.82183 5.5 4.99998 5.5L15 5.5C16.1781 5.5 16.8964 6.79593 16.272 7.795L11.272 15.795C10.6845 16.735 9.31549 16.735 8.72798 15.795Z" /></svg> :
                        <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M11.272 5.205L16.272 13.205C16.8964 14.2041 16.1782 15.5 15 15.5H5.00002C3.82186 15.5 3.1036 14.2041 3.72802 13.205L8.72802 5.205C9.31552 4.265 10.6845 4.265 11.272 5.205Z" /></svg>
                    }
                </div>
            </section>
            <PlantSearch plantPicks={plantPicks} setPlantPicks={setPlantPicks} />
        </div>
    );
};

export default BedPlantingGroup;