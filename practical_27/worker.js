import amqplib from "amqplib";

const MAX_RETRIES = 3;

async function processTask(task) {
  console.log(`[Worker ${process.env.WORKER_ID}] Processing task:`, task);

  const willFail = Math.random() < 0.3; // Имитация случайного успеха/ошибки.
  if (willFail) {
    throw new Error("Processing error.");
  }

  // Имитация задержки.
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return true;
}

async function consumeTasks() {
  const connection = await amqplib.connect("amqp://localhost");
  const channel = await connection.createChannel();

  channel.prefetch(1);

  console.log(`Worker ${process.env.WORKER_ID} waiting for tasks...`);

  channel.consume("task_queue", async (msg) => {
    if (!msg) return;

    const task = JSON.parse(msg.content.toString());
    const retryCount = msg.properties.headers?.["x-retry-count"] || 0;

    console.log(
      `[Worker ${process.env.WORKER_ID}] Attempt ${retryCount + 1}/${MAX_RETRIES}:`,
      task,
    );

    try {
      await processTask(task);
      channel.ack(msg);
    } catch (err) {
      console.error(`[Worker ${process.env.WORKER_ID}] Error: ${err.message}`);

      if (retryCount < MAX_RETRIES) {
        channel.nack(msg, false, false);

        const delay = 1000 * 2 ** retryCount;
        await new Promise((resolve) => setTimeout(resolve, delay));

        channel.sendToQueue("task_queue", msg.content, {
          persistent: true,
          headers: { "x-retry-count": retryCount + 1 },
        });
      } else {
        console.error(
          `[Worker ${proccess.env.WORKER_ID}] Message was sent to DLQ after ${MAX_RETRIES} attempts.`,
        );
        channel.nack(msg, false, false);
      }
    }
  });
}

await consumeTasks();
