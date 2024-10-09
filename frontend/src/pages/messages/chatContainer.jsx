import MessageInput from "./messageInput";
import Messages from "./Messages";
import useConversation from "../../zustand/useConversation";
import { useState } from "react";

const MessageContainer = () => {
	const { selectedConversation } = useConversation();

	return (
		<div className='md:min-w-[450px] flex flex-col'>
			<>
				{/* Header */}
				<div className='bg-primary px-4 py-2 mb-2 rounded-xl'>
					
					<span className='text-gray-900 font-extrabold'>
						{selectedConversation && selectedConversation.fullname}
					</span>
				</div>

				<Messages />
				<MessageInput />
			</>
		</div>
	);
};

export default MessageContainer;
