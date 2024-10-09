const ConversationSkeleton = () => {
    return (
      <div className="flex gap-4 w-full p-4 items-center">
        {/* Profile picture skeleton */}
        <div className="skeleton w-10 h-10 rounded-full shrink-0"></div>
  
        {/* Conversation details skeleton */}
        <div className="flex flex-col gap-2 w-full">
          <div className="skeleton h-10 w-3/4 rounded-full"></div>
          
        </div>
      </div>
    );
  };
  
  export default ConversationSkeleton;
  