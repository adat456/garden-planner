import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { isJWTInvalid } from "../Shared/helpers";
import { bedDataInterface, userInterface } from "../Shared/interfaces";

interface bedResultPreviewInterface {
    bed: bedDataInterface,
    user: userInterface | null
};

const BedResultPreview: React.FC<bedResultPreviewInterface> = function({ bed, user }) {
    const [ numHearts, setNumHearts ] = useState(bed.numhearts);
    const [ numCopies, setNumCopies ] = useState(bed.numcopies);

    const heartButtonRef = useRef(null);

    const navigate = useNavigate();

    function createBedGrid() {
        let bedInnards = [];
        let counter = 1;
        if (bed) {
            for (let j = 0; j < bed.length; j++) {
                let row = []
                for (let i = 0; i < bed.width; i++) {
                    let classes = "grid-cell ";
                    const gridData = bed?.gridmap[counter - 1];
                    if (gridData.selected) classes += "selected ";
                    if (gridData.walkway) classes += "walkway ";
                    if (!gridData.selected && !gridData.walkway) classes += "away";
                    
                    row.push(<div key={`${j}${i}`} className={classes} id={`cell-${counter}`} style={{backgroundColor: gridData.gridColor}} />);       
                    counter++;
                };
                bedInnards.push(
                    <div key={`row-${j}`} className="row">
                        {row}
                    </div>
                );
            };
        }
        return bedInnards;
    };

    async function handleToggleFavorite() {
        const reqOptions: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({id: bed.id}),
            credentials: "include"
        };

        try {
            const req = await fetch("http://localhost:3000/toggle-bed-favorites", reqOptions);
            const res = await req.json();
            if (req.ok) {
                // just front-end aesthetic changes
                if (heartButtonRef?.current?.classList.contains("favorite")) {
                    setNumHearts(numHearts - 1);
                } else {
                    setNumHearts(numHearts + 1);
                };
                heartButtonRef?.current?.classList.toggle("favorite"); 
            } else {
                throw new Error(res);
            };
        } catch(err) {
            const invalidJWTMessage = isJWTInvalid(err);
            if (invalidJWTMessage) {
                console.log(invalidJWTMessage);
                navigate("/sign-in");
            } else {
                console.log(err.message);
            };
        };
    };

    async function handleMakeCopy() {
        const reqOptions: RequestInit = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                bed,
                created: new Date(),
            }),
            credentials: "include"
        };

        try {
            const req = await fetch("http://localhost:3000/copy-bed", reqOptions);
            const res = await req.json();
            if (req.ok) {
                console.log(res);
                setNumCopies(numCopies + 1);
            } else {
                throw new Error(res);
            };
        } catch(err) {
            const invalidJWTMessage = isJWTInvalid(err);
            if (invalidJWTMessage) {
                console.log(invalidJWTMessage);
                navigate("/sign-in");
            } else {
                console.log(err.message);
            };
        };
    };

    return (
        <div className="bed-result-preview">
            <div className="bed">
                {createBedGrid()}
                <div className="bed-overlay">
                    <p>{`${bed.length}' x ${bed.width}'`}</p>
                    <p>{`${bed.seedbasket.length} plant varieties`}</p>
                    <button type="button">Expand</button>
                </div>
            </div>
            <div className="info">
                <div>
                    <h3>{bed.name}</h3>
                    <p>{`by ${bed.username}`}</p>
                </div>
                <div className="favorite">
                    <button type="button" ref={heartButtonRef} className={user?.favorited_beds.includes(bed.id) ? "favorite" : undefined} onClick={handleToggleFavorite} title="Add bed to favorites">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Interface / Heart_02"><path id="Vector" d="M19.2373 6.23731C20.7839 7.78395 20.8432 10.2727 19.3718 11.8911L11.9995 20.0001L4.62812 11.8911C3.15679 10.2727 3.21605 7.7839 4.76269 6.23726C6.48961 4.51034 9.33372 4.66814 10.8594 6.5752L12 8.00045L13.1396 6.57504C14.6653 4.66798 17.5104 4.51039 19.2373 6.23731Z" strokeLinecap="round" strokeLinejoin="round"/></g></svg>
                    </button>
                    <p>{numHearts}</p>
                </div>
                <div className="copy">
                    <button type="button" onClick={handleMakeCopy} title="Copy bed">
                        <svg viewBox="0 0 24 24"xmlns="http://www.w3.org/2000/svg"><g id="Edit / Copy"><path id="Vector" d="M9 9V6.2002C9 5.08009 9 4.51962 9.21799 4.0918C9.40973 3.71547 9.71547 3.40973 10.0918 3.21799C10.5196 3 11.0801 3 12.2002 3H17.8002C18.9203 3 19.4801 3 19.9079 3.21799C20.2842 3.40973 20.5905 3.71547 20.7822 4.0918C21.0002 4.51962 21.0002 5.07967 21.0002 6.19978V11.7998C21.0002 12.9199 21.0002 13.48 20.7822 13.9078C20.5905 14.2841 20.2839 14.5905 19.9076 14.7822C19.4802 15 18.921 15 17.8031 15H15M9 9H6.2002C5.08009 9 4.51962 9 4.0918 9.21799C3.71547 9.40973 3.40973 9.71547 3.21799 10.0918C3 10.5196 3 11.0801 3 12.2002V17.8002C3 18.9203 3 19.4801 3.21799 19.9079C3.40973 20.2842 3.71547 20.5905 4.0918 20.7822C4.5192 21 5.07899 21 6.19691 21H11.8036C12.9215 21 13.4805 21 13.9079 20.7822C14.2842 20.5905 14.5905 20.2839 14.7822 19.9076C15 19.4802 15 18.921 15 17.8031V15M9 9H11.8002C12.9203 9 13.4801 9 13.9079 9.21799C14.2842 9.40973 14.5905 9.71547 14.7822 10.0918C15 10.5192 15 11.079 15 12.1969L15 15" strokeLinecap="round" strokeLinejoin="round"/></g></svg>
                    </button>
                    <p>{numCopies}</p>
                </div>
            </div>
        </div>
    )
};

export default BedResultPreview;