import { useState } from "react";
import BedGrid from "./BedGrid";

interface BedGridFormInterface {
    length: number;
    setLength: React.Dispatch<React.SetStateAction<number>>,
    width: number,
    setWidth: React.Dispatch<React.SetStateAction<number>>,
    whole: boolean,
    setWhole: React.Dispatch<React.SetStateAction<boolean>>,
};

const BedGridForm: React.FC<BedGridFormInterface> = function({ length, setLength, width, setWidth, whole, setWhole }) {
    const [maintainSquare, setMaintainSquare] = useState(false);

    function handleDimChange(e: React.ChangeEvent) {
        const input = e.target as HTMLInputElement;
        const id = input.getAttribute("id");
        if (id === "length") {
            setLength(Number(input.value));
            if (maintainSquare) setWidth(Number(input.value));
        };
        if (id === "width") {
            setWidth(Number(input.value));
            if (maintainSquare) setLength(Number(input.value));
        };
    };

    function handleMaintainSquare() {
        setMaintainSquare(!maintainSquare);
        if (length > width) setWidth(length);
        if (width > length) setLength(width);
    };

    function handleTemplateChange(e: React.ChangeEvent) {
        const selectField = e.target as HTMLSelectElement;
        const dimensions = selectField.value;
        if (dimensions === "None") {
            setLength(10);
            setWidth(10);
        } else {
            const dimensionArr = dimensions.split("x");
            setLength(Number(dimensionArr[0]));
            setWidth(Number(dimensionArr[1]));
        };
    };

    return (
        <>
            <section>
                <div>
                    <input type="checkbox" name="whole" id="whole" onChange={() => setWhole(!whole)} defaultChecked />
                    <label htmlFor="square">Treat grid as whole bed</label>
                </div>
                <div>
                    <input type="checkbox" name="square" id="square" onChange={handleMaintainSquare}/>
                    <label htmlFor="square">Maintain equal dimensions</label> 
                </div>
                <div>
                    <label htmlFor="length">Length</label>
                    <input type="number" id="length" name="length" value={length} onChange={handleDimChange} />
                </div>
                <div>
                    <label htmlFor="width">Width</label>
                    <input type="number" id="width" name="width" value={width} onChange={handleDimChange} />
                </div>
                <div>
                    <label htmlFor="templates">Or select a template:</label>
                    <select name="templates" id="templates" onChange={handleTemplateChange}>
                        <option value="None">None</option>
                        <option value="4x4">4' x 4'</option>
                        <option value="4x8">4' x 8'</option>
                        <option value="10x10">10' x 10'</option>
                        <option value="12x24">12' x 24'</option>
                    </select>
                </div>
            </section>
            <hr />
            <BedGrid length={length} width={width} whole={whole} />
        </>
    );
};

export default BedGridForm;