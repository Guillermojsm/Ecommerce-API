const socket = io();

const productList = document.getElementById("products-list");
const createForm = document.getElementById("create-product-form");
const deleteForm = document.getElementById("delete-product-form");

const renderProducts = (products) => {
  productList.innerHTML = "";
  products.forEach((product) => {
    const li = document.createElement("li");
    li.dataset.id = product.id;
    li.innerHTML = `
      <strong>${product.title}</strong> — $${product.price}<br />
      ${product.description}
    `;
    productList.appendChild(li);
  });
};

socket.on("productsUpdated", (products) => {
  renderProducts(products);
});

socket.on("actionError", (message) => {
  alert(`Error: ${message}`);
});

createForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(createForm);
  const productData = Object.fromEntries(formData.entries());

  productData.price = Number(productData.price);
  productData.stock = Number(productData.stock);
  productData.status = formData.get("status") === "on";
  productData.thumbnails = productData.thumbnails
    ? productData.thumbnails.split(",").map((url) => url.trim())
    : [];

  socket.emit("createProduct", productData);
  createForm.reset();
});

deleteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const id = deleteForm.elements.id.value.trim();
  socket.emit("deleteProduct", id);
  deleteForm.reset();
});