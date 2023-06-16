import { useState } from "react";
import { finalSearchResultInterface } from "./interfaces";

const PlantSearchResult: React.FC<{result: finalSearchResultInterface}> = function({ result }) {
    const [ expanded, setExpanded ] = useState(false);

    return (
        <li key={result.id} id={`final-search-result-${result.id}`} className="final-search-result">
            <h3>{result.name}</h3>
            <div className="button-cluster">
                <button type="button" onClick={() => setExpanded(!expanded)}>{expanded ? "Collapse" : "Expand"}</button>
                <button type="button">Add to garden</button>
            </div>
            {expanded ?
                <div className="expanded-result">
                    <ul>
                        {result.description.map((desc, index) => <li key={index}>{desc}</li>)}
                    </ul>
                </div> : null
            }
        </li>
    );
};

export default PlantSearchResult;