const Sheets = () => {
    return (
        <div>
            <p>sheet name</p>
            <input type="text" />
            <p>sheet role</p>
            <select
                className="input"
                // value={nationality}
                // onChange={(e) => setNationality(e.target.value)}
                placeholder="Select a Sheet">
                
                <option value="dilemma">??Dilemma??</option>
                <option value="competency">??Competency??</option>
            </select>
            <p></p>
            <button>save sheets</button>
        </div>
    )

}

export default Sheets