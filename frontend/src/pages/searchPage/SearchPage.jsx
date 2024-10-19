import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
const SearchPage = () => {
  const [search, setSearch] = useState(""); // State to store the search query
  const [users, setUsers] = useState([]); // State to store the fetched users
  const [loading, setLoading] = useState(false); // Loading state to show while fetching
  const {data : authUser} = useQuery({
    queryKey: ["authUser"],
  });
  const queryClient = useQueryClient();
  // check if the user is following the user in the search results
  const amIFollowing = (userId) => {
    return authUser?.following.includes(userId);
  };
//implement follow and unfollow
const { mutate: follow, isPending } = useMutation({
  mutationFn: async (userId) => {
    const res = await fetch(`/api/users/follow/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
    queryClient.invalidateQueries({ queryKey: ["authUser"] });
    queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    
  },
  onError: (error) => {
    toast.error(error.message);
  },
});
//make a function to handle the follow button
const handleFollow = (userId) => {
  follow(userId);
};




  const navigate = useNavigate();

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };


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

  // Fetch users based on search query
  const fetchUsers = async (query) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/search/${query}`); // Assuming the API endpoint
      const data = await response.json();
      setUsers(data); // Assuming the response contains a "users" array
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  return (
    <div className="search-page flex flex-col  items-center  h-screen py-4 ">
      <input
        type="text"
        placeholder="Search Users"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-full lg:w-1/2 placeholder:text-center"
      />

      {loading && <LoadingSpinner />}
      
      {users && users.length === 0 ? (
        
        <p className="text-center py-80">No users found</p>
        
      ) : users && users.length > 0 ? (
        <div className="user-list">
          {users.map((user) => (
            <div key={user._id} className="user-card flex row items-center gap-9 my-3 hover:bg-gray-900 p-2 rounded-lg">
              {user.profileImg ? (
        <img
          src={user.profileImg}
          alt="user"
          className="h-12 w-12 object-cover rounded-full"
        />
      ) : (
        <div className="h-12 w-12 bg-gray-500 rounded-full flex items-center justify-center font-extrabold">
          {user.fullname[0]}
        </div>
      )}       <div className='flex flex-col' onClick={(e) => {e.preventDefault();
        handleUserClick(user.username)}}>
              <h3 className='font-bold'>{user.fullname}</h3>
              <p className='text-gray-500'>@{user.username}</p>
              </div>
              
              {amIFollowing(user._id) ? (
                <button className="bg-primary text-black px-4 py-2 rounded-full ml-auto" onClick={(e) => {e.preventDefault();
                 handleFollow(user._id)}}>
                  {isPending ? <LoadingSpinner size='sm' /> : "Following"}
                </button>
              ) : (
                <button className="bg-gray-500 text-white px-4 py-2 rounded-full ml-auto" onClick={(e) => {e.preventDefault();
                 handleFollow(user._id)}}>
                  {isPending ? <LoadingSpinner size='sm' /> : "Follow"}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};




export default SearchPage;
