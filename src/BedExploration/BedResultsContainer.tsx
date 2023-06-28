import { useSearchParams } from "react-router-dom";
import BedResultPreview from "./BedResultPreview";
import { bedDataInterface, userInterface } from "../Shared/interfaces";

interface BedResultsContainerInterface {
    bedResults: bedDataInterface[],
};

const BedResultsContainer: React.FC<BedResultsContainerInterface> = function({ bedResults }) {
    const [ searchParams, setSearchParams ] = useSearchParams();

    let searchBy: string, searchTerm: string, hardinessNums: string[], sunlight: string, soil: string[];

    // search params will either be undefined (if no value was provided) or a string, so check to make sure that it is indeed a string before decoding (otherwise decoding will return "null", which can get confusing when using it as a condition)
    if (searchParams.get("searchBy")) searchBy = decodeURIComponent(searchParams.get("searchBy"));
    if (searchParams.get("searchTerm")) searchTerm = decodeURIComponent(searchParams.get("searchTerm"));
    if (searchParams.get("hardinessNums")) hardinessNums = decodeURIComponent(searchParams.get("hardinessNums")).split(",");
    if (searchParams.get("sunlight")) sunlight = decodeURIComponent(searchParams.get("sunlight"));
    if (searchParams.get("soil")) soil = decodeURIComponent(searchParams.get("soil")).split(",");

    function generateBedResults() {
        // filtering
        if (bedResults.length > 0) {
            let bedResultsCopy = [...bedResults];

            if (searchBy && searchTerm) {
                if (searchBy === "bednames") {
                    bedResultsCopy = bedResultsCopy.filter(result => result.name.includes(searchTerm));
                } else if (searchBy === "usernames") {
                    bedResultsCopy = bedResultsCopy.filter(result => result.username.includes(searchTerm));
                } else if (searchBy === "plants") {
                    bedResultsCopy = bedResultsCopy.filter(result => {
                        let match = null;
                        result.seedbasket.forEach(plant => {
                            if (plant.name.toLowerCase().includes(searchTerm)) match = result;
                        });
                        return match;
                    });
                };
            };
            if (hardinessNums) {
                hardinessNums.forEach(num => {
                    bedResultsCopy = bedResultsCopy.filter(result => result.hardiness === Number(num));
                });
            };
            if (sunlight) {
                bedResultsCopy = bedResultsCopy.filter(result => result.sunlight === sunlight);
            };
            if (soil) {
                soil.forEach(soilCondition => {
                    bedResultsCopy = bedResultsCopy.filter(result => result.soil.includes(soilCondition));
                });
            };

            const bedResultsArr = bedResultsCopy.map((result, index) => <BedResultPreview bed={result} key={index} />);
            return bedResultsArr;
        };
    };

    return (
        <div className="bed-results-container">
            {generateBedResults()}
        </div>
    )
};

export default BedResultsContainer;