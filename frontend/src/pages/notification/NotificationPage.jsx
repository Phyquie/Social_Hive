import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { MdDelete } from "react-icons/md";


const NotificationPage = () => {
	const queryClient = useQueryClient();
	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			const res = await fetch("/api/notifications");
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Something went wrong");
			}
			return res.json();
		},
	});
	const { mutate: deleteNotifications } = useMutation({
		mutationFn: async () => {
			const res = await fetch("/api/notifications", {
				method: "DELETE",
			});
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Something went wrong");
			}
			return res.json();
		},
		onSuccess: () => {
			toast.success("Notifications deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<div className='flex flex-col border-gray-700'>
			<div className='flex justify-between items-center p-4 border-b border-gray-700'>
				<p className='font-bold'>Notifications</p>
				<div className='dropdown'>
					<div tabIndex={0} role='button' className='m-1'>
						<MdDelete className='w-5 h-5 hover:text-primary' onClick={deleteNotifications} />
					</div>
					
				</div>
			</div>
			{isLoading ? (
				<div className='flex justify-center h-full items-center'>
					<LoadingSpinner size='lg' />
				</div>
			) : notifications?.length === 0 ? (
				<div className='text-center p-4 font-bold'>No notifications 🤔</div>
			) : (
				notifications?.map((notification) => (
					<div className='border-b border-gray-700' key={notification._id}>
						<div className='flex gap-2 p-4'>
							{notification.type === "follow" && <FaUser className='w-7 h-7 text-primary' />}
							{notification.type === "like" && <FaHeart className='w-7 h-7 text-red-500' />}
							<Link to={`/profile/${notification.from.username}`} className='flex items-center gap-2'>
								<div className='avatar'>
									<div className='w-8 rounded-full'>
										<img src={notification.from.profileImg || "/avatar-placeholder.png"} alt="Profile" />
									</div>
								</div>
								<div className='flex gap-1'>
									<span className='font-bold'>@{notification.from.username}</span>
									{notification.type === "follow" ? "followed you" : "liked your post"}
								</div>
							</Link>
						</div>
					</div>
				))
			)}
		</div>
	);
};

export default NotificationPage;
