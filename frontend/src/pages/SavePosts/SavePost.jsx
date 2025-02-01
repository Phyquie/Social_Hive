import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Post from '../../components/common/Post'
import PostSkeleton from '../../components/skeletons/PostSkeleton'
import LoadingSpinner from '../../components/common/LoadingSpinner'
const SavedPostsPage = () => {
  const{data : savedPosts , isLoading,isRefetching} = useQuery({
    queryKey:['savedPosts'],
    queryFn : async ()=>{
      const res = await fetch("/api/users/getSavedPosts");
      const data = await res.json();
      return data;
    }
   })
   console.log(savedPosts);
  return (
    <div>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && savedPosts?.posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading  && savedPosts?.posts && (
        <div>
          {savedPosts?.posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

export default SavedPostsPage