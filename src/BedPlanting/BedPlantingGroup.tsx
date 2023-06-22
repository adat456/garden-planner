import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { plantPickDataInterface } from "../Shared/interfaces";
import BedPlantingGrid from './BedPlantingGrid';
import PlantPick from "./PlantPick";
import PlantSearch from './PlantSearch';

const BedPlantingGroup: React.FC = function() {
    const [ plantPicks, setPlantPicks ] = useState<plantPickDataInterface[]>([]);
    const [ curPlantPick, setCurPlantPick ] = useState<plantPickDataInterface | null>(null);

    const { bedId } = useParams();

    function generatePlantPicks() {
        const plantPicksArr = plantPicks.map(plant => {
            return (
                <PlantPick key={`plant-pick-${plant.id}`} plant={plant} plantPicks={plantPicks} setPlantPicks={setPlantPicks} setCurPlantPick={setCurPlantPick} />
            );
        });
        return plantPicksArr;
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
        <>
            <BedPlantingGrid curPlantPick={curPlantPick} />
            <section>
                <h2>Seed Basket</h2>
                <ul>
                    {generatePlantPicks()}
                </ul>
            </section>
            <PlantSearch plantPicks={plantPicks} setPlantPicks={setPlantPicks} />
        </>
    );
};

export default BedPlantingGroup;