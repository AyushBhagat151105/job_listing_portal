import app from "./app";
import { config } from "./config";

const port = config.PORT;

const startServer = async () => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
};

startServer();

