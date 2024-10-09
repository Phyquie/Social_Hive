
import Message from "./Message";
import useConversation from "../../zustand/useConversation";

const Messages = () =>{

 const { 	selectedConversation}=useConversation();
   
	return (
		<div className='px-4 flex-1 overflow-auto'>
            
			<Message />
			<Message />
			<Message />
			<Message />
			<Message />
			<Message />
			<Message />
			<Message />
			<Message />
			<Message />
			<Message />
			<Message />
		</div>
	);
};
export default Messages;