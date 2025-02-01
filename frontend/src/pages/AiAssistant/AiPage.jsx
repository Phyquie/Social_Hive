import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FaTrash } from 'react-icons/fa';

const AiPage = ({ userId }) => {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    // Load messages from local storage on mount
    useEffect(() => {
        const savedMessages = localStorage.getItem(`messages_${userId}`);
        console.log("savedMessages", savedMessages);
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
    }, [userId]);

    // Save messages to local storage whenever they change
    useEffect(() => {
        if(messages.length > 0){
            try{
                localStorage.setItem(`messages_${userId}`, JSON.stringify(messages));
                console.log("messages", userId, messages);
            }catch(error){
                console.log("error in saving messages to local storage", error);
            }
        }
    }, [messages, userId]);

    // Mutation for getting AI advice
    const { mutate: getAdvice } = useMutation({
        mutationFn: async (question) => {
            setIsLoading(true);
            // Ensure messages is an array of strings
            const conversation = messages.map(msg => msg.text);
            const res = await fetch('/api/users/getCareerAdvice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversation, question }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }
            return data.advice;
        },
        onSuccess: (data) => {
            setMessages((prev) => [
                ...prev,
                { sender: 'bot', text: data },
            ]);
            toast.success('Advice received!');
            setIsLoading(false);
        },
        onError: (error) => {
            toast.error(error.message || 'Error fetching advice');
            setIsLoading(false);
        },
    });

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (question.trim() === '') return;

        setMessages((prev) => [
            ...prev,
            { sender: 'user', text: question },
        ]);
        getAdvice(question);
        setQuestion('');
    };

    // Scroll to the latest message
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);


    const clearLocalStorage = () => {
        localStorage.removeItem(`messages_${userId}`);
        setMessages([]);
    }

    return (
        <div className="max-w-md mx-auto p-6 border border-primary rounded-lg shadow-md h-screen flex flex-col">
            <FaTrash className='text-primary cursor-pointer mb-2 self-end' onClick={clearLocalStorage}/>
            
            <div className="flex flex-col gap-4 mb-4 overflow-y-auto flex-1">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`p-3 rounded-md text-lg max-w-xs ${
                            message.sender === 'bot'
                                ? 'bg-green-100 text-green-800 self-start'
                                : 'bg-blue-100 text-blue-800 self-end'
                        }`}
                    >
                        {parseFormattedText(message.text)}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask for anything..."
                    className="p-3 border border-gray-300 rounded-md text-lg w-full"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`p-3 rounded-md text-lg text-black transition-colors ${
                        isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-green-300'
                    }`}
                >
                    {isLoading ? <LoadingSpinner /> : 'Send'}
                </button>
            </form>
        </div>
    );
};

export default AiPage;

// Enhanced parser for formatted text
const parseFormattedText = (text) => {
    const lines = text.split('\n').map((line, index) => {
        // Check for headers with '##'
        if (line.startsWith('##')) {
            return (
                <h3 key={index} className="text-lg font-semibold text-purple-600 mb-2">
                    {line.slice(3)}
                </h3>
            );
        }
        // Check for bold '**'
        if (line.includes('**')) {
            return (
                <p key={index} className="mb-2">
                    {line.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                        part.startsWith('**') && part.endsWith('**') ? (
                            <strong key={i}>{part.slice(2, -2)}</strong>
                        ) : (
                            part
                        )
                    )}
                </p>
            );
        }
        // Default paragraph text
        return <p key={index} className="mb-2">{line}</p>;
    });
    return lines;
};

// Example function to send data to the server
const sendCareerAdviceRequest = async (conversation, question) => {
    // Ensure conversation is an array of strings
    if (!Array.isArray(conversation) || !conversation.every(item => typeof item === 'string')) {
        console.error("Invalid conversation format. Expected an array of strings.");
        return;
    }

    try {
        const response = await fetch('/api/getCareerAdvice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversation, question }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }

        console.log("Advice received:", data.advice);
    } catch (error) {
        console.error("Error fetching career advice:", error.message);
    }
};
