import { sendVerificationEmail } from './src/lib/email.js';
import dotenv from 'dotenv';
dotenv.config();

async function testEmail() {
  try {
    console.log('Enviando email de prueba a: suportepandapo.py@gmail.com...');
    await sendVerificationEmail('suportepandapo.py@gmail.com', 'test-token');
    console.log('Email enviado con éxito!');
  } catch (error) {
    console.error('ERROR EN EMAIL:');
    console.error(error);
  }
}

testEmail();
