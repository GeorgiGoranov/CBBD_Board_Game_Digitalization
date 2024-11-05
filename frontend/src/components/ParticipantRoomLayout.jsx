const ParticipantRoomLayout = () =>{

    let checkBeforeStart = false


    const handleOnClick = () =>{
        if (!checkBeforeStart){
            alert(` Are you sure?`);
            checkBeforeStart = true
        }else{
            console.log("ready")
        }
    }
    return (
        <div>
            <button onClick={() => handleOnClick()}>ready</button>
        </div>
    )
}

export default ParticipantRoomLayout