import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
const Posts = ({feedType}) => {

	const getPostEndpoint = (feedType) => {
		const endpoints = {
		  forYou: 'api/posts/all',
		  following: 'api/posts/following',
		};
	  
		return endpoints[feedType];
	  };
const POST_ENDPOINT = getPostEndpoint(feedType)

const {data ,isLoading,refetch , isRefetching} =useQuery({
	queryKey: ["posts"],
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT);
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}

				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
})

useEffect(()=>{
	refetch();

},[feedType,refetch])

	return (
		<>
			{isLoading ||isRefetching && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && data?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && data && (
				<div>
					{data.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;