import { useState, useEffect } from "react";
import { useGetCoordinates } from "../app/customHooks";

interface frostDates {
    ten: string,
    thirty: string,
    fifty: string
};

interface weatherData {
    type: string,
    temp_min: number,
    temp_max: number,
    temp: number,
    temp_feels_like: number,
    humidity: number,
    wind_speed: number,
};

const Tools: React.FC = function() {
    // frost is 36 degrees (ignoring freeze is 32, and hard freeze is 28)
    const [ threshold, setThreshold ] = useState("");
    const [ springDates, setSpringDates ] = useState<frostDates | null>(null);
    const [ fallDates, setFallDates ] = useState<frostDates | null>(null);
    const [ weather, setWeather ] = useState<weatherData | null>(null);
    const [ weatherLastUpdated, setWeatherLastUpdated ] = useState("");
    const [ tempConversion, setTempConversion ] = useState("F");

    const { coordinates, pullCoordinates } = useGetCoordinates();

    async function findClosestStation() {
        let closestStation: string = "";
        if (coordinates) {
            try {
                const req = await fetch(`https://api.farmsense.net/v1/frostdates/stations/?lat=${coordinates.latitude}&lon=${coordinates.longitude}`);
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

    async function pullCurrentWeather() {
        if (coordinates) {
            try {
                const req = await fetch(`http://localhost:3000/pull-weather/${coordinates.latitude}/${coordinates.longitude}`, { credentials: "include" });
                const res = await req.json();
                setWeather(res);
            } catch(err) {
                console.error("Unable to obtain current weather: ", err.message);
            };
        };
    };

    function convertFromKelvin(kelvinNum: number, tempConversion: string) {
        if (tempConversion === "C") {
            return Math.round(kelvinNum - 273);
        };
        if (tempConversion === "F") {
            return Math.round((1.8 * (kelvinNum - 273)) + 32);
        };
    };

    useEffect(() => {
        if (coordinates) return;
        pullCoordinates();
    }, []);

    // const TEN_MIN_MS = 600000;
    // useEffect(() => {
    //     pullCurrentWeather();

    //     const dateTimeArr = new Date().toLocaleString().split(",");
    //     const time = dateTimeArr[1].slice(0, -6) + " " + dateTimeArr[1].slice(-2);
    //     setWeatherLastUpdated(time);

    //     const interval = setInterval(() => {
    //         pullCurrentWeather();

    //         const dateTimeArr = new Date().toLocaleString().split(",");
    //         const time = dateTimeArr[1].slice(0, -6) + " " + dateTimeArr[1].slice(-2);
    //         setWeatherLastUpdated(time);
    //     }, TEN_MIN_MS);

    //     return () => clearInterval(interval);
    // }, [coords]);

    return (
        <section>
            <h2>Garden Tools</h2>

            <p>{`Latitude: ${coordinates?.latitude}`}</p>
            <p>{`Longitude: ${coordinates?.longitude}`}</p>

            
            <section>
                <p>{`Weather last updated ${weatherLastUpdated}`}</p>
                <button type="button" onClick={pullCurrentWeather}>Refresh current weather</button>
                <div>
                    <div>
                        <input type="radio" name="tempConversion" id="F" checked={tempConversion === "F"} onChange={() => setTempConversion("F")} />
                        <label htmlFor="F">Fahrenheit</label>
                    </div>
                    <div>
                        <input type="radio" name="tempConversion" id="C" checked={tempConversion === "C"} onChange={() => setTempConversion("C")}  />
                        <label htmlFor="C">Celsius</label>
                    </div>
                </div>
                <div>
                    <h3>Current forecast</h3>
                    <p>{weather?.type}</p>
                    <p>{`${convertFromKelvin(weather?.temp, tempConversion)} ${tempConversion}, feels like ${convertFromKelvin(weather?.temp_feels_like, tempConversion)} ${tempConversion}`}</p>
                    <p>{`Min: ${convertFromKelvin(weather?.temp_min, tempConversion)} ${tempConversion}`}</p>
                    <p>{`Min: ${convertFromKelvin(weather?.temp_max, tempConversion)} ${tempConversion}`}</p>
                    <p>{`Humidity: ${weather?.humidity}%`}</p>
                </div>
            </section>

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
                <p>Distinctions and descriptions from "https://www.almanac.com/gardening/frostdates"</p>
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