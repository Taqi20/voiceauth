// --- This is our Mock/Fake Biometric Engine ---

// in real project this would be replaced with actual biometric engine implementation servies like veridas, validsoft, etc
import { createHash } from "crypto";

// Creates a voiceprint vector from an audio buffer.
export async function createVoiceprint(audioBuffer: Buffer): Promise<Buffer> {
    console.log('[MockBiometricService] Creating voiceprint...');
    // Simulate network delay and processing time
    await new Promise(res => setTimeout(res, 500));

    // Create a deterministic hash of the audio content to act as our "vector"
    const hash = createHash('sha256').update(audioBuffer).digest();
    console.log('[MockBiometricService] Voiceprint created.');
    return hash;
}


// Compares a live audio buffer to a stored voiceprint vector.

export async function compareVoice(liveAudio: Buffer,
    storedVector: Buffer
): Promise<{ similarityScore: number; isLive: boolean }> {
    console.log('[MockBiometricService] Comparing voice...');
    // Simulate network delay and processing time
    await new Promise(res => setTimeout(res, 500));

    // Generate the vector from the live audio to see if it matches
    const liveVector = createHash('sha256').update(liveAudio).digest();

    let score = 0;
    if (Buffer.compare(liveVector, storedVector) == 0) {
        score = 92 + Math.random() * 8;
    } else {
        score = 20 + Math.random() * 20;
    }

    console.log(`[MockBiometricService] Comparison complete. Score: ${score.toFixed(2)}`);

    return {
        similarityScore: score,
        isLive: true, // asssuming attempts are from the live person
    };
}