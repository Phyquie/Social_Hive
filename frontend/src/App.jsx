
import { Routes, Route ,Navigate } from 'react-router-dom'
import HomePage from './pages/auth/home/HomePage'
import SignUpPage from './pages/auth/signup/SignUpPage'
import LoginPage from './pages/auth/login/LoginPage'
import Sidebar from './components/common/Sidebar'
import RightPanel from './components/common/RightPanel'
import NotificationPage from './pages/notification/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage'
import { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from './components/common/LoadingSpinner'



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
    <><div className="flex h-screen">
    {authUser && (
      <div className="fixed top-0 left-0 w-1/5 h-full">
        <Sidebar />
      </div>
    )}
    <div className={`flex-grow ${authUser ? 'ml-[20%] lg:mr-[20%]' : ''} overflow-auto`}>
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
      </Routes>
    </div>
    {authUser && (
      <div className="fixed top-0 right-0 w-1/5 h-full hidden lg:block">
        <RightPanel />
      </div>
    )}
    <Toaster />
  </div>
  
  
  
    
  </>
  )
}

export default App
