import Notification from '../models/notification.model.js'

export const  getNotications = async (req, res) => {
    try {
        const userId = req.user._id;

		const notifications = await Notification.find({ to: userId }).populate({
			path: "from",
			select: "username profileImg",
		});
         await Notification.updateMany({to:req.user._id,read:false},{read:true})
        res.status(200).json(notifications)
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Server Error"})
    }
}
export const  deleteNotification = async (req, res) => {
     try {
        await Notification.deleteMany({to:req.user._id})    ;
        res.status(200).json({message:"Notifications deleted"})
        
     } catch (error) {
         console.log(error)
         res.status(500).json({message:"Server Error"})
        
     }
       
}   