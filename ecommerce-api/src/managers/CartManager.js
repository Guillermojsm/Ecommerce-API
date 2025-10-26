import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CARTS_PATH = path.resolve(__dirname, "../../data/carts.json");

export default class CartManager {
  constructor(filePath = CARTS_PATH) {
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

  async createCart() {
    const carts = await this.#readFile();

    const newCart = {
      id: crypto.randomUUID(),
      products: []
    };

    carts.push(newCart);
    await this.#writeFile(carts);
    return newCart;
  }

  async getCartById(id) {
    const carts = await this.#readFile();
    return carts.find((cart) => cart.id === id) || null;
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    const carts = await this.#readFile();
    const cartIndex = carts.findIndex((cart) => cart.id === cartId);

    if (cartIndex === -1) {
      throw new Error("Carrito no encontrado");
    }

    const cart = carts[cartIndex];
    const productIndex = cart.products.findIndex(
      (item) => item.product === productId
    );

    if (productIndex === -1) {
      cart.products.push({
        product: productId,
        quantity
      });
    } else {
      cart.products[productIndex].quantity += quantity;
    }

    carts[cartIndex] = cart;
    await this.#writeFile(carts);
    return cart;
  }
}