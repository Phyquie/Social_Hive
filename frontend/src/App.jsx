import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/auth/home/HomePage'
import SignUpPage from './pages/auth/signup/SignUpPage'
import LoginPage from './pages/auth/login/LoginPage'
import Sidebar from './components/common/Sidebar'
import RightPanel from './components/common/RightPanel'
import NotificationPage from './pages/notification/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage'



function App() {
  const [count, setCount] = useState(0)

  return (
    <><div className='flex'>
      <Sidebar/>
   <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/signup" element={<SignUpPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/notifications" element={<NotificationPage />} />
    <Route path="/profile/:username" element={<ProfilePage />} />
   
   
</Routes>
<RightPanel/>
    </div>
    
  </>
  )
}

export default App
