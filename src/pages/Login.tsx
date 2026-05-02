import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stethoscope, Chrome } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const [searchParams] = useSearchParams();
  const isSignupInitial = searchParams.get('signup') === 'true';
  const [isSignup, setIsSignup] = useState(isSignupInitial);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email,
          displayName: name,
          role,
          specialty: role === 'doctor' ? specialty : null,
          isApproved: role === 'doctor' ? false : true,
          createdAt: new Date().toISOString(),
        });
        
        toast.success('Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Logged in successfully!');
      }
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userRef = doc(db, 'users', result.user.uid);
      
      // Use setDoc with { merge: true } to avoid getDoc check if we just want to ensure profile exists
      // We set foundational fields only if they don't exist
      await setDoc(userRef, {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        // We don't overwrite role if it already exists, merge: true handles this if we don't include role
        // However, if it's the first time, we want role: 'patient'. 
        // We can check if doc exists or just use a default role.
      }, { merge: true });

      // Check if role is missing and set it
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists() || !userSnap.data().role) {
        await setDoc(userRef, { 
          role: 'patient',
          isApproved: true,
          createdAt: new Date().toISOString()
        }, { merge: true });
      }
      
      toast.success('Authenticated successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-bg-dark relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-dark border-white/5 shadow-2xl rounded-[3rem] overflow-hidden">
          <CardHeader className="space-y-4 text-center p-10 pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 glass border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl group hover:border-accent/50 transition-all duration-500 hover:scale-110">
                <Stethoscope className="text-accent w-8 h-8" />
              </div>
            </div>
            <div>
              <CardTitle className="text-4xl text-display text-text-main tracking-tight">
                {isSignup ? 'Initialize' : 'Authenticate'}
              </CardTitle>
              <CardDescription className="text-text-dim/60 text-sm font-light tracking-wide mt-2">
                {isSignup 
                  ? 'Join the neural-verified healthcare network.' 
                  : 'Access your clinical diagnostic portal.'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            <form onSubmit={handleAuth} className="space-y-6">
              {isSignup && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-text-dim text-[10px] uppercase tracking-[0.3em] font-bold ml-1">Full Identity</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. Alexander Pierce" 
                      required 
                      className="glass border-white/5 text-text-main placeholder:text-text-dim/20 h-14 rounded-2xl focus:ring-1 focus:ring-accent/30 px-6 font-light"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-text-dim text-[10px] uppercase tracking-[0.3em] font-bold ml-1">Protocol Role</Label>
                    <Select value={role} onValueChange={(v: any) => setRole(v)}>
                      <SelectTrigger className="glass border-white/5 text-text-main h-14 rounded-2xl px-6 font-light">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="glass-dark border-white/10 text-text-main rounded-2xl">
                        <SelectItem value="patient">Patient Node</SelectItem>
                        <SelectItem value="doctor">Medical Specialist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {role === 'doctor' && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="specialty" className="text-text-dim text-[10px] uppercase tracking-[0.3em] font-bold ml-1">Clinical Specialty</Label>
                      <Input 
                        id="specialty" 
                        placeholder="e.g. Neurosurgeon" 
                        required 
                        className="glass border-white/5 text-text-main placeholder:text-text-dim/20 h-14 rounded-2xl focus:ring-1 focus:ring-accent/30 px-6 font-light"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-text-dim text-[10px] uppercase tracking-[0.3em] font-bold ml-1">Neural ID (Email)</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@medflow.ai" 
                  required 
                  className="glass border-white/5 text-text-main placeholder:text-text-dim/20 h-14 rounded-2xl focus:ring-1 focus:ring-accent/30 px-6 font-light"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-text-dim text-[10px] uppercase tracking-[0.3em] font-bold ml-1">Access Key</Label>
                  {!isSignup && (
                    <Button variant="link" className="px-0 font-bold text-[9px] text-accent uppercase tracking-[0.2em] h-auto hover:no-underline opacity-60 hover:opacity-100 transition-opacity">
                      Lost Key?
                    </Button>
                  )}
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  className="glass border-white/5 text-text-main h-14 rounded-2xl focus:ring-1 focus:ring-accent/30 px-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-accent text-bg-dark hover:bg-accent/90 font-bold h-14 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(45,212,191,0.2)]" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-bg-dark/20 border-t-bg-dark rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (isSignup ? 'Initialize Account' : 'Authenticate')}
              </Button>
            </form>
            
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-[0.4em] font-bold">
                <span className="bg-[#0c0c0e] px-4 text-text-dim/40">Secure Gateway</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full glass border-white/5 text-text-main hover:bg-white/5 h-14 rounded-2xl group transition-all" onClick={handleGoogleSignIn}>
              <Chrome className="mr-3 h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
              Continue with Google
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center gap-3 text-[10px] uppercase tracking-[0.2em] text-text-dim/60 p-10 pt-0">
            {isSignup ? 'Already verified?' : "New Node?"}
            <button 
              className="font-bold text-accent hover:text-accent/80 transition-colors"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? 'Authenticate' : 'Initialize'}
            </button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
