import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { bedDataInterface, userInterface } from "../Shared/interfaces";
import { isJWTInvalid } from "../Shared/helpers";
import BedResultPreview from "./BedResultPreview";

const BedExplorationPage: React.FC = function() {
    const [ bedResults, setBedResults ] = useState<bedDataInterface[]>([]);
    const [ user, setUser ] = useState<userInterface | null>(null);

    const [ search, setSearch ] = useSearchParams();

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        async function pullUserData() {
            try {
                const req = await fetch("http://localhost:3000/pull-user-data", {credentials: "include"});
                const res = await req.json();
                if (req.ok) {
                    console.log(res);
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
    }, [location])

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

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const searchByElement = document.getElementById("search-category") as HTMLSelectElement;
        const searchBy = searchByElement?.value;

        const searchTermElement = document.getElementById("search-term") as HTMLInputElement;
        const searchTerm = searchTermElement?.value;

        const hardinessButtons = [...document.querySelectorAll(".hardiness-button.active-button")];
        const hardinessNums = JSON.stringify(hardinessButtons?.map(button => button.getAttribute("data-hardiness")));

        const selectedSunlightElement = document.querySelector("input[name=light]:checked") as HTMLInputElement;
        const sunlight = selectedSunlightElement.value;

        const selectedSoilElements = [...document.querySelectorAll("input[name=soil]:checked")] as HTMLInputElement[];
        const soil = JSON.stringify(selectedSoilElements.map(soil => soil.value));

        const params = {
            searchBy, searchTerm, hardinessNums, sunlight, soil
        };
        console.log(params);
    };

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

    function generateBedResults() {
        if (bedResults.length > 0) {
            console.log(bedResults);
            const bedResultsArr = bedResults.map((result, index) => <BedResultPreview bed={result} user={user} key={index} />);
            return bedResultsArr;
        };
    };

    return (
        <>
            <form className="search-beds-form" onSubmit={handleSubmit}>
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
            </form>
            <button type="button" onClick={pullAllPublicBeds}>Browse all</button>
            <section>
                <h2>Results</h2>
                <div className="bed-results-container">
                    {generateBedResults()}
                </div>
            </section>
        </>
    );
};

export default BedExplorationPage;