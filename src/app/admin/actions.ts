'use server';

import { getAdminSdks } from '@/firebase/server-init';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';
import { Author } from '@/lib/types';

const fakeComments = [
    "This is such a mood!",
    "I feel this on a spiritual level.",
    "Sending good vibes your way! ✨",
    "Totally get that.",
    "Thanks for sharing this!",
    "This is so relatable.",
    "What a great post.",
    "Love this energy.",
    "Hope you have a great day!",
    "This made me smile.",
];

const fakeReactions = ['🤗', '🙏', '❤️', '✨', '🔥', '💯', '🙌'];

async function getAdminUser() {
    // In a real app, you'd get this from a secure source.
    // For this prototype, we'll create a consistent anonymous-like author.
    return {
        name: 'Anonymous',
        avatarUrl: '',
    };
}


export async function addFakeComment(vibeId: string) {
    const { firestore, auth } = await getAdminSdks();
    const adminUser = await auth.getUserByEmail('xyzapplywork@gmail.com').catch(() => null);

    if (!adminUser) {
        throw new Error('Admin user not found. Operation not permitted.');
    }

    const commentText = fakeComments[Math.floor(Math.random() * fakeComments.length)];
    const author = await getAdminUser();

    const commentRef = firestore.collection('all-vibes').doc(vibeId).collection('comments').doc();

    await commentRef.set({
        vibeId,
        userId: `admin_${Date.now()}`, // Fake user ID
        text: commentText,
        timestamp: FieldValue.serverTimestamp(),
        isAnonymous: true,
        author,
    });

    revalidatePath(`/vibe/${vibeId}`);
    revalidatePath('/admin');
    return { success: true, message: `Added comment: "${commentText}"` };
}

export async function addFakeReaction(vibeId: string) {
    const { firestore, auth } = await getAdminSdks();
    const adminUser = await auth.getUserByEmail('xyzapplywork@gmail.com').catch(() => null);

    if (!adminUser) {
        throw new Error('Admin user not found. Operation not permitted.');
    }
    
    const reactionEmoji = fakeReactions[Math.floor(Math.random() * fakeReactions.length)];
    const author = await getAdminUser();

    const reactionRef = firestore.collection('all-vibes').doc(vibeId).collection('reactions').doc();
    
    await reactionRef.set({
        vibeId,
        userId: `admin_${Date.now()}`, // Fake user ID
        emoji: reactionEmoji,
        timestamp: FieldValue.serverTimestamp(),
        isAnonymous: true,
        author,
    });

    revalidatePath(`/vibe/${vibeId}`);
    revalidatePath('/admin');
    return { success: true, message: `Added reaction: ${reactionEmoji}` };
}
