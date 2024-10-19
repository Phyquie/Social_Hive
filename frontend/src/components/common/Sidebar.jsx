import BeeLogoSvg from "../svgs/Dsvg";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { TbMessageFilled } from "react-icons/tb";
import { FaSearch } from "react-icons/fa";

import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const Sidebar = () => {
	const queryClient = useQueryClient();
	const { mutate } = useMutation({
		mutationFn: async () => {
			const res = await fetch("/api/auth/logout", {
				method: "POST",
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.message || "Something went wrong");
			}
			return data;
		},
		onSuccess: () => {
			toast.success("Logout successful!");
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
			queryClient.setQueryData(["authUser"], null);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const { data } = useQuery({ queryKey: ["authUser"] });

	return (
		<div className="md:flex-[2_2_0] w-full lg:max-w-1/5 h-full">
			<div
				className="h-full flex flex-col md:flex-row lg:flex-col border-r border-gray-700 w-full"
			>
				<Link to="/" className="justify-center md:justify-start hidden lg:flex">
					<BeeLogoSvg className="px-2 w-20 h-20 rounded-full fill-white hover:bg-stone-900" />
				</Link>
				<ul className="flex flex-row lg:flex-col gap-3 justify-around lg:justify-start w-full grow py-2 border-t lg:border-t-0 border-gray-700 lg:py-0">
					<li className="flex justify-center md:justify-start">
						<Link
							to="/"
							className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
						>
							<MdHomeFilled className="w-8 h-8 fill-primary" />
							<span className="text-2xl font-extrabold hidden lg:block">Home</span>
						</Link>
					</li>
					<li className="flex justify-center md:justify-start">
						<Link
							to="/notifications"
							className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
						>
							<IoNotifications className="w-6 h-6 fill-primary" />
							<span className="text-2xl font-extrabold hidden lg:block">Notifications</span>
						</Link>
					</li>
					<li className="flex justify-center md:justify-start">
						<Link
							to={`/profile/${data?.username}`}
							className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
						>
							<FaUser className="w-6 h-6 fill-primary" />
							<span className="text-2xl font-extrabold hidden lg:block">Profile</span>
						</Link>
					</li>
					<li className="flex justify-center md:justify-start">
						<Link
							to={`/messages`}
							className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
						>
							<TbMessageFilled className="w-6 h-6 fill-primary" />
							<span className="text-2xl font-extrabold hidden lg:block">Messages</span>
						</Link>
					</li>
					<li className="flex justify-center md:justify-start">
						<Link
							to={`/search`}
							className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
						>
							<FaSearch className="w-6 h-6 fill-primary" />
							<span className="text-2xl font-extrabold hidden lg:block">Search</span>
						</Link>
					</li>

					<li className="flex justify-center">
						<BiLogOut
							className="w-6 h-6 cursor-pointer fill-primary my-2 lg:hidden"
							onClick={(e) => {
								e.preventDefault();
								mutate();
							}}
						/>
					</li>
				</ul>
				{data && (
					<Link
						to={`/profile/${data.username}`}
						className="mt-auto mb-10 gap-2 items-start transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full hidden lg:flex"
					>
						<div className="avatar hidden md:inline-flex">
							<div className="w-8 rounded-full">
								<img src={data?.profileImg || "/avatar-placeholder.png"} />
							</div>
						</div>
						<div className="justify-between flex-1 flex">
							<div className="hidden md:block">
								<p className="text-white font-bold text-sm w-20 truncate">{data?.fullname}</p>
								<p className="text-slate-500 text-sm">@{data?.username}</p>
							</div>
							<BiLogOut
								className="w-5 h-5 cursor-pointer fill-primary"
								onClick={(e) => {
									e.preventDefault();
									mutate();
								}}
							/>
						</div>
					</Link>
				)}
			</div>
		</div>
	);
};

export default Sidebar;
