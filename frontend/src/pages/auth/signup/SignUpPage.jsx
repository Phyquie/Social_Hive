import React, { useState } from 'react';
import { MdOutlineMail, MdDriveFileRenameOutline, MdPassword } from 'react-icons/md';
import { FaUser } from 'react-icons/fa';
import BeeLogoSvg from '../../../components/svgs/Dsvg';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const SignUpPage = () => {
  const [formData, setFormData] = useState({ 
    email: '',
    username: '',
    fullname: '',
    password: ''
  });

  const { mutate, isError, isLoading, error } = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch("/api/auth/signup", {
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
      toast.success('Sign up successful!');
      setFormData({ 
        email: '',
        username: '',
        fullname: '',
        password: ''
      })
      console.log(data);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(formData);
  };

  return (
    <div className="min-h-screen flex flex-col items-center md:flex-row max-w-full max-h-full">
      {/* Logo Box */}
      <div className="logobox flex flex-col w-full md:w-1/2 h-64 md:h-screen text-center p-8 justify-center items-center">
        <BeeLogoSvg width="600px" height="600px" />
        <h1 className="text-6xl font-extrabold text-white mt-4">Social Hive</h1>
      </div>

      {/* Input Box */}
      <div className="inputbox flex flex-col w-full md:w-1/2 h-full p-8 justify-center">
        <h1 className="text-4xl font-extrabold text-white mb-8 text-center">Join Today</h1>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="flex items-center bg-secondary p-3 rounded-lg">
            <MdOutlineMail className="text-2xl text-primary mr-3" />
            <input
              type="email"
              placeholder="Email"
              className="bg-transparent w-full text-white focus:outline-none"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Username */}
          <div className="flex items-center bg-secondary p-3 rounded-lg">
            <FaUser className="text-2xl text-primary mr-3" />
            <input
              type="text"
              placeholder="Username"
              className="bg-transparent w-full text-white focus:outline-none"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          {/* Full Name */}
          <div className="flex items-center bg-secondary p-3 rounded-lg">
            <MdDriveFileRenameOutline className="text-2xl text-primary mr-3" />
            <input
              type="text"
              placeholder="Full Name"
              className="bg-transparent w-full text-white focus:outline-none"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="flex items-center bg-secondary p-3 rounded-lg">
            <MdPassword className="text-2xl text-primary mr-3" />
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent w-full text-white focus:outline-none"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Sign Up Button */}
          <button 
            className="w-full text-primary font-bold p-3 rounded-lg mt-4 hover:bg-secondary transition"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Signup"}
          </button>
          {isError && <p className="text-red-500">{error.message}</p>}
        </form>

        {/* Already have an account */}
        <div className="text-center mt-8">
          <p className="text-white">Already have an account?</p>
          <a href="/login" className="text-primary font-bold hover:bg-secondary transition">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
