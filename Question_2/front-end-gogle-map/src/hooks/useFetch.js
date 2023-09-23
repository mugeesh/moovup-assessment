import { useEffect, useState } from "react";

const URL = process.env.REACT_APP_FRIENDS_API;

const useFetch = () => { 
  const [loading, setLoading] = useState(true);
  const [allFriend, setAllFriend] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const fetchApi = () => {
    fetch(URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch API data");
        }
        return response.json();
      })
      .then((json) => {
        setAllFriend(json);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApi();
  }, []);

  return { loading, allFriend, selectedFriend, setSelectedFriend };
}
export default useFetch;