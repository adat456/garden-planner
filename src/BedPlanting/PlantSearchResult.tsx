import { useState } from "react";
import { plantDataInterface, plantPickDataInterface } from "../Shared/interfaces";
import randomColor from "random-color";

interface plantSearchResultsInterface {
    result: plantDataInterface,
    plantPicks: plantPickDataInterface[],
    setPlantPicks: React.Dispatch<React.SetStateAction<plantPickDataInterface[]>>,
    updateSeedBasket: (arr: plantPickDataInterface[]) => Promise<void>
};

const PlantSearchResult: React.FC<plantSearchResultsInterface> = function({ result, plantPicks, setPlantPicks, updateSeedBasket }) {
    const [ expanded, setExpanded ] = useState(false);

    function addPlantPick() {
        const updatedPlantPicks = [...plantPicks, {
           ...result,
           gridcolor: randomColor().hexString(),
        }];
        updateSeedBasket(updatedPlantPicks);
        setPlantPicks(updatedPlantPicks);
    };

    return (
        <li key={result.id} id={`final-search-result-${result.id}`} className="final-search-result">
            <div className="collapsed-result">
                <h4>{result.contributor ? `${result.name} - Contributed by user ${result.contributor}` : `${result.name}`}</h4>
                <div className="button-cluster">
                    <button type="button" onClick={() => setExpanded(!expanded)}>{expanded ? "Collapse" : "Expand"}</button>
                    {plantPicks.find(plant => plant.id === result.id) ?
                        <button type="button" disabled>Add to basket</button> :
                        <button type="button" onClick={addPlantPick}>Add to basket</button>
                    }  
                </div>
            </div>
            {expanded ?
                <div className="expanded-result">
                    {typeof result.description === "string" ?
                        <p>{result.description}</p> :
                        <ul className="desc">
                            {result.description.map((desc, index) => <li key={index}>{desc}</li>)}
                        </ul>
                    }
                    <section>
                        <h5>REQUIREMENTS</h5>
                        <ul className="icons-more-info">
                            <li>
                                <div>
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 18C11.5597 18 11.1318 17.8547 10.7825 17.5867C10.4332 17.3187 10.1821 16.9429 10.0681 16.5176" strokeLinecap="round"/><path d="M10.4243 4.67868C11.0553 3.60606 11.3707 3.06975 11.8223 2.98822C11.9398 2.967 12.0602 2.967 12.1777 2.98822C12.6293 3.06975 12.9447 3.60606 13.5757 4.67868L15.244 7.51482C16.41 9.49693 17.3197 11.619 17.9515 13.8301V13.8301C18.9781 17.4232 16.2801 21 12.5432 21H11.4568C7.71989 21 5.02193 17.4232 6.04854 13.8301V13.8301C6.6803 11.619 7.59004 9.49693 8.75599 7.51482L10.4243 4.67868Z"/></svg>
                                </div>
                                <p className="detail-title">Water</p>
                                <p>{result.water}</p>
                            </li>
                            <li>
                                <div>
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Environment / Sun"><path id="Vector" d="M12 4V2M12 20V22M6.41421 6.41421L5 5M17.728 17.728L19.1422 19.1422M4 12H2M20 12H22M17.7285 6.41421L19.1427 5M6.4147 17.728L5.00049 19.1422M12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17Z" strokeLinecap="round" strokeLinejoin="round"/></g></svg>
                                </div>
                                <p className="detail-title">Light</p>
                                {result.light.map((light, index) => <p key={`light-${index}`}>{light}</p>)}
                            </li>
                            <li>
                                <div>
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9C3 8.01858 3 7.52786 3.21115 7.10557C3.42229 6.68328 3.81486 6.38885 4.6 5.8L7 4V4C7.69964 3.47527 8.04946 3.2129 8.43022 3.11365C8.79466 3.01866 9.17851 3.02849 9.53761 3.14203C9.91278 3.26065 10.2487 3.54059 10.9206 4.10046L12.5699 5.47491C13.736 6.44667 14.3191 6.93255 15.0141 6.95036C15.7091 6.96817 16.3163 6.51279 17.5306 5.60203L18 5.25V5.25C19.2361 4.32295 21 5.20492 21 6.75V14V15C21 15.9814 21 16.4721 20.7889 16.8944C20.5777 17.3167 20.1851 17.6111 19.4 18.2L17 20V20C16.3004 20.5247 15.9505 20.7871 15.5698 20.8863C15.2053 20.9813 14.8215 20.9715 14.4624 20.858C14.0872 20.7394 13.7513 20.4594 13.0794 19.8995L10.9206 18.1005C10.2487 17.5406 9.91278 17.2606 9.53761 17.142C9.17851 17.0285 8.79466 17.0187 8.43022 17.1137C8.04946 17.2129 7.69964 17.4753 7 18V18V18C6.3181 18.5114 5.97715 18.7671 5.7171 18.867C4.61978 19.2885 3.39734 18.6773 3.07612 17.5465C3 17.2786 3 16.8524 3 16V10V9Z" strokeLinejoin="round"/><path d="M15 7.22924V20.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 3.5V16.7083" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                                <p className="detail-title">Hardiness</p>
                                <p>{`${result.hardiness[1]} - ${result.hardiness[result.hardiness.length - 1]}`}</p>
                            </li>
                            <li>
                                <div>
                                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h9.11A1.89 1.89 0 0 0 16 6.11v0c0-1.615-1.894-2.486-3.12-1.435L12.5 5M3 12h14.902C19.06 12 20 12.94 20 14.098v0c0 2.152-2.853 2.91-3.92 1.041L16 15M5 16h6.11A1.89 1.89 0 0 1 13 17.89v0c0 1.615-1.894 2.486-3.12 1.435L9.5 19"/></svg>
                                </div>
                                <p className="detail-title">Growth conditions</p>
                                {result.growconditions.map((condition, index) => <p key={`condition-${index}`}>{condition}</p>)}
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h5>PLANTING</h5>
                        <ul className="icons-more-info">
                            <li>
                                <div>
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9C11.1077 8.98562 10.2363 9.27003 9.52424 9.808C8.81222 10.346 8.30055 11.1066 8.07061 11.9688C7.84068 12.8311 7.90568 13.7455 8.25529 14.5665C8.6049 15.3876 9.21904 16.0682 10 16.5M12 3V5M6.6 18.4L5.2 19.8M4 13H2M6.6 7.6L5.2 6.2M20 14.5351V4C20 2.89543 19.1046 2 18 2C16.8954 2 16 2.89543 16 4V14.5351C14.8044 15.2267 14 16.5194 14 18C14 20.2091 15.7909 22 18 22C20.2091 22 22 20.2091 22 18C22 16.5194 21.1956 15.2267 20 14.5351Z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                                <p className="detail-title">Planting season</p>
                                {result.plantingseason.map((szn, index) => <p key={`szn-${index}`}>{szn}</p>)}
                            </li>
                            <li>
                                <div>
                                    <svg className="shovel" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1"><path d="M21.71,7.38,16.62,2.29a1,1,0,0,0-1.41,0,1,1,0,0,0,0,1.42L17,5.54,11.58,11l-1-1h0a3,3,0,0,0-4.25,0L2.88,13.42A3,3,0,0,0,2,15.55V19a3,3,0,0,0,3,3H8.45a3,3,0,0,0,2.13-.88L14,17.69a3,3,0,0,0,0-4.25l-1-1L18.46,7l1.83,1.83a1,1,0,0,0,1.42,0A1,1,0,0,0,21.71,7.38ZM12.6,16.27,9.16,19.71a1,1,0,0,1-.71.29H5a1,1,0,0,1-1-1V15.55a1,1,0,0,1,.29-.71L7.73,11.4a1,1,0,0,1,1.41,0l1,1-.89.9a1,1,0,0,0,0,1.41A1,1,0,0,0,10,15a1,1,0,0,0,.7-.29l.9-.89,1,1A1,1,0,0,1,12.6,16.27Z"/></svg>
                                </div>
                                <p className="detail-title">Sowing method</p>
                                {result.sowingmethod.map((method, index) => <p key={`method-${index}`}>{method}</p>)}
                            </li>
                            <li>
                                <div>
                                    <svg viewBox="0 0 24 24"><path id="primary" d="M12,3a9,9,0,1,0,9,9A9,9,0,0,0,12,3Zm0,4v5m.69,4.63,2.14-3.13a1,1,0,0,0-.69-1.5H9.86a1,1,0,0,0-.69,1.5l2.14,3.12A.82.82,0,0,0,12.69,16.63Z" strokeLinecap="round" strokeLinejoin="round" fill="none"></path></svg>
                                </div>
                                <p className="detail-title">Depth</p>
                                <p>{result.depth}</p>
                            </li>
                            <li>
                                <div>
                                    <svg viewBox="0 0 24 24" fill="none"><path d="M21 21V3M3 21V3M6.5 12H17.5M17.5 15L17.5 9M6.5 15L6.5 9" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                                <p className="detail-title">Spacing (in)</p>
                                <p>{result.spacingin.length === 1 ?
                                    result.spacingin :
                                    `${result.spacingin[0]} - ${result.spacingin[1]}`
                                }</p>
                            </li>
                            <li>
                                <div>
                                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none"><path d="M12 4v6m0 4v6"/><path strokeLinecap="round" strokeLinejoin="round" d="M9.5 6.5L12 4l2.5 2.5m-5 11L12 20l2.5-2.5m-8-8L4 12l2.5 2.5m11-5L20 12l-2.5 2.5M5.5 12h13"/></svg>
                                </div>
                                <p className="detail-title">Growth habit</p>
                                {result.growthhabit[0] === "" ? "N/A" :
                                    result.growthhabit.map((habit, index) => <p key={`habit-${index}`}>{habit}</p>)
                                }
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h5>YIELD</h5>
                        <ul className="icons-more-info">
                            <li>
                                <div>
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Calendar / Calendar_Days"><path id="Vector" d="M8 4H7.2002C6.08009 4 5.51962 4 5.0918 4.21799C4.71547 4.40973 4.40973 4.71547 4.21799 5.0918C4 5.51962 4 6.08009 4 7.2002V8M8 4H16M8 4V2M16 4H16.8002C17.9203 4 18.4796 4 18.9074 4.21799C19.2837 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V8M16 4V2M4 8V16.8002C4 17.9203 4 18.4801 4.21799 18.9079C4.40973 19.2842 4.71547 19.5905 5.0918 19.7822C5.5192 20 6.07899 20 7.19691 20H16.8031C17.921 20 18.48 20 18.9074 19.7822C19.2837 19.5905 19.5905 19.2842 19.7822 18.9079C20 18.4805 20 17.9215 20 16.8036V8M4 8H20M16 16H16.002L16.002 16.002L16 16.002V16ZM12 16H12.002L12.002 16.002L12 16.002V16ZM8 16H8.002L8.00195 16.002L8 16.002V16ZM16.002 12V12.002L16 12.002V12H16.002ZM12 12H12.002L12.002 12.002L12 12.002V12ZM8 12H8.002L8.00195 12.002L8 12.002V12Z" strokeLinecap="round" strokeLinejoin="round"/></g></svg>
                                </div>
                                <p className="detail-title">Days to maturity</p>
                                <p>{result.daystomaturity.length === 1 ?
                                    result.daystomaturity[0] === "" ? 
                                        "N/A" : result.daystomaturity[0]
                                    : `${result.daystomaturity[0]} - ${result.daystomaturity[1]}`
                                }</p>
                            </li>
                            <li>
                                <div>
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 5.49989L16 6.99989M11.5 8.49989L13 9.99989M8.49996 11.4999L9.99996 12.9999M5.49996 14.4999L6.99996 15.9999M2.56561 17.5656L6.43424 21.4342C6.63225 21.6322 6.73125 21.7313 6.84542 21.7683C6.94584 21.801 7.05401 21.801 7.15443 21.7683C7.2686 21.7313 7.3676 21.6322 7.56561 21.4342L21.4342 7.56561C21.6322 7.3676 21.7313 7.2686 21.7683 7.15443C21.801 7.05401 21.801 6.94584 21.7683 6.84542C21.7313 6.73125 21.6322 6.63225 21.4342 6.43424L17.5656 2.56561C17.3676 2.3676 17.2686 2.2686 17.1544 2.2315C17.054 2.19887 16.9458 2.19887 16.8454 2.2315C16.7313 2.2686 16.6322 2.3676 16.4342 2.56561L2.56561 16.4342C2.3676 16.6322 2.2686 16.7313 2.2315 16.8454C2.19887 16.9458 2.19887 17.054 2.2315 17.1544C2.2686 17.2686 2.3676 17.3676 2.56561 17.5656Z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </div>
                                <p className="detail-title">Height (in)</p>
                                <p>{result.heightin.length === 1 ?
                                    result.heightin[0] === "" ?
                                        "N/A" : result.heightin[0]
                                    : `${result.heightin[0]} - ${result.heightin[1]}`
                                }</p>
                            </li>
                            <li>
                                <div>
                                    <svg className="fruit-size" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.6244 20.6823C14.2892 15.2475 18.4035 10 24 10V10C29.5965 10 33.7108 15.2475 32.3756 20.6824L27.2786 41.4294C26.9078 42.9388 25.5543 44 24 44V44C22.4457 44 21.0922 42.9388 20.7214 41.4294L15.6244 20.6823Z" /><path d="M24 4L24 9.5" strokeLinecap="round"/><path d="M30.1013 5.59171L27.3742 8.84176" strokeLinecap="round"/><path d="M18 5.59174L20.7271 8.84179" strokeLinecap="round"/><path d="M16 19H22" strokeLinecap="round"/><path d="M25 26H31" strokeLinecap="round"/><path d="M19 34H23" strokeLinecap="round"/></svg>
                                </div>
                                <p className="detail-title">Fruit size</p>
                                <p>{result.fruitsize.replace("Fruit Size", "") || "N/A"}</p>
                            </li>
                        </ul>
                    </section>
                </div> : null
            }
        </li>
    );
};

export default PlantSearchResult;