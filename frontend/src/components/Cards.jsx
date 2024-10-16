const Cards = () => {
    return (
        <div>
            <p>card name</p>
            <input type="text" />
            <p>card role</p>
            <select
                className="input"
                // value={nationality}
                // onChange={(e) => setNationality(e.target.value)}
                placeholder="Select a Role">
                
                <option value="dilemma">Dilemma</option>
                <option value="competency">Competency</option>
            </select>
            <p></p>
            <button>save card</button>
        </div>
    )

}

export default Cards