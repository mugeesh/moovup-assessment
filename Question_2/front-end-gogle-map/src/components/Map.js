import { GoogleMap, LoadScript, MarkerF, InfoWindow } from "@react-google-maps/api";
import React, {useState } from "react";

const containerStyle = {
    height: "400px",
    width: "100%",
  };
  
  const defaultProps = {
    center: { lat: 22.31, lng: 113.71 },
    zoom: 10,
  };

  
const Map = ({ friends }) => {

    const [selectedFriend, setSelectedFriend] = useState(null);
  
    const handleMarkerClick = (friend) => {
      setSelectedFriend(friend);
    };
  
    const handleInfoWindowClose = () => {
      setSelectedFriend(null);
    };
  
    return (
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_API_KEY}>
        <GoogleMap 
          mapContainerStyle={containerStyle}
          center={defaultProps.center}
          zoom={defaultProps.zoom}
        >
          {friends.map((friend) => (
            <MarkerF
              key={friend.id}
              position={{ lat: friend.location.latitude, lng: friend.location.longitude }}
              label={friend.fullName.split(" ")[0]}
              onClick={() => handleMarkerClick(friend)}
            >
              {selectedFriend === friend && (
                <InfoWindow onCloseClick={handleInfoWindowClose}>
                  <div>
                    <h2>{`${friend.fullName}`}</h2>
                    <p>Id: {friend.id}</p>
                    <p>Latitude: {friend.location.latitude}</p>
                    <p>Longitude: {friend.location.longitude}</p>
                  </div>
                </InfoWindow>
              )}
            </MarkerF>
          ))}
        </GoogleMap>
      </LoadScript>
    );
  };

  export default Map;