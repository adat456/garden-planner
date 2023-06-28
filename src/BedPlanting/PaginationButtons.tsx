interface PaginationButtonsInterface {
    curPage: number,
    setCurPage: React.Dispatch<React.SetStateAction<number>>,
    totalPages: number
};

const PaginationButtons: React.FC<PaginationButtonsInterface> = function({ curPage, setCurPage, totalPages}) {
    return (
        <div className="pages-button-cluster">
            {curPage === 1 ?
                <button type="button" disabled>BACK</button> :
                <button type="button" onClick={() => setCurPage(curPage - 1)}>BACK</button> 
            }
            <p>{`Page ${curPage} of ${totalPages}`}</p>
            {curPage === totalPages ?
                <button type="button" disabled>NEXT</button> : 
                <button type="button" onClick={() => setCurPage(curPage + 1)}>NEXT</button>
            }
        </div>
    )
};

export default PaginationButtons;