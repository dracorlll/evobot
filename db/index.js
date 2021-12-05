const mongoose = require("mongoose")
const mongoURI = "mongodb://localhost:27017/evobot"
const connectDB = async () => {
  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  console.log(`MongoDB connected`)

}

module.exports = {connectDB}