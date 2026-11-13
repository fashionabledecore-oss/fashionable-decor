import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('MONGODB_URI is missing in server/.env')
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected')
  })

  // (Database ka naam fixed hai, URI mein kuch bhi likha ho. Server aur scripts sab isi se connect hote hain.)
  const conn = await mongoose.connect(uri, { dbName: 'fashionable_decor' })
  console.log(`MongoDB connected: ${conn.connection.host} (db: ${conn.connection.name})`)
}