import { cloudinaryImageUrl } from './cloudinaryMockups';

export type CloudinaryBrowseAsset = {
  id: string;
  kind: 'shirt' | 'design';
  name: string;
  imageUrl: string;
  backImageUrl?: string;
  description: string;
  meta: string;
  tags: string[];
};

const shirtOptions = [
  {
    id: 'blue-plain-shirt',
    name: 'Blue Plain Shirt',
    frontPublicId: 'front-blue-plain-shirt_plpwxd',
    backPublicId: 'back-blue-plain-shirt_f88pv8',
    tags: ['blue', 'plain', 'shirt'],
  },
  {
    id: 'olive-plain-shirt',
    name: 'Olive Plain Shirt',
    frontPublicId: 'front-olive-plain-shirt_lv8eys',
    backPublicId: 'back-olive-plain-shirt_pgb39o',
    tags: ['olive', 'plain', 'shirt'],
  },
  {
    id: 'black-plain-shirt',
    name: 'Black Plain Shirt',
    frontPublicId: 'front-black-plain-shirt_kjqm2w',
    backPublicId: 'back-black-plain-shirt_zbsaku',
    tags: ['black', 'plain', 'shirt'],
  },
  {
    id: 'cream-plain-shirt',
    name: 'Cream Plain Shirt',
    frontPublicId: 'front-cream-plain-shirt_lyyext',
    backPublicId: 'back-cream-plain-shirt_nvqhoj',
    tags: ['cream', 'plain', 'shirt'],
  },
  {
    id: 'green-plain-shirt',
    name: 'Green Plain Shirt',
    frontPublicId: 'front-green-plain-shirt_ahqjhx',
    backPublicId: 'back-green-plain-shirt_ethtim',
    tags: ['green', 'plain', 'shirt'],
  },
  {
    id: 'light-gray-plain-shirt',
    name: 'Light Gray Plain Shirt',
    frontPublicId: 'front-light-gray-plain-shirt_qqiywe',
    backPublicId: 'back-light-gray-plain-shirt_ielp0p',
    tags: ['light gray', 'plain', 'shirt'],
  },
  {
    id: 'beige-plain-shirt',
    name: 'Beige Plain Shirt',
    frontPublicId: 'front-beige-plain-shirt_vzqsmt',
    backPublicId: 'back-beige-plain-shirt_h0a6mv',
    tags: ['beige', 'plain', 'shirt'],
  },
  {
    id: 'gray-plain-shirt',
    name: 'Gray Plain Shirt',
    frontPublicId: 'front-gray-plain-shirt_recrxi',
    backPublicId: 'back-gray-plain-shirt_rbseha',
    tags: ['gray', 'plain', 'shirt'],
  },
];

const designOptions: Array<{
  publicId: string;
  name: string;
  description: string;
  tags: string[];
}> = [
  {
    publicId: 'tropical-skull-sunglasses_qpfxje',
    name: 'Tropical Skull Sunglasses',
    description: 'Tropical skull illustration with hibiscus accents.',
    tags: ['skull', 'tropical', 'sunglasses', 'hibiscus'],
  },
  {
    publicId: 'retro-cassette-sun_hesp1j',
    name: 'Retro Cassette Sun',
    description: 'Sticker-style cassette graphic with music accents.',
    tags: ['cassette', 'music', 'retro', 'sun'],
  },
  {
    publicId: 'robot-noodle-bowl_zactq4',
    name: 'Robot Noodle Bowl',
    description: 'Cute robot character holding a steaming noodle bowl.',
    tags: ['robot', 'noodle', 'cute', 'food'],
  },
  {
    publicId: 'moon-bunny-skateboard_dxt74q',
    name: 'Moon Bunny Skateboard',
    description: 'Playful moon bunny with skate and star details.',
    tags: ['bunny', 'moon', 'skateboard', 'stars'],
  },
  {
    publicId: 'lucky-carp-wave_csocrn',
    name: 'Lucky Carp Wave',
    description: 'Bold carp artwork built for a front-print statement.',
    tags: ['carp', 'wave', 'lucky', 'fish'],
  },
];

function mapShirtAssets(): CloudinaryBrowseAsset[] {
  return shirtOptions.map((shirt) => ({
    id: `shirt-${shirt.id}`,
    kind: 'shirt',
    name: shirt.name,
    imageUrl: cloudinaryImageUrl(shirt.frontPublicId, 'f_auto,q_auto,c_limit,w_1000'),
    backImageUrl: cloudinaryImageUrl(shirt.backPublicId, 'f_auto,q_auto,c_limit,w_1000'),
    description: 'Plain shirt base for mockup setup.',
    meta: 'Cloudinary shirt',
    tags: shirt.tags,
  }));
}

function mapDesignAssets(): CloudinaryBrowseAsset[] {
  return designOptions.map((design) => ({
    id: `design-${design.publicId}`,
    kind: 'design',
    name: design.name,
    imageUrl: cloudinaryImageUrl(design.publicId, 'f_auto,q_auto,c_limit,w_1000'),
    description: design.description,
    meta: 'Cloudinary design',
    tags: ['design', ...design.tags],
  }));
}

export function getCloudinaryBrowseAssets(): CloudinaryBrowseAsset[] {
  return [...mapShirtAssets(), ...mapDesignAssets()];
}
