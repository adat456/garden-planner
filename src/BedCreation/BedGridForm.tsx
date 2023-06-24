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
            <h2>DIMENSIONS</h2>
            <section className="dimensions-container">
                <div className="length-width-container">
                    <div>
                        <label htmlFor="length">L:</label>
                        <input type="number" id="length" name="length" value={length} onChange={handleDimChange} />
                    </div>
                    <div>
                        <label htmlFor="width">W:</label>
                        <input type="number" id="width" name="width" value={width} onChange={handleDimChange} />
                    </div>
                </div>
                {maintainSquare ?
                    <button type="button" onClick={handleMaintainSquare}className="active-maintain-square">
                        <svg viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg"><path d="M216,48V88a8,8,0,0,1-16,0V56H168a8,8,0,0,1,0-16h40A8.00008,8.00008,0,0,1,216,48ZM88,200H56V168a8,8,0,0,0-16,0v40a8.00039,8.00039,0,0,0,8,8H88a8,8,0,0,0,0-16Zm120-40a8.00039,8.00039,0,0,0-8,8v32H168a8,8,0,0,0,0,16h40a8.00039,8.00039,0,0,0,8-8V168A8.00039,8.00039,0,0,0,208,160ZM88,40H48a8.00008,8.00008,0,0,0-8,8V88a8,8,0,0,0,16,0V56H88a8,8,0,0,0,0-16Z"/></svg>
                    </button> : 
                    <button type="button" onClick={handleMaintainSquare}>
                        <svg viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg"><path d="M216,48V88a8,8,0,0,1-16,0V56H168a8,8,0,0,1,0-16h40A8.00008,8.00008,0,0,1,216,48ZM88,200H56V168a8,8,0,0,0-16,0v40a8.00039,8.00039,0,0,0,8,8H88a8,8,0,0,0,0-16Zm120-40a8.00039,8.00039,0,0,0-8,8v32H168a8,8,0,0,0,0,16h40a8.00039,8.00039,0,0,0,8-8V168A8.00039,8.00039,0,0,0,208,160ZM88,40H48a8.00008,8.00008,0,0,0-8,8V88a8,8,0,0,0,16,0V56H88a8,8,0,0,0,0-16Z"/></svg>
                    </button>
                }
                <div className="templates-container">
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
            <div className="whole-toggler-container">
                <p>Use whole grid</p>
                <button type="button" className="toggler" onClick={() => setWhole(!whole)}>
                    <div id="circle" className={whole ? "whole" : "not-whole"}></div>
                    <span className="sr-only"></span>
                </button>
                <p>Place individual cells</p>
            </div>
            <BedGrid length={length} width={width} whole={whole} />
        </>
    );
};

export default BedGridForm;