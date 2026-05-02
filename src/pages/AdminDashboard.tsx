import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ShieldCheck, 
  Users, 
  Stethoscope, 
  CheckCircle2, 
  XCircle, 
  Activity,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;

    // Fetch pending doctors
    const q = query(collection(db, 'users'), where('role', '==', 'doctor'), where('isApproved', '==', false));
    const unsubDoctors = onSnapshot(q, (snapshot) => {
      setPendingDoctors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch stats
    const fetchStats = async () => {
      const patients = await getDocs(query(collection(db, 'users'), where('role', '==', 'patient')));
      const doctors = await getDocs(query(collection(db, 'users'), where('role', '==', 'doctor')));
      const appointments = await getDocs(collection(db, 'appointments'));
      
      setStats({
        totalPatients: patients.size,
        totalDoctors: doctors.size,
        totalAppointments: appointments.size
      });
      setLoading(false);
    };

    fetchStats();
    return () => unsubDoctors();
  }, [isAdmin]);

  const approveDoctor = async (id: string) => {
    try {
      await updateDoc(doc(db, 'users', id), { isApproved: true });
      toast.success('Doctor approved successfully');
    } catch (error: any) {
      toast.error('Failed to approve: ' + error.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-slate-500">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="mesh-glow p-2">
          <h1 className="text-4xl text-display text-text-main flex items-center gap-6 font-semibold">
            <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center border-accent/10 shadow-xl shadow-accent/5">
              <ShieldCheck className="text-accent w-8 h-8" />
            </div>
            Admin Control Center
          </h1>
          <p className="text-text-dim mt-4 font-light tracking-wide max-w-xl">Global platform orchestration and system health monitoring.</p>
        </div>
        <div className="px-6 py-3 glass rounded-2xl text-[10px] text-text-dim uppercase tracking-[0.3em] flex items-center gap-3 border-black/5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.6)]" />
          System Status: Optimal
        </div>
      </header>

      {/* Stats Grid - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { label: 'Total Patients', value: stats.totalPatients, icon: Users, trend: 'Registered Nodes' },
          { label: 'Total Doctors', value: stats.totalDoctors, icon: Stethoscope, trend: 'Clinical Assets' },
          { label: 'Total Appointments', value: stats.totalAppointments, icon: BarChart3, trend: 'Active Flows' }
        ].map((stat, i) => (
          <Card key={i} className="glass border-black/5 p-10 hover-glow group relative overflow-hidden rounded-[3rem] shadow-xl shadow-black/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/3 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-text-dim mb-4 font-bold">{stat.label}</p>
                <p className="text-5xl text-display text-text-main tracking-tighter font-semibold">{stat.value}</p>
                <p className="text-[8px] uppercase tracking-[0.3em] text-accent mt-4 font-bold">{stat.trend}</p>
              </div>
              <div className="w-16 h-16 glass border border-black/5 rounded-[1.5rem] flex items-center justify-center group-hover:border-accent/20 group-hover:scale-110 transition-all duration-500 shadow-sm">
                <stat.icon className="w-7 h-7 text-accent" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-12">
        <Card className="glass border-black/5 rounded-[3.5rem] overflow-hidden shadow-2xl shadow-black/5">
          <CardHeader className="p-12 border-b border-black/5 bg-black/[0.01]">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-[10px] uppercase tracking-[0.4em] text-text-dim font-bold mb-2">Clinical Verification Queue</CardTitle>
                <CardDescription className="text-text-dim font-light tracking-wide">Review credentials for incoming medical professionals.</CardDescription>
              </div>
              <Badge variant="outline" className="glass border-accent/10 text-accent px-6 py-2 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold">
                {pendingDoctors.length} Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {pendingDoctors.length > 0 ? (
              <div className="divide-y divide-black/5">
                {pendingDoctors.map((doctor) => (
                  <div key={doctor.id} className="p-12 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:bg-black/[0.01] transition-all duration-500 group">
                    <div className="flex items-center gap-8">
                      <Avatar className="w-20 h-20 border-[4px] border-white shadow-xl group-hover:scale-110 transition-transform duration-500">
                        <AvatarImage src={doctor.photoURL} />
                        <AvatarFallback className="glass text-accent font-bold border-black/5">{doctor.displayName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-2xl font-semibold text-text-main tracking-tight group-hover:text-accent transition-colors">Dr. {doctor.displayName}</h3>
                        <p className="text-sm text-text-dim mt-2 font-light tracking-wide">
                          {doctor.email} • <span className="text-accent font-bold uppercase tracking-[0.2em] text-[10px] ml-2">{doctor.specialty}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <Button 
                        className="bg-accent text-white hover:bg-accent/90 font-bold h-14 px-10 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/20" 
                        onClick={() => approveDoctor(doctor.id)}
                      >
                        <CheckCircle2 className="w-5 h-5 mr-3" />
                        Authorize
                      </Button>
                      <Button 
                        variant="outline" 
                        className="glass border-black/5 text-text-dim hover:text-error hover:border-error/20 hover:bg-error/5 h-14 px-10 rounded-2xl transition-all shadow-sm"
                      >
                        <XCircle className="w-5 h-5 mr-3" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-32 text-center">
                <div className="w-24 h-24 glass border border-black/5 rounded-full flex items-center justify-center mx-auto mb-10 shadow-sm">
                  <CheckCircle2 className="w-10 h-10 text-black/5" />
                </div>
                <p className="text-text-dim text-sm font-light tracking-[0.3em] uppercase">Queue Clear • All Nodes Verified</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
