import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRODUCTS_PATH = path.resolve(__dirname, "../../data/products.json");

export default class ProductManager {
  constructor(filePath = PRODUCTS_PATH) {
    this.filePath = filePath;
  }

  async #readFile() {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") return [];
      throw error;
    }
  }

  async #writeFile(data) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async getAll() {
    return this.#readFile();
  }

  async getById(id) {
    const products = await this.#readFile();
    return products.find((product) => product.id === id) || null;
  }

  async create(productData) {
    const requiredFields = [
      "title",
      "description",
      "code",
      "price",
      "status",
      "stock",
      "category",
      "thumbnails"
    ];

    const missing = requiredFields.filter((field) => !(field in productData));
    if (missing.length) {
      throw new Error(`Campos faltantes: ${missing.join(", ")}`);
    }

    const products = await this.#readFile();

    const codeExists = products.some(
      (product) => product.code === productData.code
    );
    if (codeExists) {
      throw new Error(`Ya existe un producto con code=${productData.code}`);
    }

    const newProduct = {
      ...productData,
      id: crypto.randomUUID()
    };

    products.push(newProduct);
    await this.#writeFile(products);
    return newProduct;
  }

  async update(id, updates) {
    if ("id" in updates) {
      delete updates.id; // nunca actualizar el id
    }

    const products = await this.#readFile();
    const index = products.findIndex((product) => product.id === id);

    if (index === -1) {
      throw new Error("Producto no encontrado");
    }

    const updatedProduct = { ...products[index], ...updates };
    products[index] = updatedProduct;

    await this.#writeFile(products);
    return updatedProduct;
  }

  async delete(id) {
    const products = await this.#readFile();
    const filtered = products.filter((product) => product.id !== id);

    if (filtered.length === products.length) {
      throw new Error("Producto no encontrado");
    }

    await this.#writeFile(filtered);
    return true;
  }
}