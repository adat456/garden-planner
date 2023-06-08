import { useState } from "react";
import BedGrid from "./BedGrid";

const BedGridForm: React.FC = function() {
    const [length, setLength] = useState(10);
    const [width, setWidth] = useState(10);
    const [coords, setCoords] = useState<string[] | []>([]);
    const [maintainSquare, setMaintainSquare] = useState(false);
    const [whole, setWhole] = useState(false);

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

    return (
        <>
            <form>
                <input type="checkbox" name="square" id="square" onChange={handleMaintainSquare}/>
                <label htmlFor="square">Maintain equal dimensions</label>
                <input type="checkbox" name="whole" id="whole" onChange={() => setWhole(!whole)}/>
                <label htmlFor="square">Treat grid as whole bed</label>
                <label htmlFor="length">Length</label>
                <input type="number" id="length" name="length" value={length} onChange={handleDimChange} />
                <label htmlFor="width">Width</label>
                <input type="number" id="width" name="width" value={width} onChange={handleDimChange} />
            </form>
            <button type="button" onClick={() => setCoords([])}>Clear all</button>
            <BedGrid length={length} width={width} coords={coords} setCoords={setCoords} />
        </>
    );
};

export default BedGridForm;