import React, { useEffect, useState } from 'react';
import useConversation from '../../zustand/useConversation.js';
import { useNavigate } from 'react-router-dom';
import { CometChat } from '@cometchat-pro/chat';

const MessageSidebar = ({ user }) => {
  const navigate = useNavigate();
  const { selectedConversation, setSelectedConversation } = useConversation();
  const [isOnline, setIsOnline] = useState(false); // Track user's online status

  const isSelected = selectedConversation?._id === user._id;

  // Function to check if user is online
  async function checkUserOnlineStatus(userId) {
    try {
      const fetchedUser = await CometChat.getUser(userId);
      const onlineStatus = fetchedUser.status === "online";
      setIsOnline(onlineStatus); // Update state with the online status
    } catch (error) {
      console.log("Error fetching user status:", error);
      setIsOnline(false); // Set to offline in case of error
    }
  }

  // useEffect to fetch user's online status on component mount or when user._id changes
  useEffect(() => {
    checkUserOnlineStatus(user._id);
  }, [user._id]);

  return (
    <div
      key={user._id}
      className={`flex items-center p-2 hover:bg-stone-900 rounded-full cursor-pointer ${isSelected ? "bg-stone-900" : ""}`}
      onClick={() => {
        setSelectedConversation(user);
        navigate('/messages/chat');
      }}
    >
      {user.profileImg ? (
        <img
          src={user.profileImg}
          alt="user"
          className="h-10 w-10 object-cover rounded-full"
        />
      ) : (
        <div className="h-10 w-10 bg-gray-500 rounded-full flex items-center justify-center font-extrabold">
          {user.fullname[0]}
        </div>
      )}
      <div className="ml-3 flex gap-2">
        
        <div className="flex flex-col">
          <p className="text-md font-semibold">{user.fullname}</p>
          <p className="text-xs text-gray-500">@{user.username}</p>
        </div>
        {isOnline ? (
          
          <div className="h-2 w-2 bg-green-500 rounded-full my-2"></div>
        ) : (
          <div className="h-2 w-2 bg-gray-500 rounded-full my-2"></div>
        )}
      </div>
    </div>
  );
};

export default MessageSidebar;
