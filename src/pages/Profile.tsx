import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Stethoscope, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, profile, isDoctor } = useAuth();
  const [name, setName] = useState(profile?.displayName || user?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [specialty, setSpecialty] = useState(profile?.specialty || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        displayName: name,
        bio,
        specialty: isDoctor ? specialty : null,
        // Ensure critical fields exist if document is being created for the first time
        uid: user.uid,
        email: user.email,
        role: profile?.role || 'patient',
        isApproved: profile?.isApproved ?? (profile?.role === 'doctor' ? false : true),
      }, { merge: true });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      <header className="mesh-glow p-2">
        <h1 className="text-4xl text-display text-text-main mb-3 font-semibold">User Profile</h1>
        <p className="text-text-dim font-light tracking-wide max-w-xl">Manage your personal information and professional credentials.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Profile Card */}
        <div className="lg:col-span-4">
          <Card className="glass border-black/5 rounded-[3rem] overflow-hidden shadow-2xl shadow-black/5 sticky top-24">
            <div className="h-32 bg-black/[0.01] relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.08),transparent_70%)]" />
            </div>
            <CardContent className="pt-0 text-center relative px-10 pb-12">
              <Avatar className="w-32 h-32 mx-auto -mt-16 mb-6 border-[6px] border-white shadow-2xl">
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback className="text-4xl glass text-accent font-bold border-black/5">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-semibold text-text-main tracking-tight">{profile?.displayName || 'User'}</h2>
              <p className="text-text-dim text-xs mt-3 mb-8 font-light tracking-wide">{user?.email}</p>
              
              <div className="flex flex-col gap-4">
                <Badge variant="outline" className="glass border-accent/10 text-accent uppercase tracking-[0.3em] text-[10px] px-6 py-2 rounded-full font-bold w-fit mx-auto shadow-sm">
                  {profile?.role || 'Patient'}
                </Badge>
                
                {isDoctor && !profile?.isApproved && (
                  <div className="p-4 glass border border-amber-500/10 rounded-2xl text-[9px] text-amber-500 font-bold uppercase tracking-[0.2em] animate-pulse shadow-sm shadow-amber-500/5">
                    Verification Pending
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Form */}
        <div className="lg:col-span-8">
          <Card className="glass border-black/5 rounded-[3rem] overflow-hidden shadow-2xl shadow-black/5">
            <CardHeader className="p-10 border-b border-black/5 bg-black/[0.01]">
              <CardTitle className="text-[10px] uppercase tracking-[0.4em] text-text-dim font-bold">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-10">
              <form onSubmit={handleUpdate} className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-[10px] uppercase tracking-[0.3em] text-text-dim font-bold ml-1">Display Name</Label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-accent/3 blur-[15px] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-accent/40 relative z-10" />
                      <Input id="name" className="pl-14 glass border-black/5 text-text-main h-14 rounded-2xl focus:ring-accent/20 relative z-10 font-light shadow-sm" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.3em] text-text-dim font-bold ml-1">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim/40" />
                      <Input id="email" className="pl-14 glass border-black/5 text-text-dim/40 h-14 rounded-2xl cursor-not-allowed font-light shadow-sm" value={user?.email || ''} disabled />
                    </div>
                  </div>
                </div>

                {isDoctor && (
                  <div className="space-y-3">
                    <Label htmlFor="specialty" className="text-[10px] uppercase tracking-[0.3em] text-text-dim font-bold ml-1">Medical Specialization</Label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-accent/3 blur-[15px] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Stethoscope className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-accent/40 relative z-10" />
                      <Input id="specialty" className="pl-14 glass border-black/5 text-text-main h-14 rounded-2xl focus:ring-accent/20 relative z-10 font-light shadow-sm" value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="bio" className="text-[10px] uppercase tracking-[0.3em] text-text-dim font-bold ml-1">Professional Bio</Label>
                  <textarea
                    id="bio"
                    className="w-full min-h-[200px] p-6 glass border-black/5 rounded-[2rem] text-text-main placeholder:text-text-dim/40 text-lg font-light leading-relaxed focus:ring-1 focus:ring-accent/20 outline-none transition-all resize-none italic text-serif shadow-sm"
                    placeholder="Describe your medical background..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div className="flex justify-end pt-6">
                  <Button type="submit" className="bg-accent text-white hover:bg-accent/90 font-bold px-12 h-14 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/20" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-3 h-5 w-5" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
