import React from 'react';
import ConversationSkeleton from '../../components/skeletons/ConversationSkeleton';
import { useQuery } from '@tanstack/react-query';
import MessageSidebar from './MessageSide';


const MessagesPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch(`/api/users/getSidebarUsers`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      return data;
    },
  });

  return (
    <>
      <div className="text-primary text-3xl font-extrabold text-center">All Messages</div>
      {isLoading && (
        <div>
          <ConversationSkeleton />
          <ConversationSkeleton />
          <ConversationSkeleton />
        </div>
      )}
      {data && data.map((user) => <MessageSidebar key={user._id} user={user} />)}
    </>
  );
};

export default MessagesPage;
