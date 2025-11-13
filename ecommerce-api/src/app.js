import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import ProductManager from "./managers/ProductManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Configuración Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routers
app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Socket.io
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);
app.set("io", io);

const productManager = new ProductManager();

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("createProduct", async (productData) => {
    try {
      await productManager.create(productData);
      const products = await productManager.getAll();
      io.emit("productsUpdated", products);
    } catch (error) {
      socket.emit("actionError", error.message);
    }
  });

  socket.on("deleteProduct", async (productId) => {
    try {
      await productManager.delete(productId);
      const products = await productManager.getAll();
      io.emit("productsUpdated", products);
    } catch (error) {
      socket.emit("actionError", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});