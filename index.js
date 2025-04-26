const express = require('express');
const bodyParser = require('body-parser');
const dbConnect = require("./config/database");
const user = require("./Routes/user_routes");
const post= require('./Routes/post_routes')
const connection= require('./Routes/connection_route')
const notificationRoutes= require('./Routes/notification_routes')
const chatRoutes = require("./Routes/chat_routes");
const messageRoutes = require("./Routes/message_routes");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const { initializeSocket } = require('./socket');
const corsOption = {
    origin:"http://localhost:5173",
    credentials:true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Authorization,Content-Type"
}
app.use(cors(corsOption));
app.use(bodyParser.json());
app.use(cookieParser());


app.use(express.json()); // <== Required to parse JSON body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

dbConnect();
const server=app.listen(3000, () => {
    console.log("server started successfully");
})
app.get('/', (req , res) => {
    res.send("Api is working");
});
//mounting the route
app.use('/api/v1', user);

app.use('/api/v1/post', post)

app.use('/api/v1/chat', chatRoutes);

app.use('/api/v1/message', messageRoutes);

app.use('/api/v1/connection', connection);

app.use('/api/v1/notification', notificationRoutes);
initializeSocket(server)
