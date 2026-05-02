import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, MapPin, Star, Calendar as CalendarIcon, Clock, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function DoctorSearch() {
  const { user, profile } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingSymptoms, setBookingSymptoms] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'doctor'), where('isApproved', '==', true));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDoctors(docs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please login to book an appointment');
      return;
    }
    if (!bookingDate) {
      toast.error('Please select a date');
      return;
    }

    setIsBooking(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        patientId: user.uid,
        doctorId: selectedDoctor.id,
        patientName: user.displayName || user.email,
        doctorName: selectedDoctor.displayName,
        date: new Date(bookingDate).toISOString(),
        status: 'pending',
        symptoms: bookingSymptoms,
        createdAt: new Date().toISOString(),
      });
      toast.success('Appointment requested successfully!');
      setSelectedDoctor(null);
      setBookingDate('');
      setBookingSymptoms('');
    } catch (error: any) {
      toast.error('Failed to book appointment: ' + error.message);
    } finally {
      setIsBooking(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="mesh-glow p-2">
          <h1 className="text-4xl text-display text-text-main mb-3 font-semibold">Medical Specialists</h1>
          <p className="text-text-dim font-light tracking-wide max-w-xl">Direct access to our verified network of medical professionals and clinical experts.</p>
        </div>
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-0 bg-accent/3 blur-[20px] opacity-0 group-hover:opacity-100 transition-opacity" />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-accent w-5 h-5 z-10" />
          <Input 
            className="pl-14 h-16 glass border-black/5 text-text-main placeholder:text-text-dim/40 rounded-2xl focus:ring-1 focus:ring-accent/20 outline-none transition-all relative z-10 text-lg font-light shadow-sm" 
            placeholder="Search by name or specialty..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[450px] glass border border-black/5 rounded-[3rem] animate-pulse" />
          ))}
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="glass border-black/5 hover:border-accent/20 transition-all duration-700 rounded-[3rem] overflow-hidden group shadow-xl shadow-black/5">
              <div className="h-32 bg-black/[0.01] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.08),transparent_70%)] group-hover:scale-150 transition-transform duration-1000" />
                <div className="absolute -bottom-12 left-10">
                  <Avatar className="w-24 h-24 border-[6px] border-white shadow-2xl group-hover:scale-105 transition-transform duration-500">
                    <AvatarImage src={doctor.photoURL || ''} />
                    <AvatarFallback className="glass text-accent text-2xl font-bold border-black/5">
                      {doctor.displayName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <CardHeader className="pt-16 px-10">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-semibold text-text-main tracking-tight group-hover:text-accent transition-colors">Dr. {doctor.displayName}</CardTitle>
                    <Badge variant="outline" className="mt-3 glass border-accent/10 text-accent px-4 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold">
                      {doctor.specialty}
                    </Badge>
                  </div>
                  <div className="flex items-center text-accent gap-1.5 glass px-3 py-1 rounded-full border-black/5 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-bold tracking-tighter">4.9</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-10 pb-10">
                <p className="text-text-dim text-sm leading-relaxed font-light tracking-wide line-clamp-2 mb-8 italic text-serif">
                  "{doctor.bio || 'Experienced specialist dedicated to providing high-quality healthcare services to patients.'}"
                </p>
                <div className="space-y-4">
                  <div className="flex items-center text-text-dim text-[10px] uppercase tracking-[0.2em] font-bold">
                    <div className="w-8 h-8 glass rounded-lg flex items-center justify-center mr-4 border-black/5 group-hover:border-accent/20 transition-colors shadow-sm">
                      <MapPin className="w-4 h-4 text-accent" />
                    </div>
                    City Medical Center, NY
                  </div>
                  <div className="flex items-center text-text-dim text-[10px] uppercase tracking-[0.2em] font-bold">
                    <div className="w-8 h-8 glass rounded-lg flex items-center justify-center mr-4 border-black/5 group-hover:border-accent/20 transition-colors shadow-sm">
                      <Clock className="w-4 h-4 text-accent" />
                    </div>
                    Available: Mon - Fri
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-10 pb-10 pt-0">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-accent text-white hover:bg-accent/90 font-bold rounded-2xl h-14 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/20" onClick={() => setSelectedDoctor(doctor)}>
                      Book Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass border-black/5 text-text-main sm:max-w-[480px] rounded-[3rem] p-10 shadow-2xl">
                    <DialogHeader className="mb-8">
                      <DialogTitle className="text-serif italic text-3xl tracking-tight">Request Appointment</DialogTitle>
                      <DialogDescription className="text-text-dim font-light tracking-wide mt-2">
                        Initialize a verified appointment with Dr. {doctor.displayName}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-8 py-4">
                      <div className="grid gap-3">
                        <Label htmlFor="date" className="text-[10px] uppercase tracking-[0.3em] text-text-dim font-bold ml-1">Preferred Date & Time</Label>
                        <Input 
                          id="date" 
                          type="datetime-local" 
                          className="h-14 glass border-black/5 text-text-main focus:ring-accent/20 rounded-2xl px-6"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="symptoms" className="text-[10px] uppercase tracking-[0.3em] text-text-dim font-bold ml-1">Symptom Description</Label>
                        <textarea
                          id="symptoms"
                          className="w-full min-h-[140px] p-6 glass border-black/5 rounded-2xl text-text-main placeholder:text-text-dim/40 focus:ring-1 focus:ring-accent/20 outline-none transition-all resize-none text-sm font-light leading-relaxed"
                          placeholder="Briefly describe your symptoms..."
                          value={bookingSymptoms}
                          onChange={(e) => setBookingSymptoms(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter className="mt-8 gap-4">
                      <Button variant="ghost" className="text-text-dim hover:text-text-main hover:bg-black/5 rounded-xl h-12 font-bold text-[10px] uppercase tracking-widest" onClick={() => setSelectedDoctor(null)}>Cancel</Button>
                      <Button className="bg-accent text-white hover:bg-accent/90 font-bold px-10 h-12 rounded-xl shadow-lg shadow-accent/20" onClick={handleBooking} disabled={isBooking}>
                        {isBooking ? 'Processing...' : 'Confirm Request'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 glass border border-dashed border-black/10 rounded-[4rem] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.03),transparent_70%)]" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 glass border border-black/5 rounded-full mb-8 shadow-sm">
              <Search className="w-8 h-8 text-text-dim" />
            </div>
            <h3 className="text-2xl font-light text-text-main tracking-tight">No specialists found</h3>
            <p className="text-text-dim mt-3 font-light tracking-wide">Try adjusting your search parameters.</p>
            <Button variant="link" className="text-accent mt-6 font-bold uppercase tracking-widest text-[10px]" onClick={() => setSearchTerm('')}>Reset Search</Button>
          </div>
        </div>
      )}
    </div>
  );
}
