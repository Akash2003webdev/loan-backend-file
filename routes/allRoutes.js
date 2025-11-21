import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";

import User from "../models/User.js";
import Loan from "../models/Loan.js";
import Applicant from "../models/Applicant.js";
import Document from "../models/Document.js";

const router = express.Router();

// 📌 JWT Middleware
const auth = (req, res, next) => {
  const token = req.headers.token;
  if (!token) return res.json({ message: "No Token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
    if (err) return res.json({ message: "Invalid Token" });
    req.userId = decode.id;
    next();
  });
};

// --------------------------
// 🔐 LOGIN + REGISTER
// --------------------------

// router.post("/register", async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.json({ message: "All fields required" });
//     }

//     const exists = await User.findOne({ username });
//     if (exists) {
//       return res.json({ message: "User already exists" });
//     }

//     const hash = await bcrypt.hash(password, 10);

//     await User.create({ username, password: hash });

//     res.json({ message: "Registered Successfully" });
//   } catch (err) {
//     res.json({ message: "Error", error: err.message });
//   }
// });

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "all fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password: hashedPassword,
    });
    res.status(200).json({ message: `registerd` });
  } catch (error) {
    res.status(500).json({ message: `something went wrong ${error}` });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.json({ message: "User Not Found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ message: "Wrong Password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ message: "Success", token });
});

// --------------------------
// 📝 Create Loan
// --------------------------

router.post("/loan/create", auth, async (req, res) => {
  const loan = await Loan.create({ userId: req.userId });
  res.json(loan);
});

// --------------------------
// 👤 Add Applicant
// --------------------------

router.post("/applicant/add", auth, async (req, res) => {
  const { loanId, name, email } = req.body;

  const applicant = await Applicant.create({ loanId, name, email });
  res.json(applicant);
});

// --------------------------
// 📂 Multer Setup
// --------------------------

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// --------------------------
// 📄 Upload Document
// --------------------------

router.post(
  "/document/upload/:applicantId",
  upload.single("file"),
  async (req, res) => {
    const doc = await Document.create({
      applicantId: req.params.applicantId,
      fileName: req.file.originalname,
      filePath: req.file.path,
    });

    res.json(doc);
  }
);

// --------------------------
// 📃 Get Documents List
// --------------------------

router.get("/documents/:applicantId", async (req, res) => {
  const docs = await Document.find({ applicantId: req.params.applicantId });
  res.json(docs);
});


router.get("/applicant/all", auth, async (req, res) => {
  try {
    const applicants = await Applicant.find(); // fetch all applicants
    res.status(200).json(applicants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch applicants", error: err.message });
  }
});

export default router;
