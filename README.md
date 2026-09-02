# Family Tree Builder — Take-Home Starter

This repo is a starting point, not a finished app. It gives you a working chat
UI, a working graph visualization, and a bare LLM connection with no tools
attached. Your job is everything that turns a conversation into a correct,
persisted family tree.

## What's already here

- **`client/`** — React (Vite) app with two panels:
  - `ChatPanel` — a text chat interface. Sends the full conversation to
    `POST /api/chat` on every turn and renders the reply.
  - `GraphView` — renders whatever `GET /api/graph` returns using
    [React Flow](https://reactflow.dev). It expects:
    ```
    {
      people: [{ id, name, ... }],
      parentEdges: [{ parentId, childId }],
      spouseEdges: [{ personAId, personBId }]
    }
    ```
    It lays nodes out by generation and re-fetches on an interval, so once
    your backend actually persists data, it'll show up here without any
    frontend changes.
- **`server/`** — Express app with:
  - `POST /api/chat` — stateless proxy to the model (`server/src/llm/client.js`,
    `server/src/routes/chat.js`). No tools are wired up. It can already hold a
    plain-text conversation and ask clarifying questions, but it has no way to
    read or write structured family-tree data.
  - `GET /api/graph` — currently always returns an empty graph
    (`server/src/routes/graph.js`). There is no database yet.

## What you need to build

1. **Tool definitions** the model uses to read/write the family tree (add
   person, add parent/child edge, add spouse edge, look up a person, apply a
   correction, etc. — you choose the shape).
2. **The agentic loop** in `POST /api/chat`: send messages + tools to the
   model, handle `tool_use` blocks, execute them against your persistence
   layer, feed `tool_result` blocks back, and repeat until the model returns
   plain text.
3. **A persistence layer** (SQLite is fine) that survives a process restart.
   `GET /api/graph` should read from it instead of returning the empty stub.
4. **Ambiguity and correction handling**:
   - If a reference is ambiguous (e.g. "my brother John" when two Johns
     exist), the agent should ask a clarifying question rather than guess.
   - If the user corrects an earlier statement (a misspelled name, a
     misstated relationship), state should update in place — not gain a
     duplicate or contradictory fact.
5. **DAG validation** — a parent→child edge that would create a cycle must be
   rejected, not silently accepted.

### Data model

uses **sequelize**  for active-record-esque data modeling.

- **Person**: `id`, `name`, `spouse_id`, `parent_1_id`, and `parent_2_id`.
- **Parent → Child**: `parent_1_id` and `parent_2_id` are optional, and 
  are both self-referencing foreign keys.
- **Spouse**: While the relationship should always be symmetrical, we do
  not enforce this at the data level. `spouse_id` is a self-referencing
  foreign key.
- We use a sequelize validate block to keep the parent-child graph a valid
  DAG. This runs a loop-detecting recursive query on every insert.

### Tool Schema

Tools are represented in the /server/src/llm/tools directory. Adding a new tool file
is as simple as adding a new file in that directory with an export default of an object
with the following properties:
- toolDescription:
  - name: string
  - description: string
  - input_schema: object
- runTool: an async function that runs the actual tool after validating input
  - runTool may return results or throw errors. Errors thrown will be surfaced
    as failed tool calls to the model with the error messaged passed to the model

Then, simply add an entry in tools/index.js and the tool will be available to the model.

#### Tool Granularity

Tools are defined in a granular way to keep the calls themselves simple with the
number of inputs for each call. This results in possibly a slower user experience
while the model calls many tools sequentially, but it keeps the calls easier to
reason about and more reliable.

#### Implemented Tools:

##### Create Tools
- AddPerson
- LinkSpouses
- SetParents

##### Read Tools
- ListEveryone
- FindPerson

##### Update Tools
- RenamePerson

##### Delete Tools
- UnsetParents
- UnlinkSpouses
- RemovePerson 

### Out of scope

Remarriage, half-siblings, more than 2 recorded parents, and unknown/missing
parents are out of scope. If a description happens to touch one of these, a
non-crashing response (clarifying question or a stated limitation) is fine —
you don't need to model it correctly.

#### Known Limitations

- The system requires two parents for every child. If the user doesn't know someone's name,
  the system may prompt the user to just use a placeholder for the person's name
- The system relies on an inital tool call to `list_everyone` to initialize its understanding
  of the current family tree. As this gets larger, the format of this tool's output becomes
  more and more difficult to reason about, and it becomes more prone to mistakes.
- The eval suite is very limitied

#### Future Work

- Improve the existing eval suite
  - Test cases where there is ambiguity, ensuring no tools are called and that the model
    instead asks a question
- Add an eval suite for each tool
  - Test a few cases each tool **should** be called
  - Test at least one case each tool **should not** be called
- Add a general eval suite for testing the model's understanding of its limitations
  - Test each "out of scope" case to make sure the model does not attempt to call any
    tools on unsupported family situations.
- Support more varied family circumstances
- Modify `list_everyone` tool guidance and output format to be easier to reason about

## Getting started

```bash
npm install
cp server/.env.example server/.env   # then fill in ANTHROPIC_API_KEY
npm run dev
```

This starts the server (`:3001`) and client (`:5173`, proxying `/api` to the
server) together. Open the client URL and start chatting.

## Deliverables

- Your implementation (tool schema, agent loop, persistence, validation).
- A README section (append to this file or add a new one) covering:
  - Your tool schema and why you designed it that way
  - How you resolve ambiguous references and in-place corrections
  - Known limitations
- Be ready to walk through your design decisions and trade-offs in a follow-up
  discussion — not just demo the working app.
