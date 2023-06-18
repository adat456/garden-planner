import { plantDataInterface } from "../interfaces";

interface plantPicksInterface {
    plantPicks: plantDataInterface[],
    setPlantPicks: React.Dispatch<React.SetStateAction<plantDataInterface[]>>,
    setCurPlantPick: React.Dispatch<React.SetStateAction<plantDataInterface | null>>
};

const PlantPicks: React.FC<plantPicksInterface> = function({ plantPicks, setPlantPicks, setCurPlantPick }) {
    function generatePlantPicks() {
        const plantPicksArr = plantPicks.map(plant => 
            <li key={plant.id}>
                <p>{plant.name}</p>
                <button type="button" onClick={() => setCurPlantPick(plant)}>Plant in bed</button>
                <button type="button" onClick={() => removePlantPick(plant.id)}>Remove from basket</button>
            </li>
        );
        return plantPicksArr;
    };

    function removePlantPick(id: number) {
        setPlantPicks(plantPicks.filter(plant => plant.id !== id));
    };

    return (
        <section>
            <h2>Seed Basket</h2>
            <ul>
                {generatePlantPicks()}
            </ul>
        </section>
    );
};

export default PlantPicks;