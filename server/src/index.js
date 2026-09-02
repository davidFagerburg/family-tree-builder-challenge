import "dotenv/config";
import express from "express";
import cors from "cors";
import { chatRouter } from "./routes/chat.js";
import { graphRouter } from "./routes/graph.js";
import sequelize from "./config/database.js"

const app = express();
const PORT = process.env.PORT || 3001;

async function startServer() {
  await sequelize.sync({force: false})

  app.use(cors());
  app.use(express.json());
  
  app.use("/api/chat", chatRouter);
  app.use("/api/graph", graphRouter);
  
  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  
  app.listen(PORT, () => {
    console.log(`family-tree-builder server listening on http://localhost:${PORT}`);
  });
}

startServer()