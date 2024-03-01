import dotenv from "dotenv";
dotenv.config();

export default {
  Port: Number(process.env.PORT || 3000),
  SessionSecret: process.env.SESSION_SECRET || "",
  DatabaseUri: process.env.DATABASE_URI || "",
  EmailUser: process.env.EMAIL_USER || "",
  EmailPassword: process.env.EMAIL_PASS || "",
  OrganizationName: "Aishwarya College of Education Jodhpur",
  EventName: "ACE Research Paper",
};
