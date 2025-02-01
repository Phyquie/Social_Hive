
import { Routes, Route ,Navigate } from 'react-router-dom'
import HomePage from './pages/auth/home/HomePage'
import SignUpPage from './pages/auth/signup/SignUpPage'
import LoginPage from './pages/auth/login/LoginPage'
import RightPanel from './components/common/RightPanel'
import NotificationPage from './pages/notification/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage'
import Sidebar from './components/common/Sidebar'
import { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from './components/common/LoadingSpinner'
import MessagesPage from './pages/messages/messagesSide'
import ChatWindow from './pages/messages/ChatWindow'
import SearchPage from './pages/searchPage/SearchPage'
import AiPage from './pages/AiAssistant/AiPage'
import ResumeChecker from './pages/Resume/ResumeChecker'
import SavedPostsPage from './pages/SavePosts/SavePost'
import VideoCallWindow from './pages/messages/videoCallWindow'
function App() {
 const{data : authUser,isLoading} =useQuery({
  queryKey:['authUser'],
  queryFn : async ()=>{
    try{
      const res = await fetch("/api/auth/me");
        const data = await res.json();
        if(!res.ok){
          throw new Error(data.error||"Something went worng")
        }
        
        return data;
      }
      catch(error){

        throw new Error(error)

      }

      
    },
    retry:false,
    

  }
 );
 if(isLoading){
  return (
    <div className='h-screen flex justify-center items-center'>
				<LoadingSpinner size='lg' />
			</div>
  )
 }
 


  return (
    <><div className="flex h-screen lg:flex-row flex-col-reverse">
    {authUser && (
      <div className="lg:sticky lg:top-0 left-0 lg:w-1/5 lg:h-full h-20 bottom-0 w-full ">
        <Sidebar />
      </div>
    )}
    <div className={`flex-grow ${authUser ? '' : ''} overflow-auto`}>
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/notifications"
          element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:username"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route 
           path="/messages"
           element={authUser ? <MessagesPage/>: <Navigate to="/login" />}/>
      
      <Route 
           path="/messages/chat"
           element={authUser ? <ChatWindow userID={authUser._id} /> : <Navigate to="/login" />}/>

            <Route 
      path = "/AiChat"
      element={authUser ? <AiPage userId={authUser._id}/> : <Navigate to="/login" />}/>
      <Route path="/resumeChecker" element={authUser ? <ResumeChecker/> : <Navigate to="/login" />}/>

      <Route path="/savedPosts" element={authUser ? <SavedPostsPage/> : <Navigate to="/login" />}/>
      <Route path="/search" element={authUser ? <SearchPage/> : <Navigate to="/login" />}/>
      <Route path="/videoCall" element={authUser ? <VideoCallWindow userID={authUser._id}/> : <Navigate to="/login" />}/>

      </Routes>
      

    </div>
    {authUser && (
      <div className="sticky top-0 right-0 w-1/5 h-full hidden lg:block">
        <RightPanel />
      </div>
    )}
    <Toaster />
  </div>
  
  
  
    
  </>
  )
}

export default App
