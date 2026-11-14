import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { MAX_ANIMAL_PHOTOS, MAX_PHOTO_BYTES } from '../constants';

export type LocalPhoto = {
  id: string;
  uri: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  fileName: string;
  byteSize: number;
};

export class PhotoValidationError extends Error {
  constructor(public readonly code: 'tooMany' | 'tooLarge' | 'badType' | 'permission') {
    super(code);
    this.name = 'PhotoValidationError';
  }
}

const ALLOWED_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

function normalizeMime(raw: string | undefined | null): LocalPhoto['mimeType'] | null {
  if (!raw) return 'image/jpeg';
  const lower = raw.toLowerCase();
  if (!ALLOWED_MIME.has(lower)) return null;
  if (lower === 'image/jpg' || lower === 'image/jpeg') return 'image/jpeg';
  if (lower === 'image/png') return 'image/png';
  return 'image/webp';
}

function extensionFor(mime: LocalPhoto['mimeType']): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

async function compressAsset(asset: ImagePicker.ImagePickerAsset): Promise<LocalPhoto> {
  const mime = normalizeMime(asset.mimeType);
  if (!mime) {
    throw new PhotoValidationError('badType');
  }

  const format =
    mime === 'image/png' ? SaveFormat.PNG : mime === 'image/webp' ? SaveFormat.WEBP : SaveFormat.JPEG;

  const result = await manipulateAsync(
    asset.uri,
    [{ resize: { width: 1280 } }],
    {
      compress: 0.7,
      format,
    },
  );

  const size = result.uri.startsWith('data:')
    ? Math.ceil((result.uri.length * 3) / 4)
    : (asset.fileSize ?? 0);

  // Re-check size via fetch when possible (native file URIs).
  let byteSize = size;
  try {
    const response = await fetch(result.uri);
    const buffer = await response.arrayBuffer();
    byteSize = buffer.byteLength;
  } catch {
    // Fall back to picker metadata / estimate.
  }

  if (byteSize > MAX_PHOTO_BYTES) {
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

export async function pickAnimalPhotos(currentCount: number): Promise<LocalPhoto[]> {
  const remaining = MAX_ANIMAL_PHOTOS - currentCount;
  if (remaining <= 0) {
    throw new PhotoValidationError('tooMany');
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new PhotoValidationError('permission');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: remaining,
    quality: 1,
  });

  if (result.canceled || !result.assets?.length) {
    return [];
  }

  if (currentCount + result.assets.length > MAX_ANIMAL_PHOTOS) {
    throw new PhotoValidationError('tooMany');
  }

  const photos: LocalPhoto[] = [];
  for (const asset of result.assets) {
    if (asset.fileSize && asset.fileSize > MAX_PHOTO_BYTES) {
      // Still try compress; only fail if still too large after.
    }
    const mime = normalizeMime(asset.mimeType);
    if (!mime) {
      throw new PhotoValidationError('badType');
    }
    photos.push(await compressAsset(asset));
  }
  return photos;
}
