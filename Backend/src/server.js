import 'dotenv/config';
import app from './app.js';

const myPort = process.env.PORT || 3000;

app.listen(myPort, () => {
    console.log(`Server is running on http://localhost:${myPort}`);
});
