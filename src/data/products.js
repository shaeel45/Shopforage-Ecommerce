// ShopForge Products Catalog Data

export const categories = [
  {
    id: "all",
    name: "All Products",
    description: "Explore our full collection of premium apparel and footwear",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "shirts",
    name: "Shirts & Tops",
    description: "Elevated everyday shirts, tees, and statement tops",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "pants",
    name: "Pants & Trousers",
    description: "Tailored chinos, selvedge denim, and relaxed cargo trousers",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "shoes",
    name: "Footwear & Shoes",
    description: "Handcrafted leather boots, clean minimalist sneakers, and loafers",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "accessories",
    name: "Accessories",
    description: "Handcrafted leather goods, minimalist caps, and wool scarves",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
  }
];

export const products = [
  // --- SHIRTS ---
  {
    id: "sh-1",
    name: "Classic Oxford Cotton Button-Down",
    category: "shirts",
    price: 68.0,
    originalPrice: 85.0,
    rating: 4.8,
    reviewCount: 142,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80"
    ],
    description: "A tailored essential crafted from 100% organic combed cotton. Features a refined button-down collar, durable mother-of-pearl buttons, and a curved hem designed to stay neatly tucked or worn casually untucked.",
    details: [
      "100% Organic Combed Oxford Cotton",
      "Button-down collar with stay-flat stitching",
      "Box pleat with locker loop at the back",
      "Pre-washed to resist shrinkage"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Sky Blue", "Crisp White", "Navy Blue"],
    isNew: true,
    isTrending: true,
    featured: true,
    stock: 45
  },
  {
    id: "sh-2",
    name: "Heavyweight Linen Camp Collar Shirt",
    category: "shirts",
    price: 74.0,
    originalPrice: 92.0,
    rating: 4.6,
    reviewCount: 98,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Breathable European flax linen with a relaxed silhouette and vintage camp collar. Perfect for warm-weather layering or relaxed weekend styling.",
    details: [
      "100% French Flax Linen",
      "Relaxed cuban camp collar",
      "Square straight hem with side vents",
      "Machine washable on cold delicate cycle"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Olive Green", "Sand Beige", "Charcoal"],
    isNew: false,
    isTrending: true,
    featured: true,
    stock: 28
  },
  {
    id: "sh-3",
    name: "Supima Minimalist Crewneck Tee",
    category: "shirts",
    price: 38.0,
    originalPrice: 45.0,
    rating: 4.9,
    reviewCount: 310,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80"
    ],
    description: "The definitive everyday crewneck. Cut from extra-long staple American Supima cotton for unparalleled softness, lasting color vibrancy, and zero pilling.",
    details: [
      "100% Supima Cotton, 220 GSM",
      "Reinforced ribbed collar that retains its shape",
      "Blind-stitched hems for a sleek profile",
      "Pre-shrunk fabric"
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Matte Black", "Off White", "Heather Grey"],
    isNew: false,
    isTrending: false,
    featured: true,
    stock: 80
  },
  {
    id: "sh-4",
    name: "Brushed Flannel Overshirt",
    category: "shirts",
    price: 89.0,
    originalPrice: 110.0,
    rating: 4.7,
    reviewCount: 76,
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Double-brushed cotton flannel designed to serve as both a heavy shirt and lightweight autumn jacket. Twin chest pockets and horn buttons.",
    details: [
      "Heavyweight 320 GSM brushed twill cotton",
      "Dual chest flap pockets with button closure",
      "Satin sleeve lining for effortless layering"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Forest Plaid", "Burgundy Plaid", "Earth Ochre"],
    isNew: true,
    isTrending: false,
    featured: false,
    stock: 19
  },
  {
    id: "sh-5",
    name: "Textured Knit Polo Shirt",
    category: "shirts",
    price: 59.0,
    originalPrice: 75.0,
    rating: 4.7,
    reviewCount: 112,
    image: "https://images.unsplash.com/photo-1625910513413-7e189d20c572?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1625910513413-7e189d20c572?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Retro-inspired open weave knit polo offering breezy comfort and a textured, sophisticated drape. Perfect with tailored shorts or pleated trousers.",
    details: [
      "Cotton-silk blend knit",
      "Seamless buttonless Johnny collar",
      "Ribbed cuff and waistband"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Ecrù Cream", "Sage Green", "Midnight Blue"],
    isNew: false,
    isTrending: true,
    featured: false,
    stock: 35
  },

  // --- PANTS ---
  {
    id: "pa-1",
    name: "Tailored Slim Chino Trousers",
    category: "pants",
    price: 78.0,
    originalPrice: 95.0,
    rating: 4.8,
    reviewCount: 215,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80"
    ],
    description: "The ideal balance of smart-casual refinement and all-day comfort. Crafted with 98% cotton twill and 2% elastane for just the right amount of flexible stretch.",
    details: [
      "98% Long-staple Cotton, 2% Elastane",
      "YKK brass zipper fly with horn button closure",
      "Slanted side pockets and double welt back pockets",
      "Tapered leg opening"
    ],
    sizes: ["30x30", "32x32", "34x32", "36x34"],
    colors: ["Khaki Tan", "Navy", "Charcoal Grey"],
    isNew: true,
    isTrending: true,
    featured: true,
    stock: 52
  },
  {
    id: "pa-2",
    name: "Japanese Selvedge Denim Jeans",
    category: "pants",
    price: 135.0,
    originalPrice: 165.0,
    rating: 4.9,
    reviewCount: 184,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Woven on vintage shuttle looms in Okayama, Japan. 13.5oz raw indigo selvedge denim that shapes to your body and develops unique, personalized fades over time.",
    details: [
      "13.5oz Okayama Selvedge Raw Denim",
      "Red-line selvedge ticker along the outseam",
      "Hidden copper rivets and custom leather patch",
      "Classic straight-leg cut"
    ],
    sizes: ["30x32", "32x32", "34x32", "36x32"],
    colors: ["Deep Raw Indigo", "Washed Slate"],
    isNew: false,
    isTrending: true,
    featured: true,
    stock: 24
  },
  {
    id: "pa-3",
    name: "Relaxed Utility Cargo Pants",
    category: "pants",
    price: 85.0,
    originalPrice: 105.0,
    rating: 4.7,
    reviewCount: 129,
    image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Modernized military utilitarian trousers with low-profile bellow cargo pockets, articulated knees for mobility, and drawstring ankle cuffs.",
    details: [
      "Ripstop cotton canvas with water-repellent finish",
      "6-pocket configuration with snap fasteners",
      "Adjustable drawstring hems at ankles"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Olive Drab", "Desert Sand", "Matte Black"],
    isNew: true,
    isTrending: false,
    featured: false,
    stock: 31
  },
  {
    id: "pa-4",
    name: "Pleated Wool-Blend Dress Trousers",
    category: "pants",
    price: 110.0,
    originalPrice: 140.0,
    rating: 4.8,
    reviewCount: 65,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Sophisticated single-pleat dress trousers woven from lightweight tropical wool blend. Features a comfortable side tab adjuster for a belt-free clean silhouette.",
    details: [
      "60% Wool, 38% Polyester, 2% Spandex",
      "Single front pleat and pressed creases",
      "Adjustable brass side tabs on waistband"
    ],
    sizes: ["30", "32", "34", "36"],
    colors: ["Charcoal Melange", "Warm Taupe"],
    isNew: false,
    isTrending: false,
    featured: false,
    stock: 18
  },
  {
    id: "pa-5",
    name: "Essential French Terry Joggers",
    category: "pants",
    price: 62.0,
    originalPrice: 75.0,
    rating: 4.9,
    reviewCount: 240,
    image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Ultra-comfortable lounge joggers engineered from 400 GSM heavyweight French terry. Tailored fit with zippered pockets to secure your phone and essentials.",
    details: [
      "100% Organic Ring-spun Cotton French Terry",
      "Concealed zipper side pockets",
      "Tonal metal aglets on flat cotton drawstring"
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Heather Grey", "Black", "Forest Green"],
    isNew: false,
    isTrending: true,
    featured: false,
    stock: 65
  },

  // --- SHOES ---
  {
    id: "sh-shoe-1",
    name: "Artisan Leather Derby Shoes",
    category: "shoes",
    price: 165.0,
    originalPrice: 210.0,
    rating: 4.9,
    reviewCount: 164,
    image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Handcrafted full-grain Italian leather derby shoes with a Goodyear-welted construction. Designed to offer lifelong durability, comfort, and timeless elegance.",
    details: [
      "Full-grain calfskin leather upper",
      "Goodyear-welted resoleable construction",
      "Natural vegetable-tanned leather lining and insole",
      "Stacked leather heel with non-slip Vibram half-sole"
    ],
    sizes: ["8", "9", "10", "11", "12"],
    colors: ["Rich Cognac", "Polished Black", "Dark Espresso"],
    isNew: true,
    isTrending: true,
    featured: true,
    stock: 22
  },
  {
    id: "sh-shoe-2",
    name: "Minimalist Low-Top Leather Sneakers",
    category: "shoes",
    price: 120.0,
    originalPrice: 150.0,
    rating: 4.8,
    reviewCount: 388,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80"
    ],
    description: "The archetype of understated luxury. Italian nappa leather, cushioned memory foam footbed, and stitched Margom rubber cupsole that pairs seamlessly with suits or denim.",
    details: [
      "Buttery-soft Italian Nappa leather",
      "Antimicrobial leather-lined memory foam insoles",
      "Vulcanized durable rubber outsole"
    ],
    sizes: ["7", "8", "9", "10", "11", "12", "13"],
    colors: ["Triple White", "White / Gum", "Triple Black"],
    isNew: false,
    isTrending: true,
    featured: true,
    stock: 74
  },
  {
    id: "sh-shoe-3",
    name: "Heritage Suede Chelsea Boots",
    category: "shoes",
    price: 185.0,
    originalPrice: 230.0,
    rating: 4.9,
    reviewCount: 142,
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Sculpted from water-resistant Repello suede with elasticated side gussets and reinforced nylon pull tabs. Sleek, comfortable, and versatile across seasons.",
    details: [
      "Water-repellent European split suede",
      "Durable elastic gore panels for effortless entry",
      "Lightweight studded rubber lug sole"
    ],
    sizes: ["8", "9", "10", "11", "12"],
    colors: ["Snuff Tobacco", "Ash Charcoal"],
    isNew: true,
    isTrending: false,
    featured: true,
    stock: 16
  },
  {
    id: "sh-shoe-4",
    name: "Classic Penny Loafers",
    category: "shoes",
    price: 145.0,
    originalPrice: 180.0,
    rating: 4.7,
    reviewCount: 92,
    image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Traditional moc-toe stitching with a penny keeper slot. Woven leather footbed molds to your foot shape over time for custom slipper-like comfort.",
    details: [
      "Full-grain hand-burnished pull-up leather",
      "Hand-stitched beefroll detailing",
      "Leather outsole with rubber heel cap"
    ],
    sizes: ["8", "9", "10", "11", "12"],
    colors: ["Oxblood Cordovan", "Black Onyx"],
    isNew: false,
    isTrending: false,
    featured: false,
    stock: 25
  },
  {
    id: "sh-shoe-5",
    name: "Trail Performance Running Sneaker",
    category: "shoes",
    price: 130.0,
    originalPrice: 160.0,
    rating: 4.6,
    reviewCount: 118,
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Engineered for technical outdoor exploration or all-day city walking. High-rebound foam cushioning and multi-directional traction tread.",
    details: [
      "Breathable engineered ripstop mesh upper",
      "EVA dual-density midsole cushioning",
      "Vibram high-traction rubber outsole"
    ],
    sizes: ["8", "8.5", "9", "9.5", "10", "11", "12"],
    colors: ["Storm Grey", "Neon Coral / Black"],
    isNew: false,
    isTrending: true,
    featured: false,
    stock: 40
  },

  // --- ACCESSORIES ---
  {
    id: "acc-1",
    name: "Full-Grain Leather Everyday Bifold",
    category: "accessories",
    price: 45.0,
    originalPrice: 58.0,
    rating: 4.9,
    reviewCount: 210,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Slimline bifold wallet with 6 card slots, a cash compartment, and RFID blocking mesh to protect your contactless payment cards.",
    details: [
      "Vegetable-tanned full grain cowhide",
      "Built-in RFID shielding layer",
      "Ultra-slim 8mm profile"
    ],
    sizes: ["One Size"],
    colors: ["Caramel Tan", "Midnight Black"],
    isNew: false,
    isTrending: true,
    featured: true,
    stock: 60
  },
  {
    id: "acc-2",
    name: "Minimalist Chronograph Wristwatch",
    category: "accessories",
    price: 195.0,
    originalPrice: 250.0,
    rating: 4.8,
    reviewCount: 88,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Bauhaus-inspired clean dial design with Japanese Miyota quartz movement, scratch-resistant sapphire crystal glass, and interchangeable leather strap.",
    details: [
      "316L Surgical-grade stainless steel case (40mm)",
      "Scratch-resistant Sapphire crystal with anti-reflective coating",
      "5 ATM Water resistance (50m)",
      "Quick-release Italian leather strap"
    ],
    sizes: ["40mm"],
    colors: ["Silver / White", "Rose Gold / Black"],
    isNew: true,
    isTrending: true,
    featured: true,
    stock: 15
  },
  {
    id: "acc-3",
    name: "Waxed Canvas Weekender Duffle Bag",
    category: "accessories",
    price: 140.0,
    originalPrice: 175.0,
    rating: 4.9,
    reviewCount: 104,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Rugged 18oz water-resistant waxed canvas duffle with thick bridle leather handles, solid brass YKK zippers, and padded shoe compartment.",
    details: [
      "18oz Heavyweight Martexin waxed canvas",
      "Vegetable-tanned bridle leather handles and accents",
      "Separate zippered side shoe compartment",
      "42-liter capacity (Carry-on compliant)"
    ],
    sizes: ["42L"],
    colors: ["Field Tan", "Navy", "Charcoal"],
    isNew: true,
    isTrending: false,
    featured: false,
    stock: 20
  }
];

export const reviews = [
  {
    id: 1,
    author: "Alexander M.",
    role: "Verified Buyer",
    rating: 5,
    date: "March 10, 2026",
    comment: "The quality of the Classic Oxford Cotton Button-Down blew me away. The stitching is impeccable, the drape is sharp, and it washed without any shrinking. ShopForge is now my go-to store.",
    product: "Classic Oxford Cotton Button-Down"
  },
  {
    id: 2,
    author: "Elena Rostova",
    role: "Verified Buyer",
    rating: 5,
    date: "February 24, 2026",
    comment: "The Leather Sneakers are genuinely comparable to $400 designer brands. Ultra-comfortable right out of the box with zero blistering. Fast 2-day delivery too!",
    product: "Minimalist Low-Top Leather Sneakers"
  },
  {
    id: 3,
    author: "Marcus Chen",
    role: "Verified Buyer",
    rating: 5,
    date: "January 19, 2026",
    comment: "Finally found chinos that fit both my thighs and have a tailored taper at the ankle. 10/10 craftsmanship and fabric feel.",
    product: "Tailored Slim Chino Trousers"
  }
];

export const promoCodes = [
  {
    code: "SHOPFORGE10",
    discountPercent: 10,
    description: "10% off entire order"
  },
  {
    code: "SAVE20",
    discountPercent: 20,
    description: "20% seasonal clearance discount"
  },
  {
    code: "WELCOME15",
    discountPercent: 15,
    description: "15% off first purchase"
  }
];
