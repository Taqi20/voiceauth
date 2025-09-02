'use client';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useState } from 'react';

interface VoiceRecorderProps {
    onRecordingComplete: (audioBlob: Blob) => void;
    promptText: string;
}

export default function VoiceRecorder({ onRecordingComplete, promptText }: VoiceRecorderProps) {
    const { status, audioBlob, startRecording, stopRecording, resetRecording } = useAudioRecorder();
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (audioBlob) {
            onRecordingComplete(audioBlob);
            resetRecording();
        }
    };

    return (
        <div className="w-full max-w-sm p-6 bg-gray-800 rounded-lg shadow-md text-white">
            <h3 className="text-lg font-semibold text-center mb-4">Voice Authentication</h3>
            <div className="text-center p-4 mb-4 bg-gray-700 rounded-md">
                <p className="text-gray-300">Please say:</p>
                <p className="text-xl font-bold text-cyan-400">"{promptText}"</p>
            </div>

            <div className="flex items-center justify-center space-x-4">
                {status !== 'recording' ? (
                    <button onClick={startRecording} className="p-4 bg-green-600 hover:bg-green-700 rounded-full text-white transition-colors">
                        🎤 Start
                    </button>
                ) : (
                    <button onClick={stopRecording} className="p-4 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors animate-pulse">
                        ⏹️ Stop
                    </button>
                )}
            </div>

            {status === 'error' && <p className="text-red-500 text-sm mt-4 text-center">Error: Could not access microphone. Please grant permission and ensure you are on HTTPS.</p>}

            {audioBlob && status === 'stopped' && (
                <div className="mt-6 text-center">
                    <p className="text-green-400 mb-2">Recording complete!</p>
                    <audio src={URL.createObjectURL(audioBlob)} controls className="w-full mb-4" />
                    <div className="flex justify-center space-x-4">
                        <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors">
                            Submit
                        </button>
                        <button onClick={resetRecording} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white transition-colors">
                            Record Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}