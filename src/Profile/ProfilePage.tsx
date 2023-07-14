import { useState, useEffect } from "react";
import { plantDataInterface } from "../app/interfaces";
import CreateVeg from "../Create/CreateVeg";

const ProfilePage: React.FC = function() {
    const [ seedContributions, setSeedContributions ] = useState<plantDataInterface[]>([])
    const [ createVegVis, setCreateVegVis ] = useState(false);
    const [ focusVeg, setFocusVeg ] = useState<plantDataInterface | null>(null);

    useEffect(() => {
        async function pullSeedContributions() {
            try {
                const req = await fetch("http://localhost:3000/pull-seed-contributions", { credentials: "include" });
                const res = await req.json();
                if (req.ok) {
                    setSeedContributions(res);
                } else {
                    throw new Error(res);
                };
            } catch(err) {
                console.error("Unable to pull all seed contributions: ", err.message);
            };
        };
        if (seedContributions.length === 0) pullSeedContributions();
    }, []);

    function generateSeedContributions() {
        const seedContributionsArr = seedContributions.map(seed => (
            <li key={seed.id}>
                <p>{seed.name}</p>
                <button type="button" onClick={() => {setCreateVegVis(true); setFocusVeg(seed);}}>Edit</button>
            </li>
        ));
        return seedContributionsArr;
    };

    useEffect(() => {
        if (createVegVis) {
            const createVegForm: HTMLDialogElement | null = document.querySelector(".create-veg-form");
            createVegForm?.showModal();
        };
    }, [createVegVis]);

    return (
        <>
            <div>
                <h1>Profile</h1>
                <section>
                    <h2>Seed contributions</h2>
                    <ul>
                        {generateSeedContributions()}
                    </ul>
                    <button type="button" onClick={() => setCreateVegVis(true)}>Add new contribution</button>
                </section>
            </div>
            {createVegVis ? <CreateVeg setCreateVegVis={setCreateVegVis} focusVeg={focusVeg} setFocusVeg={setFocusVeg} setSeedContributions={setSeedContributions} /> : null}
        </>
    );
};

export default ProfilePage;