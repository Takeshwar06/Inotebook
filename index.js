const connectToMongo=require('./db')
const cors=require("cors")
const express=require('express')
connectToMongo();
const port=5000
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))

app.use(express.static("/client/build"))   // cut for run 

app.listen(port,()=>{
    console.log(`listening at http://localhost:${port}`);
    
})