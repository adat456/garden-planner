import { useState, useEffect } from "react";
import { plantDataInterface } from "../Shared/interfaces";

interface PlantSortFilterInterface {
    finalSearchResults: plantDataInterface[] | string,
    setFiltSortSearchResults: React.Dispatch<React.SetStateAction<plantDataInterface[]>>,
    setSortFiltOn: React.Dispatch<React.SetStateAction<boolean>>
};

const PlantSortFilter: React.FC<PlantSortFilterInterface> = function({ finalSearchResults, setFiltSortSearchResults, setSortFiltOn}) { 
    const [ hardinessFilters, setHardinessFilters ] = useState<number[]>([]);
    const [ lifecycleFilter, setLifecycleFilter ] = useState<string>("");
    const [ waterFilter, setWaterFilter ] = useState("");
    const [ lightFilter, setLightFilter ] = useState("");
    const [ plantingSznFilter, setPlantingSznFilter ] = useState("");
    // may be name, days to maturation, or height in inches
    const [ sorter, setSorter ] = useState("");
    // either ascending or descending
    const [ ascending, setAscending ] = useState(true);

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
        let finalSearchResultsCopy = finalSearchResults as plantDataInterface[];

        if (hardinessFilters.length === 0 && !lifecycleFilter && !waterFilter && !lightFilter && !plantingSznFilter && !sorter) {
            setSortFiltOn(false);
            setFiltSortSearchResults([]);
        } else {
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
    }, [hardinessFilters, lifecycleFilter, waterFilter, lightFilter, plantingSznFilter, sorter, ascending, finalSearchResults]);

    function resetAll() {
        setHardinessFilters([]);
        setLifecycleFilter("");
        setWaterFilter("");
        setLightFilter("");
        setPlantingSznFilter("");
        setSorter("");
    };

    return (
        <form className="filter-sort-form">
            <fieldset className="filters-container">
                <legend>Filter by: </legend>
                <fieldset className="hardiness-filters-container">
                    <legend>Hardiness zones</legend>
                    {generateHardinessButtons()}
                </fieldset>
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
                    <legend>Water needs</legend>
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
                    <legend>Light needs</legend>
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
            </fieldset>
            <div className="sorters-container">
                <label htmlFor="sorters">Sort by:</label>
                <select name="sorters" id="sorters" onChange={(e) => setSorter(e.target.value)}>
                    <option value=""></option>
                    <option value="name">Name</option>
                    <option value="dtm">Days to maturity</option>
                    <option value="height">Height (in)</option>
                </select>
                <button type="button" onClick={() => setAscending(!ascending)}>{!ascending ? "Descending" : "Ascending"}</button>
            </div>
            <button type="reset" onClick={resetAll}>Reset all</button>
        </form>
    )
};

export default PlantSortFilter;