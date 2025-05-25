import { 
  users, boards, subjects, materials, notes, pyqPapers,
  type User, type InsertUser,
  type Board, type InsertBoard,
  type Subject, type InsertSubject,
  type Material, type InsertMaterial,
  type Note, type InsertNote,
  type PyqPaper, type InsertPyqPaper
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Board methods
  getAllBoards(): Promise<Board[]>;
  getBoard(id: number): Promise<Board | undefined>;
  createBoard(board: InsertBoard): Promise<Board>;
  updateBoard(id: number, board: Partial<InsertBoard>): Promise<Board | undefined>;
  deleteBoard(id: number): Promise<boolean>;

  // Subject methods
  getAllSubjects(): Promise<Subject[]>;
  getSubjectsByBoard(boardId: number): Promise<Subject[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: number, subject: Partial<InsertSubject>): Promise<Subject | undefined>;
  deleteSubject(id: number): Promise<boolean>;

  // Material methods
  getAllMaterials(): Promise<Material[]>;
  getMaterialsBySubject(subjectId: number): Promise<Material[]>;
  getMaterialsByBoard(boardId: number): Promise<Material[]>;
  getMaterial(id: number): Promise<Material | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(id: number, material: Partial<InsertMaterial>): Promise<Material | undefined>;
  deleteMaterial(id: number): Promise<boolean>;

  // Note methods
  getAllNotes(): Promise<Note[]>;
  getNotesBySubject(subjectId: number): Promise<Note[]>;
  getNotesByBoard(boardId: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  incrementNoteViews(id: number): Promise<void>;

  // PYQ Paper methods
  getAllPyqPapers(): Promise<PyqPaper[]>;
  getPyqPapersBySubject(subjectId: number): Promise<PyqPaper[]>;
  getPyqPapersByBoard(boardId: number): Promise<PyqPaper[]>;
  getPyqPapersByYear(year: number): Promise<PyqPaper[]>;
  getPyqPaper(id: number): Promise<PyqPaper | undefined>;
  createPyqPaper(pyqPaper: InsertPyqPaper): Promise<PyqPaper>;
  updatePyqPaper(id: number, pyqPaper: Partial<InsertPyqPaper>): Promise<PyqPaper | undefined>;
  deletePyqPaper(id: number): Promise<boolean>;

  // Analytics methods
  getDashboardStats(): Promise<{
    totalStudents: number;
    totalBoards: number;
    totalMaterials: number;
    totalPyqPapers: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private boards: Map<number, Board>;
  private subjects: Map<number, Subject>;
  private materials: Map<number, Material>;
  private notes: Map<number, Note>;
  private pyqPapers: Map<number, PyqPaper>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.boards = new Map();
    this.subjects = new Map();
    this.materials = new Map();
    this.notes = new Map();
    this.pyqPapers = new Map();
    this.currentId = 1;

    // Initialize with some default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default admin user
    const adminUser: User = {
      id: this.currentId++,
      username: "admin",
      password: "admin123" // In production, this should be hashed
    };
    this.users.set(adminUser.id, adminUser);

    // Create default boards
    const cbseBoard: Board = {
      id: this.currentId++,
      name: "CBSE Class 12",
      description: "Central Board of Secondary Education",
      type: "secondary",
      isActive: true,
      createdAt: new Date()
    };
    this.boards.set(cbseBoard.id, cbseBoard);

    const jeeBoard: Board = {
      id: this.currentId++,
      name: "JEE Main",
      description: "Joint Entrance Examination Main",
      type: "competitive",
      isActive: true,
      createdAt: new Date()
    };
    this.boards.set(jeeBoard.id, jeeBoard);

    const neetBoard: Board = {
      id: this.currentId++,
      name: "NEET",
      description: "National Eligibility cum Entrance Test",
      type: "competitive",
      isActive: true,
      createdAt: new Date()
    };
    this.boards.set(neetBoard.id, neetBoard);

    // Create default subjects
    const mathSubject: Subject = {
      id: this.currentId++,
      name: "Mathematics",
      description: "Advanced mathematics covering calculus, algebra, and trigonometry",
      boardId: cbseBoard.id,
      isActive: true,
      createdAt: new Date()
    };
    this.subjects.set(mathSubject.id, mathSubject);

    const physicsSubject: Subject = {
      id: this.currentId++,
      name: "Physics",
      description: "Fundamental physics concepts including mechanics, thermodynamics, and optics",
      boardId: jeeBoard.id,
      isActive: true,
      createdAt: new Date()
    };
    this.subjects.set(physicsSubject.id, physicsSubject);

    const biologySubject: Subject = {
      id: this.currentId++,
      name: "Biology",
      description: "Comprehensive biology covering botany, zoology, and human physiology",
      boardId: neetBoard.id,
      isActive: true,
      createdAt: new Date()
    };
    this.subjects.set(biologySubject.id, biologySubject);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Board methods
  async getAllBoards(): Promise<Board[]> {
    return Array.from(this.boards.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getBoard(id: number): Promise<Board | undefined> {
    return this.boards.get(id);
  }

  async createBoard(insertBoard: InsertBoard): Promise<Board> {
    const id = this.currentId++;
    const board: Board = { 
      ...insertBoard, 
      id,
      createdAt: new Date()
    };
    this.boards.set(id, board);
    return board;
  }

  async updateBoard(id: number, boardUpdate: Partial<InsertBoard>): Promise<Board | undefined> {
    const board = this.boards.get(id);
    if (!board) return undefined;
    
    const updatedBoard = { ...board, ...boardUpdate };
    this.boards.set(id, updatedBoard);
    return updatedBoard;
  }

  async deleteBoard(id: number): Promise<boolean> {
    return this.boards.delete(id);
  }

  // Subject methods
  async getAllSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getSubjectsByBoard(boardId: number): Promise<Subject[]> {
    return Array.from(this.subjects.values())
      .filter(subject => subject.boardId === boardId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const id = this.currentId++;
    const subject: Subject = { 
      ...insertSubject, 
      id,
      createdAt: new Date()
    };
    this.subjects.set(id, subject);
    return subject;
  }

  async updateSubject(id: number, subjectUpdate: Partial<InsertSubject>): Promise<Subject | undefined> {
    const subject = this.subjects.get(id);
    if (!subject) return undefined;
    
    const updatedSubject = { ...subject, ...subjectUpdate };
    this.subjects.set(id, updatedSubject);
    return updatedSubject;
  }

  async deleteSubject(id: number): Promise<boolean> {
    return this.subjects.delete(id);
  }

  // Material methods
  async getAllMaterials(): Promise<Material[]> {
    return Array.from(this.materials.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getMaterialsBySubject(subjectId: number): Promise<Material[]> {
    return Array.from(this.materials.values())
      .filter(material => material.subjectId === subjectId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getMaterialsByBoard(boardId: number): Promise<Material[]> {
    return Array.from(this.materials.values())
      .filter(material => material.boardId === boardId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getMaterial(id: number): Promise<Material | undefined> {
    return this.materials.get(id);
  }

  async createMaterial(insertMaterial: InsertMaterial): Promise<Material> {
    const id = this.currentId++;
    const material: Material = { 
      ...insertMaterial, 
      id,
      createdAt: new Date()
    };
    this.materials.set(id, material);
    return material;
  }

  async updateMaterial(id: number, materialUpdate: Partial<InsertMaterial>): Promise<Material | undefined> {
    const material = this.materials.get(id);
    if (!material) return undefined;
    
    const updatedMaterial = { ...material, ...materialUpdate };
    this.materials.set(id, updatedMaterial);
    return updatedMaterial;
  }

  async deleteMaterial(id: number): Promise<boolean> {
    return this.materials.delete(id);
  }

  // Note methods
  async getAllNotes(): Promise<Note[]> {
    return Array.from(this.notes.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getNotesBySubject(subjectId: number): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter(note => note.subjectId === subjectId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getNotesByBoard(boardId: number): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter(note => note.boardId === boardId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.currentId++;
    const note: Note = { 
      ...insertNote, 
      id,
      views: 0,
      createdAt: new Date()
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: number, noteUpdate: Partial<InsertNote>): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    
    const updatedNote = { ...note, ...noteUpdate };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }

  async incrementNoteViews(id: number): Promise<void> {
    const note = this.notes.get(id);
    if (note) {
      note.views += 1;
      this.notes.set(id, note);
    }
  }

  // PYQ Paper methods
  async getAllPyqPapers(): Promise<PyqPaper[]> {
    return Array.from(this.pyqPapers.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getPyqPapersBySubject(subjectId: number): Promise<PyqPaper[]> {
    return Array.from(this.pyqPapers.values())
      .filter(paper => paper.subjectId === subjectId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getPyqPapersByBoard(boardId: number): Promise<PyqPaper[]> {
    return Array.from(this.pyqPapers.values())
      .filter(paper => paper.boardId === boardId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getPyqPapersByYear(year: number): Promise<PyqPaper[]> {
    return Array.from(this.pyqPapers.values())
      .filter(paper => paper.year === year)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getPyqPaper(id: number): Promise<PyqPaper | undefined> {
    return this.pyqPapers.get(id);
  }

  async createPyqPaper(insertPyqPaper: InsertPyqPaper): Promise<PyqPaper> {
    const id = this.currentId++;
    const pyqPaper: PyqPaper = { 
      ...insertPyqPaper, 
      id,
      createdAt: new Date()
    };
    this.pyqPapers.set(id, pyqPaper);
    return pyqPaper;
  }

  async updatePyqPaper(id: number, pyqPaperUpdate: Partial<InsertPyqPaper>): Promise<PyqPaper | undefined> {
    const pyqPaper = this.pyqPapers.get(id);
    if (!pyqPaper) return undefined;
    
    const updatedPyqPaper = { ...pyqPaper, ...pyqPaperUpdate };
    this.pyqPapers.set(id, updatedPyqPaper);
    return updatedPyqPaper;
  }

  async deletePyqPaper(id: number): Promise<boolean> {
    return this.pyqPapers.delete(id);
  }

  // Analytics methods
  async getDashboardStats(): Promise<{
    totalStudents: number;
    totalBoards: number;
    totalMaterials: number;
    totalPyqPapers: number;
  }> {
    return {
      totalStudents: 2847, // Mock data as users table doesn't represent students
      totalBoards: this.boards.size,
      totalMaterials: this.materials.size,
      totalPyqPapers: this.pyqPapers.size,
    };
  }
}

export const storage = new MemStorage();
