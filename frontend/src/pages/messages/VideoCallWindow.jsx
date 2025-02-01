import React, { useEffect, useState, useRef } from "react";
import { CometChat } from "@cometchat-pro/chat";
import useConversation from "../../zustand/useConversation.js";

const VideoCallWindow = ({ userID }) => {
  const { selectedConversation: client } = useConversation();
  const [incomingCall, setIncomingCall] = useState(null); // Store incoming call data
  const [isCalling, setIsCalling] = useState(false); // For ringing indicator
  const [callRejected, setCallRejected] = useState(false); // To show "Call rejected" message
  const audioRef = useRef(null);

  useEffect(() => {
    const listenerID = `listenerID${client?._id}`;

    // Add call listener for handling call events
    CometChat.addCallListener(
      listenerID,
      new CometChat.CallListener({
        onIncomingCallReceived: (call) => {
          console.log("Incoming call received:", call);
          setIncomingCall(call); // Store incoming call data
          setIsCalling(true); // Trigger ringing
        },
        onOutgoingCallAccepted: (call) => {
          console.log("Outgoing call accepted:", call);
          startCall(call.sessionId); // Start the call
          setIsCalling(false); // Stop ringing
        },
        onOutgoingCallRejected: (call) => {
          console.log("Outgoing call rejected:", call);
          setIsCalling(false); // Stop ringing
          setCallRejected(true); // Show rejected message
          setTimeout(() => setCallRejected(false), 3000); // Clear after 3 seconds
        },
        onIncomingCallCancelled: (call) => {
          console.log("Incoming call cancelled:", call);
          setIncomingCall(null); // Reset incoming call
          setIsCalling(false); // Stop ringing
        },
      })
    );

    // Clean up the listener on component unmount
    return () => {
      CometChat.removeCallListener(listenerID);
    };
  }, []);

  const startCall = (sessionId) => {
    CometChat.startCall(
      sessionId,
      document.getElementById("callScreen"),
      new CometChat.OngoingCallListener({
        onUserJoined: (user) => {
          console.log("User joined the call:", user);
        },
        onUserLeft: (user) => {
          console.log("User left the call:", user);
        },
        onCallEnded: (call) => {
          console.log("Call ended:", call);
          setIncomingCall(null); // Reset after call ends
        },
      })
    );
  };

  const startVideoCall = () => {
    setIsCalling(true); // Show ringing
    if (!client?._id) {
      console.error("No recipient selected for the video call.");
      setIsCalling(false);
      return;
    }

    const call = new CometChat.Call(client._id, CometChat.CALL_TYPE.VIDEO, CometChat.RECEIVER_TYPE.USER);

    CometChat.initiateCall(call).then(
      (outgoingCall) => {
        console.log("Outgoing call initiated:", outgoingCall);
      },
      (error) => {
        console.error("Outgoing call failed to initiate:", error);
        setIsCalling(false); // Stop ringing
      }
    );
  };

  const acceptCall = () => {
    if (!incomingCall) return;

    CometChat.acceptCall(incomingCall.sessionId).then(
      (acceptedCall) => {
        console.log("Call accepted successfully:", acceptedCall);
        setIncomingCall(null); // Clear the incoming call state
        setIsCalling(false); // Stop ringing
        startCall(acceptedCall.sessionId);
      },
      (error) => {
        console.error("Failed to accept call:", error);
      }
    );
  };

  const rejectCall = () => {
    if (!incomingCall) return;
    setIsCalling(false);
    CometChat.rejectCall(incomingCall.sessionId, CometChat.CALL_STATUS.REJECTED).then(
      (rejectedCall) => {
        console.log("Call rejected successfully:", rejectedCall);
        setIncomingCall(null); // Clear the incoming call state
      },
      (error) => {
        console.error("Failed to reject call:", error);
      }
    );
  };

  return (
    <div className="video-call-window">
      <h1 className="text-2xl font-bold text-white mb-4">Video Call Window</h1>

      {/* Outgoing Call Button */}
      <button
        onClick={startVideoCall}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Start Video Call
      </button>

      {/* "Ringing..." Text */}
      {isCalling && !incomingCall && (
        <p className="text-yellow-500 font-bold mt-2 animate-pulse">Ringing...</p>
      )}

      {/* Incoming Call UI */}
      {incomingCall && (
        <div className="incoming-call-popup bg-gray-800 text-white p-4 rounded-lg mt-4 shadow-lg">
          <h2 className="text-lg font-bold mb-2">Incoming Call</h2>
          <p className="mb-4">{incomingCall.sender.name} is calling...</p>
          <div className="flex space-x-4">
            <button
              onClick={acceptCall}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Accept
            </button>
            <button
              onClick={rejectCall}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Call Rejected Message */}
      {callRejected && (
        <p className="text-red-500 font-bold mt-2">Call rejected by client.</p>
      )}

      {/* Ringing Tone */}
      {isCalling && (
        <audio ref={audioRef} autoPlay loop>
          <source src="/ringtone.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}

      {/* Call Screen */}
      <div
        id="callScreen"
        style={{ width: "100%", height: "500px", backgroundColor: "#000", marginTop: "20px" }}
      ></div>
    </div>
  );
};

export default VideoCallWindow;
