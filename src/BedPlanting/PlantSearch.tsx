import { useState, useEffect } from "react";
import PlantSortFilter from "./PlantSortFilter";
import PlantSearchResult from "./PlantSearchResult";
import { plantDataInterface, plantPickDataInterface } from "../Shared/interfaces";
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
    const [ filtSortSearchResults, setFiltSortSearchResults ] = useState<plantDataInterface[]>([]);

    const [ totalPages, setTotalPages ] = useState(0);
    const [ curPage, setCurPage ] = useState(0);

    async function handleSearchTermChange(e: React.FormEvent) {
        const input = e.target as HTMLInputElement;
        setSearchTerm(input.value);
        
        if (input.value === "") {
            setLiveSearchResults([]);
            setExtraResults(0);
        } else {
            const hyphenatedSearchTerm = input.value.trim().replace(/ /g, "-");
            try {
                const req = await fetch(`http://localhost:3000/search/${hyphenatedSearchTerm}`, {credentials: "include"});
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

    function generateLiveResultsArr() {
        let liveResultsArr;
        if (typeof liveSearchResults !== "string") {
            liveResultsArr = liveSearchResults.map(result => {
                return (
                    <li key={result.id}>
                        {plantPicks.find(plant => plant.id === result.id) ?
                            <button type="button" disabled>
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 4C12.5523 4 13 4.44772 13 5V11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H13V19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19V13H5C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11H11V5C11 4.44772 11.4477 4 12 4Z" /></svg>
                            </button> :
                            <button type="button" onClick={() => addPlantPick(result)}>
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 4C12.5523 4 13 4.44772 13 5V11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H13V19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19V13H5C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11H11V5C11 4.44772 11.4477 4 12 4Z" /></svg>
                            </button>
                        }
                        <p>{result.name}</p>
                    </li>
                );
            });
        };
        return liveResultsArr;
    };

    async function handleFinalSearch(e: React.FormEvent) {
        e.preventDefault();
        const hyphenatedSearchTerm = searchTerm.trim().replace(/ /g, "-");

        try {
            const req = await fetch(`http://localhost:3000/search/${hyphenatedSearchTerm}`, {credentials: "include"});
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

    async function addPlantPick(result: plantDataInterface) {
        setPlantPicks([...plantPicks, {
            ...result,
            gridcolor: randomColor().hexString(),
        }]);
    };

    // pagination logic
    
    useEffect(() => {
        console.log("change");
        // sets both the curPage at 1 and the total number of pages whenever either the filtered and sorted array or the final search results array changes
        // so, you'll only be sent to page 1 at the conclusion of every search AND whenever a filter or sort is changed, which makes sense
        function setInitialPagesState(arr: plantDataInterface[]) {
            setCurPage(1);
            const remainder = arr.length % 10;
            const dividend = arr.length / 10;
            if (remainder) {
                const dividendStringArr = dividend.toString().split(".");
                console.log(dividendStringArr);
                const initialValue = Number(dividendStringArr[0]);
                console.log(initialValue);
                const finalValue = initialValue + 1;
                console.log(finalValue);
                setTotalPages(finalValue);
            } else {
                setTotalPages(dividend);
            };
        };

        if (sortFiltOn) {
            if (filtSortSearchResults.length > 10) {
                setInitialPagesState(filtSortSearchResults);
            } else {
                setCurPage(0);
                setTotalPages(1);
            };
        } else {
            if (typeof finalSearchResults !== "string" && finalSearchResults.length > 10) {
                setInitialPagesState(finalSearchResults);
            } else {
                setCurPage(0);
                setTotalPages(1);
            };
        };

    }, [finalSearchResults, filtSortSearchResults, sortFiltOn]);

    function generateFinalResultsArr(arr: plantDataInterface[]) {
        // if there are 10 or fewer results in the array (final search or sorted and filtered), just map through them
        if (totalPages === 1) {
            let resultsArr = arr.map(result => <PlantSearchResult key={result.id} result={result} plantPicks={plantPicks} setPlantPicks={setPlantPicks} />);
            return resultsArr;
        } else {
            // but if there are more than 10 results in the provided array, filter out a subset of that array where the indices belong on the current page
            // e.g., curPage = 3, all results from 31-40 inclusive
            const resultsPageArr = arr.filter((result, index) => {
                if (index >= ((curPage - 1) * 10) && index < (curPage * 10)) {
                    return result;
                };
            });
            // then generate elements from that array subset
            let resultsArr = resultsPageArr.map(result => <PlantSearchResult key={result.id} result={result} plantPicks={plantPicks} setPlantPicks={setPlantPicks} />);
            return resultsArr;
        };
    };

    return(
        <section className="plant-search">
            <form method="GET" onSubmit={handleFinalSearch}>
                <label htmlFor="search">Search seeds:</label>
                <input type="text" name="search" id="search" value={searchTerm} onChange={handleSearchTermChange} />
                <button type="submit">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Interface / Search_Magnifying_Glass"><path id="Vector" d="M15 15L21 21M10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17Z" stroke-linecap="round" stroke-linejoin="round"/></g></svg>
                </button>
            </form>
            <div className="filter-sort-results-container">
                {typeof liveSearchResults === "string" ?
                    <p>{liveSearchResults}</p> :
                    // display the live results if they exist
                    <ul className="live-search-results-container">
                        {generateLiveResultsArr()}
                        {extraResults ? <p className="total-results">{`${extraResults} more results.`}</p> : null }
                    </ul> 
                }
                {typeof finalSearchResults !== "string" ?
                    // display the sorting/filtering if there are final search results
                    <PlantSortFilter finalSearchResults={finalSearchResults} setSortFiltOn={setSortFiltOn} setFiltSortSearchResults={setFiltSortSearchResults} /> :
                    null
                }
                {typeof finalSearchResults === "string" ?
                    // display the string if something's gone wrong
                    <p>{finalSearchResults}</p> : 
                    // else display either the filtered or the original final search results
                    sortFiltOn ?
                        <>
                            <h3 className="total-results">{`${filtSortSearchResults.length} results`}</h3>
                            {totalPages > 1 ?
                                <div className="pages-button-cluster">
                                    {curPage === 1 ?
                                        <button type="button" disabled>BACK</button> :
                                        <button type="button" onClick={() => setCurPage(curPage - 1)}>BACK</button> 
                                    }
                                    <p>{`Page ${curPage} of ${totalPages}`}</p>
                                    {curPage === totalPages ?
                                        <button type="button" disabled>NEXT</button> : 
                                        <button type="button" onClick={() => setCurPage(curPage + 1)}>NEXT</button>
                                    }
                                </div> : null
                            }
                            <ul className="final-search-results-container">
                                {generateFinalResultsArr(filtSortSearchResults)}
                            </ul>
                            {totalPages > 1 ?
                                <div className="pages-button-cluster">
                                    {curPage === 1 ?
                                        <button type="button" disabled>BACK</button> :
                                        <button type="button" onClick={() => setCurPage(curPage - 1)}>BACK</button> 
                                    }
                                    <p>{`Page ${curPage} of ${totalPages}`}</p>
                                    {curPage === totalPages ?
                                        <button type="button" disabled>NEXT</button> : 
                                        <button type="button" onClick={() => setCurPage(curPage + 1)}>NEXT</button>
                                    }
                                </div> : null
                            }
                        </> :
                        <>
                            <h3 className="total-results">{`${finalSearchResults.length} results`}</h3>
                            {totalPages > 1 ?
                                <div className="pages-button-cluster">
                                    {curPage === 1 ?
                                        <button type="button" disabled>BACK</button> :
                                        <button type="button" onClick={() => setCurPage(curPage - 1)}>BACK</button> 
                                    }
                                    <p>{`Page ${curPage} of ${totalPages}`}</p>
                                    {curPage === totalPages ?
                                        <button type="button" disabled>NEXT</button> : 
                                        <button type="button" onClick={() => setCurPage(curPage + 1)}>NEXT</button>
                                    }
                                </div> : null
                            }
                            <ul className="final-search-results-container">
                                {generateFinalResultsArr(finalSearchResults)}
                            </ul>
                            {totalPages > 1 ?
                                <div className="pages-button-cluster">
                                    {curPage === 1 ?
                                        <button type="button" disabled>BACK</button> :
                                        <button type="button" onClick={() => setCurPage(curPage - 1)}>BACK</button> 
                                    }
                                    <p>{`Page ${curPage} of ${totalPages}`}</p>
                                    {curPage === totalPages ?
                                        <button type="button" disabled>NEXT</button> : 
                                        <button type="button" onClick={() => setCurPage(curPage + 1)}>NEXT</button>
                                    }
                                </div> : null
                            }
                        </>
                }
            </div>
        </section>
    );
};

export default PlantSearch;