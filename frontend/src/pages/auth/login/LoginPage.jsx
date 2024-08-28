import React from 'react'
import { FaUser } from 'react-icons/fa';
import { MdPassword } from 'react-icons/md';
import BeeLogoSvg from '../../../components/svgs/Dsvg';
import { useState } from 'react';
import { useMutation ,useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const LoginPage = () => {

  const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
   const queryClient = useQueryClient();
  const { mutate, isError, isLoading,error} = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success('Login successful!');
      setFormData({ 
        username: '',
        password: ''
      })
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      

    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
  const handleSubmit = (e) => {
		e.preventDefault();
		mutate(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

  return (
    <div className="min-h-screen flex flex-col items-center md:flex-row max-w-full max-h-full">
      {/* Logo Box */}
      <div className="logobox flex flex-col w-full md:w-1/2 h-64 md:h-screen text-center p-8 justify-center items-center">
  <BeeLogoSvg width="600px" height="600px" />
  <h1 className="text-6xl font-extrabold text-white mt-4">Social Hive</h1>
</div>


      {/* Input Box */}
      <div className="inputbox flex flex-col w-full md:w-1/2 h-full  p-8 justify-center">
        <h1 className="text-4xl font-extrabold text-white mb-8 text-center">Lets Go</h1>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
         

          {/* Username */}
          <div className="flex items-center bg-secondary p-3 rounded-lg">
            <FaUser className="text-2xl text-primary mr-3" />
            <input
              type="text"
              placeholder="Username"
              className="bg-transparent w-full text-white focus:outline-none"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
            />
          </div>

          {/* Password */}
          <div className="flex items-center bg-secondary p-3 rounded-lg">
            <MdPassword className="text-2xl text-primary mr-3" />
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent w-full text-white focus:outline-none"
              name='password'
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          {/* Sign Up Button */}
          <button className="w-full  text-primary font-bold p-3 rounded-lg mt-4 hover:bg-secondary transition">
            {isLoading?"Loading..." : "Sign In"}
          </button>
          {isError && <p className='text-red-500'>{error.message}</p>}
        </form>

        {/* Already have an account */}
        <div className="text-center mt-8">
          <p className="text-white">Didn't have a account?</p>
          <a href="/signup" className="text-primary font-bold hover:bg-secondary transition">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
  
}

export default LoginPage