'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import VoiceRecorder from '@/components/VoiceRecorder';

export default function EnrollPage() {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (!storedToken) {
            setError('You must be logged in to enroll.');
        }
        setToken(storedToken);
    }, []);

    const handleEnrollment = async (audioBlob: Blob) => {
        if (!token) {
            setError('Authentication token not found.');
            return;
        }
        setMessage('Enrolling your voiceprint...');
        setError('');

        const formData = new FormData();
        formData.append('audio', audioBlob, 'enrollment.webm');

        try {
            const response = await axios.post('http://localhost:5001/api/auth/enroll', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
            });
            setMessage(response.data.message);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'An error occurred during enrollment.');
            setMessage('');
        }
    };

    if (error && !token) {
        return <div className="text-red-500 text-center mt-10">{error} Please log in first.</div>
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 py-10">
            <h1 className="text-3xl font-bold text-white mb-8">Enroll Your Voice</h1>
            <VoiceRecorder
                onRecordingComplete={handleEnrollment}
                promptText="The quick brown fox jumps over the lazy dog"
            />
            {message && <p className="mt-6 text-green-400 text-lg">{message}</p>}
            {error && <p className="mt-6 text-red-500 text-lg">{error}</p>}
        </div>
    );
}