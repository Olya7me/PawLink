import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { FALLBACK_APP_CONFIG, type AppConfigValues } from '@/features/content';

export type LocalPhoto = {
  id: string;
  uri: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  fileName: string;
  byteSize: number;
};

export type PhotoLimits = Pick<
  AppConfigValues,
  'maxAnimalPhotos' | 'maxPhotoBytes' | 'allowedPhotoMimeTypes'
>;

export class PhotoValidationError extends Error {
  constructor(public readonly code: 'tooMany' | 'tooLarge' | 'badType' | 'permission') {
    super(code);
    this.name = 'PhotoValidationError';
  }
}

function normalizeMime(
  raw: string | undefined | null,
  allowed: Set<string>,
): LocalPhoto['mimeType'] | null {
  if (!raw) return 'image/jpeg';
  const lower = raw.toLowerCase();
  if (!allowed.has(lower)) return null;
  if (lower === 'image/jpg' || lower === 'image/jpeg') return 'image/jpeg';
  if (lower === 'image/png') return 'image/png';
  return 'image/webp';
}

function extensionFor(mime: LocalPhoto['mimeType']): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

async function compressAsset(
  asset: ImagePicker.ImagePickerAsset,
  limits: PhotoLimits,
  allowed: Set<string>,
): Promise<LocalPhoto> {
  const mime = normalizeMime(asset.mimeType, allowed);
  if (!mime) {
    throw new PhotoValidationError('badType');
  }

  const format =
    mime === 'image/png' ? SaveFormat.PNG : mime === 'image/webp' ? SaveFormat.WEBP : SaveFormat.JPEG;

  const result = await manipulateAsync(asset.uri, [{ resize: { width: 1280 } }], {
    compress: 0.7,
    format,
  });

  const size = result.uri.startsWith('data:')
    ? Math.ceil((result.uri.length * 3) / 4)
    : (asset.fileSize ?? 0);

  let byteSize = size;
  try {
    const response = await fetch(result.uri);
    const buffer = await response.arrayBuffer();
    byteSize = buffer.byteLength;
  } catch {
    // Fall back to picker metadata / estimate.
  }

  if (byteSize > limits.maxPhotoBytes) {
    throw new PhotoValidationError('tooLarge');
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    uri: result.uri,
    mimeType: mime === 'image/png' ? 'image/png' : mime === 'image/webp' ? 'image/webp' : 'image/jpeg',
    fileName: `${id}.${extensionFor(mime === 'image/png' ? 'image/png' : mime === 'image/webp' ? 'image/webp' : 'image/jpeg')}`,
    byteSize,
  };
}

export async function pickAnimalPhotos(
  currentCount: number,
  limits: PhotoLimits = FALLBACK_APP_CONFIG,
): Promise<LocalPhoto[]> {
  const remaining = limits.maxAnimalPhotos - currentCount;
  if (remaining <= 0) {
    throw new PhotoValidationError('tooMany');
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new PhotoValidationError('permission');
  }

  const allowed = new Set(limits.allowedPhotoMimeTypes.map((item) => item.toLowerCase()));

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: remaining,
    quality: 1,
  });

  if (result.canceled || !result.assets?.length) {
    return [];
  }

  if (currentCount + result.assets.length > limits.maxAnimalPhotos) {
    throw new PhotoValidationError('tooMany');
  }

  const photos: LocalPhoto[] = [];
  for (const asset of result.assets) {
    const mime = normalizeMime(asset.mimeType, allowed);
    if (!mime) {
      throw new PhotoValidationError('badType');
    }
    photos.push(await compressAsset(asset, limits, allowed));
  }
  return photos;
}
