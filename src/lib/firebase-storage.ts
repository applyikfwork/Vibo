import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { initializeFirebase } from '@/firebase';

export async function uploadVoiceNote(
  userId: string,
  audioBlob: Blob,
  vibeId: string
): Promise<string> {
  const { storage } = initializeFirebase();
  
  // Create a unique filename with timestamp
  const timestamp = Date.now();
  const filename = `voice-notes/${userId}/${vibeId}_${timestamp}.webm`;
  
  const storageRef = ref(storage, filename);
  
  // Upload the audio blob
  await uploadBytes(storageRef, audioBlob, {
    contentType: 'audio/webm',
    customMetadata: {
      userId,
      vibeId,
      uploadedAt: new Date().toISOString(),
    },
  });
  
  // Get and return the download URL
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

export async function deleteVoiceNote(audioUrl: string): Promise<void> {
  try {
    const { storage } = initializeFirebase();
    const storageRef = ref(storage, audioUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting voice note:', error);
    // Don't throw - deletion errors shouldn't block other operations
  }
}
