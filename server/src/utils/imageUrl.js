export function buildImageUrl(publicId, context = 'list') {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const transforms = {
    thumbnail: 'w_200,h_250,c_fill,f_auto,q_auto:low',
    list: 'w_400,h_500,c_fill,f_auto,q_auto:low',
    detail: 'w_800,h_1000,c_fill,f_auto,q_auto:good',
    zoom: 'w_1200,h_1500,c_fill,f_auto,q_auto:best',
  };
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms[context] || transforms.list}/${publicId}`;
}

export function expandImageUrls(publicId) {
  return {
    publicId,
    thumbnail: buildImageUrl(publicId, 'thumbnail'),
    list: buildImageUrl(publicId, 'list'),
    detail: buildImageUrl(publicId, 'detail'),
    zoom: buildImageUrl(publicId, 'zoom'),
  };
}

export function expandListImage(images) {
  if (!images?.length) return null;
  const publicId = images[0];
  return { publicId, thumbnail: buildImageUrl(publicId, 'thumbnail'), list: buildImageUrl(publicId, 'list') };
}

export function expandDetailImages(images) {
  if (!images?.length) return [];
  return images.map(expandImageUrls);
}
