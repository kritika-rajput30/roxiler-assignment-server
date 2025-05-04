import { Request, Response } from "express";
import prisma from "../prisma/client";

export const createStore = async (req: Request, res: Response) => {
  const { name, address, email, userId, image } = req.body;

  try {
    const store = await prisma.store.create({
      data: {
        name,
        address,
        email,
        image,
        owner: {
          connect: { user_id: userId },
        },
      },
    });
    return res.status(201).json(store);
  } catch (error) {
    console.error("Create Store Error:", error);
    return res.status(500).json({ error: "Failed to create store" });
  }
};

export const getAllStores = async (req: Request, res: Response) => {
  const { name, email, address } = req.query;

  try {
    const stores = await prisma.store.findMany({
      where: {
        name: name
          ? { contains: name as string, mode: "insensitive" }
          : undefined,
        email: email
          ? { contains: email as string, mode: "insensitive" }
          : undefined,
        address: address
          ? { contains: address as string, mode: "insensitive" }
          : undefined,
      },
      include: {
        ratings: true,
      },
    });

    const storesWithRating = stores.map((store) => {
      const total = store.ratings.length;
      const avgRating =
        total > 0
          ? store.ratings.reduce((sum, r) => sum + r.rating, 0) / total
          : null;

      return {
        ...store,
        averageRating: avgRating,
        totalRatings: total,
      };
    });

    res.json(storesWithRating);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stores" });
  }
};

export const getStoreById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const store = await prisma.store.findUnique({
      where: { storeId: id },
      include: {
        ratings: true,
        user: true,
      },
    });

    if (!store) return res.status(404).json({ error: "Store not found" });

    const avgRating =
      store.ratings.length > 0
        ? store.ratings.reduce((sum, r) => sum + r.rating, 0) /
          store.ratings.length
        : null;

    res.json({
      ...store,
      averageRating: avgRating,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch store" });
  }
};

export const updateStore = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, address, email } = req.body;
  const user = req.user;

  try {
    const store = await prisma.store.findUnique({ where: { store_id: id } });

    if (!store) return res.status(404).json({ error: "Store not found" });

    if (user.role !== "admin" && user.user_id !== store.user_id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updated = await prisma.store.update({
      where: { store_id: id },
      data: { name, address, email },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update store" });
  }
};

export const deleteStore = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const store = await prisma.store.findUnique({ where: { store_id: id } });

    if (!store) return res.status(404).json({ error: "Store not found" });

    await prisma.rating.deleteMany({ where: { store_id: id } });

    await prisma.store.delete({ where: { store_id: id } });

    res.json({ message: "Store and related ratings deleted successfully" });
  } catch (error: any) {
    console.error("Delete store error:", error);

    res.status(500).json({ error: "Failed to delete store" });
  }
};

export const getStoresByOwner = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    if (req.user?.user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Forbidden: You can only view your own stores" });
    }

    const stores = await prisma.store.findMany({
      where: {
        user_id: userId,
      },
    });

    return res.status(200).json(stores);
  } catch (error) {
    console.error("Get Stores by Owner Error:", error);
    return res.status(500).json({ error: "Failed to retrieve stores" });
  }
};

export const getRatingsForUserStores = async (req, res) => {
  const { user_id } = req.params;

  try {
    const stores = await prisma.store.findMany({
      where: {
        user_id: user_id,
      },
      select: {
        store_id: true,
        name: true,
        ratings: {
          select: {
            rating_id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                user_id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!stores || stores.length === 0) {
      return res
        .status(404)
        .json({ message: "No stores found for this user." });
    }

    return res.status(200).json({ stores });
  } catch (error) {
    console.error("Error fetching ratings for user's stores:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
