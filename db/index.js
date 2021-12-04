const mongoose = require("mongoose")
const mongoURI = "mongodb://localhost:27017/cafeApp"
const connectDB = async () => {
  const conn = await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  console.log(`MongoDB connected`)
  console.log(conn.collection)
}

function find(name, query, cb) {
  console.log(mongoose.connection.collection(name))
  mongoose.connection.db.collection(name, function (err, collection) {
    collection.find(query).toArray(cb)
  })
}

module.exports = {connectDB}