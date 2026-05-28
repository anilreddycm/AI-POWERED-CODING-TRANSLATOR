import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { getDBStatus } from "../config/db.config.js";

const HistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sourceLanguage: {
      type: String,
      required: true,
      trim: true,
    },
    targetLanguage: {
      type: String,
      required: true,
      trim: true,
    },
    sourceCode: {
      type: String,
      required: true,
    },
    translatedCode: {
      type: String,
      default: "",
    },
    complexityAnalysis: {
      type: String,
      default: "",
    },
    explanation: {
      type: String,
      default: "",
    },
    optimization: {
      type: String,
      default: "",
    },
    action: {
      type: String,
      enum: ["translate", "complexity", "explain", "optimize"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseHistory = mongoose.model("History", HistorySchema);

// --- Local File Database Fallback ---
const getMockHistories = () => {
  const dir = path.resolve("./data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const file = path.join(dir, "histories.json");
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "[]", "utf8");
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
};

const saveMockHistories = (histories) => {
  const file = path.resolve("./data/histories.json");
  fs.writeFileSync(file, JSON.stringify(histories, null, 2), "utf8");
};

class MockHistory {
  constructor(data) {
    Object.assign(this, data);
    if (!this._id) {
      this._id = Math.random().toString(36).substring(2, 9);
    }
    if (!this.createdAt) {
      this.createdAt = new Date().toISOString();
    }
  }
}

// Helper to make chainable native promise for find() operations
const makeHistoryChainPromise = (historiesList) => {
  const promise = Promise.resolve(historiesList);

  promise.sort = (sortQuery) => {
    const field = Object.keys(sortQuery)[0];
    const direction = sortQuery[field];
    const sorted = [...historiesList].sort((a, b) => {
      if (direction === -1) {
        return new Date(b[field]) - new Date(a[field]);
      }
      return new Date(a[field]) - new Date(b[field]);
    });
    return makeHistoryChainPromise(sorted);
  };

  promise.skip = (skipVal) => {
    return makeHistoryChainPromise(historiesList.slice(skipVal));
  };

  promise.limit = (limitVal) => {
    return makeHistoryChainPromise(historiesList.slice(0, limitVal));
  };

  promise.select = (selectStr) => {
    return promise;
  };

  return promise;
};

const HistoryAdapter = {
  create: async (data) => {
    if (getDBStatus()) {
      return await MongooseHistory.create(data);
    }
    const entry = new MockHistory(data);
    const histories = getMockHistories();
    histories.push({ ...entry });
    saveMockHistories(histories);
    return entry;
  },

  find: (query) => {
    if (getDBStatus()) {
      return MongooseHistory.find(query);
    }

    const histories = getMockHistories();
    const filtered = histories.filter((h) => {
      return Object.entries(query).every(([k, v]) => {
        if (h[k] && h[k].toString) {
          return h[k].toString() === v.toString();
        }
        return h[k] === v;
      });
    });

    return makeHistoryChainPromise(filtered.map((h) => new MockHistory(h)));
  },

  countDocuments: async (query) => {
    if (getDBStatus()) {
      return await MongooseHistory.countDocuments(query);
    }
    const histories = getMockHistories();
    const filtered = histories.filter((h) => {
      return Object.entries(query).every(([k, v]) => {
        if (h[k] && h[k].toString) {
          return h[k].toString() === v.toString();
        }
        return h[k] === v;
      });
    });
    return filtered.length;
  },

  findOne: async (query) => {
    if (getDBStatus()) {
      return await MongooseHistory.findOne(query);
    }
    const histories = getMockHistories();
    const entry = histories.find((h) => {
      return Object.entries(query).every(([k, v]) => {
        if (k === "_id") return h._id === v.toString();
        if (h[k] && h[k].toString) return h[k].toString() === v.toString();
        return h[k] === v;
      });
    });
    return entry ? new MockHistory(entry) : null;
  },

  findOneAndDelete: async (query) => {
    if (getDBStatus()) {
      return await MongooseHistory.findOneAndDelete(query);
    }
    const histories = getMockHistories();
    const idx = histories.findIndex((h) => {
      return Object.entries(query).every(([k, v]) => {
        if (k === "_id") return h._id === v.toString();
        if (h[k] && h[k].toString) return h[k].toString() === v.toString();
        return h[k] === v;
      });
    });
    if (idx === -1) return null;
    const deleted = histories.splice(idx, 1)[0];
    saveMockHistories(histories);
    return new MockHistory(deleted);
  },

  deleteMany: async (query) => {
    if (getDBStatus()) {
      return await MongooseHistory.deleteMany(query);
    }
    const histories = getMockHistories();
    let deletedCount = 0;
    const remaining = histories.filter((h) => {
      const match = Object.entries(query).every(([k, v]) => {
        if (h[k] && h[k].toString) return h[k].toString() === v.toString();
        return h[k] === v;
      });
      if (match) deletedCount++;
      return !match;
    });
    saveMockHistories(remaining);
    return { deletedCount };
  },
};

export default HistoryAdapter;
export { MongooseHistory };
