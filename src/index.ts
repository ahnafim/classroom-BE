import express from "express";
import { eq } from "drizzle-orm";
import { index } from "./db/index.js";
import { departments } from "./db/schema/index.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

async function runDemo() {
  console.log("Performing CRUD operations (demo)...");

  const code = `CSE-${Date.now()}`;

  const [newDepartment] = await index
    .insert(departments)
    .values({
      code,
      name: "Computer Science",
      description: "Demo department",
    })
    .returning();

  if (!newDepartment) {
    throw new Error("Failed to create department");
  }

  console.log("CREATE:", newDepartment);

  const foundDepartment = await index
    .select()
    .from(departments)
    .where(eq(departments.id, newDepartment.id));
  console.log("READ:", foundDepartment[0]);

  const [updatedDepartment] = await index
    .update(departments)
    .set({ name: "Computer Science & Engineering" })
    .where(eq(departments.id, newDepartment.id))
    .returning();

  if (!updatedDepartment) {
    throw new Error("Failed to update department");
  }

  console.log("UPDATE:", updatedDepartment);

  await index.delete(departments).where(eq(departments.id, newDepartment.id));
  console.log("DELETE: Department deleted.");

  console.log("CRUD operations completed successfully.");
}

async function startServer() {
  const port = Number(process.env.PORT) || 3000;

  await new Promise<void>((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
      resolve();
    });

    server.on("error", reject);
  });
}

async function main() {
  const runDemoFlag =
    process.env.RUN_DEMO === "1" || process.argv.includes("--demo");

  if (runDemoFlag) {
    await runDemo();
  }

  await startServer();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
