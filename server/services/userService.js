// services/userService.js
import bcrypt from "bcrypt";
import {
  insertUser,
  getUserById,
  updateUserProfile,
  deleteUserById,
  // getUserProfileById,
} from "../models/userModel.js";

export async function createUser(email, password, username) {
  const hashed = await bcrypt.hash(password, 10);
  return insertUser(username, email, hashed);
}

export async function fetchProfile(userId) {
  return getUserById(userId);
}

export async function modifyProfile(userId, updates) {
  return updateUserProfile(userId, updates);
}

export async function removeProfile(userId) {
  return deleteUserById(userId);
}

// export async function fetchOtherUserProfile(otherUserId) {
//   return getUserProfileById(otherUserId);
// }
