import fs from "fs";
import http from "http";
import apiRouter from "./api";
import express from "express";
import { createServer } from "vite";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
export const socketIO = new Server(server);
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);
socketIO.on("connection", () => console.log("Client has connected."));

if (process.env.NODE_ENV === "development") {
  const vite = await createServer({
    server: { middlewareMode: true }, // Use middleware mode for integration
    appType: "custom",
  });

  app.use(vite.middlewares);

  const loader = async (req, res) => {
    const url = req.originalUrl;

    try {
      const indexFile = fs.readFileSync("index.html", "utf-8");
      const html = await vite.transformIndexHtml(url, indexFile);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (error) {
      res.status(500).end(error);
    }
  };

  app.use("*", loader);
} else {
  app.use("/", express.static("dist"));
  app.use("/admin", express.static("dist"));
}

server.listen(port, undefined, undefined, () =>
  console.log(`http://localhost:${port}`),
);
