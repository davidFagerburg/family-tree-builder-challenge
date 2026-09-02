import { Router } from "express";
import FamilyService from "../service/FamilyService.js";

export const graphRouter = Router();

// GET /api/graph
//
// The graph visualization polls this endpoint and renders whatever it
// returns. Right now it always returns an empty graph — there is no
// persistence layer wired up yet.
//
// TODO (candidate): back this with your own database and
// return the current state of the family tree:
//   {
//     people: [{ id, name, ...whatever attributes you decide to track }],
//     parentEdges: [{ parentId, childId }],   // single-direction, <= 2 parents/child
//     spouseEdges: [{ personAId, personBId }] // undirected, distinct from parent/child
//   }
//
// The graph must stay a valid DAG with respect to parentEdges (no cycles),
// and must survive a process restart.
graphRouter.get("/", async (_req, res) => {
  const graph = await FamilyService.getPersonGraph()
  console.log("GET /api/graph", JSON.stringify(graph))
  res.json(graph);
});
