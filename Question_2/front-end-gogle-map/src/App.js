import Map from './components/Map'
import FriendDetails from './components/FriendDetails'
import useFetch from './hooks/useFetch.js'
import './App.css';

const App = () => {

  const { loading, allFriend, selectedFriend, setSelectedFriend } = useFetch();

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend);
  };

  if (loading) return <h1>Loading</h1>;

  return (
      <div className="container">
        <div className="friends-list">
          { allFriend.map((friend) => (

              <div className="friend-profile"
                   key={friend.id} onClick={() => handleFriendClick(friend)}>
                <img id='img1' src={friend.picture} alt={`${friend.fullName}`}/>
                <p>{`${friend.fullName}`}</p>
              </div>
          ))}
        </div>
        <div className="map-container">
          {allFriend.length > 0 ?
              (
              <Map friends={selectedFriend ? [selectedFriend] : allFriend} />
              )
              : (<p>No Friend info available</p>
          )}
          {selectedFriend &&  (
              <div className="display-container">
                <FriendDetails displayFriend={selectedFriend ?
                    [selectedFriend] : null} />
              </div>
          )}

        </div>
      </div>
  );
};

export default App;