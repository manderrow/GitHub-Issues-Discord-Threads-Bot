import express from "express";
import config from "../config";
import { GithubHandlerFunction } from "../interfaces";
import {
  handleClosed,
  handleCreated,
  handleDeleted,
  handleLocked,
  handleOpened,
  handleReopened,
  handleUnlocked,
} from "./githubHandlers";

const app = express();
app.use(
  express.json({
    // See https://docs.github.com/en/webhooks/webhook-events-and-payloads#payload-cap
    limit: 25 * 1024 * 1024,
  }),
);

export function initGithub() {
  const githubActions: {
    [key: string]: GithubHandlerFunction;
  } = {
    opened: (req) => handleOpened(req),
    created: (req) => handleCreated(req),
    closed: (req) => handleClosed(req),
    reopened: (req) => handleReopened(req),
    locked: (req) => handleLocked(req),
    unlocked: (req) => handleUnlocked(req),
    deleted: (req) => handleDeleted(req),
  };

  app.post(`/${config.GITHUB_WEBHOOK_TOKEN}`, async (req, res) => {
    const githubAction = githubActions[req.body.action];
    githubAction && githubAction(req);
    res.status(200);
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
