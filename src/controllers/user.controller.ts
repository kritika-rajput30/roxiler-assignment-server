import { Request, Response } from "express";
import prisma from "../prisma/client";
import { hashPassword } from "../utils/hash";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { name, email, address, role, sortKey, sortOrder } = req.query;

    const users = await prisma.user.findMany({
      where: {
        name: name
          ? { contains: String(name), mode: "insensitive" }
          : undefined,
        email: email
          ? { contains: String(email), mode: "insensitive" }
          : undefined,
        address: address
          ? { contains: String(address), mode: "insensitive" }
          : undefined,
        role: role ? String(role) : undefined,
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        ratings: true,
      },
      orderBy:
        sortKey && sortOrder
          ? {
              [String(sortKey)]: sortOrder === "desc" ? "desc" : "asc",
            }
          : undefined,
    });

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { newPassword, userId } = req.body;

    if (!newPassword)
      return res.status(400).json({ error: "New password is required" });
    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { user_id: userId },
      data: {
        password: hashed,
      },
    });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update password" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        store: true,
        ratings: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, address, role, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { user_id: id },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedPassword = password
      ? await hashPassword(password)
      : existingUser.password;

    const updatedUser = await prisma.user.update({
      where: { user_id: id },
      data: {
        name: name || existingUser.name,
        email: email || existingUser.email,
        address: address || existingUser.address,
        role: role || existingUser.role,
        password: hashedPassword,
      },
    });

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating user" });
  }
};
