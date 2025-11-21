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

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  await User.create({ username, password: hash });
  res.json({ message: "Registered" });
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
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// --------------------------
// 📄 Upload Document
// --------------------------

router.post("/document/upload/:applicantId", upload.single("file"), async (req, res) => {
  const doc = await Document.create({
    applicantId: req.params.applicantId,
    fileName: req.file.originalname,
    filePath: req.file.path
  });

  res.json(doc);
});

// --------------------------
// 📃 Get Documents List
// --------------------------

router.get("/documents/:applicantId", async (req, res) => {
  const docs = await Document.find({ applicantId: req.params.applicantId });
  res.json(docs);
});

export default router;
