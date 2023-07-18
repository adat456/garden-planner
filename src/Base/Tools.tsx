import { useState } from "react";

interface frostDates {
    ten: string,
    thirty: string,
    fifty: string
};

const Tools: React.FC = function() {
    const [ coords, setCoords ] = useState<{
        latitude: number,
        longitude: number
    } | null>(null);
    // frost is 36 degrees (ignoring freeze is 32, and hard freeze is 28)
    const [ threshold, setThreshold ] = useState("");
    const [ springDates, setSpringDates ] = useState<frostDates | null>(null);
    const [ fallDates, setFallDates ] = useState<frostDates | null>(null);

    function pullCoords() {
        function handleSuccess(position) {
            setCoords({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        };
        const handleError = () => console.log("Unable to pull coordinates.");

        navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    };

    async function findClosestStation() {
        let closestStation: string = "";
        if (coords) {
            try {
                const req = await fetch(`https://api.farmsense.net/v1/frostdates/stations/?lat=${coords.latitude}&lon=${coords.longitude}`);
                const res = await req.json();
                if (req.ok && !res.Error) {
                    closestStation = res[0].id;
                };
            } catch(err) {
                console.error("Unable to find nearby stations: ", err.message);
            };
        };
        return closestStation;
    };

    async function pullFrostDates(season: string) {
        const closestStation = await findClosestStation();
        if (!closestStation)  return;

        const seasonNumber = season === "spring" ? "1" : "2";

        function pullDatesGivenThreshold(arr, percentage: string) {
            const probabilities = arr.find(probabilitiesObj => probabilitiesObj.temperature_threshold === threshold);

            const unformattedDate = probabilities[`prob_${percentage}`];
            const formattedDate = `${unformattedDate.slice(0, 2)}/${unformattedDate.slice(-2)}`
            return formattedDate;
        };

        try {
            const req = await fetch(`https://api.farmsense.net/v1/frostdates/probabilities/?station=${closestStation}&season=${seasonNumber}`);
            const res = await req.json();
            if (req.ok) {
                if (seasonNumber === "1") {
                    setSpringDates({
                        ten: pullDatesGivenThreshold(res, "10"),
                        thirty: pullDatesGivenThreshold(res, "30"),
                        fifty: pullDatesGivenThreshold(res, "50"),
                    });
                } else {
                    setFallDates({
                        ten: pullDatesGivenThreshold(res, "10"),
                        thirty: pullDatesGivenThreshold(res, "30"),
                        fifty: pullDatesGivenThreshold(res, "50"),
                    });
                };
            };
        } catch(err) {
            console.error("Unable to retrieve frost date: ", err.message);
        };
        
    };

    return (
        <section>
            <h2>Garden Tools</h2>
            <button type="button" onClick={pullCoords}>Obtain coordinates</button>
            <p>{`Latitude: ${coords?.latitude}`}</p>
            <p>{`Longitude: ${coords?.longitude}`}</p>

            <div>
                <div>
                    <input type="radio" name="threshold" id="32" onChange={() => setThreshold("32")} />
                    <label htmlFor="32">Light freeze (32F) - "tender plants are killed", most common frost date temperature threshold</label>
                </div>
                <div>
                    <input type="radio" name="threshold" id="28" onChange={() => setThreshold("28")} />
                    <label htmlFor="28">Moderate freeze (28F) - causes wide destruction to most vegetation</label>
                </div>
                <div>
                    <input type="radio" name="threshold" id="24" onChange={() => setThreshold("24")} />
                    <label htmlFor="24">Severe freeze (24F) - "heavy damage to most garden plants"</label>
                </div>
            </div>

            <button type="button" onClick={() => pullFrostDates("spring")}>Pull spring frost dates</button>
            {springDates ?
                <>
                    <table>
                        <thead>
                            <tr>
                                <th>Likelihood of frost after</th>
                                <th>...this date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>50%</td>
                                <td>{springDates?.fifty}</td>
                            </tr>
                            <tr>
                                <td>30%</td>
                                <td>{springDates?.thirty}</td>
                            </tr>
                            <tr>
                                <td>10%</td>
                                <td>{springDates?.ten}</td>
                            </tr>
                        </tbody>
                    </table>
                </>
                : null
            }
            <button type="button" onClick={() => pullFrostDates("fall")}>Pull fall frost dates</button>
            {fallDates ?
                <>
                    <table>
                        <thead>
                            <tr>
                                <th>Likelihood of frost before</th>
                                <th>...this date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>10%</td>
                                <td>{fallDates?.ten}</td>
                            </tr>
                            <tr>
                                <td>30%</td>
                                <td>{fallDates?.thirty}</td>
                            </tr>
                            <tr>
                                <td>50%</td>
                                <td>{fallDates?.fifty}</td>
                            </tr>
                        </tbody>
                    </table>
                </>
                : null
            }
        </section>
    );
};

export default Tools;