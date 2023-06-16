import { useState } from "react";
import PlantSortFilter from "./PlantSortFilter";
import PlantSearchResult from "./PlantSearchResult";
import { finalSearchResultInterface } from "./interfaces";

const PlantPicker: React.FC = function() {
    const [ searchTerm, setSearchTerm ] = useState("");
    // const [ liveSearchResults, setLiveSearchResults ] = useState([]);
    // const [ loadingSearchResults, setLoadingSearchResults ] = useState(true);
    const [ finalSearchResults, setFinalSearchResults ] = useState<finalSearchResultInterface[] | string>("Awaiting search results.");
    const [ filtSortSearchResults, setFiltSortSearchResults ] = useState<finalSearchResultInterface[]>([])

    function handleSearchTermChange(e: React.FormEvent) {
        const input = e.target as HTMLInputElement;
        setSearchTerm(input.value);
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
                } else {
                    setFinalSearchResults("No matches found.");
                };
            };
        } catch(err) {
            console.log(err.message);
            setFinalSearchResults("Unable to complete your search.");
        };
    };

    function generateFinalResultsArr() {
        let resultsArr;
        if (filtSortSearchResults.length > 0) {
            resultsArr = filtSortSearchResults.map(result => <PlantSearchResult key={result.id} result={result} />);
        } else if (filtSortSearchResults.length === 0) {
            resultsArr = finalSearchResults.map(result => <PlantSearchResult key={result.id} result={result} />);
        };
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
                <PlantSortFilter finalSearchResults={finalSearchResults}  filtSortSearchResults={filtSortSearchResults} setFiltSortSearchResults={setFiltSortSearchResults} />
                {typeof finalSearchResults === "string" ?
                    // display the string if something's gone wrong
                    <p>{finalSearchResults}</p> : 
                    <ul className="final-search-results-container">
                        {generateFinalResultsArr()}
                    </ul> 
                }
            </div>
        </section>
    );
};

export default PlantPicker;