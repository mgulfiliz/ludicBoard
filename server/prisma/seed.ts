import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
const prisma = new PrismaClient();

async function deleteAllData(orderedFileNames: string[]) {
  const modelNames = orderedFileNames.map((fileName) => {
    const modelName = path.basename(fileName, path.extname(fileName));
    return modelName.charAt(0).toUpperCase() + modelName.slice(1);
  });

  for (const modelName of modelNames) {
    const model: any = prisma[modelName as keyof typeof prisma];
    try {
      await model.deleteMany({});
      console.log(`Cleared data from ${modelName}`);
    } catch (error) {
      console.error(`Error clearing data from ${modelName}:`, error);
    }
  }
}

async function resetSequences(modelNames: string[]) {
  for (const modelName of modelNames) {
    try {
      await prisma.$executeRawUnsafe(`
        SELECT setval(
          pg_get_serial_sequence('"${modelName}"', 'id'), 
          COALESCE((SELECT MAX(id)+1 FROM "${modelName}"), 1), 
          false
        )
      `);
      console.log(`Reset sequence for ${modelName}`);
    } catch (error) {
      console.error(`Error resetting sequence for ${modelName}:`, error);
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  const orderedFileNames = [
    "team.json",
    "project.json",
    "projectTeam.json",
    "user.json",
    "task.json",
    "attachment.json",
    "comment.json",
    "taskAssignment.json",
  ];

  // Delete existing data
  await deleteAllData(orderedFileNames);

  // Seed data
  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = path.basename(fileName, path.extname(fileName));
    const model: any = prisma[modelName as keyof typeof prisma];

    try {
      for (const data of jsonData) {
        // Destructure to remove id if present
        const { id, ...dataWithoutId } = data;
        await model.create({ data: dataWithoutId });
      }
      console.log(`Seeded ${modelName} with data from ${fileName}`);
    } catch (error) {
      console.error(`Error seeding data for ${modelName}:`, error);
    }
  }

  // Reset sequences for all models
  const modelNames = orderedFileNames.map(fileName => 
    path.basename(fileName, path.extname(fileName)).charAt(0).toUpperCase() + 
    path.basename(fileName, path.extname(fileName)).slice(1)
  );
  await resetSequences(modelNames);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());