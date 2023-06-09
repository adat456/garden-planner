import { useState } from "react";
import BedGrid from "./BedGrid";

const BedGridForm: React.FC = function() {
    const [length, setLength] = useState(10);
    const [width, setWidth] = useState(10);
    const [coords, setCoords] = useState<string[] | []>([]);
    const [maintainSquare, setMaintainSquare] = useState(false);
    const [whole, setWhole] = useState(true);
    const [createWalkway, setCreateWalkway] = useState(false);

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

    function handleWalkway() {

    };

    function handleClearAll() {
        setCoords([]);
        const allCells = [...document.querySelectorAll(".cell")];
        allCells.forEach(cell => {
            cell.classList.remove("selected");
        });
    };

    return (
        <>
            <form>
                <div>
                    <input type="checkbox" name="whole" id="whole" onChange={() => setWhole(!whole)} defaultChecked />
                    <label htmlFor="square">Treat grid as whole bed</label>
                </div>
                <input type="checkbox" name="square" id="square" onChange={handleMaintainSquare}/>
                <label htmlFor="square">Maintain equal dimensions</label> 
                <label htmlFor="length">Length</label>
                <input type="number" id="length" name="length" value={length} onChange={handleDimChange} />
                <label htmlFor="width">Width</label>
                <input type="number" id="width" name="width" value={width} onChange={handleDimChange} />
                <label htmlFor="templates">Or select a template:</label>
                <select name="templates" id="templates" onChange={handleTemplateChange}>
                    <option value="None">None</option>
                    <option value="4x4">4' x 4'</option>
                    <option value="4x8">4' x 8'</option>
                    <option value="10x10">10' x 10'</option>
                    <option value="12x24">12' x 24'</option>
                </select>
            </form>
            <hr />
            {whole ?
                <button type="button" disabled>Clear all</button> :
                <button type="button" onClick={handleClearAll}>Clear all</button>
            }
            <BedGrid length={length} width={width} whole={whole} coords={coords} setCoords={setCoords} createWalkway={createWalkway} />
            <button type="button" onClick={() => setCreateWalkway
            (!createWalkway)}>Add a walkway</button>
        </>
    );
};

export default BedGridForm;