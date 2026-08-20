const app = require("./app");
const { startScheduler } = require("./jobs/scheduler");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startScheduler();
});