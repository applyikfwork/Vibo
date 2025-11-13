import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { initializeFirebase } from '@/firebase';

export async function uploadVoiceNote(
  userId: string,
  audioBlob: Blob
): Promise<{ audioUrl: string; storagePath: string }> {
  const { storage } = initializeFirebase();
  
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const filename = `voice-notes/${userId}/${timestamp}_${randomSuffix}.webm`;
  
  const storageRef = ref(storage, filename);
  
  await uploadBytes(storageRef, audioBlob, {
    contentType: 'audio/webm',
    customMetadata: {
      userId,
      uploadedAt: new Date().toISOString(),
    },
  });
  
  const downloadURL = await getDownloadURL(storageRef);
  return {
    audioUrl: downloadURL,
    storagePath: filename,
  };
}

export async function deleteVoiceNote(storagePath: string): Promise<void> {
  try {
    const { storage } = initializeFirebase();
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting voice note:', error);
    // Don't throw - deletion errors shouldn't block other operations
  }
}

export async function uploadVibeImage(
  userId: string,
  imageBlob: Blob
): Promise<{ imageUrl: string; storagePath: string }> {
  const { storage } = initializeFirebase();
  
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const filename = `vibe-images/${userId}/${timestamp}_${randomSuffix}.webp`;
  
  const storageRef = ref(storage, filename);
  
  await uploadBytes(storageRef, imageBlob, {
    contentType: 'image/webp',
    customMetadata: {
      userId,
      uploadedAt: new Date().toISOString(),
    },
  });
  
  const downloadURL = await getDownloadURL(storageRef);
  
  return {
    imageUrl: downloadURL,
    storagePath: filename,
  };
}

export async function deleteVibeImage(storagePath: string): Promise<void> {
  try {
    const { storage } = initializeFirebase();
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting vibe image:', error);
    // Don't throw - deletion errors shouldn't block other operations
  }
}
