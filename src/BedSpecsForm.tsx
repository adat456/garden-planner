import { useState } from "react";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

// style for lower thumb, which should not be visivle:
// #range-slider .range-slider__thumb[data-lower] {
//     width: 0;
// }

const BedSpecsForm: React.FC = function() {
    // first value will always be 0
    const [hardiness, setHardiness] = useState([0, 5]);

    return (
        <form method="post">
            <fieldset>
                <legend>Sunlight:</legend>
                <div>
                    <input type="radio" name="sunlight" id="full-sun" />
                    <label htmlFor="full-sun">Full sun</label>
                </div>
                <div>
                    <input type="radio" name="sunlight" id="partial-sun" />
                    <label htmlFor="partial-sun">Partial sun</label>
                </div>
            </fieldset>
            <fieldset>
                <legend>Soil:</legend>
                <div>
                    <input type="checkbox" name="soil" id="well-drained" />
                    <label htmlFor="well-drained">Well drained/Droughty</label>
                </div>
                <div>
                    <input type="checkbox" name="soil" id="poorly-drained" />
                    <label htmlFor="poorly-drained">Poorly drained/Damp</label>
                </div>
                <div>
                    <input type="checkbox" name="soil" id="high-fertility" />
                    <label htmlFor="high-fertility">High fertility</label>
                </div>
                <div>
                    <input type="checkbox" name="soil" id="low-fertility" />
                    <label htmlFor="low-fertility">Low fertility</label>
                </div>
                <div>
                    <input type="checkbox" name="soil" id="acidic" />
                    <label htmlFor="acidic">Acidic (pH less than 7)</label>
                </div>
                <div>
                    <input type="checkbox" name="soil" id="basic" />
                    <label htmlFor="basic">Basic (pH greater than 7)</label>
                </div>
            </fieldset>
            <div>
                <label htmlFor="hardiness">Hardiness</label>
                <RangeSlider className="single-thumb" value={hardiness} step={1} min={1} max={10} thumbsDisabled={[true, false]} onInput={setHardiness} />
            </div>
        </form>
    );
};

export default BedSpecsForm;