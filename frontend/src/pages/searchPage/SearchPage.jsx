import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const SearchPage = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  const { data: searchHistory } = useQuery({
    queryKey: ["searchHistory"],
    queryFn: async () => {
      const res = await fetch("/api/users/getSearchHistory");
      if (!res.ok) throw new Error("Failed to fetch search history");
      return res.json();
    },
  });

  const { mutate: follow } = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`/api/users/follow/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to follow user");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["suggestedUsers", "authUser", "userProfile", "notifications"]);
      setLoadingUserId(null);
    },
    onError: (error) => {
      toast.error(error.message);
      setLoadingUserId(null);
    },
  });

  const { mutate: addSearchHistory } = useMutation({
    mutationFn: async ({ username, profileImage, fullname, searchUserId }) => {
      const res = await fetch(`/api/users/addSearchHistory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, profileImage, fullname, searchUserId }),
      });
      if (!res.ok) throw new Error("Failed to add search history");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["authUser"]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleFollow = (userId) => {
    setLoadingUserId(userId);
    follow(userId);
  };

  const handleUserClick = (user) => {
    const profileImage = user.profileImg || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
    const fullname = user.fullname || "Unknown User";
    const username = user.username;
    const searchUserId = user._id;

    addSearchHistory({ username, profileImage, fullname, searchUserId });
    navigate(`/profile/${username}`);
  };

  const amIFollowing = (userId) => authUser?.following?.includes(userId);

    // Debounce function to delay API calls
    useEffect(() => {
      // If the search input is empty, clear the users list
      if (!search) {
        setUsers([]);
        return;
      }
  
      const delayDebounceFn = setTimeout(() => {
        fetchUsers(search);
      }, 500); // 500ms debounce
  
      return () => clearTimeout(delayDebounceFn); // Cleanup the timeout when the search value changes
    }, [search]);

  const fetchUsers = async (query) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/search/${query}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const {mutate : handleDeleteSearchHistory}=useMutation({
    mutationFn : async (searchUserId) => {
      const res = await fetch(`/api/users/deleteSearchHistory/${searchUserId}`);
    },
    onSuccess : () => {
      console.log("search history deleted");
      queryClient.invalidateQueries(["searchHistory"]);
    },
    onError : (error) => {
      toast.error(error.message);
    }
  })

  return (
    <div className="search-page flex flex-col items-center h-screen py-4 px-4">
      <input
        type="text"
        placeholder="Search Users"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-full lg:w-1/2 placeholder:text-center"
      />

      {loading && <LoadingSpinner />}

      {search  ? (

        users.length === 0 ? (
          <div>no users found</div>
        ) : (
          <div className="user-list">
            {users.map((user) => (
              <div
                key={user._id}
                className="user-card flex row items-center gap-9 my-3 hover:bg-gray-900 p-2 rounded-lg"
              >
                <img
                  src={user.profileImg || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                  alt="user"
                  className="h-12 w-12 object-cover rounded-full"
                />
                <div
                  className="flex flex-col"
                  onClick={(e) => {
                    e.preventDefault();
                    handleUserClick(user);
                  }}
                >
                  <h3 className="font-bold">{user.fullname || "Unknown User"}</h3>
                  <p className="text-gray-500">@{user.username}</p>
                </div>
                <button
                  className={`px-4 py-2 rounded-full ml-auto ${
                    amIFollowing(user._id) ? "bg-primary text-black" : "bg-gray-500 text-white"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleFollow(user._id);
                  }}
                  disabled={loadingUserId === user._id}
                >
                  {loadingUserId === user._id ? <LoadingSpinner size="sm" /> : amIFollowing(user._id) ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        <div>
          {searchHistory && searchHistory.length > 0 && (
            <div className="user-list">
              {console.log("searchHistory", searchHistory[0].searchUsername.map((historyItem) => historyItem.searchUserId))}

              {searchHistory[0].searchUsername.reverse().map((historyItem) => (
                <div key={historyItem.searchUserId} className="user-card flex row items-center gap-9 my-3 hover:bg-gray-900 p-2 rounded-lg"
                >
                  
                  {historyItem.profileImage ? <img src={historyItem.profileImage} alt="user" className="h-12 w-12 object-cover rounded-full" /> : <div className="h-12 w-12 bg-gray-500 rounded-full flex items-center justify-center font-extrabold">{historyItem.fullname ? historyItem.fullname.charAt(0) : "?"}</div>}
                  <div onClick={(e) => {
                    e.preventDefault();
                    navigate(`/profile/${historyItem.username}`);
                  }}>
                    <h3 className="font-bold">{historyItem.fullname}</h3>
                    <p className="text-gray-500">@{historyItem.username}</p>
                  </div>
                  <button
                  className={`px-4 py-2 rounded-full ml-auto ${
                    amIFollowing(historyItem.searchUserId) ? "bg-primary text-black" : "bg-gray-500 text-white"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleFollow(historyItem.searchUserId);
                  }}
                  disabled={loadingUserId === historyItem.searchUserId}
                >
                  {loadingUserId === historyItem.searchUserId ? <LoadingSpinner size="sm" /> : amIFollowing(historyItem.searchUserId) ? "Following" : "Follow"}
                </button>
              <button onClick={() => handleDeleteSearchHistory(historyItem.searchUserId)}>
                X
              </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
