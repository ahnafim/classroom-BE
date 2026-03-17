import express from "express";
import subjectsRouter from "./routes/subjects.js"
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT) || 8000;

const frontendUrl = process.env.FRONTEND_URL;
if (!frontendUrl) {
    throw new Error("FRONTEND_URL is not defined");
  }

    app.use(cors({
          origin: frontendUrl,
      methods: ["GET", "POST", "PUT", "DELETE"],
     credentials: true
}))

app.use('/api/subjects', subjectsRouter)
app.get('/', (req, res) => {
  res.send('Welcome to the database!')
});
app.listen(PORT, () => {
console.log(`Server is running at http://localhost:${PORT}`);
})
