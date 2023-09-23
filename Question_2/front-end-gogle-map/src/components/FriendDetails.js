const FriendDetails = ({displayFriend}) => {
    return (
        <div>
            {displayFriend && displayFriend.length > 0 ? (
                displayFriend.map((friend) => (
                    <div key={friend.id} className={"details"}>
                        <img id='img1' src={friend.picture} alt={`${friend.fullName}`}/>
                        <p className={"dName"}>{`${friend.fullName}`}</p>
                    </div>
                ))
            ) : (
                <div/>
            )}
        </div>
    );
};
export default FriendDetails;