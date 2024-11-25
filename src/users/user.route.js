const express = require("express");
const User = require("./user.model");
const generateToken = require("../middleware/generateToken");
const router = express.Router();

//Register Endpoint
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ email, username, password });
    await user.save();
    res.status(201).send({ message: "User Registration Successfully" });
  } catch (error) {
    console.error("Error registering user", error);
    res.status(500).send({ message: "Error registering user" });
  }
});

//login Endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).send({ message: "Password Mismatch" });
    }
    const token = await generateToken(user.id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).send({
      message: "Logged in Successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        ProfileImage: user.ProfileImage,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Error login user", error);
    res.status(500).send({ message: "Error login user" });
  }
});

// logout Endpoint
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).send({ message: "Log out Successfully" });
});
//delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user", error);
    res.status(500).send({ message: "Error deleting user" });
  }
});

// get all User
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "id email role").sort({ createdAt: -1 });
    res.status(200).send(users);
  } catch (error) {
    console.error("Error fetching user", error);
    res.status(500).send({ message: "Error fetching user" });
  }
});
// update user role
router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send({ message: "User role updated successfully" });
  } catch (error) {
    console.error("Error updating user role", error);
    res.status(500).send({ message: "Error updating user role" });
  }
});
// Edit or update profile
router.patch("/edit-profile", async (req, res) => {
  try {
    const { userId, username, profileImage, bio } = req.body;
    if (!userId) {
      return res.status(404).send({ message: "User ID is require" });
    }
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "User Not Found" });
    }

    // update profile
    if (username !== undefined) user.username = username;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (bio !== undefined) user.bio = bio;

    await user.save();
    res.status(200).send({
      message: "Profile Updated Successfully",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Error updating user profile", error);
    res.status(500).send({ message: "Error updating user profile" });
  }
});
module.exports = router;
