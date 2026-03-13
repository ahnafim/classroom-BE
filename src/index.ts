import { eq } from "drizzle-orm";
import { index } from "./db/index.js";
import { demoUsers } from "./db/schema/index.js";

async function main() {
  try {
    console.log("Performing CRUD operations...");

    const email = `admin+${Date.now()}@example.com`;

    const [newUser] = await index
      .insert(demoUsers)
      .values({ name: "Admin User", email })
      .returning();

    if (!newUser) {
      throw new Error("Failed to create user");
    }

    console.log("CREATE:", newUser);

    const foundUser = await index
      .select()
      .from(demoUsers)
      .where(eq(demoUsers.id, newUser.id));
    console.log("READ:", foundUser[0]);

    const [updatedUser] = await index
      .update(demoUsers)
      .set({ name: "Super Admin" })
      .where(eq(demoUsers.id, newUser.id))
      .returning();

    if (!updatedUser) {
      throw new Error("Failed to update user");
    }

    console.log("UPDATE:", updatedUser);

    await index.delete(demoUsers).where(eq(demoUsers.id, newUser.id));
    console.log("DELETE: User deleted.");

    console.log("CRUD operations completed successfully.");
  } catch (error) {
    console.error("Error performing CRUD operations:", error);
    process.exit(1);
  }
}

void main();
