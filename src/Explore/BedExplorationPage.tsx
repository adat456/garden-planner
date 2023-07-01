import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { bedDataInterface } from "../app/interfaces";
import { isJWTInvalid } from "../app/helpers";
import BedResultsContainer from "./BedResultsContainer";

const BedExplorationPage: React.FC = function() {
    const [ bedResults, setBedResults ] = useState<bedDataInterface[]>([]);

    const [ searchParams, setSearchParams ] = useSearchParams();

    const navigate = useNavigate();
    const location = useLocation();

    // pulling ALL public beds

    useEffect(() => {
        async function pullAllPublicBeds() {
            try {
                const req = await fetch("http://localhost:3000/all-public-beds", {credentials: "include"});
                const res = await req.json();
                if (req.ok) {
                    setBedResults(res);
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
        pullAllPublicBeds();
    }, [location]);

    function generateHardinessButtons() {
        let hardinessButtonsArr = [];
        for (let i = 1; i <= 12; i++) {
            hardinessButtonsArr.push(
                <button type="button" key={i} className="hardiness-button" id={`hardiness-filter-${i}`} data-hardiness={i} onClick={() => toggleHardiness(i)}>{i}</button>
            );
        };
        return hardinessButtonsArr;
    };
    function toggleHardiness(number: number) {
        const hardinessButton = document.querySelector(`#hardiness-filter-${number}`) as HTMLButtonElement;
        hardinessButton.classList.toggle("active-button");
    };

    // setting and clearing search params
    function submitSearchParams(e: React.FormEvent) {
        e.preventDefault();
        let params: {
            searchBy?: string,
            searchTerm?: string,
            hardinessNums?: string,
            sunlight?: string,
            soil?: string
        } = {};

        const searchByElement = document.getElementById("search-category") as HTMLSelectElement;
        const searchBy = searchByElement?.value;
        const searchTermElement = document.getElementById("search-term") as HTMLInputElement;
        const searchTerm = searchTermElement?.value.trim().toLowerCase();
        if (searchTerm) {
            params.searchBy = encodeURIComponent(searchBy);
            params.searchTerm = encodeURIComponent(searchTerm);
        };

        const hardinessButtons = [...document.querySelectorAll(".hardiness-button.active-button")];
        const hardinessNums = (hardinessButtons?.map(button => button.getAttribute("data-hardiness"))).join(",");
        if (hardinessNums) params.hardinessNums = encodeURIComponent(hardinessNums);

        const selectedSunlightElement = document.querySelector("input[name=light]:checked") as HTMLInputElement;
        const sunlight = selectedSunlightElement?.value;
        if (sunlight) params.sunlight = encodeURIComponent(sunlight);

        const selectedSoilElements = [...document.querySelectorAll("input[name=soil]:checked")] as HTMLInputElement[];
        const soil = (selectedSoilElements?.map(soil => soil.value)).join(",");
        if (soil) params.soil = encodeURIComponent(soil);


        setSearchParams(params);
    };

    function clearSearchParams() {
        const hardinessButtons = [...document.querySelectorAll(".hardiness-button")] as HTMLDivElement[];
        hardinessButtons.forEach(btn => btn.classList.remove("active-button"));

        setSearchParams({});
    };

    return (
        <>
            <form className="search-beds-form" onSubmit={submitSearchParams}>
                <div>
                    <label htmlFor="search-category">Search by</label>
                    <select name="search-category" id="search-category">
                        <option value="bednames">bed names</option>
                        <option value="usernames">usernames</option>
                        <option value="plants">plants</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="search-term">for</label>
                    <input type="text" name="search-term" id="search-term" />
                </div>
                <div className="filters-container">
                    <fieldset className="hardiness-container">
                        <legend>Hardiness zones</legend>
                        {generateHardinessButtons()}
                    </fieldset>
                    <fieldset className="light-filter-container">
                        <legend>Sunlight</legend>
                        <div>
                            <input type="radio" name="light" id="full-sun" value="full sun" />
                            <label htmlFor="full-sun">Full sun</label>
                        </div>
                        <div>
                            <input type="radio" name="light" id="partial-sun" value="partial sun" />
                            <label htmlFor="partial-sun">Partial sun</label>
                        </div>
                    </fieldset>
                    <fieldset className="soil-filter-container">
                        <legend>Soil:</legend>
                        <ul>
                            <li>
                                <input type="checkbox" name="soil" id="well-drained" value="well-drained" />
                                <label htmlFor="well-drained">Well drained/Droughty</label>
                            </li>
                            <li>
                                <input type="checkbox" name="soil" id="poorly-drained" value="poorly drained" />
                                <label htmlFor="poorly-drained">Poorly drained/Damp</label>
                            </li>
                            <li>
                                <input type="checkbox" name="soil" id="high-fertility" value="high fertility" />
                                <label htmlFor="high-fertility">High fertility</label>
                            </li>
                            <li>
                                <input type="checkbox" name="soil" id="low-fertility" value="low fertility" />
                                <label htmlFor="low-fertility">Low fertility</label>
                            </li>
                            <li>
                                <input type="checkbox" name="soil" id="acidic" value="acidic" />
                                <label htmlFor="acidic">Acidic (pH less than 7)</label>
                            </li>
                            <li>
                                <input type="checkbox" name="soil" id="basic" value="basic" />
                                <label htmlFor="basic">Basic (pH greater than 7)</label>
                            </li>
                        </ul>    
                    </fieldset>
                </div>
                <button type="submit">Search</button>
                <button type="reset" onClick={clearSearchParams}>Clear all filters</button>
            </form>
            <section>
                <h2>Results</h2>
                <BedResultsContainer bedResults={bedResults} />
            </section>
        </>
    );
};

export default BedExplorationPage;