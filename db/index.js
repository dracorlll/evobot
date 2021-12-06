const mongoose = require("mongoose")
const mongoURI = "mongodb://127.0.0.1:27017/evobot"
const connectDB = async () => {
  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  console.log(`MongoDB connected`)

}

module.exports = {connectDB}