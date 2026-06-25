// CFG: Distributed Storage Layer
import { supabase } from './db';

export const StorageService = {
  // EXEC: Upload File to Bucket
  async uploadFile(file, bucket = 'avatars') {
    if (!supabase) {
      console.log(`[Storage] Simulation Mode. Generating local blob for ${file.name}`);
      return URL.createObjectURL(file); 
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Call to Cloud Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Retrive Public CDN Link
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error("[Storage Error] Upload failed:", error);
      return null;
    }
  }
};
