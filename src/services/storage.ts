import { supabase } from '../config/supabase';
import * as ImageManipulator from 'expo-image-manipulator';

const CHAT_BUCKET = 'chat-uploads';
const SERVICE_BUCKET = 'service-photos';
const PORTFOLIO_BUCKET = 'portfolio-images';
const AVATAR_BUCKET = 'avatar-images';

interface UploadImageOptions {
  bucket: string;
  fileUri: string;
  pathPrefix: string;
  maxWidth?: number;
  maxHeight?: number;
  compress?: number;
  format?: ImageManipulator.SaveFormat;
}

const buildFilePath = (pathPrefix: string, extension: string) => {
  const cleanPrefix = pathPrefix.replace(/\/+$/, '');
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${cleanPrefix}/${uniqueId}.${extension}`;
};

const detectContentType = (uri: string, fallback = 'image/jpeg') => {
  const extension = uri.split('?')[0]?.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'heic':
      return 'image/heic';
    default:
      return fallback;
  }
};

const uploadImageToBucket = async ({
  bucket,
  fileUri,
  pathPrefix,
  maxWidth = 1600,
  maxHeight = 1600,
  compress = 0.7,
  format = ImageManipulator.SaveFormat.JPEG,
}: UploadImageOptions) => {
  const resizeOptions: ImageManipulator.Action[] = [];
  if (maxWidth || maxHeight) {
    resizeOptions.push({
      resize: {
        width: maxWidth,
        height: maxHeight,
      },
    });
  }

  const manipulation = await ImageManipulator.manipulateAsync(
    fileUri,
    resizeOptions,
    {
      compress,
      format,
    },
  );

  const response = await fetch(manipulation.uri);
  const blob = await response.blob();
  const contentType =
    blob.type ||
    (format === ImageManipulator.SaveFormat.PNG
      ? 'image/png'
      : format === ImageManipulator.SaveFormat.WEBP
        ? 'image/webp'
        : detectContentType(fileUri));

  const extension = contentType.split('/')[1] || 'jpg';
  const filePath = buildFilePath(pathPrefix, extension);

  const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, blob, {
    contentType,
    cacheControl: '3600',
    upsert: false,
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: data.publicUrl,
    contentType,
  };
};

export const uploadChatImage = async (conversationId: string, fileUri: string) => {
  return uploadImageToBucket({
    bucket: CHAT_BUCKET,
    fileUri,
    pathPrefix: `conversations/${conversationId}`,
    maxWidth: 1280,
    maxHeight: 1280,
    compress: 0.6,
  });
};

export const uploadServiceImage = async (userId: string, fileUri: string) => {
  return uploadImageToBucket({
    bucket: SERVICE_BUCKET,
    fileUri,
    pathPrefix: `users/${userId}`,
    maxWidth: 1600,
    maxHeight: 1600,
    compress: 0.75,
  });
};

export const uploadPortfolioImage = async (professionalId: string, fileUri: string) => {
  return uploadImageToBucket({
    bucket: PORTFOLIO_BUCKET,
    fileUri,
    pathPrefix: `professionals/${professionalId}`,
    maxWidth: 1800,
    maxHeight: 1800,
    compress: 0.75,
  });
};

export const uploadAvatarImage = async (professionalId: string, fileUri: string) => {
  return uploadImageToBucket({
    bucket: AVATAR_BUCKET,
    fileUri,
    pathPrefix: `professionals/${professionalId}`,
    maxWidth: 600,
    maxHeight: 600,
    compress: 0.8,
  });
};

