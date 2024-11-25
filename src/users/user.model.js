const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  username: { type: String, require: true, unique: true },
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true },
  role: { type: String, default: "user" },
  profileImage: String,
  bio: { type: String, maxlength: 200 },
  createdAt: { type: Date, default: Date.now },
});

// Hashing Password before save to database
userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;
  next();
});

// matching password

userSchema.methods.comparePassword = function (cadidatePassword) {
  return bcrypt.compare(cadidatePassword, this.password);
};

const User = new model("User", userSchema);

module.exports = User;
