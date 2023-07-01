// import { useEffect } from "react";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

interface BedSpecsFormInterface {
    hardiness: number[],
    setHardiness: React.Dispatch<React.SetStateAction<number[]>>,
    sunlight: string,
    setSunlight: React.Dispatch<React.SetStateAction<string>>,
    soil: string[],
    setSoil: React.Dispatch<React.SetStateAction<string[]>>,
};

const BedSpecsForm: React.FC<BedSpecsFormInterface> = function({ hardiness, setHardiness, sunlight, setSunlight, soil, setSoil }) {
    function handleSunlightChange(e: React.FormEvent) {
        const input = e.target as HTMLInputElement;
        setSunlight(input.value);
    };

    function handleSoilChange(e: React.FormEvent) {
        const input = e.target as HTMLInputElement;
        if (soil.includes(input.value)) {
            setSoil(soil.filter(soil => soil !== input.value));
        } else {
            setSoil([...soil, input.value]);
        };
    };

    return (
        <section className="bed-specs">
            <h2>SPECIFICATIONS</h2>
            <fieldset>
                <legend>Sunlight:</legend>
                <ul>
                    <li>
                        <input type="radio" name="sunlight" id="full-sun" value="full sun" onChange={handleSunlightChange} />
                        <label htmlFor="full-sun">Full sun</label>
                    </li>
                    <li>
                        <input type="radio" name="sunlight" id="partial-sun" value="partial sun" onChange={handleSunlightChange} />
                        <label htmlFor="partial-sun">Partial sun</label>
                    </li>
                </ul>
            </fieldset>
            <fieldset>
                <legend>Soil:</legend>
                <ul>
                    <li>
                        <input type="checkbox" name="soil" id="well-drained" value="well-drained" onChange={handleSoilChange} />
                        <label htmlFor="well-drained">Well drained/Droughty</label>
                    </li>
                    <li>
                        <input type="checkbox" name="soil" id="poorly-drained" value="poorly drained" onChange={handleSoilChange} />
                        <label htmlFor="poorly-drained">Poorly drained/Damp</label>
                    </li>
                    <li>
                        <input type="checkbox" name="soil" id="high-fertility" value="high fertility" onChange={handleSoilChange} />
                        <label htmlFor="high-fertility">High fertility</label>
                    </li>
                    <li>
                        <input type="checkbox" name="soil" id="low-fertility" value="low fertility" onChange={handleSoilChange} />
                        <label htmlFor="low-fertility">Low fertility</label>
                    </li>
                    <li>
                        <input type="checkbox" name="soil" id="acidic" value="acidic" onChange={handleSoilChange} />
                        <label htmlFor="acidic">Acidic (pH less than 7)</label>
                    </li>
                    <li>
                        <input type="checkbox" name="soil" id="basic" value="basic" onChange={handleSoilChange} />
                        <label htmlFor="basic">Basic (pH greater than 7)</label>
                    </li>
                </ul>    
            </fieldset>
            <div>
                <label htmlFor="hardiness">{`Hardiness: ${hardiness[1]}`}</label>
                <RangeSlider className="single-thumb" value={hardiness} step={1} min={1} max={12} thumbsDisabled={[true, false]} onInput={setHardiness} />
            </div>
        </section>
    );
};

export default BedSpecsForm;