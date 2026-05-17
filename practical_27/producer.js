import amqplib from "amqplib";
import express from "express";

const app = express();
app.use(express.json());

let channel;

async function setupQueues() {
  const connection = await amqplib.connect("amqp://localhost");
  channel = await connection.createChannel();

  await channel.assertExchange("dlx_exchange", "direct", { durable: true });
  await channel.assertQueue("dead_letter_queue", { durable: true });
  await channel.bindQueue("dead_letter_queue", "dlx_exchange", "dead");

  channel.assertQueue("task_queue", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "dlx_exchange",
      "x-dead-letter-routing-key": "dead",
      "x-message-ttl": 60000,
      "x-max-retries": 3,
    },
  });

  console.log("Queues declared and connected.");
}

app.post("/tasks", async (req, res) => {
  const task = req.body;
  if (!task.type || !task.payload) {
    return res.status(400).json({ error: "Task must have type and payload." });
  }

  try {
    channel.sendToQueue("task_queue", Buffer.from(JSON.stringify(task)), {
      persistent: true,
    });
    res.status(202).json({ message: "Task accepted.", task: task });
  } catch (err) {
    console.error("Failed to send task:", err);
    res.status(500).json({ error: "Internal server error. " });
  }
});

await setupQueues();
app.listen(3000, () => {
  console.log(`Producer listening on port 3000.`);
});
