import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Activity,
  AlertCircle,
  Plus,
  Search,
  Stethoscope,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  date: string;
  status: string;
  symptoms?: string;
}

export default function Dashboard() {
  const { user, profile, isPatient, isDoctor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isPrescribing, setIsPrescribing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = isPatient 
      ? query(collection(db, 'appointments'), where('patientId', '==', user.uid))
      : query(collection(db, 'appointments'), where('doctorId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      setAppointments(docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isPatient]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
      toast.success(`Appointment ${status}`);
    } catch (error: any) {
      toast.error('Failed to update status: ' + error.message);
    }
  };

  const handlePrescribe = async () => {
    if (!selectedAppointment) return;
    setIsPrescribing(true);
    try {
      await addDoc(collection(db, 'prescriptions'), {
        appointmentId: selectedAppointment.id,
        patientId: selectedAppointment.patientId,
        doctorId: user?.uid,
        diagnosis,
        medications: medications.split(',').map(m => m.trim()),
        instructions,
        createdAt: new Date().toISOString(),
      });
      
      await updateDoc(doc(db, 'appointments', selectedAppointment.id), { status: 'completed' });
      
      toast.success('Prescription issued successfully!');
      setSelectedAppointment(null);
      setDiagnosis('');
      setMedications('');
      setInstructions('');
    } catch (error: any) {
      toast.error('Failed to issue prescription: ' + error.message);
    } finally {
      setIsPrescribing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Activity className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="mesh-glow p-2">
          <h1 className="text-4xl text-display text-text-main font-semibold">
            {isPatient ? 'Patient Portal' : isDoctor ? 'Doctor Portal' : 'Admin Portal'}
          </h1>
          <p className="text-text-dim mt-3 font-light tracking-wide">Welcome back, <span className="text-accent font-bold">{profile?.displayName || user?.email}</span></p>
        </div>
        <div className="px-6 py-3 glass rounded-2xl text-[10px] uppercase tracking-[0.3em] text-text-dim flex items-center gap-3 border-black/5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.6)]" />
          Node: {user?.uid.slice(0, 8).toUpperCase()} • Active Session
        </div>
      </header>

      {!profile?.isApproved && isDoctor && (
        <div className="glass border border-amber-500/10 rounded-[2.5rem] p-10 flex items-start gap-8 relative overflow-hidden group shadow-xl shadow-amber-500/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/3 blur-[40px]" />
          <div className="w-14 h-14 bg-amber-500/5 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/10">
            <AlertCircle className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em] mb-3">Verification Protocol Pending</h3>
            <p className="text-sm text-text-dim leading-relaxed max-w-2xl font-light">Your clinical credentials are currently undergoing verification by our administrative node. Full diagnostic capabilities will be unlocked upon approval.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-12">
          <Card className="glass border-black/5 rounded-[3rem] overflow-hidden shadow-2xl shadow-black/5">
            <CardHeader className="p-10 border-b border-black/5 bg-black/[0.01]">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-[10px] uppercase tracking-[0.4em] text-text-dim font-bold mb-2">Schedule</CardTitle>
                  <h3 className="text-2xl font-semibold text-text-main tracking-tight">Upcoming Appointments</h3>
                </div>
                <Badge variant="outline" className="glass border-accent/20 text-accent px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold">
                  {appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[520px]">
                {loading ? (
                  <div className="p-10 space-y-8">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full bg-black/[0.02] rounded-[2rem]" />)}
                  </div>
                ) : appointments.length > 0 ? (
                  <div className="divide-y divide-black/5">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="p-10 flex items-center justify-between hover:bg-black/[0.01] transition-all duration-500 group cursor-pointer">
                        <div className="flex items-center gap-8">
                          <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center border-black/5 group-hover:border-accent/30 group-hover:scale-110 transition-all duration-500 shadow-sm">
                            <Calendar className="w-7 h-7 text-accent" />
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold text-text-main tracking-tight group-hover:text-accent transition-colors">
                              {isPatient ? `Dr. ${appointment.doctorName}` : appointment.patientName}
                            </h4>
                            <p className="text-sm text-text-dim mt-2 font-light tracking-wide">{appointment.symptoms || 'General Consultation'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-10">
                          <div className="text-right hidden sm:block">
                            <p className="text-base font-semibold text-text-main tracking-tight">{format(new Date(appointment.date), 'MMM dd, yyyy')}</p>
                            <p className="text-[10px] text-text-dim uppercase tracking-[0.2em] mt-2 font-bold">{format(new Date(appointment.date), 'hh:mm a')}</p>
                          </div>
                          <div className={`
                            px-6 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold border shadow-sm
                            ${appointment.status === 'confirmed' ? 'bg-accent/5 text-accent border-accent/10' :
                              appointment.status === 'pending' ? 'bg-amber-500/5 text-amber-500 border-amber-500/10' :
                              'bg-black/5 text-text-dim border-black/5'}
                          `}>
                            {appointment.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-32 text-center">
                    <div className="w-24 h-24 glass rounded-full flex items-center justify-center mx-auto mb-10 border-black/5 shadow-sm">
                      <Calendar className="w-10 h-10 text-black/5" />
                    </div>
                    <p className="text-text-dim text-sm font-light tracking-[0.3em] uppercase">No active schedules found</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Stats Grid - Modern Bento Style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { label: "Health Index", value: "92%", icon: Activity, trend: "+2.4%" },
              { label: "AI Checks", value: "12", icon: Stethoscope, trend: "Stable" },
              { label: "Prescriptions", value: "04", icon: ShieldCheck, trend: "Updated" }
            ].map((stat, i) => (
              <Card key={i} className="glass border-black/5 p-10 rounded-[2.5rem] hover-glow group relative overflow-hidden shadow-xl shadow-black/5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/3 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center border-black/5 group-hover:border-accent/20 transition-colors shadow-sm">
                    <stat.icon className="w-6 h-6 text-accent" />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-accent font-bold px-3 py-1 bg-accent/5 rounded-full border border-accent/10">{stat.trend}</span>
                </div>
                <p className="text-5xl text-display text-text-main mb-2 font-semibold">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-[0.4em] text-text-dim font-bold">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-12">
          <Card 
            className="glass border-accent/10 rounded-[3rem] p-12 overflow-hidden relative group cursor-pointer shadow-2xl shadow-accent/5" 
            onClick={() => navigate('/symptoms')}
          >
            <div className="absolute inset-0 bg-accent/3 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/5 blur-[100px] group-hover:bg-accent/10 transition-all duration-700" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mb-10 shadow-xl shadow-accent/30">
                <Stethoscope className="text-white w-7 h-7" />
              </div>
              <h3 className="text-[10px] uppercase tracking-[0.4em] text-accent font-bold mb-6">Neural Diagnostic</h3>
              <p className="text-3xl font-semibold text-text-main leading-tight mb-10 tracking-tight">Analyze your symptoms with our AI engine.</p>
              <Button className="w-full bg-accent text-white hover:bg-accent/90 h-16 font-bold rounded-2xl transition-all group-hover:scale-[1.02] shadow-lg shadow-accent/20">
                Start Analysis
                <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </Card>

          <Card className="glass border-black/5 rounded-[3rem] p-10 shadow-xl shadow-black/5">
            <CardHeader className="p-0 mb-10">
              <CardTitle className="text-[10px] uppercase tracking-[0.4em] text-text-dim font-bold">Quick Protocols</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-5">
              {isPatient && (
                <Button variant="outline" className="w-full justify-start glass border-black/5 text-text-main hover:bg-black/5 rounded-2xl h-16 group shadow-sm" onClick={() => navigate('/doctors')}>
                  <div className="w-10 h-10 glass rounded-xl flex items-center justify-center mr-5 border-black/5 group-hover:border-accent/20 transition-colors">
                    <Search className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-base font-semibold tracking-tight">Find Specialist</span>
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start glass border-black/5 text-text-main hover:bg-black/5 rounded-2xl h-16 group shadow-sm" onClick={() => navigate('/profile')}>
                <div className="w-10 h-10 glass rounded-xl flex items-center justify-center mr-5 border-black/5 group-hover:border-accent/20 transition-colors">
                  <User className="w-5 h-5 text-accent" />
                </div>
                <span className="text-base font-semibold tracking-tight">Access Profile</span>
              </Button>
            </CardContent>
          </Card>

          <div className="p-10 glass border border-error/10 rounded-[3rem] relative overflow-hidden group shadow-xl shadow-error/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-error/3 blur-[50px]" />
            <div className="flex items-center gap-4 mb-8">
              <div className="w-2 h-2 rounded-full bg-error animate-ping shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
              <p className="text-[10px] font-bold text-error uppercase tracking-[0.4em]">Critical Protocol</p>
            </div>
            <p className="text-sm text-text-dim leading-relaxed mb-10 font-light tracking-wide">
              Immediate intervention required for severe respiratory distress or cardiac anomalies.
            </p>
            <Button variant="destructive" className="w-full bg-error hover:bg-error/90 text-white text-sm font-bold h-14 rounded-2xl shadow-lg shadow-error/20">
              Emergency Uplink
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
