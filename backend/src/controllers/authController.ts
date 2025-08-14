import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';
import { createVoiceprint, compareVoice } from '../services/mockBiometricService.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;
const SIMILARITY_THRESHOLD = 90;

const generateToken = (id: string) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '1d' });
};


export const register = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: { email, password: hashedPassword },
        });

        res.status(201).json({
            id: user.id,
            email: user.email,
            token: generateToken(user.id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                email: user.email,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            include: { voiceprint: true },
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ id: user.id, email: user.email, hasVoiceprint: !!user.voiceprint });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


export const enroll = async (req: AuthRequest, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Audio file is required' });
    }

    const userId = req.user!.id;
    const audioBuffer = req.file.buffer;

    try {
        const voiceprintVector = await createVoiceprint(audioBuffer);

        await prisma.voiceprint.upsert({
            where: { userId },
            update: {
                voiceprintVector,
                algorithmVersion: 1,
            },
            create: {
                userId,
                voiceprintVector,
                algorithmVersion: 1,
            },
        });

        res.status(200).json({ message: 'Voiceprint enrolled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to enroll voiceprint' });
    }
};

export const verify = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Audio file is required' });
    }
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const liveAudio = req.file.buffer;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { voiceprint: true },
        });

        if (!user || !user.voiceprint) {
            return res.status(404).json({ message: 'User not found or no voiceprint enrolled' });
        }

        const { voiceprintVector } = user.voiceprint;

        const { similarityScore, isLive } = await compareVoice(liveAudio, voiceprintVector);

        if (similarityScore >= SIMILARITY_THRESHOLD && isLive) {
            res.json({
                message: 'Verification successful!',
                user: { id: user.id, email: user.email },
                token: generateToken(user.id),
            });
        } else {
            let reason = 'Voice did not match.';
            if (!isLive) reason = 'Liveness check failed.';
            res.status(401).json({ message: `Verification failed: ${reason}`, score: similarityScore });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to verify voiceprint' });
    }
};