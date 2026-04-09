const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const vapidKeys = {
  publicKey: process.env.PUBLIC_VAPID_KEY,
  privateKey: process.env.PRIVATE_VAPID_KEY,
};

webpush.setVapidDetails(
  "mailto:my-email@example.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "./")));

// Хранилище подписок
let subscriptions = [];

// Хранилище активных напоминаний: ключ - id заметки, значение - объект с таймером и данными
const reminders = new Map();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("Клиент подключён:", socket.id);

  // Обработка события 'newTask' от клиента
  socket.on("newTask", (task) => {
    // Рассылаем событие всем подключённым клиентам, включая отправителя
    io.emit("taskAdded", task);

    // Формируем payload для push-уведомления
    const payload = JSON.stringify({
      title: "Новая задача",
      body: task.text,
    });

    // Отправляем уведомление всем подписанным клиентам
    subscriptions.forEach((sub) => {
      webpush
        .sendNotification(sub, payload)
        .catch((err) => console.error("Push error:", err));
    });
  });

  socket.on("disconnect", () => {
    console.log("Клиент отключён:", socket.id);
  });

  socket.on("newReminder", (reminder) => {
    const { id, text, reminderTime } = reminder;
    const delay = reminderTime - Date.now();
    if (delay <= 0) return;

    // Сохраняем таймер
    const timeoutId = setTimeout(() => {
      // Отправляем push-уведомление всем подписанным клиентам
      const payload = JSON.stringify({
        title: "!!! Напоминание",
        body: text,
        reminderId: id,
      });

      subscriptions.forEach((sub) => {
        webpush
          .sendNotification(sub, payload)
          .catch((err) => console.error("Push error:", err));
      });
    }, delay);

    const key = id.toString();
    reminders.set(key, { timeoutId, text, reminderTime });
  });
});

// Эндпоинты для управления push-подписками
app.post("/subscribe", (req, res) => {
  subscriptions.push(req.body);
  res.status(201).json({ message: "Подписка сохранена" });
});

app.post("/unsubscribe", (req, res) => {
  const { endpoint } = req.body;
  subscriptions = subscriptions.filter((sub) => sub.endpoint !== endpoint);
  res.status(200).json({ message: "Подписка удалена" });
});

app.post("/snooze", (req, res) => {
  const reminderId = req.query.reminderId;
  console.log(reminders);
  if (!reminderId || !reminders.has(reminderId)) {
    return res.status(404).json({ error: "Reminder not found" });
  }

  const reminder = reminders.get(reminderId);
  // Отменяем предыдущий таймер
  clearTimeout(reminder.timeoutId);

  // Устанавливаем новый через 5 минут (300 000 мс)
  const newDelay = 5 * 1000;
  const newTimeoutId = setTimeout(() => {
    const payload = JSON.stringify({
      title: "Напоминание отложено",
      body: reminder.text,
      reminderId: reminderId,
    });

    subscriptions.forEach((sub) => {
      webpush
        .sendNotification(sub, payload)
        .catch((err) => console.error("Push error:", err));
    });
  }, newDelay);

  // Обновляем хранилище
  reminders.set(reminderId, {
    timeoutId: newTimeoutId,
    text: reminder.text,
    reminderTime: Date.now() + newDelay,
  });

  res.status(200).json({ message: "Reminder snoozed for 5 minutes" });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
