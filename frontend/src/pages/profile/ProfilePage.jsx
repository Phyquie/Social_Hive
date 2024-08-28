import { useRef, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";
import { POSTS } from "../../utils/db/dummy";
import { FaArrowLeft, FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const ProfilePage = () => {
    const [coverImg, setCoverImg] = useState(null);
    const [profileImg, setProfileImg] = useState(null);
    const [feedType, setFeedType] = useState("posts");

    const coverImgRef = useRef(null);
    const profileImgRef = useRef(null);

    const { username } = useParams();
    const queryClient = useQueryClient();

    const { data: authUser } = useQuery({
        queryKey: ["authUser"],
    });

    const { mutate: follow, isLoading: isFollowing } = useMutation({
        mutationFn: async (userId) => {
            const res = await fetch(`/api/users/follow/${userId}`, {
                method: "POST",
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Something went wrong!");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const { data: user, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ["userProfile", username],
        queryFn: async () => {
            const res = await fetch(`/api/users/profile/${username}`);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }
            return data;
        },
    });

    useEffect(() => {
        refetch();
    }, [username, refetch]);

    const handleImgChange = (e, setImg) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const isMyProfile = authUser?._id === user?._id;
    const amIFollowing = authUser?.following.includes(user?._id);

    const { mutate: updateProfile, isPending: isUpdating } = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/users/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ coverImg, profileImg }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }
            return data;
        },
        onSuccess: () => {
            toast.success("Profile Updated Successfully!");
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    if (isLoading || isRefetching) {
        return <ProfileHeaderSkeleton />;
    }

    if (!user) {
        return <p className="text-center text-lg mt-4">User not found</p>;
    }

    return (
        <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
            {/* HEADER */}
            <div className="flex flex-col">
                <div className="flex gap-10 px-4 py-2 items-center">
                    <Link to="/">
                        <FaArrowLeft className="w-4 h-4" />
                    </Link>
                    <div className="flex flex-col">
                        <p className="font-bold text-lg">{user?.fullName}</p>
                        <span className="text-sm text-slate-500">{POSTS?.length} posts</span>
                    </div>
                </div>

                {/* COVER IMG */}
                <div className="relative group/cover">
                    <img
                        src={coverImg || user?.coverImg || "/cover.png"}
                        className="h-52 w-full object-cover"
                        alt="cover image"
                    />
                    {isMyProfile && (
                        <div
                            className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200"
                            onClick={() => coverImgRef.current.click()}
                        >
                            <MdEdit className="w-5 h-5 text-white" />
                        </div>
                    )}

                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        ref={coverImgRef}
                        onChange={(e) => handleImgChange(e, setCoverImg)}
                    />
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        ref={profileImgRef}
                        onChange={(e) => handleImgChange(e, setProfileImg)}
                    />

                    {/* USER AVATAR */}
                    <div className="avatar absolute -bottom-16 left-4">
                        <div className="w-32 rounded-full relative group/avatar">
                            <img
                                src={profileImg || user?.profileImg || "/avatar-placeholder.png"}
                                alt="profile"
                            />
                            <div className="absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer">
                                {isMyProfile && (
                                    <MdEdit
                                        className="w-4 h-4 text-white"
                                        onClick={() => profileImgRef.current.click()}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end px-4 mt-5">
                    {isMyProfile && <EditProfileModal />}
                    {!isMyProfile && (
                        <button
                            className="btn btn-outline rounded-full btn-sm"
                            onClick={() => follow(user?._id)}
                        >
                            {isFollowing ? "Loading..." : amIFollowing ? "Unfollow" : "Follow"}
                        </button>
                    )}
                    {(coverImg || profileImg) && (
                        <button
                            className="btn btn-primary rounded-full btn-sm text-black px-4 ml-2"
                            onClick={updateProfile}
                        >
                            {isUpdating ? "Updating..." : "Update"}
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-4 mt-14 px-4">
                    <div className="flex flex-col">
                        <span className="font-bold text-lg">{user?.fullname}</span>
                        <span className="text-sm text-slate-500">@{user?.username}</span>
                        <span className="text-sm my-1">{user?.bio}</span>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {user?.link && (
                            <div className="flex gap-1 items-center">
                                <FaLink className="w-3 h-3 text-slate-500" />
                                <a
                                    href={user?.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-blue-500 hover:underline"
                                >
                                    {user?.link}
                                </a>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <div className="flex gap-1 items-center">
                            <span className="font-bold text-xs">{user?.following.length}</span>
                            <span className="text-slate-500 text-xs">Following</span>
                        </div>
                        <div className="flex gap-1 items-center">
                            <span className="font-bold text-xs">{user?.followers.length}</span>
                            <span className="text-slate-500 text-xs">Followers</span>
                        </div>
                    </div>
                </div>
                <div className="flex w-full border-b border-gray-700 mt-4">
                    <div
                        className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer"
                        onClick={() => setFeedType("posts")}
                    >
                        Posts
                        {feedType === "posts" && (
                            <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
                        )}
                    </div>
                    <div
                        className="flex justify-center flex-1 p-3 text-slate-500 hover:bg-secondary transition duration-300 relative cursor-pointer"
                        onClick={() => setFeedType("likes")}
                    >
                        Likes
                        {feedType === "likes" && (
                            <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
                        )}
                    </div>
                </div>
            </div>

            <Posts feedType={feedType} username={username} userId={user?._id} />
        </div>
    );
};

export default ProfilePage;
