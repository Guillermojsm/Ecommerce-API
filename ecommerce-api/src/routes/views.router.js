import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const router = Router();
const productManager = new ProductManager();

router.get("/", async (req, res) => {
  const products = await productManager.getAll();
  res.render("home", { title: "Listado de productos", products });
});

router.get("/realtimeproducts", async (req, res) => {
  const products = await productManager.getAll();
  res.render("realTimeProducts", {
    title: "Productos en tiempo real",
    products
  });
});

export default router;