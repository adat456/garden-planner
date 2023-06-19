import { useState } from "react";
import PlantSortFilter from "./PlantSortFilter";
import PlantSearchResult from "./PlantSearchResult";
import { plantDataInterface, plantPickDataInterface } from "../interfaces";
import randomColor from "random-color";

interface plantSearchInterface {
    plantPicks: plantPickDataInterface[],
    setPlantPicks: React.Dispatch<React.SetStateAction<plantPickDataInterface[]>>
};

const PlantSearch: React.FC<plantSearchInterface> = function({ plantPicks, setPlantPicks }) {
    const [ searchTerm, setSearchTerm ] = useState("");
    const [ liveSearchResults, setLiveSearchResults ] = useState<plantDataInterface[] | string>([]);
    const [ extraResults, setExtraResults ] = useState<number>(0);
    const [ finalSearchResults, setFinalSearchResults ] = useState<plantDataInterface[] | string>("Awaiting search results.");
    // used to determine whether the original or the sorted and filtered array should be displayed
    const [ sortFiltOn, setSortFiltOn ] = useState(false);
    const [ filtSortSearchResults, setFiltSortSearchResults ] = useState<plantDataInterface[]>([])

    async function handleSearchTermChange(e: React.FormEvent) {
        const input = e.target as HTMLInputElement;
        setSearchTerm(input.value);
        
        if (input.value === "") {
            setLiveSearchResults([]);
        } else {
            const hyphenatedSearchTerm = input.value.trim().replace(/ /g, "-");
            try {
                const req = await fetch(`http://localhost:3000/search/live/${hyphenatedSearchTerm}`);
                const res = await req.json();
                if (req.ok) {
                    if (res.length > 0) {
                        if (res.length > 5) {
                            setExtraResults(res.length - 5);
                        } else {
                            setExtraResults(0);
                        };
                        setLiveSearchResults(res.slice(0, 5));
                    } else {
                        setLiveSearchResults("No matches found.");
                    };
                };
            } catch(err) {
                console.log(err.message);
            };
        };
    };

    async function handleFinalSearch(e: React.FormEvent) {
        e.preventDefault();
        const hyphenatedSearchTerm = searchTerm.trim().replace(/ /g, "-");

        try {
            const req = await fetch(`http://localhost:3000/search/final/${hyphenatedSearchTerm}`);
            const res = await req.json();
            if (req.ok) {
                if (res.length > 0) {
                    setFinalSearchResults(res);
                    setLiveSearchResults([]);
                } else {
                    setFinalSearchResults("No matches found.");
                    setLiveSearchResults([]);
                };
            };
        } catch(err) {
            console.log(err.message);
            setFinalSearchResults("Unable to complete your search.");
            setLiveSearchResults([]);
        };

        setExtraResults(0);
    };

    function generateLiveResultsArr() {
        let liveResultsArr;
        if (typeof liveSearchResults !== "string") {
            liveResultsArr = liveSearchResults.map(result => {
                return (
                    <li key={result.id}>
                        <h4>{result.name}</h4>
                        {plantPicks.find(plant => plant.id === result.id) ?
                            <button type="button" disabled>+</button> :
                            <button type="button" onClick={() => addPlantPick(result)}>+</button>
                        }
                    </li>
                );
            });
        };
        return liveResultsArr;
    };

    function addPlantPick(result: plantDataInterface) {
        setPlantPicks([...plantPicks, {
            ...result,
            gridcolor: randomColor().hexString(),
        }]);
    };

    function generateFinalResultsArr(arr: plantDataInterface[]) {
        let resultsArr = arr.map(result => <PlantSearchResult key={result.id} result={result} plantPicks={plantPicks} setPlantPicks={setPlantPicks} />);
        return resultsArr;
    };

    return(
        <section>
            <h2>Plant Search, Filter, Sort + Pick</h2>
            <form method="GET" onSubmit={handleFinalSearch}>
                <label htmlFor="search">Search for a vegetable or herb here:</label>
                <input type="text" name="search" id="search" value={searchTerm} onChange={handleSearchTermChange} />
                <button type="submit">Search</button>
            </form>
            <div className="filter-sort-results-container">
                {typeof liveSearchResults === "string" ?
                    <p>{liveSearchResults}</p> :
                    extraResults ?
                        <ul className="live-search-results-container">
                            {generateLiveResultsArr()}
                            <p>{`${extraResults} more results.`}</p>
                        </ul> :
                        <ul className="live-search-results-container">
                            {generateLiveResultsArr()}
                        </ul>
                }
                {typeof finalSearchResults !== "string" ?
                    <PlantSortFilter finalSearchResults={finalSearchResults} setSortFiltOn={setSortFiltOn} setFiltSortSearchResults={setFiltSortSearchResults} /> :
                    null
                }
                {typeof finalSearchResults === "string" ?
                    // display the string if something's gone wrong
                    <p>{finalSearchResults}</p> : 
                    sortFiltOn ?
                        <>
                            <h3>{`Results (${filtSortSearchResults.length})`}</h3>
                            <ul className="final-search-results-container">
                                {generateFinalResultsArr(filtSortSearchResults)}
                            </ul>
                        </> :
                        <>
                            <h3>{`Results (${finalSearchResults.length})`}</h3>
                            <ul className="final-search-results-container">
                                {generateFinalResultsArr(finalSearchResults)}
                            </ul>
                        </>
                }
            </div>
        </section>
    );
};

export default PlantSearch;