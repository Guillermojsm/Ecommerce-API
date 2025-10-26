import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const router = Router();
const productManager = new ProductManager();

router.get("/", async (req, res) => {
  try {
    const products = await productManager.getAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productManager.getById(pid);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newProduct = await productManager.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const updatedProduct = await productManager.update(pid, req.body);
    res.json(updatedProduct);
  } catch (error) {
    if (error.message === "Producto no encontrado") {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    await productManager.delete(pid);
    res.status(204).end();
  } catch (error) {
    if (error.message === "Producto no encontrado") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;