import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IPostQuery } from "../post/post.interface";

const getPremiumContent = async (query: IPostQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const tags = query.tags ? JSON.parse(query.tags as string) : null;

  const tagsArray = Array.isArray(tags) ? tags : [];

  const andCondition: PostWhereInput[] = [];

  if (query.searchTerm) {
    andCondition.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.title) {
    andCondition.push({
      title: query.title,
    });
  }
  if (query.content) {
    andCondition.push({
      content: query.content,
    });
  }
  if (query.authorId) {
    andCondition.push({
      authorId: query.authorId,
    });
  }

  if (query.isFeatured) {
    andCondition.push({
      isFeatured: Boolean(query.isFeatured),
    });
  }
  if (query.tags) {
    andCondition.push({
      tags: {
        hasSome: tagsArray,
      },
    });
  }

  if (query.status) {
    andCondition.push({
      status: query.status,
    });
  }
  andCondition.push({
    isPremium: true,
  });
  const posts = await prisma.post.findMany({
    where: {
      AND: andCondition,
    },
    take: limit,
    skip: skip,

    orderBy: {
      [sortBy]: sortOrder,
    },

    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  
  });


  
  const totalPostCount = await prisma.post.count({
    where: {
      AND: andCondition,
    },
  });
  return {
    data: posts,
    meta: {
      page: page,
      limit: limit,
      total: totalPostCount,
      totalPages: Math.ceil(totalPostCount / limit),
    },
  };
};

export const PremiumServices = {
  getPremiumContent,
};
