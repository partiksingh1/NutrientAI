import express, { type Request, type Response } from "express";
import router from "./routes/auth.routes.js";
import goal_router from "./routes/goal.routes.js";
import meal_logs from "./routes/meals.routes.js";
import preference from "./routes/preferences.routes.js";
import recommend_router from "./routes/recommend.route.js";
import main_router from "./routes/mainController.routes.js";
import analytics from "./routes/analytics.routes.js";
import user_router from "./routes/user.routes.js";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, TypeScript + Express + Live Reload!");
});
app.use(cors());
app.use(express.json());
app.use('/api/auth', router);
app.use('/api/goals', goal_router);
app.use('/api/meals', meal_logs);
app.use('/api/preference', preference);
app.use('/api/recommend', recommend_router);
app.use('/api/complete_profile', main_router);
app.use('/api/analytics', analytics);
app.use('/api/user', user_router);
app.listen(PORT, () => {
    console.log(`...Server running at http://localhost:${PORT}`);
});
