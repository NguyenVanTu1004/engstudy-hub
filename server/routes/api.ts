import { Router } from "express";
import { isDbConnected, dbConfigUsed, dbErrorDetails } from "../models/db";
import { AuthController } from "../controllers/authController";
import { UserController } from "../controllers/userController";
import { VocabularyController } from "../controllers/vocabularyController";
import { DocumentController } from "../controllers/documentController";

const router = Router();

// 1. Connection & System Status
router.get("/db-status", (req, res) => {
  res.json({
    connected: isDbConnected,
    mode: isDbConnected ? "MySQL Production" : "Hệ thống Lưu trữ Dự phòng",
    config: dbConfigUsed,
    error: isDbConnected ? null : dbErrorDetails,
    smtpConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS)
  });
});

// 2. Authentication routes
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);
router.post("/auth/otp-request", AuthController.requestOtp);
router.post("/auth/otp-verify", AuthController.verifyOtp);

// 3. User management routes
router.get("/users", UserController.getUsers);
router.put("/users/:id", UserController.updateUser);
router.delete("/users/:id", UserController.deleteUser);

// 4. Vocabulary routes
router.get("/vocabularies", VocabularyController.getVocabularies);
router.post("/vocabularies", VocabularyController.createVocabulary);
router.put("/vocabularies/:id", VocabularyController.updateVocabulary);
router.delete("/vocabularies/:id", VocabularyController.deleteVocabulary);
router.post("/vocabularies/sync", VocabularyController.syncVocabularies);

// 5. Document routes
router.get("/documents", DocumentController.getDocuments);
router.post("/documents", DocumentController.createDocument);
router.delete("/documents/:id", DocumentController.deleteDocument);

export default router;
