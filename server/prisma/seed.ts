import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function deleteAllData() {
  console.log("Starting data deletion...");
  try {
    // Delete in strict reverse order of dependencies to avoid foreign key constraints
    await prisma.comment.deleteMany({});
    console.log("Deleted all comments");

    await prisma.attachment.deleteMany({});
    console.log("Deleted all attachments");

    await prisma.taskAssignment.deleteMany({});
    console.log("Deleted all task assignments");

    await prisma.task.deleteMany({});
    console.log("Deleted all tasks");

    await prisma.projectTeam.deleteMany({});
    console.log("Deleted all project teams");

    await prisma.project.deleteMany({});
    console.log("Deleted all projects");

    await prisma.team.deleteMany({});
    console.log("Deleted all teams");

    await prisma.user.deleteMany({});
    console.log("Deleted all users");
  } catch (error) {
    console.error("Error during data deletion:", error);
    throw error;
  }
}

async function seedUsers() {
  console.log("Starting user seeding...");
  const usersPath = path.join(__dirname, "seedData", "user.json");
  const users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));

  const createdUsers = [];
  for (const userData of users) {
    try {
      console.log(`Seeding user: ${userData.username}`);
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          profilePictureUrl: userData.profilePictureUrl
        }
      });
      createdUsers.push(user);
      console.log(`Successfully seeded user: ${user.username}`);
    } catch (error) {
      console.error(`Error seeding user ${userData.username}:`, error);
    }
  }

  console.log(`Total users seeded: ${createdUsers.length}`);
  return createdUsers;
}

async function seedTeams(users: any[]) {
  console.log("Starting team seeding...");
  const teamsPath = path.join(__dirname, "seedData", "team.json");
  const teams = JSON.parse(fs.readFileSync(teamsPath, "utf-8"));

  const createdTeams = [];
  for (const teamData of teams) {
    try {
      console.log(`Seeding team: ${teamData.teamName}`);
      const team = await prisma.team.create({
        data: {
          teamName: teamData.teamName,
          productOwnerUserId: teamData.productOwnerUserId,
          projectManagerUserId: teamData.projectManagerUserId
        }
      });
      createdTeams.push(team);
      console.log(`Successfully seeded team: ${team.teamName}`);
    } catch (error) {
      console.error(`Error seeding team ${teamData.teamName}:`, error);
    }
  }

  console.log(`Total teams seeded: ${createdTeams.length}`);
  return createdTeams;
}

async function seedProjects(teams: any[], users: any[]) {
  console.log("Starting project seeding...");
  const projectsPath = path.join(__dirname, "seedData", "project.json");
  const projects = JSON.parse(fs.readFileSync(projectsPath, "utf-8"));

  const createdProjects = [];
  for (const projectData of projects) {
    try {
      console.log(`Seeding project: ${projectData.name}`);
      const project = await prisma.project.create({
        data: {
          name: projectData.name,
          description: projectData.description,
          startDate: new Date(projectData.startDate),
          endDate: new Date(projectData.endDate)
        }
      });
      createdProjects.push(project);
      console.log(`Successfully seeded project: ${project.name}`);
    } catch (error) {
      console.error(`Error seeding project ${projectData.name}:`, error);
    }
  }

  console.log(`Total projects seeded: ${createdProjects.length}`);
  return createdProjects;
}

async function seedProjectTeams(projects: any[], teams: any[]) {
  console.log("Starting project-team seeding...");
  const projectTeamsPath = path.join(__dirname, "seedData", "projectTeam.json");
  const projectTeamData = JSON.parse(fs.readFileSync(projectTeamsPath, "utf-8"));

  const createdProjectTeams = [];
  for (let i = 0; i < projectTeamData.length; i++) {
    try {
      // Cycle through projects and teams
      const project = projects[i % projects.length];
      const team = teams[i % teams.length];

      console.log(`Seeding project-team: Project ${project.name}, Team ${team.teamName}`);
      const projectTeam = await prisma.projectTeam.create({
        data: {
          projectId: project.id,
          teamId: team.id
        }
      });
      createdProjectTeams.push(projectTeam);
      console.log(`Successfully seeded project-team`);
    } catch (error) {
      console.error(`Error seeding project-team:`, error);
    }
  }

  console.log(`Total project-teams seeded: ${createdProjectTeams.length}`);
  return createdProjectTeams;
}

async function seedTasks(projects: any[], users: any[]) {
  console.log("Starting task seeding...");
  const tasksPath = path.join(__dirname, "seedData", "task.json");
  const tasks = JSON.parse(fs.readFileSync(tasksPath, "utf-8"));

  const createdTasks = [];
  for (const taskData of tasks) {
    try {
      console.log(`Seeding task: ${taskData.title}`);
      const task = await prisma.task.create({
        data: {
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          tags: taskData.tags,
          startDate: new Date(taskData.startDate),
          dueDate: new Date(taskData.dueDate),
          points: taskData.points || null,
          projectId: projects.find(p => p.id === taskData.projectId)?.id || projects[0].id,
          authorUserId: users.find(u => u.userId === taskData.authorUserId)?.userId || users[0].userId,
          assignedUserId: users.find(u => u.userId === taskData.assignedUserId)?.userId || null
        }
      });
      createdTasks.push(task);
      console.log(`Successfully seeded task: ${task.title}`);
    } catch (error) {
      console.error(`Error seeding task ${taskData.title}:`, error);
    }
  }

  console.log(`Total tasks seeded: ${createdTasks.length}`);
  return createdTasks;
}

async function seedComments(tasks: any[], users: any[]) {
  console.log("Starting comment seeding...");
  const commentsPath = path.join(__dirname, "seedData", "comment.json");
  const comments = JSON.parse(fs.readFileSync(commentsPath, "utf-8"));

  const createdComments = [];
  for (const commentData of comments) {
    try {
      console.log(`Seeding comment for task: ${commentData.taskId}`);
      const comment = await prisma.comment.create({
        data: {
          text: commentData.text,
          taskId: tasks.find(t => t.id === commentData.taskId)?.id || tasks[0].id,
          userId: users.find(u => u.userId === commentData.userId)?.userId || users[0].userId
        }
      });
      createdComments.push(comment);
      console.log(`Successfully seeded comment`);
    } catch (error) {
      console.error(`Error seeding comment:`, error);
    }
  }

  console.log(`Total comments seeded: ${createdComments.length}`);
  return createdComments;
}

async function main() {
  console.log("Starting seeding process...");

  try {
    // Delete existing data
    await deleteAllData();

    // Seed data with relationships
    const users = await seedUsers();
    const teams = await seedTeams(users);
    const projects = await seedProjects(teams, users);
    await seedProjectTeams(projects, teams);
    const tasks = await seedTasks(projects, users);
    await seedComments(tasks, users);

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Critical error during seeding:", error);
  }
}

main()
  .catch((e) => console.error("Unhandled error:", e))
  .finally(async () => {
    console.log("Disconnecting from database...");
    await prisma.$disconnect();
  });