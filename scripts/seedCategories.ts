import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
//yarn run ts-node ./scripts/seedCategories.ts
const main = async () => {
  const categories = [
    {
      category: "Arts & Design",
      description: "Painting, Illustration, Photography, Sculpting",
    },
    // {
    //   category: "Autos & Vehicles",
    //   description: "Cars, Motorcycles, Boats, Bikes, Aircraft",
    // },
    {
      category: "Beauty & Fashion",
      description: "Cosmetics, Hygiene, Makeup, Fashion",
    },
    {
      category: "Books & Literature",
      description: "Poetry, E-Books, Writer Resources, Publishing",
    },
    {
      category: "Business & Economics",
      description: "Entrepreneurship, Money, Stocks, Finance, Investing",
    },
    {
      category: "Food & Cooking",
      description: "Food, Cooking, Baking, Nutrition, World Cuisines",
    },
    {
      category: "Fun",
      description:"Catch all for anything fun or weird. If this is selected you must select another category as well."
    },
    {
      category: "Games",
      description: "Video Games, Consoles, Toys, Board Games",
    },
    {
      category: "Health & Fitness",
      description: "Fitness, Mental health, Psychology, Medicine",
    },
    {
      category: "Hobbies & Leisure",
      description: "Ceramics, Knitting, Outdoors, Hiking, Travel",
    },
    {
      category: "Home & Garden",
      description: "Interior Decor, Gardening, Construction, Personal Farming",
    },
    {
      category: "Jobs & Education",
      description:
        "Online Courses and Certifications, Internships, Jobs, Career Resources",
    },
    {
      category: "Music & Audio",
      description: "Radios, Music Stations, Sounds, Music History",
    },
    {
      category: "Nature & Animals",
      description: "Earth, Ecology, Farming, Pets, and wild Animals",
    },
    {
      category: "Other",
      description: "Anything else",
    },
    {
      category: "People & Society",
      description: "Anthropology, Social networks, News, History",
    },
    {
      category: "Philosophy & Life",
      description: "Philosophy, Beliefs, Religion, Self-Improvement",
    },
    {
      category: "Science & Math",
      description: "Research, Biology, Chemistry, Physics, Astronomy",
    },
    {
      category: "Sports",
      description:
        "Soccer, Baseball, Curling, Darts, Tennis, and any other Sport",
    },
    {
      category: "Technology",
      description:
        "Computer Science, Hardware, Engineering, Internet, Programming",
    },
    {
      category: "TV, Movies, Videos",
      description: "TV Series, Cable TV, Videos, Streaming",
    },
  ];

  // const deleteAll = await prisma.categories.deleteMany();
  // console.log(deleteAll);

  const create = await await prisma.$transaction(
    categories.map((category) =>
      prisma.categories.upsert({
        where: { category: category.category },
        create: {
          category: category.category,
          description: category.description,
        },
        update: { description: category.description },
      })
    )
  );
  console.log(create); 
};

main();
