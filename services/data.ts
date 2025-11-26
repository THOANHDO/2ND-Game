
import { Product, HeroSlide, Category } from '../types';

// Enum values used as strings for backward compatibility with initial data
const CAT_CONSOLE = 'CONSOLE';
const CAT_GAME = 'GAME';
const CAT_ACCESSORY = 'ACCESSORY';

export const INITIAL_CATEGORIES: Category[] = [
    {
        id: 'cat_1',
        name: 'Máy Game Console',
        slug: CAT_CONSOLE,
        icon: 'videogame_asset', // Material Icon Name
        description: 'Các dòng máy Nintendo Switch OLED, Lite, V2'
    },
    {
        id: 'cat_2',
        name: 'Đĩa Game',
        slug: CAT_GAME,
        icon: 'sports_esports', // Material Icon Name
        description: 'Thư viện game phong phú nhập khẩu chính hãng'
    },
    {
        id: 'cat_3',
        name: 'Phụ Kiện',
        slug: CAT_ACCESSORY,
        icon: 'headset', // Material Icon Name
        description: 'Tay cầm Pro, bao đựng, dán màn hình'
    }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'Nintendo Switch OLED Model - White',
    description: 'Làm quen với thành viên mới nhất của gia đình Nintendo Switch. Hệ thống mới có màn hình OLED 7 inch rực rỡ, chân đế rộng có thể điều chỉnh, đế cắm có cổng LAN có dây, bộ nhớ trong 64 GB và âm thanh nâng cao.',
    price: 8490000,
    category: CAT_CONSOLE,
    imageUrl: 'https://images.unsplash.com/photo-1640499900704-b00dd6a1103a?auto=format&fit=crop&q=80&w=1000',
    images: [
      'https://images.unsplash.com/photo-1640499900704-b00dd6a1103a?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1599933390231-158223d77884?auto=format&fit=crop&q=80&w=1000'
    ],
    videoUrl: 'https://www.youtube.com/embed/4mHq6Y7JSmg',
    rating: 4.9,
    stock: 50,
    releaseDate: '2021-10-08'
  },
  {
    id: 'p2',
    title: 'The Legend of Zelda: Tears of the Kingdom',
    description: 'Một cuộc phiêu lưu hoành tráng trên mặt đất và bầu trời Hyrule đang chờ đón bạn trong The Legend of Zelda: Tears of the Kingdom.',
    price: 1290000,
    category: CAT_GAME,
    imageUrl: 'https://images.unsplash.com/photo-1599557438491-18e0018d052d?auto=format&fit=crop&q=80&w=1000',
    images: [
        'https://images.unsplash.com/photo-1599557438491-18e0018d052d?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1560529178-855d6e2996d9?auto=format&fit=crop&q=80&w=1000'
    ],
    videoUrl: 'https://www.youtube.com/embed/uHGShqcAHlQ',
    rating: 5.0,
    stock: 100,
    releaseDate: '2023-05-12'
  },
  {
    id: 'p3',
    title: 'Super Mario Bros. Wonder',
    description: 'Trò chơi Mario phong cách cuộn cảnh 2D cổ điển đã bị đảo lộn với sự ra đời của Wonder Flowers!',
    price: 1190000,
    category: CAT_GAME,
    imageUrl: 'https://images.unsplash.com/photo-1566576912906-600ace7a8582?auto=format&fit=crop&q=80&w=1000',
    images: [
        'https://images.unsplash.com/photo-1566576912906-600ace7a8582?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1612404730960-5c71579fca11?auto=format&fit=crop&q=80&w=1000'
    ],
    videoUrl: 'https://www.youtube.com/embed/JStAYvJMTp0',
    rating: 4.8,
    stock: 75,
    releaseDate: '2023-10-20'
  },
  {
    id: 'p4',
    title: 'Nintendo Switch Pro Controller',
    description: 'Nâng tầm các buổi chơi game của bạn với Nintendo Switch Pro Controller.',
    price: 1690000,
    category: CAT_ACCESSORY,
    imageUrl: 'https://images.unsplash.com/photo-1599933390231-158223d77884?auto=format&fit=crop&q=80&w=1000',
    images: [
        'https://images.unsplash.com/photo-1599933390231-158223d77884?auto=format&fit=crop&q=80&w=1000',
        'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&q=80&w=1000'
    ],
    rating: 4.7,
    stock: 30,
    releaseDate: '2017-03-03'
  },
  {
    id: 'p5',
    title: 'Mario Kart 8 Deluxe',
    description: 'Đua xe và chiến đấu với bạn bè trong phiên bản Mario Kart dứt khoát nhất.',
    price: 1150000,
    category: CAT_GAME,
    imageUrl: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80&w=1000',
    images: ['https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80&w=1000'],
    videoUrl: 'https://www.youtube.com/embed/tKlRN2YpxRE',
    rating: 4.9,
    stock: 120,
    releaseDate: '2017-04-28'
  },
  {
    id: 'p6',
    title: 'Animal Crossing: New Horizons',
    description: 'Thoát đến một hòn đảo hoang vắng và tạo ra thiên đường của riêng bạn.',
    price: 1190000,
    category: CAT_GAME,
    imageUrl: 'https://images.unsplash.com/photo-1629814484931-e4039e6a9898?auto=format&fit=crop&q=80&w=1000',
    images: ['https://images.unsplash.com/photo-1629814484931-e4039e6a9898?auto=format&fit=crop&q=80&w=1000'],
    videoUrl: 'https://www.youtube.com/embed/_3YNL0OWio0',
    rating: 4.8,
    stock: 80,
    releaseDate: '2020-03-20'
  }
];

export const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    title: "Level Up Your Game.",
    subtitle: "Khám phá thế giới Nintendo Switch OLED với màn hình rực rỡ.",
    image: "https://assets.nintendo.com/image/upload/f_auto/q_auto/dpr_1.5/c_scale,w_500/ncom/en_US/switch/site-design-update/oled-model-promo",
    bgGradient: "from-nintendo-red to-orange-500",
    accentColor: "bg-nintendo-red",
    theme: "dark"
  },
  {
    id: 2,
    title: "Legend of Zelda.",
    subtitle: "Khám phá bầu trời rộng lớn và mặt đất bí ẩn của Hyrule.",
    image: "https://assets.nintendo.com/image/upload/f_auto/q_auto/dpr_1.5/c_scale,w_500/ncom/en_US/games/switch/t/the-legend-of-zelda-tears-of-the-kingdom-switch/hero",
    bgGradient: "from-green-600 to-teal-400",
    accentColor: "bg-green-600",
    theme: "dark"
  },
  {
    id: 3,
    title: "Mario Wonder.",
    subtitle: "Sự kỳ diệu đang chờ đón trong cuộc phiêu lưu mới nhất.",
    image: "https://assets.nintendo.com/image/upload/f_auto/q_auto/dpr_1.5/c_scale,w_500/ncom/en_US/games/switch/s/super-mario-bros-wonder-switch/hero",
    bgGradient: "from-blue-600 to-purple-500",
    accentColor: "bg-blue-600",
    theme: "dark"
  }
];