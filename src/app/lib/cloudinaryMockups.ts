const CLOUDINARY_CLOUD_NAME = 'dbx52chmq';

export const cloudinaryImageUrl = (publicId: string, transformation: string) =>
  `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformation}/${publicId}`;

export type MockupAsset = {
  id: string;
  label: string;
  src: string;
  thumbSrc: string;
};

export const createMockupAsset = (publicId: string, label: string): MockupAsset => ({
  id: publicId,
  label,
  src: cloudinaryImageUrl(publicId, 'f_auto,q_auto,c_limit,w_1000'),
  thumbSrc: cloudinaryImageUrl(publicId, 'f_auto,q_auto,c_fill,w_160,h_160'),
});

export const frontMockupOptions = [
  createMockupAsset('front-beige-plain-shirt_vzqsmt', 'Beige plain shirt front'),
  createMockupAsset('front-black-plain-shirt_kjqm2w', 'Black plain shirt front'),
  createMockupAsset('front-blue-plain-shirt_plpwxd', 'Blue plain shirt front'),
  createMockupAsset('front-cream-plain-shirt_lyyext', 'Cream plain shirt front'),
  createMockupAsset('front-gray-plain-shirt_recrxi', 'Gray plain shirt front'),
  createMockupAsset('front-green-plain-shirt_ahqjhx', 'Green plain shirt front'),
  createMockupAsset('front-light-gray-plain-shirt_qqiywe', 'Light gray plain shirt front'),
  createMockupAsset('front-olive-plain-shirt_lv8eys', 'Olive plain shirt front'),
];

export const backMockupOptions = [
  createMockupAsset('back-beige-plain-shirt_h0a6mv', 'Beige plain shirt back'),
  createMockupAsset('back-black-plain-shirt_zbsaku', 'Black plain shirt back'),
  createMockupAsset('back-blue-plain-shirt_f88pv8', 'Blue plain shirt back'),
  createMockupAsset('back-cream-plain-shirt_nvqhoj', 'Cream plain shirt back'),
  createMockupAsset('back-gray-plain-shirt_rbseha', 'Gray plain shirt back'),
  createMockupAsset('back-green-plain-shirt_ethtim', 'Green plain shirt back'),
  createMockupAsset('back-light-gray-plain-shirt_ielp0p', 'Light gray plain shirt back'),
  createMockupAsset('back-olive-plain-shirt_pgb39o', 'Olive plain shirt back'),
];
