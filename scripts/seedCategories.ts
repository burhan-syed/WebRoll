import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  // const categories = [
  //   {
  //     category: "Arts, Design",
  //     description: "Painting, Illustration, Fashion, Photography, Sculpting",
  //   },
  //   {
  //     category: "Business, Economics",
  //     description: "Entrepreneurship, Jobs, Money, Stocks",
  //   },
  //   {
  //     category: "Culture, Society",
  //     description: "Law, Sociology, Traveling, Politics",
  //   },
  //   {
  //     category: "Education, Learning",
  //     description: "Teaching, Knowledge Sharing, Schools",
  //   },
  //   {
  //     category: "Food, Cooking",
  //     description: "Food, Cooking, Baking, Nutrition",
  //   },
  //   {
  //     category: "Fun Stuff",
  //     description: "Anything really weird, funny, or satiric",
  //   },
  //   {
  //     category: "Gaming",
  //     description: "Video Games, Consoles, Toys, Board Games",
  //   },
  //   {
  //     category: "Health",
  //     description: "Fitness, Mental health, Psychology, Medicine",
  //   },
  //   { category: "History", description: "Anything relating to the past" },
  //   {
  //     category: "Home, Garden",
  //     description: "Interior, Gardening, Construction, personal Farming",
  //   },
  //   {
  //     category: "Literature, Writing",
  //     description: "Books, Magazines, Writing, Publishing",
  //   },
  //   { category: "Music, Audio", description: "Bands, Music Theory, Sounds" },
  //   {
  //     category: "Nature, Animals",
  //     description: "Earth, Ecology, Farming, Animals (wild & domesticated)",
  //   },
  //   {
  //     category: "Other",
  //     description: "Anything else",
  //   },
  //   {
  //     category: "Philosophy, Life",
  //     description: "Philosophy, Beliefs, Religion, Self-Improvement",
  //   },
  //   {
  //     category: "Science, Math",
  //     description: "Research, Biology, Chemistry, Physics, Astronomy",
  //   },
  //   { category: "Social", description: "Social networks" },
  //   {
  //     category: "Sports",
  //     description:
  //       "Soccer, Baseball, Curling, Darts, Crossfit, and any other Sport",
  //   },
  //   {
  //     category: "Technology",
  //     description:
  //       "Computer Science, Hardware, Engineering, Internet, Programming",
  //   },
  //   {
  //     category: "TV, Movies, Videos",
  //     description: "TV Series, Cable TV, Videos, Streaming",
  //   },
  // ];

  const categories = [
    {
      category: "Arts & Design",
      description: "Painting, Illustration, Photography, Sculpting",
    },
    {
      category: "Autos & Vehicles",
      description: "Cars, Motorcycles, Boats, Bikes, Aircraft",
    },
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
      description: "Interior Decor, Gardening, Construction, personal Farming",
    },
    {
      category: "Jobs & Education",
      description:
        "Online Courses and Certifications, Internships, Jobs, Career Resources",
    },
    {
      category: "People & Society",
      description: "Anthropology, Social networks, News, History",
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

  const create = await prisma.categories.createMany({data: categories})
  console.log(create); 
};

main(); 
