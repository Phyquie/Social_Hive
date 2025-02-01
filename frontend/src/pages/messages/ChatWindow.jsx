import React, { useState, useEffect } from "react";
import { CometChat } from "@cometchat-pro/chat";
import useConversation from "../../zustand/useConversation.js"
import CryptoJS from "crypto-js";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { FaVideo } from "react-icons/fa";


const ChatWindow = ({ userID }) => {
  const { selectedConversation: client } = useConversation();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [encryptionKey] = useState(import.meta.env.VITE_ENCRYPTION_KEY);
  const [isOnline, setIsOnline] = useState(false);
  const navigate = useNavigate();

  const encryptMessage = (message) => {
    return CryptoJS.AES.encrypt(message, encryptionKey).toString();
  };

  const decryptMessage = (encryptedMessage) => {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };
  
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
 // Set up interval to check if user is online every 5 seconds
 useEffect(() => {
  if (!client||!client._id) return;

  const interval = setInterval(() => {
    checkUserOnlineStatus(client._id);
  }, 5000);

  // Clean up the interval on component unmount
  return () => clearInterval(interval);
}, [client]); // Ensure the effect runs when user._id changes

  // Function to fetch previous messages between userID and client
  const fetchMessages = () => {
    const limit = 30;
    const messagesRequest = new CometChat.MessagesRequestBuilder()
      .setUID(client._id)  // clientID
      .setLimit(limit)
      .build();

    messagesRequest.fetchPrevious().then(
      (messageList) => {
        const decryptedMessages = messageList.map(msg => {
          try {
            return {
              ...msg,
              text: decryptMessage(msg.text)
            };
          } catch (error) {
            console.error("Error decrypting message:", error);
            return msg; // Return the original message if decryption fails
          }
        });
        setMessages(decryptedMessages);
      },
      (error) => {
        console.error("Message fetching failed with error:", error);
      }
    );
  };

  // Send message to the client
  const sendMessage = () => {
    const encryptedMessage = encryptMessage(newMessage);
    const textMessage = new CometChat.TextMessage(
      client._id,
      encryptedMessage,
      CometChat.RECEIVER_TYPE.USER
    );

    CometChat.sendMessage(textMessage).then(
      (message) => {
        // Add the decrypted message to the local state
        const decryptedMessage = {
          ...message,
          text: newMessage // Use the original message text
        };
        setMessages((prevMessages) => [...prevMessages, decryptedMessage]);
        setNewMessage("");
      },
      (error) => {
        console.error("Message sending failed with error:", error);
      }
    );
  };

  // Add a message listener to handle incoming messages
  const addMessageListener = () => {
    const listenerID = `listener_${userID}_${client._id}`;

    CometChat.addMessageListener(
      listenerID,
      new CometChat.MessageListener({
        onTextMessageReceived: (message) => {
          if (message.sender.uid === client._id) {
            try {
              const decryptedMessage = {
                ...message,
                text: decryptMessage(message.text)
              };
              setMessages((prevMessages) => [...prevMessages, decryptedMessage]);
            } catch (error) {
              console.error("Error decrypting incoming message:", error);
              setMessages((prevMessages) => [...prevMessages, message]);
            }
          }
        },
      })
    );

    return () => {
      CometChat.removeMessageListener(listenerID);
    };
  };

  useEffect(() => {
    if (client) {
      fetchMessages();
      const listenerCleanup = addMessageListener();

      return () => {
        listenerCleanup();
      };
    }
  }, [client]);

  if (!client) return (
    <div className="flex flex-col  bg-black shadow-lg items-center justify-center p-4">
      <div className="flex justify-center items-center h-full">
        Select a conversation
      </div>
      <IoArrowBack 
        className="w-6 h-6 cursor-pointer fill-white" 
        onClick={() => navigate("/messages")}
      />
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-black shadow-lg ">
      <div className="flex items-center justify-start gap-4 p-4 bg-primary text-black font-extrabold sticky top-0 z-10">
        <IoArrowBack className="w-6 h-6 cursor-pointer fill-primary" onClick={() => navigate("/messages")}/>
        <div className="flex items-center gap-2">
        {client.profileImg ? (
        <img
          src={client.profileImg}
          alt="user"
          className="h-10 w-10 object-cover rounded-full"
        />
      ) : (
        <div className="h-10 w-10 bg-gray-500 rounded-full flex items-center justify-center font-extrabold">
          {client.fullname[0]}
        </div>
      )}        <h2 className="text-lg font-semibold">{client.fullname}</h2>
        {isOnline ? (
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
        ) : (
          <div className="h-2 w-2 bg-gray-500 rounded-full animate-pulse"></div>
        )}
       
                
        </div>
        <FaVideo className="w-6 h-6 cursor-pointer fill-secondary ml-auto" onClick={() => navigate("/videoCall")}/> 
        {/* add a profile picture of client */}
      </div>

      {/* Message List */}
      


      <div className="flex-1 p-4 overflow-y-auto flex flex-col">
        {messages.map((msg, index) => {
          const messageText = msg.text?.trim(); // Trim whitespace
          if (messageText) { // Only render non-empty messages
            return (
              <div
                key={index}
                className={`mb-2 p-2 w-fit max-w-1/2 min-w-40 relative rounded-b-lg pb-5 ${
                  msg.sender.uid === userID
                    ? "bg-primary text-black rounded-l-lg self-end mr-2"
                    : "bg-gray-200 text-black rounded-r-lg ml-2"
                }`}
              >
                {messageText}
                {/* make a triangle on the top right corner */}
                <div className={`absolute  ${
                  msg.sender.uid === userID ? "top-0 -right-2 w-0 h-0 border-t-8 border-primary border-r-8 border-r-transparent" : "top-0 -left-2 w-0 h-0 border-t-8 border-t-gray-200 border-l-8 border-l-transparent"
                }`}></div>
                {/* {add time to the message} */}
                
              </div>
            );
          }
          return null; // Skip rendering if message is empty
        })}
      </div>

      {/* Message Input */}
      <div className="flex p-4 border-t border-gray-200 sticky bottom-0 z-10 bg-black">
        <input
          type="text"
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-primary text-black rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;


