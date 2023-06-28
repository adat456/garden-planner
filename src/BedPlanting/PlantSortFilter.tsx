import { useState, useEffect } from "react";
import { plantDataInterface, userInterface } from "../Shared/interfaces";
import { isJWTInvalid } from "../Shared/helpers";
import { useNavigate } from "react-router-dom";

interface PlantSortFilterInterface {
    finalSearchResults: plantDataInterface[] | string,
    setFiltSortSearchResults: React.Dispatch<React.SetStateAction<plantDataInterface[]>>,
    setSortFiltOn: React.Dispatch<React.SetStateAction<boolean>>
};

const PlantSortFilter: React.FC<PlantSortFilterInterface> = function({ finalSearchResults, setFiltSortSearchResults, setSortFiltOn}) { 
    const [ user, setUser ] = useState<userInterface | null>(null);
    const [ vis, setVis ] = useState("");
    const [ hardinessFilters, setHardinessFilters ] = useState<number[]>([]);
    const [ lifecycleFilter, setLifecycleFilter ] = useState<string>("");
    const [ waterFilter, setWaterFilter ] = useState("");
    const [ lightFilter, setLightFilter ] = useState("");
    const [ plantingSznFilter, setPlantingSznFilter ] = useState("");
    const [ includePersonalVeg, setIncludePersonalVeg ] = useState(true);
    const [ includePublicVeg, setIncludePublicVeg ] = useState(false);
    // may be name, days to maturation, or height in inches
    const [ sorter, setSorter ] = useState("");
    // either ascending or descending
    const [ ascending, setAscending ] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        async function pullUserData() {
            try {
                const req = await fetch("http://localhost:3000/pull-user-data", {credentials: "include"});
                const res = await req.json();
                if (req.ok) {
                    setUser(res);
                } else {
                    throw new Error(res);
                };
            } catch(err) {
                const invalidJWTMessage = isJWTInvalid(err);
                if (invalidJWTMessage) {
                    console.log(invalidJWTMessage);
                    navigate("/sign-in");
                } else {
                    console.log(err.message);
                };
            };
        };
        pullUserData();
    }, [location]);

    function generateHardinessButtons() {
        let hardinessButtonsArr = [];
        for (let i = 1; i <= 12; i++) {
            hardinessButtonsArr.push(
                <button type="button" key={i} className="hardiness-button" id={`hardiness-filter-${i}`} onClick={() => toggleHardiness(i)}>{i}</button>
            );
        };
        return hardinessButtonsArr;
    };
    function toggleHardiness(number: number) {
        if (hardinessFilters.includes(number)) {
            setHardinessFilters(hardinessFilters.filter(filter => filter != number));
        } else {
            setHardinessFilters([...hardinessFilters, number]);
        };
        const hardinessButton = document.querySelector(`#hardiness-filter-${number}`) as HTMLButtonElement;
        hardinessButton.classList.toggle("active-button");
    };

    useEffect(() => {
        console.log(finalSearchResults);
        let finalSearchResultsCopy = finalSearchResults as plantDataInterface[];

        if (hardinessFilters.length === 0 && !lifecycleFilter && !waterFilter && !lightFilter && !plantingSznFilter && includePersonalVeg && includePublicVeg && !sorter) {
            setSortFiltOn(false);
            setFiltSortSearchResults([]);
        } else {
            // by default finalSearchResults will include BOTH formal and user added contributions, and by default user added contributions will be filtered out
            // if this checkbox is checked, then this filtering process will be skipped and any other filtering/sorting ops will be performed on the entire result set
            if (!includePersonalVeg) {
                finalSearchResultsCopy = finalSearchResultsCopy.filter(result => {
                    if (!result.contributor) return result;
                    console.log(result.contributor);
                    console.log(user?.username);
                    if (result.contributor && result.contributor !== user?.username) return result;
                });
            };
            if (!includePublicVeg) {
                console.log("triggered");
                finalSearchResultsCopy = finalSearchResultsCopy.filter(result => {
                    if (!result.contributor) return result;
                    console.log(result.contributor);
                    console.log(user?.username);
                    if (result.contributor && result.contributor === user?.username) return result;
                });
            };
            if (hardinessFilters.length > 0) {
                hardinessFilters.forEach(hardiness => {
                    finalSearchResultsCopy = finalSearchResultsCopy.filter(result => result.hardiness.includes(hardiness.toString()));
                });
            };
            if (lifecycleFilter) {
                finalSearchResultsCopy = finalSearchResultsCopy.filter(result => result.lifecycle.includes(lifecycleFilter));
            };
            if (waterFilter) {
                finalSearchResultsCopy = finalSearchResultsCopy.filter(result => result.water.includes(waterFilter));
            };
            if (lightFilter) {
                finalSearchResultsCopy = finalSearchResultsCopy.filter(result => result.light.includes(lightFilter));
            };
            if (plantingSznFilter) {
                if (plantingSznFilter === "Spring" || plantingSznFilter === "Fall") {
                    finalSearchResultsCopy = finalSearchResultsCopy.filter(result => {
                        if (result.plantingseason.includes(plantingSznFilter) || result.plantingseason.includes("Cool Season")) return result;
                    });
                };
                if (plantingSznFilter === "Summer") {
                    finalSearchResultsCopy = finalSearchResultsCopy.filter(result => {
                        if (result.plantingseason.includes(plantingSznFilter) || result.plantingseason.includes("Warm Season")) return result;
                    });
                };
            };

            if (sorter) {
                switch (sorter) {
                    case "name":
                        if (ascending) finalSearchResultsCopy.sort((a, b) => {
                            if (a.name > b.name) return 1;
                            if (a.name < b.name) return -1;
                        });
                        if (!ascending) finalSearchResultsCopy.sort((a, b) => {
                            if (a.name > b.name) return -1;
                            if (a.name < b.name) return 1;
                        });
                        break;
                    case "dtm": 
                        if (ascending) finalSearchResultsCopy.sort((a, b) => {
                            let adtm = Number(a.daystomaturity[0]);
                            let bdtm = Number(b.daystomaturity[0]);
                            if (adtm && bdtm) {
                                if (adtm > bdtm) return 1;
                                if (adtm < bdtm) return -1;
                            } else {
                                return 0;
                            };
                        });
                        if (!ascending) finalSearchResultsCopy.sort((a, b) => {
                            let adtm = Number(a.daystomaturity[0]);
                            let bdtm = Number(b.daystomaturity[0]);
                            if (adtm && bdtm) {
                                if (adtm > bdtm) return -1;
                                if (adtm < bdtm) return 1;
                            } else {
                                return 0;
                            };
                        });
                        break;
                    case "height":
                        if (ascending) finalSearchResultsCopy.sort((a, b) => {
                            let adtm = Number(a.heightin[0]);
                            let bdtm = Number(b.heightin[0]);
                            if (adtm && bdtm) {
                                if (adtm > bdtm) return 1;
                                if (adtm < bdtm) return -1;
                            } else {
                                return 0;
                            };
                        });
                        if (!ascending) finalSearchResultsCopy.sort((a, b) => {
                            let adtm = Number(a.heightin[0]);
                            let bdtm = Number(b.heightin[0]);
                            if (adtm && bdtm) {
                                if (adtm > bdtm) return -1;
                                if (adtm < bdtm) return 1;
                            } else {
                                return 0;
                            };
                        });
                        break;
                };
            };
            setSortFiltOn(true);
            setFiltSortSearchResults([...finalSearchResultsCopy]);
        };
    }, [hardinessFilters, lifecycleFilter, waterFilter, lightFilter, plantingSznFilter, includePersonalVeg, includePublicVeg, sorter, ascending, finalSearchResults]);

    function resetAll() {
        setHardinessFilters([]);
        setLifecycleFilter("");
        setWaterFilter("");
        setLightFilter("");
        setPlantingSznFilter("");
        setIncludePersonalVeg(true);
        setIncludePublicVeg(false);
        setSorter("");
    };

    return (
        <form className="filter-sort-form">
            <div className="button-cluster">
                <button type="button" onClick={() => setVis("filters")} style={vis === "filters" ? {border: "1px solid #F0CB75", borderBottom: "none", borderRadius: "5px 5px 0 0"} : null}>+ FILTER</button>
                <button type="button" onClick={() => setVis("sorters")} style={vis === "sorters" ? {border: "1px solid #F0CB75", borderBottom: "none", borderRadius: "5px 5px 0 0"} : null}>+ SORTER</button>
            </div>
            {vis === "filters" ?
                <div className="filters-container">
                    <div>
                        <fieldset className="hardiness-container">
                            <legend>Hardiness zones</legend>
                            {generateHardinessButtons()}
                        </fieldset>
                        <div className="radio-button-filters">
                            <fieldset className="lifecycle-filter-container">
                                <legend>Lifecycle</legend>
                                <div>
                                    <input type="radio" name="lifecycle" id="annual" value="Annual" onChange={(e) => setLifecycleFilter(e.target.value)} />
                                    <label htmlFor="annual">Annual</label>
                                </div>
                                <div>
                                    <input type="radio" name="lifecycle" id="biennial" value="Biennial" onChange={(e) => setLifecycleFilter(e.target.value)} />
                                    <label htmlFor="biennial">Biennial</label>
                                </div>
                                <div>
                                    <input type="radio" name="lifecycle" id="perennial" value="Perennial" onChange={(e) => setLifecycleFilter(e.target.value)} />
                                    <label htmlFor="perennial">Perennial</label>
                                </div>
                            </fieldset>
                            <fieldset className="water-filter-container">
                                <legend>Water</legend>
                                <div>
                                    <input type="radio" name="water" id="low" value="Low" onChange={(e) => setWaterFilter(e.target.value)} />
                                    <label htmlFor="low">Low</label>
                                </div>
                                <div>
                                    <input type="radio" name="water" id="average" value="Average" onChange={(e) => setWaterFilter(e.target.value)} />
                                    <label htmlFor="average">Average</label>
                                </div>
                                <div>
                                    <input type="radio" name="water" id="high" value="High" onChange={(e) => setWaterFilter(e.target.value)} />
                                    <label htmlFor="high">High</label>
                                </div>
                            </fieldset>
                            <fieldset className="light-filter-container">
                                <legend>Light</legend>
                                <div>
                                    <input type="radio" name="light" id="full-shade" value="Full Shade" onChange={(e) => setLightFilter(e.target.value)} />
                                    <label htmlFor="full-shade">Full shade</label>
                                </div>
                                <div>
                                    <input type="radio" name="light" id="partial-shade" value="Partial Shade" onChange={(e) => setLightFilter(e.target.value)} />
                                    <label htmlFor="partial-shade">Partial shade</label>
                                </div>
                                <div>
                                    <input type="radio" name="light" id="full-sun" value="Full Sun" onChange={(e) => setLightFilter(e.target.value)} />
                                    <label htmlFor="full-sun">Full sun</label>
                                </div>
                            </fieldset>
                            <fieldset className="planting-szn-filter-container">
                                <legend>Planting season</legend>
                                <div>
                                    <input type="radio" name="season" id="spring" value="Spring" onChange={(e) => setPlantingSznFilter(e.target.value)} />
                                    <label htmlFor="spring">Spring</label>
                                </div>
                                <div>
                                    <input type="radio" name="season" id="summer" value="Summer" onChange={(e) => setPlantingSznFilter(e.target.value)} />
                                    <label htmlFor="summer">Summer</label>
                                </div>
                                <div>
                                    <input type="radio" name="season" id="fall" value="Fall" onChange={(e) => setPlantingSznFilter(e.target.value)} />
                                    <label htmlFor="fall">Fall</label>
                                </div>
                            </fieldset>
                        </div>
                        <div>
                            <input type="checkbox" name="include" id="include" checked={includePersonalVeg} onChange={() => setIncludePersonalVeg(!includePersonalVeg)} />
                            <label htmlFor="include">Include personal contributions</label>
                        </div>
                        <div>
                            <input type="checkbox" name="include-public" id="include-public" checked={includePublicVeg} onChange={() => setIncludePublicVeg(!includePublicVeg)} />
                            <label htmlFor="include-public">Include other users' contributions</label>
                        </div>
                    </div>
                    <div className="button-cluster">
                        <button type="reset" onClick={resetAll}>Reset all</button> 
                        <button type="button" onClick={() => setVis("")}>Close</button>
                    </div>
                </div> : null
            }
            { vis === "sorters" ?
                <div className="sorters-container">
                    <div>
                        <select name="sorters" id="sorters" onChange={(e) => setSorter(e.target.value)}>
                            <option value=""></option>
                            <option value="name">Name</option>
                            <option value="dtm">Days to maturity</option>
                            <option value="height">Height (in)</option>
                        </select>
                        <button type="button" className="sort-order-button" onClick={() => setAscending(!ascending)}>
                            {!ascending ? 
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 7L12 16" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 13L12 17L16 13" strokeLinecap="round" strokeLinejoin="round"/></svg> : 
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 17L12 8" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 11L12 7L8 11" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            }
                        </button>
                    </div> 
                    <div className="button-cluster">
                        <button type="reset" onClick={resetAll}>Reset all</button>
                        <button type="button" onClick={() => setVis("")}>Close</button>
                    </div>
                </div> : null
            }
        </form>
    )
};

export default PlantSortFilter;