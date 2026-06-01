const CLOUDINARY_CLOUD_NAME = 'dbx52chmq';

const cloudinaryImageUrl = (publicId: string, transformation: string) =>
  `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformation}/${publicId}`;

type MockupAsset = {
  id: string;
  label: string;
  src: string;
  thumbSrc: string;
};

const createMockupAsset = (publicId: string, label: string): MockupAsset => ({
  id: publicId,
  label,
  src: cloudinaryImageUrl(publicId, 'f_auto,q_auto,c_limit,w_1000'),
  thumbSrc: cloudinaryImageUrl(publicId, 'f_auto,q_auto,c_fill,w_160,h_160'),
});

export const frontMockupOptions = [
  createMockupAsset('beige-polo-front_adlhdb', 'Beige polo front'),
  createMockupAsset('beige-sweatshirt-front_silau5', 'Beige sweatshirt front'),
  createMockupAsset('beige-tshirt-front_zaooac', 'Beige T-shirt front'),
  createMockupAsset('black-polo-front_dqofte', 'Black polo front'),
  createMockupAsset('black-sweatshirt-front_cr2xg0', 'Black sweatshirt front'),
  createMockupAsset('black-tshirt-front_kin8g4', 'Black T-shirt front'),
  createMockupAsset('mint-polo-front_hipixo', 'Mint polo front'),
  createMockupAsset('mint-sweatshirt-front_gnomgf', 'Mint sweatshirt front'),
  createMockupAsset('mint-tshirt-front_fdwuey', 'Mint T-shirt front'),
  createMockupAsset('navy-polo-front_gylear', 'Navy polo front'),
  createMockupAsset('navy-sweatshirt-front_ehucto', 'Navy sweatshirt front'),
  createMockupAsset('navy-tshirt-front_kdejn8', 'Navy T-shirt front'),
  createMockupAsset('white-polo-front_g21mgh', 'White polo front'),
  createMockupAsset('white-sweatshirt-front_f9yrv0', 'White sweatshirt front'),
  createMockupAsset('white-tshirt-front_utrve6', 'White T-shirt front'),
];

export const backMockupOptions = [
  createMockupAsset('beige-polo-back_gz4hdd', 'Beige polo back'),
  createMockupAsset('beige-sweatshirt-back_zvtjgj', 'Beige sweatshirt back'),
  createMockupAsset('beige-tshirt-back_zqvqbt', 'Beige T-shirt back'),
  createMockupAsset('black-polo-back_j8qxrt', 'Black polo back'),
  createMockupAsset('black-sweatshirt-back_gplavw', 'Black sweatshirt back'),
  createMockupAsset('black-tshirt-back_byisqx', 'Black T-shirt back'),
  createMockupAsset('mint-polo-back_dde9uf', 'Mint polo back'),
  createMockupAsset('mint-sweatshirt-back_i151de', 'Mint sweatshirt back'),
  createMockupAsset('mint-tshirt-back_nvveo2', 'Mint T-shirt back'),
  createMockupAsset('navy-polo-back_kzt1ey', 'Navy polo back'),
  createMockupAsset('navy-sweatshirt-back_wu4lda', 'Navy sweatshirt back'),
  createMockupAsset('navy-tshirt-back_o0h4xb', 'Navy T-shirt back'),
  createMockupAsset('white-polo-back_hsuaiv', 'White polo back'),
  createMockupAsset('white-sweatshirt-back_xn1ays', 'White sweatshirt back'),
  createMockupAsset('white-tshirt-back_whyfbr', 'White T-shirt back'),
];
