import { Router } from "express";
import { isDbConnected, dbConfigUsed, dbErrorDetails } from "../models/db";
import { AuthController } from "../controllers/authController";
import { UserController } from "../controllers/userController";
import { VocabularyController } from "../controllers/vocabularyController";
import { DocumentController } from "../controllers/documentController";
import { ExamController } from "../controllers/examController";
import { authenticateToken, optionalToken, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

// 1. Connection & System Status
router.get("/db-status", (req, res) => {
  res.json({
    connected: isDbConnected,
    mode: isDbConnected ? "MySQL Production" : "Hệ thống Lưu trữ Dự phòng",
    config: {
      host: dbConfigUsed.host,
      port: dbConfigUsed.port,
      database: dbConfigUsed.database,
      user: dbConfigUsed.user
    },
    error: isDbConnected ? null : dbErrorDetails,
    smtpConfigured: !!(process.env.SMTP_USER && process.env.SMTP_PASS)
  });
});

// 2. Authentication & Profile Routes
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);
router.get("/auth/me", authenticateToken, AuthController.getMe);
router.put("/auth/profile", authenticateToken, AuthController.updateProfile);
router.post("/auth/otp-request", AuthController.requestOtp);
router.post("/auth/otp-verify", AuthController.verifyOtp);

// 3. User Management Routes (Admin protected)
router.get("/users", authenticateToken, requireAdmin, UserController.getUsers);
router.put("/users/:id", authenticateToken, requireAdmin, UserController.updateUser);
router.delete("/users/:id", authenticateToken, requireAdmin, UserController.deleteUser);

// 4. Vocabulary Routes
router.get("/vocabularies", optionalToken, VocabularyController.getVocabularies);
router.post("/vocabularies/:id/toggle-learned", authenticateToken, VocabularyController.toggleLearned);
router.post("/vocabularies/:id/toggle-favorite", authenticateToken, VocabularyController.toggleFavorite);
router.post("/vocabularies", authenticateToken, requireAdmin, VocabularyController.createVocabulary);
router.put("/vocabularies/:id", authenticateToken, requireAdmin, VocabularyController.updateVocabulary);
router.delete("/vocabularies/:id", authenticateToken, requireAdmin, VocabularyController.deleteVocabulary);
router.post("/vocabularies/sync", authenticateToken, requireAdmin, VocabularyController.syncVocabularies);

// 5. Exam & Learning Results Routes (Real user test persistence)
router.post("/exams/results", authenticateToken, ExamController.submitResult);
router.get("/exams/history", authenticateToken, ExamController.getHistory);
router.get("/exams/stats", authenticateToken, ExamController.getStats);

// 6. Study Document Routes
router.get("/documents", DocumentController.getDocuments);
router.post("/documents", authenticateToken, requireAdmin, DocumentController.createDocument);
router.delete("/documents/:id", authenticateToken, requireAdmin, DocumentController.deleteDocument);

export default router;
