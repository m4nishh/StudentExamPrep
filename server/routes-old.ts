import type { Express } from "express";
import { createServer, type Server } from "http";
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Board routes
  app.get("/api/boards", async (req, res) => {
    try {
      const boards = await storage.getAllBoards();
      res.json(boards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch boards" });
    }
  });

  app.get("/api/boards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const board = await storage.getBoard(id);
      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }
      res.json(board);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch board" });
    }
  });

  app.post("/api/boards", async (req, res) => {
    try {
      const validatedData = insertBoardSchema.parse(req.body);
      const board = await storage.createBoard(validatedData);
      res.status(201).json(board);
    } catch (error) {
      res.status(400).json({ message: "Invalid board data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/boards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBoardSchema.partial().parse(req.body);
      const board = await storage.updateBoard(id, validatedData);
      if (!board) {
        return res.status(404).json({ message: "Board not found" });
      }
      res.json(board);
    } catch (error) {
      res.status(400).json({ message: "Invalid board data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.delete("/api/boards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBoard(id);
      if (!deleted) {
        return res.status(404).json({ message: "Board not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete board" });
    }
  });

  // Subject routes
  app.get("/api/subjects", async (req, res) => {
    try {
      const boardId = req.query.boardId ? parseInt(req.query.boardId as string) : undefined;
      const subjects = boardId 
        ? await storage.getSubjectsByBoard(boardId)
        : await storage.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.get("/api/subjects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subject = await storage.getSubject(id);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      res.json(subject);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subject" });
    }
  });

  app.post("/api/subjects", async (req, res) => {
    try {
      const validatedData = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(validatedData);
      res.status(201).json(subject);
    } catch (error) {
      res.status(400).json({ message: "Invalid subject data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/subjects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSubjectSchema.partial().parse(req.body);
      const subject = await storage.updateSubject(id, validatedData);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      res.json(subject);
    } catch (error) {
      res.status(400).json({ message: "Invalid subject data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.delete("/api/subjects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSubject(id);
      if (!deleted) {
        return res.status(404).json({ message: "Subject not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });

  // Material routes
  app.get("/api/materials", async (req, res) => {
    try {
      const subjectId = req.query.subjectId ? parseInt(req.query.subjectId as string) : undefined;
      const boardId = req.query.boardId ? parseInt(req.query.boardId as string) : undefined;
      
      let materials;
      if (subjectId) {
        materials = await storage.getMaterialsBySubject(subjectId);
      } else if (boardId) {
        materials = await storage.getMaterialsByBoard(boardId);
      } else {
        materials = await storage.getAllMaterials();
      }
      res.json(materials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch materials" });
    }
  });

  app.post("/api/materials", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const materialData = {
        title: req.body.title,
        description: req.body.description,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        subjectId: parseInt(req.body.subjectId),
        boardId: parseInt(req.body.boardId),
        uploadedBy: 1, // Default admin user
      };

      const validatedData = insertMaterialSchema.parse(materialData);
      const material = await storage.createMaterial(validatedData);
      res.status(201).json(material);
    } catch (error) {
      res.status(400).json({ message: "Invalid material data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.delete("/api/materials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMaterial(id);
      if (!deleted) {
        return res.status(404).json({ message: "Material not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete material" });
    }
  });

  // Note routes
  app.get("/api/notes", async (req, res) => {
    try {
      const subjectId = req.query.subjectId ? parseInt(req.query.subjectId as string) : undefined;
      const boardId = req.query.boardId ? parseInt(req.query.boardId as string) : undefined;
      
      let notes;
      if (subjectId) {
        notes = await storage.getNotesBySubject(subjectId);
      } else if (boardId) {
        notes = await storage.getNotesByBoard(boardId);
      } else {
        notes = await storage.getAllNotes();
      }
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      // Increment view count
      await storage.incrementNoteViews(id);
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const noteData = {
        ...req.body,
        createdBy: 1, // Default admin user
      };
      const validatedData = insertNoteSchema.parse(noteData);
      const note = await storage.createNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ message: "Invalid note data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertNoteSchema.partial().parse(req.body);
      const note = await storage.updateNote(id, validatedData);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(400).json({ message: "Invalid note data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNote(id);
      if (!deleted) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // PYQ Paper routes
  app.get("/api/pyq-papers", async (req, res) => {
    try {
      const subjectId = req.query.subjectId ? parseInt(req.query.subjectId as string) : undefined;
      const boardId = req.query.boardId ? parseInt(req.query.boardId as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      
      let papers;
      if (subjectId) {
        papers = await storage.getPyqPapersBySubject(subjectId);
      } else if (boardId) {
        papers = await storage.getPyqPapersByBoard(boardId);
      } else if (year) {
        papers = await storage.getPyqPapersByYear(year);
      } else {
        papers = await storage.getAllPyqPapers();
      }
      res.json(papers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch PYQ papers" });
    }
  });

  app.post("/api/pyq-papers", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const pyqData = {
        title: req.body.title,
        year: parseInt(req.body.year),
        fileName: req.file.originalname,
        fileSize: req.file.size,
        duration: req.body.duration ? parseInt(req.body.duration) : null,
        totalQuestions: req.body.totalQuestions ? parseInt(req.body.totalQuestions) : null,
        subjectId: parseInt(req.body.subjectId),
        boardId: parseInt(req.body.boardId),
        hasSolutions: req.body.hasSolutions === 'true',
        hasAnswerKey: req.body.hasAnswerKey === 'true',
        uploadedBy: 1, // Default admin user
      };

      const validatedData = insertPyqPaperSchema.parse(pyqData);
      const pyqPaper = await storage.createPyqPaper(validatedData);
      res.status(201).json(pyqPaper);
    } catch (error) {
      res.status(400).json({ message: "Invalid PYQ paper data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.delete("/api/pyq-papers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePyqPaper(id);
      if (!deleted) {
        return res.status(404).json({ message: "PYQ paper not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete PYQ paper" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
