import { useState } from "react";
import BedGrid from "./BedGrid";

interface BedGridFormInterface {
    length: number;
    setLength: React.Dispatch<React.SetStateAction<number>>,
    width: number,
    setWidth: React.Dispatch<React.SetStateAction<number>>,
    whole: boolean,
    setWhole: React.Dispatch<React.SetStateAction<boolean>>,
    name: string,
    setName: React.Dispatch<React.SetStateAction<string>>,
    publicBoard: boolean,
    setPublicBoard: React.Dispatch<React.SetStateAction<boolean>>,
    address: string,
    setAddress: React.Dispatch<React.SetStateAction<string>>,
    pullAutocompletedAddresses: (value: string) => Promise<void>,
    generateAutocompletedAddresses: () => JSX.Element[] | undefined,
    coordinates: {latitude: number, longitude: number} | null,
    pullCoordinates: () => Promise<void>,
    resetCoordinates: () => void,
};

const BedGridForm: React.FC<BedGridFormInterface> = function({ length, setLength, width, setWidth, whole, setWhole, name, setName, publicBoard, setPublicBoard, address, setAddress, pullAutocompletedAddresses, generateAutocompletedAddresses, coordinates, pullCoordinates, resetCoordinates }) {
    const [maintainSquare, setMaintainSquare] = useState(false);

    // HANDLING GRID DIMENSIONS
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
            <div className="meta-container">
                <div className="bed-name-input">
                    <label htmlFor="name">Name:</label>
                    <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                    <input type="checkbox" name="public" id="public" checked={publicBoard} onChange={() => setPublicBoard(!publicBoard)} />
                    <label htmlFor="public">Make board public (allow other users to view, favorite, and make copies of this board)</label>
                </div>
                {publicBoard ?
                    <div>
                        <p>Adding a location allows others users in your area to discover your garden bed more quickly.</p>
                        <label htmlFor="location">Specify an address</label>
                        <input type="text" id="location" value={address} onChange={(e) => {setAddress(e.target.value); pullAutocompletedAddresses(e.target.value);}} />
                        <ul>
                            {generateAutocompletedAddresses()}
                        </ul>
                        <button type="button" onClick={() => setAddress("")}>Clear</button>

                        <button type="button" onClick={pullCoordinates}>Or use your current coordinates</button>
                        {coordinates ?
                            <div>
                                <p>{`Latitude: ${coordinates?.latitude}`}</p>
                                <p>{`Longitude: ${coordinates?.longitude}`}</p>
                            </div> : null
                        }
                        <button type="button" onClick={resetCoordinates}>Clear</button>
                    </div> : null
                }
            </div>
            <section className="dimensions-section">
                <h2>DIMENSIONS</h2>
                <div className="dimensions-container">
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