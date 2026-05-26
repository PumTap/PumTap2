import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';

const _dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url));

// Firebase SDK imports
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  setLogLevel,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

setLogLevel('error');

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('Debe configurar la variable de entorno STRIPE_SECRET_KEY en AI Studio.');
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

async function startServer() {
  // Read firebase configuration
  let configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (!fs.existsSync(configPath)) {
    // If running from dist/ or another subdirectory, check the parent or relative to _dirname
    configPath = _dirname.includes('dist') 
      ? path.join(path.dirname(_dirname), 'firebase-applet-config.json')
      : path.join(_dirname, 'firebase-applet-config.json');
  }
  const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  const firebaseApp = initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

  // Helper to query active completed payments for this user directly from Stripe
  async function syncProcessedStripeSessions(uid: string) {
    if (!process.env.STRIPE_SECRET_KEY) return;
    try {
      const stripe = getStripe();
      const sessions = await stripe.checkout.sessions.list({ limit: 40 });
      // Find completing/paid sessions for this user
      const userSessions = sessions.data.filter(
        s => s.metadata?.uid === uid && s.payment_status === 'paid'
      );

      if (userSessions.length === 0) return;

      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) return;

      const userData = docSnap.data();
      const processedSessions: string[] = userData.processedSessions || [];

      let isPremium = userData.isPremium || false;
      let pointsLimit = userData.pointsLimit || 2000;
      let changed = false;
      const updatedProcessed = [...processedSessions];

      for (const session of userSessions) {
        if (!updatedProcessed.includes(session.id)) {
          const type = session.metadata?.type;
          if (type === 'premium') {
            isPremium = true;
            changed = true;
          } else if (type === 'extension') {
            pointsLimit += 2000;
            changed = true;
          }
          updatedProcessed.push(session.id);
        }
      }

      if (changed) {
        await updateDoc(userRef, {
          isPremium,
          pointsLimit,
          processedSessions: updatedProcessed
        });
      }
    } catch (err) {
      console.error('Error auto-syncing Stripe sessions in background:', err);
    }
  }

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // Handle register
  app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });
      
      const userRef = doc(db, 'users', user.uid);
      const initialProfile = {
        name,
        email,
        hasSeenTutorial: false,
        points: 0,
        isPremium: false,
        pointsLimit: 2000,
        createdAt: serverTimestamp()
      };
      
      await setDoc(userRef, initialProfile);
      
      res.json({
        uid: user.uid,
        name,
        email,
        hasSeenTutorial: false,
        points: 0,
        isPremium: false,
        pointsLimit: 2000
      });
    } catch (error: any) {
      console.error('Register error:', error);
      let userMessage = 'Error al registrar usuario';
      if (error.code === 'auth/email-already-in-use' || error.message?.includes('email-already-in-use')) {
        userMessage = 'Este correo electrónico ya está registrado. Intenta iniciar sesión.';
      } else if (error.code === 'auth/weak-password' || error.message?.includes('weak-password')) {
        userMessage = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
      } else if (error.code === 'auth/invalid-email' || error.message?.includes('invalid-email')) {
        userMessage = 'El correo electrónico no tiene un formato válido.';
      } else if (error.code === 'auth/operation-not-allowed' || error.message?.includes('operation-not-allowed')) {
        userMessage = '⚠️ El método de inicio de sesión con Correo/Contraseña está desactivado en Firebase. Debes ir a tu Consola de Firebase -> Authentication -> Sign-in-method y habilitar "Correo electrónico/contraseña".';
      } else if (error.message) {
        userMessage = error.message;
      }
      res.status(400).json({ error: userMessage });
    }
  });

  // Handle login
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        res.json({ uid: user.uid, ...docSnap.data() });
      } else {
        const initialProfile = {
          name: user.displayName || 'Jugador',
          email: user.email || email,
          hasSeenTutorial: false,
          points: 0,
          isPremium: false,
          pointsLimit: 2000,
          createdAt: serverTimestamp()
        };
        await setDoc(userRef, initialProfile);
        res.json({ uid: user.uid, ...initialProfile });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let userMessage = 'Error al iniciar sesión';
      if (error.code === 'auth/invalid-credential' || error.message?.includes('invalid-credential') || error.message?.includes('user-not-found') || error.message?.includes('wrong-password')) {
        userMessage = 'El correo electrónico o la contraseña son incorrectos. Por favor, verifícalos o regístrate si no tienes cuenta.';
      } else if (error.code === 'auth/invalid-email' || error.message?.includes('invalid-email')) {
        userMessage = 'El correo electrónico no tiene un formato válido.';
      } else if (error.code === 'auth/user-disabled' || error.message?.includes('user-disabled')) {
        userMessage = 'Esta cuenta ha sido inhabilitada.';
      } else if (error.code === 'auth/operation-not-allowed' || error.message?.includes('operation-not-allowed')) {
        userMessage = '⚠️ El método de inicio de sesión con Correo/Contraseña está desactivado en Firebase. Debes ir a tu Consola de Firebase -> Authentication -> Sign-in-method y habilitar "Correo electrónico/contraseña".';
      } else if (error.message) {
        userMessage = error.message;
      }
      res.status(400).json({ error: userMessage });
    }
  });

  // Handle password reset
  app.post('/api/auth/reset-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'El correo electrónico es requerido' });
    }
    try {
      await sendPasswordResetEmail(auth, email);
      res.json({ 
        success: true, 
        message: '¡Enlace enviado con éxito! ⚠️ IMPORTANTE: Debido a las políticas de seguridad de Gmail y otros proveedores, estos correos de recuperación de Firebase de prueba suelen ser filtrados de inmediato. Por favor, REVISA TU CARPETA DE SPAM (Correo no deseado) y busca un remitente como "noreply@gen-lang-client-..." o similar. Si has desplegado en pumtap.com con tu propio Firebase, recuerda configurar y autenticar tu dominio personalizado en la sección de plantillas de autenticación en la Consola de Firebase para evitar este bloqueo.' 
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      let userMessage = 'Error al enviar el correo de restablecimiento';
      if (error.code === 'auth/invalid-email' || error.message?.includes('invalid-email')) {
        userMessage = 'El correo electrónico no tiene un formato válido.';
      } else if (error.code === 'auth/user-not-found' || error.message?.includes('user-not-found')) {
        userMessage = 'No existe ningún usuario registrado con este correo electrónico.';
      } else if (error.message) {
        userMessage = error.message;
      }
      res.status(400).json({ error: userMessage });
    }
  });

  // Get active session profile
  app.get('/api/user/profile/:uid', async (req, res) => {
    const { uid } = req.params;
    try {
      // Sync premium/extension purchases with Stripe in background
      await syncProcessedStripeSessions(uid);

      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        res.json({ uid, ...docSnap.data() });
      } else {
        res.status(404).json({ error: 'Usuario no encontrado' });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update points
  app.post('/api/user/update-points', async (req, res) => {
    const { uid, points, pointsPerGame } = req.body;
    if (!uid || typeof points !== 'number') {
      return res.status(400).json({ error: 'UID y puntos requeridos' });
    }
    try {
      const userRef = doc(db, 'users', uid);
      const updateData: any = { points };
      if (pointsPerGame) {
        updateData.pointsPerGame = pointsPerGame;
      }
      await updateDoc(userRef, updateData);
      res.json({ success: true, points, pointsPerGame });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get users ranking
  app.get('/api/user/ranking', async (req, res) => {
    try {
      const usersRef = collection(db, 'users');
      let querySnapshot;
      try {
        const q = query(usersRef, orderBy('points', 'desc'), limit(50));
        querySnapshot = await getDocs(q);
      } catch (err) {
        console.warn('Query sorted failed, falling back to unsorted fetch:', err);
        querySnapshot = await getDocs(usersRef);
      }

      const ranking: any[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        ranking.push({
          uid: docSnap.id,
          name: data.name || 'Jugador Anónimo',
          points: data.points || 0,
          isPremium: !!data.isPremium
        });
      });

      // Ensure stable sorting descending
      ranking.sort((a, b) => b.points - a.points);
      
      res.json({ success: true, ranking: ranking.slice(0, 50) });
    } catch (error: any) {
      console.error('Error fetching ranking:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Mark tutorial as seen
  app.post('/api/user/seen-tutorial', async (req, res) => {
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ error: 'UID requerido' });
    }
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { hasSeenTutorial: true });
      res.json({ success: true, hasSeenTutorial: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Purchase premium
  app.post('/api/user/buy-premium', async (req, res) => {
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ error: 'UID requerido' });
    }
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { isPremium: true });
      res.json({ success: true, isPremium: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Purchase points limit extension
  app.post('/api/user/buy-limit-extension', async (req, res) => {
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ error: 'UID requerido' });
    }
    try {
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      const data = docSnap.data();
      const currentLimit = typeof data.pointsLimit === 'number' ? data.pointsLimit : 2000;
      const newLimit = currentLimit + 2000;
      await updateDoc(userRef, { pointsLimit: newLimit });
      res.json({ success: true, pointsLimit: newLimit });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Create Stripe Checkout Session
  app.post('/api/stripe/create-checkout', async (req, res) => {
    const { uid, type } = req.body;
    if (!uid || !type) {
      return res.status(400).json({ error: 'UID y tipo de compra (premium | extension) requeridos' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const origin = req.get('origin') || `${protocol}://${host}`;

    const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;

    if (!hasStripeKey) {
      // Fallback mode: Stripe not configured yet - simulate direct checkout
      console.warn('STRIPE_SECRET_KEY no está configurada. Usando el simulador de pago inmediato para pruebas.');
      return res.json({
        success: false,
        error: 'stripe_not_configured',
        message: 'No se ha configurado la variable de entorno STRIPE_SECRET_KEY en AI Studio. Se activará el simulador gratuito para probar de inmediato sin configurar Stripe.',
      });
    }

    try {
      const stripe = getStripe();
      
      const title = type === 'premium' 
        ? 'Pumtap Premium - Puntos Infinitos' 
        : 'Ampliación +2.000 Puntos (Pumtap)';
        
      const amount = type === 'premium' ? 299 : 100; // 2.99 EUR or 1.00 EUR

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: title,
                description: type === 'premium' 
                  ? 'Acceso ilimitado a todos los juegos, sin límites de puntos diarios. Desbloquea el Modo Infantil.' 
                  : 'Suma 2,000 puntos adicionales al límite diario de juego de tu cuenta.',
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        metadata: {
          uid,
          type,
        },
        success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/`,
      });

      res.json({ success: true, url: session.url });
    } catch (err: any) {
      console.error('Error al crear sesión de cobro con Stripe:', err);
      res.status(500).json({ error: err.message || 'Error del servidor Stripe' });
    }
  });

  // Verify Stripe Checkout Session
  app.post('/api/stripe/verify-session', async (req, res) => {
    const { session_id } = req.body;
    if (!session_id) {
      return res.status(400).json({ error: 'ID de sesión requerido' });
    }

    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.payment_status === 'paid') {
        const uid = session.metadata?.uid;
        const type = session.metadata?.type;

        if (!uid || !type) {
          return res.status(400).json({ error: 'Metadata de sesión dañada o incompleta' });
        }

        const userRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          return res.status(404).json({ error: 'Usuario destinatario no encontrado' });
        }

        let updatedData: any = {};
        if (type === 'premium') {
          updatedData.isPremium = true;
        } else if (type === 'extension') {
          const currentLimit = docSnap.data().pointsLimit || 2000;
          updatedData.pointsLimit = currentLimit + 2000;
        }

        // Add to processedSessions to keep consistency with background sync
        const processedSessions = docSnap.data().processedSessions || [];
        if (!processedSessions.includes(session_id)) {
          updatedData.processedSessions = [...processedSessions, session_id];
        }

        await updateDoc(userRef, updatedData);
        
        // Fetch fresh state to return to client
        const finalSnap = await getDoc(userRef);
        res.json({ success: true, type, profile: { uid, ...finalSnap.data() } });
      } else {
        res.status(400).json({ error: 'El pago no ha sido completado' });
      }
    } catch (err: any) {
      console.error('Error al verificar sesión de Stripe:', err);
      res.status(500).json({ error: err.message || 'Error de verificación de Stripe' });
    }
  });

  // --- VITE MIDDLEWARE ---
  const isProduction = process.env.NODE_ENV === 'production' || 
                       _dirname.includes('dist') || 
                       !fs.existsSync(path.join(process.cwd(), 'server.ts'));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, server.cjs lives in the dist folder, so _dirname is exactly the built dist folder containing index.html.
    const distPath = _dirname.includes('dist') ? _dirname : path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
