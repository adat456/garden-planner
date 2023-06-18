import { useState } from "react";
import { plantDataInterface } from "../interfaces";

interface plantSearchResultsInterface {
    result: plantDataInterface,
    plantPicks: plantDataInterface[],
    setPlantPicks: React.Dispatch<React.SetStateAction<plantDataInterface[]>>
};

const PlantSearchResult: React.FC<plantSearchResultsInterface> = function({ result, plantPicks, setPlantPicks }) {
    const [ expanded, setExpanded ] = useState(false);

    function addPlantPick() {
        setPlantPicks([...plantPicks, result]);
    };

    return (
        <li key={result.id} id={`final-search-result-${result.id}`} className="final-search-result">
            <h4>{result.name}</h4>
            <div className="button-cluster">
                <button type="button" onClick={() => setExpanded(!expanded)}>{expanded ? "Collapse" : "Expand"}</button>
                {plantPicks.find(plant => plant.id === result.id) ?
                    <button type="button" disabled>Add to basket</button> :
                    <button type="button" onClick={addPlantPick}>Add to basket</button>
                }  
            </div>
            {expanded ?
                <div className="expanded-result">
                    <ul>
                        {result.description.map((desc, index) => <li key={index}>{desc}</li>)}
                    </ul>
                </div> : null
            }
        </li>
    );
};

export default PlantSearchResult;