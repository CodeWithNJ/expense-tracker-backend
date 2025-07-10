import app from "./app.js";
import connectDB from "./db/dbConnection.js";

const port = process.env.PORT || 7800;

connectDB();

app.listen(port, () => {
  console.log(`Server Running On Port ${port}`);
});
