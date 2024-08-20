import Notification from '../models/notification.model.js'

export const  getNotications = async (req, res) => {
    try {
        const notifications = await Notification.find({to:req.user._id}).sort({createdAt:-1})
         await Notification.updateMany({to:req.user._id,read:false},{read:true})
        res.json(notifications)
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Server Error"})
    }
}
export const  deleteNotification = async (req, res) => {
     try {
        await Notification.deleteMany({to:req.user._id})    ;
        res.json({message:"Notifications deleted"})
        
     } catch (error) {
         console.log(error)
         res.status(500).json({message:"Server Error"})
        
     }
       
}   