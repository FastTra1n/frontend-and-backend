import express from "express";

// Инициализация приложения.
const app = express();
const port = 3000;

// Подключение мидлвара на обработку JSON.
app.use(express.json());

let products = [
  { id: 1, name: "Ноутбук", price: 199990 },
  { id: 2, name: "Набор посуды", price: 4590 },
  { id: 3, name: "Горный велосипед", price: 89990 },
  { id: 4, name: "Увлажнитель воздуха", price: 3990 },
  { id: 5, name: "Комплект постельного белья", price: 7490 },
];

app.get("/products", (req, res) => {
  // GET-запрос на получение списка всех товаров.
  res.send(JSON.stringify(products));
});

app.get("/products/:id", (req, res) => {
  // GET-запрос на получение конкретного товара по id.
  const product = products.find(p => p.id == req.params.id);
  res.send(JSON.stringify(product));
});

app.post("/products", (req, res) => {
  // POST-запрос на добавление нового товара.
  const maxId = Math.max(...products.map((p) => p.id));
  const { name, price } = req.body;

  const newProduct = { id: maxId + 1, name, price };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.patch("/products/:id", (req, res) => {
  // PATCH-запрос на модифицирование конкретного товара по id.
  const { name, price } = req.body;

  const product = products.find(p => p.id == req.params.id);
  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = price;
  
  res.status(200).json(product);
});

app.delete("/products/:id", (req, res) => {
  // DELETE-запрос на удаление товара по id.
  products = products.filter(p => p.id != req.params.id)
  res.status(204).send();
})

app.listen(port, () => {
  // Включение сервера на указанном порту.
  console.log(`Сервер запущен на http://localhost:${port}`);
});
