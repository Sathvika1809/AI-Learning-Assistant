import dns from 'node:dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dns.setServers(['1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

try {
  console.log('Trying to connect to MongoDB...');

  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000
  });

  console.log('SUCCESS!');
  console.log('Connected to:', conn.connection.host);

  await mongoose.disconnect();
  process.exit(0);

} catch (error) {
  console.error('\n=== CONNECTION FAILED ===');
  console.error('Message:', error.message);

  // Print detailed errors for individual MongoDB servers
  if (error.reason?.servers) {
    console.error('\n=== SERVER DETAILS ===');

    for (const [server, description] of error.reason.servers) {
      console.error(`\nServer: ${server}`);
      console.error('Type:', description.type);

      if (description.error) {
        console.error('Actual error:', description.error);
      }
    }
  }

  process.exit(1);
}