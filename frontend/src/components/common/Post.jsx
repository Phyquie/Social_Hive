import { FaRegComment, FaRegHeart, FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from 'react-hot-toast';

const Post = ({ post }) => {
  const [comment, setComment] = useState("");
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  // Local state to manage likes and liked status
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [isLikedLocal, setIsLikedLocal] = useState(post.likes.includes(authUser._id));

  const postOwner = post.user;
  const isMyPost = authUser._id === post.user._id;
 
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const dateOnly = new Date(post.createdAt).toLocaleDateString(undefined, options);
  

  const { mutate: Delete } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/${post._id}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: async () => {
      toast.success("Post deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: likePost } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/like/${post._id}`, {
          method: "POST",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: async () => {
	  if(!isLikedLocal){
		toast.success("💔");
	  }	
	  else{
		toast.success("❤️");
	  }
      
     
    },
    onError: (error) => {
   
      toast.error(error.message);
    },
  });

  const { mutate: commentPost, isPending: isCommenting } = useMutation({
		mutationFn: async (comment) => {
			try {
				const res = await fetch(`/api/posts/comment/${post._id}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ text: comment }),
				});
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			toast.success("Comment posted successfully");
			setComment("");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

  const handleDeletePost = () => {
    Delete();
  };

  const handlePostComment = (e) => {
    e.preventDefault();
   
    commentPost(comment);
  };

  const handleLikePost = (e) => {
    e.preventDefault();
  
    setLikeCount((prevCount) => (isLikedLocal ? prevCount - 1 : prevCount + 1));
    setIsLikedLocal(!isLikedLocal);
    likePost();
  };

  return (
    <>
      <div className="flex gap-4 items-start p-4 border-b border-gray-700 rounded-lg shadow-lg">
        <div className="avatar">
          <Link to={`/profile/${postOwner.username}`} className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700">
            <img src={postOwner.profileImg || "/avatar-placeholder.png"} alt="Profile" />
          </Link>
        </div>

        <div className="flex flex-col flex-1">
          <div className="flex gap-3 items-center mb-2">
            <Link to={`/profile/${postOwner.username}`} className="font-bold text-white hover:underline">
              {postOwner.fullName}
            </Link>
            <span className="text-gray-400 flex gap-1 text-sm">
              <Link to={`/profile/${postOwner.username}`} className="hover:underline">@{postOwner.username}</Link>
              <span>·</span>
              
              <span>{dateOnly}</span>
            </span>
            {isMyPost && (
              <span className="flex justify-end flex-1">
                <FaTrash className="cursor-pointer text-gray-500 hover:text-red-500" onClick={handleDeletePost} />
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4 overflow-hidden">
            <span className="text-gray-300">{post.text}</span>
            {post.img && (
              <img
                src={post.img}
                className="w-full h-80 rounded-lg border border-gray-700 shadow-sm object-contain"
                alt="Post"
              />
            )}
          </div>

          <div className="flex justify-between mt-4 text-gray-400">
            <div className="flex gap-6 items-center w-2/3">
              <div
                className="flex gap-2 items-center cursor-pointer group"
                onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
              >
                <FaRegComment className="w-5 h-5 group-hover:text-sky-400" />
                <span className="text-sm group-hover:text-sky-400">
                  {post.comments.length}
                </span>
              </div>

              <dialog id={`comments_modal${post._id}`} className="modal p-0 rounded-lg">
                <div className="modal-box rounded-lg border border-gray-600 p-6">
                  <h3 className="font-bold text-lg mb-4 text-white">Comments</h3>
                  <div className="flex flex-col gap-4 max-h-60 overflow-auto">
                    {post.comments.length === 0 && (
                      <p className="text-sm text-gray-400">
                        No comments yet 🤔 Be the first one 😉
                      </p>
                    )}
                    {post.comments.map((comment) => (
                      <div key={comment._id} className="flex gap-3 items-start">
                        <div className="avatar">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-700">
                            <img src={comment.user.profileImg || "/avatar-placeholder.png"} alt="Commenter" />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{comment.user.fullName}</span>
                            <span className="text-gray-500 text-sm">@{comment.user.username}</span>
                          </div>
                          <div className="text-sm text-gray-300">{comment.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form
                    className="flex gap-3 items-center mt-4 border-t border-gray-600 pt-4"
                    onSubmit={handlePostComment}
                  >
                    <textarea
                      className="textarea w-full p-2 rounded-lg text-md resize-none border border-gray-700 bg-gray-800 text-gray-300 focus:outline-none focus:border-gray-500"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button className="btn btn-primary rounded-full btn-sm text-black px-4">
                      {isCommenting ? (
                        <span className="loading loading-spinner loading-md"></span>
                      ) : (
                        "Post"
                      )}
                    </button>
                  </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button className="outline-none">close</button>
                </form>
              </dialog>

              <div className="flex gap-2 items-center cursor-pointer group" onClick={handleLikePost}>
                {isLikedLocal ? (
                  <FaRegHeart className="w-5 h-5 text-pink-500 fill-pink-500" />
                ) : (
                  <FaRegHeart className="w-5 h-5 group-hover:text-pink-500" />
                )}
                <span className={`text-sm ${isLikedLocal ? "text-pink-500" : "group-hover:text-pink-500"}`}>
                  {likeCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;
