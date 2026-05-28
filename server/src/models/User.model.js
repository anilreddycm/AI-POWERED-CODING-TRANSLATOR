import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { getDBStatus } from "../config/db.config.js";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function() {
        return !this.isGoogleUser;
      },
    },
    picture: {
      type: String,
      default: "",
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: "",
    },
    otpExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password") || this.isGoogleUser) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseUser = mongoose.model("User", UserSchema);

// --- Local File Database Fallback ---
const getMockUsers = () => {
  const dir = path.resolve("./data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const file = path.join(dir, "users.json");
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "[]", "utf8");
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
};

const saveMockUsers = (users) => {
  const file = path.resolve("./data/users.json");
  fs.writeFileSync(file, JSON.stringify(users, null, 2), "utf8");
};

class MockUser {
  constructor(data) {
    Object.assign(this, data);
    if (!this._id) {
      this._id = Math.random().toString(36).substring(2, 9);
    }
    if (!this.createdAt) {
      this.createdAt = new Date().toISOString();
    }
  }

  async comparePassword(enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
  }

  async save() {
    const users = getMockUsers();
    const idx = users.findIndex((u) => u._id === this._id);
    if (idx !== -1) {
      users[idx] = { ...this };
    } else {
      users.push({ ...this });
    }
    saveMockUsers(users);
    return this;
  }
}

const UserAdapter = {
  findOne: async (query) => {
    if (getDBStatus()) {
      return await MongooseUser.findOne(query);
    }
    const users = getMockUsers();
    const user = users.find((u) => {
      return Object.entries(query).every(([k, v]) => {
        if (k === "email") return u.email === v.toLowerCase();
        return u[k] === v;
      });
    });
    return user ? new MockUser(user) : null;
  },

  findById: (id) => {
    if (getDBStatus()) {
      return MongooseUser.findById(id);
    }
    const users = getMockUsers();
    const user = users.find((u) => u._id === id.toString());
    const result = user ? new MockUser(user) : null;

    // Use a native Promise so it has standard `.then()` behavior
    const promise = Promise.resolve(result);

    // Attach mongoose `.select()` chaining method
    promise.select = (selectStr) => {
      if (result && selectStr.includes("-password")) {
        delete result.password;
      }
      return promise;
    };

    return promise;
  },

  create: async (data) => {
    if (getDBStatus()) {
      return await MongooseUser.create(data);
    }
    const user = new MockUser(data);
    if (user.password && !user.isGoogleUser) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
    await user.save();
    return user;
  },
};

export default UserAdapter;
export { MongooseUser };
