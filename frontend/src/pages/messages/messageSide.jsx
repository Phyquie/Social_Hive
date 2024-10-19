import React from 'react';
import useConversation from '../../zustand/useConversation.js'
import { useNavigate } from 'react-router-dom';

const MessageSidebar = ({ user }) => {
  const navigate = useNavigate();
  const { selectedConversation, setSelectedConversation } = useConversation();

  const isSelected = selectedConversation?._id === user._id;

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
      <div className="ml-3">
        <p className="text-md font-semibold">{user.fullname}</p>
        <p className="text-xs text-gray-500">@{user.username}</p>
      </div>
    </div>
  );
};

export default MessageSidebar;
