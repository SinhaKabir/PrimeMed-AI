import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ai, buildSymptomCheckerPrompt } from '../lib/gemini';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Stethoscope, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ArrowRight,
  Loader2,
  RefreshCw,
  Activity,
  FileText,
  Upload,
  X,
  Pill,
  Languages,
  ActivitySquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface AnalysisResult {
  possibilities: {
    condition: string;
    confidence: number;
    explanation: string;
  }[];
  recommendation: string;
  isEmergency: boolean;
  emergencyAction: string | null;
  reportAnalysis?: {
    summary: string | null;
    keyFindings: string[];
    suggestedMedicines: string[];
  };
}

const TRANSLATIONS = {
  en: {
    title: "PrimeMed Diagnostic Engine",
    subtitle: "Describe your symptoms or upload a doctor's report for a comprehensive AI analysis and medical guidance.",
    moduleTitle: "AI Intelligence Module v4.2",
    moduleDesc: "Provide a detailed description of your symptoms, including duration and intensity.",
    languageLabel: "Output Language",
    severityLabel: "Perceived Severity",
    symptomLabel: "Symptom Description",
    symptomPlaceholder: "e.g. Persistent headache for 3 days, accompanied by nausea...",
    reportLabel: "Doctor Report (Optional)",
    uploadClick: "Click to upload report",
    uploadLimit: "PDF, PNG, JPG (MAX. 5MB)",
    disclaimerInfo: "Our AI analyzes your symptoms and reports against medical databases for informational purposes. Always consult a doctor for professional diagnosis and before taking any medication.",
    analyzeBtn: "Start Analysis",
    analyzingBtn: "Analyzing Medical Data...",
    criticalAlert: "Critical Anomaly Detected",
    emergencyBtn: "Emergency Uplink",
    reportAnalysisTitle: "Report Analysis",
    reportAnalysisDesc: "AI interpretation of your uploaded medical document.",
    summaryFindings: "Summary & Findings",
    suggestedMeds: "Suggested Medications",
    medWarning: "Warning: Consult your physician before starting any medication. Do not self-medicate based solely on AI suggestions.",
    noMeds: "No specific medications suggested for this analysis.",
    patternCorrelation: "Pattern Correlation",
    conditionLabel: "Condition",
    confidenceLabel: "Confidence",
    aiProtocol: "AI Protocol",
    matchSpecialist: "Match Specialist",
    resetBtn: "Reset Diagnostic",
    askSeverityTitle: "Severity Assessment",
    askSeverityDesc: "How severe are your symptoms right now?",
    severityNormal: "Normal / Mild",
    severityMedium: "Moderate",
    severityCritical: "Critical / Severe",
    confirmAnalyzeBtn: "Confirm & Analyze",
    cancelBtn: "Cancel",
    errorRequired: "Please enter symptoms or upload a report.",
    errorSize: "File size must be less than 5MB",
    successMsg: "Analysis complete",
    errorMsg: "Failed to analyze. Please try again."
  },
  bn: {
    title: "প্রাইমমেড ডায়াগনস্টিক ইঞ্জিন",
    subtitle: "আপনার উপসর্গগুলো বর্ণনা করুন অথবা একটি নিবিড় এআই বিশ্লেষণ এবং চিকিৎসীয় নির্দেশনার জন্য ডাক্তারের রিপোর্ট আপলোড করুন।",
    moduleTitle: "এআই ইন্টেলিজেন্স মডিউল v4.2",
    moduleDesc: "আপনার উপসর্গের বিস্তারিত বিবরণ দিন, কত দিন ধরে এবং কতটা তীব্র তা উল্লেখ করুন।",
    languageLabel: "ফলাফলের ভাষা",
    severityLabel: "অনুভূত তীব্রতা",
    symptomLabel: "উপসর্গের বিবরণ",
    symptomPlaceholder: "যেমন: ৩ দিন ধরে একটানা মাথাব্যথা, সাথে বমি বমি ভাব...",
    reportLabel: "ডাক্তারের রিপোর্ট (ঐচ্ছিক)",
    uploadClick: "রিপোর্ট আপলোড করতে ক্লিক করুন",
    uploadLimit: "PDF, PNG, JPG (সর্বোচ্চ ৫ মেগাবাইট)",
    disclaimerInfo: "আমাদের এআই আপনার উপসর্গ এবং রিপোর্টগুলোকে চিকিৎসা ডেটাবেসের সাথে বিশ্লেষণ করে। যেকোনো ওষুধ সেবনের আগে এবং সঠিক রোগ নির্ণয়ের জন্য সর্বদা একজন ডাক্তারের পরামর্শ নিন।",
    analyzeBtn: "বিশ্লেষণ শুরু করুন",
    analyzingBtn: "মেডিকেল ডেটা বিশ্লেষণ করা হচ্ছে...",
    criticalAlert: "গুরুতর সমস্যা শনাক্ত করা হয়েছে",
    emergencyBtn: "জরুরী যোগাযোগ",
    reportAnalysisTitle: "রিপোর্ট বিশ্লেষণ",
    reportAnalysisDesc: "আপনার আপলোড করা মেডিকেল ডকুমেন্টের এআই পর্যালোচনা।",
    summaryFindings: "সারসংক্ষেপ এবং প্রাপ্ত তথ্য",
    suggestedMeds: "প্রস্তাবিত ঔষধ",
    medWarning: "সতর্কতা: কোনো ওষুধ সেবনের আগে চিকিৎসকের পরামর্শ নিন। শুধুমাত্র এআই এর পরামর্শের ওপর ভিত্তি করে নিজে নিজে ওষুধ সেবন করবেন না।",
    noMeds: "এই বিশ্লেষণের জন্য নির্দিষ্ট কোনো ঔষধের পরামর্শ দেওয়া হয়নি।",
    patternCorrelation: "লক্ষণ বিশ্লেষণ",
    conditionLabel: "রোগ",
    confidenceLabel: "নিশ্চয়তা",
    aiProtocol: "এআই নির্দেশিকা",
    matchSpecialist: "ডাক্তার খুঁজুন",
    resetBtn: "নতুন করে শুরু করুন",
    askSeverityTitle: "তীব্রতা মূল্যায়ন",
    askSeverityDesc: "বর্তমানে আপনার উপসর্গগুলো কতটা গুরুতর?",
    severityNormal: "স্বাভাবিক / হালকা",
    severityMedium: "মাঝারি",
    severityCritical: "গুরুতর / মারাত্মক",
    confirmAnalyzeBtn: "নিশ্চিত করুন এবং বিশ্লেষণ করুন",
    cancelBtn: "বাতিল করুন",
    errorRequired: "অনুগ্রহ করে আপনার উপসর্গ লিখুন অথবা রিপোর্ট আপলোড করুন।",
    errorSize: "ফাইলের আকার ৫ মেগাবাইটের কম হতে হবে",
    successMsg: "বিশ্লেষণ সম্পন্ন হয়েছে",
    errorMsg: "বিশ্লেষণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
  }
};

export default function SymptomChecker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [severityStage, setSeverityStage] = useState<'normal' | 'medium' | 'critical'>('normal');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isAskingSeverity, setIsAskingSeverity] = useState(false);

  const t = TRANSLATIONS[language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: {
        data: await base64EncodedDataPromise,
        mimeType: file.type,
      },
    };
  };

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim() && !file) {
      toast.error(t.errorRequired);
      return;
    }
    setIsAskingSeverity(true);
  };

  const handleActualAnalyze = async () => {
    setIsAskingSeverity(false);
    setLoading(true);
    try {
      const contents: any[] = [{ text: symptoms || "Analyze the provided medical report." }];
      
      if (file) {
        const filePart = await fileToGenerativePart(file);
        contents.push(filePart);
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: contents },
        config: {
          systemInstruction: buildSymptomCheckerPrompt(language, severityStage),
          responseMimeType: "application/json",
        },
      });

      const parsedResult = JSON.parse(response.text || '{}');
      setResult(parsedResult);
      toast.success(t.successMsg);
    } catch (error: any) {
      console.error(error);
      toast.error(t.errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSymptoms('');
    setResult(null);
    setFile(null);
    setFilePreview(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="mesh-glow p-2">
        <h1 className="text-4xl text-display text-text-main mb-3">{t.title}</h1>
        <p className="text-text-dim font-light tracking-wide max-w-2xl">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Input Section */}
        {!result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          >
            <Card className="glass-dark border-white/5 rounded-[3rem] p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[100px] group-hover:bg-accent/10 transition-colors duration-1000" />
              
              <CardHeader className="p-0 mb-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
                  <CardTitle className="text-[10px] uppercase tracking-[0.4em] text-text-dim font-bold">{t.moduleTitle}</CardTitle>
                </div>
                <CardDescription className="text-text-dim/60 font-light tracking-wide">
                  {t.moduleDesc}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <form onSubmit={handleAnalyze} className="space-y-8">
                  <div className="grid grid-cols-1 gap-8 bg-black/[0.01] p-6 rounded-3xl border border-black/5">
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase tracking-[0.2em] text-text-dim font-bold ml-1 flex items-center gap-2">
                        <Languages className="w-3 h-3 text-accent" /> {t.languageLabel}
                      </Label>
                      <Select value={language} onValueChange={(v: any) => setLanguage(v)} disabled={loading}>
                        <SelectTrigger className="glass border-black/5 text-text-main h-14 rounded-2xl">
                          <SelectValue placeholder="Select output language" />
                        </SelectTrigger>
                        <SelectContent className="glass-dark border-white/10 text-white rounded-2xl">
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="bn">Bengali (বাংলা)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="symptoms" className="text-[10px] uppercase tracking-[0.2em] text-text-dim font-bold ml-1">{t.symptomLabel}</Label>
                      <textarea
                        id="symptoms"
                        className="w-full min-h-[220px] p-6 glass border-black/5 rounded-[2rem] text-text-main placeholder:text-text-dim/40 focus:ring-1 focus:ring-accent/20 outline-none transition-all resize-none font-light leading-relaxed text-lg shadow-sm"
                        placeholder={t.symptomPlaceholder}
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase tracking-[0.2em] text-text-dim font-bold ml-1">{t.reportLabel}</Label>
                      <div className="relative min-h-[220px]">
                        {!filePreview ? (
                          <label className="flex flex-col items-center justify-center w-full h-[220px] glass border-2 border-dashed border-black/5 rounded-[2rem] cursor-pointer hover:bg-black/[0.02] transition-all group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-accent" />
                              </div>
                              <p className="mb-2 text-sm text-text-main font-medium">{t.uploadClick}</p>
                              <p className="text-xs text-text-dim">{t.uploadLimit}</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} disabled={loading} />
                          </label>
                        ) : (
                          <div className="relative h-[220px] glass border border-black/5 rounded-[2rem] overflow-hidden group">
                            {file?.type.startsWith('image/') ? (
                              <img src={filePreview} alt="Preview" className="w-full h-full object-cover opacity-40" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileText className="w-16 h-16 text-accent/20" />
                              </div>
                            )}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                              <FileText className="w-10 h-10 text-accent mb-3" />
                              <p className="text-sm font-bold text-text-main truncate max-w-full px-4">{file?.name}</p>
                              <p className="text-[10px] text-text-dim uppercase tracking-widest mt-1">{(file!.size / 1024 / 1024).toFixed(2)} MB</p>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/80 hover:bg-white text-error shadow-sm"
                                onClick={removeFile}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 glass rounded-2xl text-[10px] text-text-dim border-white/5 font-light leading-relaxed">
                    <div className="w-10 h-10 glass rounded-xl flex items-center justify-center shrink-0 border-white/10">
                      <Info className="w-5 h-5 text-accent" />
                    </div>
                    <p>{t.disclaimerInfo}</p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-accent text-bg-dark hover:bg-accent/90 h-16 font-bold text-lg rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_30px_rgba(45,212,191,0.2)]"
                    disabled={loading || !symptoms.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        {t.analyzingBtn}
                      </>
                    ) : (
                      <>
                        {t.analyzeBtn}
                        <ArrowRight className="ml-3 h-6 w-6" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
              {result.isEmergency && (
                <div className="p-8 glass-dark border border-error/20 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-error/5 animate-pulse" />
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center border-error/20">
                      <AlertTriangle className="w-7 h-7 text-error" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-error uppercase tracking-[0.4em] mb-1">{t.criticalAlert}</p>
                      <p className="text-sm text-text-dim font-light tracking-wide">{result.emergencyAction}</p>
                    </div>
                  </div>
                  <Button variant="destructive" className="bg-error hover:bg-error/90 text-white font-bold px-10 h-14 rounded-2xl shadow-[0_0_20px_rgba(244,63,94,0.3)] relative z-10">
                    {t.emergencyBtn}
                  </Button>
                </div>
              )}

              {result.reportAnalysis && (
                <Card className="glass border-accent/10 rounded-[3rem] overflow-hidden shadow-xl shadow-accent/5">
                  <CardHeader className="p-10 border-b border-black/5 bg-accent/[0.02]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center border-accent/20">
                        <FileText className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-[10px] uppercase tracking-[0.4em] text-accent font-bold">{t.reportAnalysisTitle}</CardTitle>
                        <CardDescription className="text-text-dim font-light">{t.reportAnalysisDesc}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h4 className="text-[10px] uppercase tracking-[0.3em] text-text-dim font-bold">{t.summaryFindings}</h4>
                      <p className="text-lg text-text-main font-light leading-relaxed italic text-serif">
                        {result.reportAnalysis.summary}
                      </p>
                      <ul className="space-y-3">
                        {result.reportAnalysis.keyFindings.map((finding, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-text-dim font-light">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-6">
                      <div className="p-8 glass border border-accent/10 rounded-[2.5rem] bg-accent/[0.01]">
                        <h4 className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold mb-6 flex items-center gap-2">
                          <Pill className="w-4 h-4" />
                          {t.suggestedMeds}
                        </h4>
                        {result.reportAnalysis.suggestedMedicines.length > 0 ? (
                          <div className="space-y-4">
                            {result.reportAnalysis.suggestedMedicines.map((med, i) => (
                              <div key={i} className="flex items-center gap-3 p-4 glass border border-black/5 rounded-xl">
                                <div className="w-8 h-8 glass rounded-lg flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4 text-accent" />
                                </div>
                                <span className="text-sm font-medium text-text-main">{med}</span>
                              </div>
                            ))}
                            <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider leading-relaxed">
                                {t.medWarning}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-text-dim font-light italic">{t.noMeds}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <Card className="lg:col-span-7 glass-dark border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                  <CardHeader className="p-10 border-b border-white/5 bg-white/[0.02]">
                    <CardTitle className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-text-dim font-bold">
                      <Activity className="w-4 h-4 text-accent" />
                      {t.patternCorrelation}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-12 p-10">
                    {result.possibilities.map((p, i) => (
                      <div key={i} className="space-y-6 group">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[9px] uppercase tracking-[0.3em] text-text-dim mb-2 font-bold">{t.conditionLabel} {i + 1}</p>
                            <h4 className="text-3xl font-medium text-text-main text-serif italic tracking-tight group-hover:text-accent transition-colors">{p.condition}</h4>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-light text-accent tracking-tighter">{p.confidence}%</p>
                            <p className="text-[8px] uppercase tracking-[0.3em] text-text-dim font-bold">{t.confidenceLabel}</p>
                          </div>
                        </div>
                        <p className="text-sm text-text-dim leading-relaxed font-light tracking-wide">{p.explanation}</p>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${p.confidence}%` }}
                            transition={{ duration: 1.5, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
                            className="h-full bg-accent shadow-[0_0_15px_rgba(45,212,191,0.5)]"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="lg:col-span-5 space-y-8">
                  <Card className="glass-dark border-accent/20 rounded-[3rem] p-10 relative overflow-hidden group shadow-[0_0_40px_rgba(45,212,191,0.1)]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 blur-[60px]" />
                    <CardHeader className="p-0 mb-8">
                      <CardTitle className="flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-accent font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        {t.aiProtocol}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p className="text-lg text-text-main leading-relaxed font-light tracking-wide mb-10 italic text-serif">
                        "{result.recommendation}"
                      </p>
                      <Button 
                        className="w-full bg-accent text-bg-dark hover:bg-accent/90 font-bold h-16 rounded-2xl shadow-[0_0_30px_rgba(45,212,191,0.2)]" 
                        onClick={() => navigate('/doctors')}
                      >
                        {t.matchSpecialist}
                        <ArrowRight className="ml-3 h-5 w-5" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Button variant="ghost" className="w-full text-text-dim hover:text-text-main hover:bg-white/5 h-14 rounded-2xl text-[10px] uppercase tracking-[0.3em] font-bold" onClick={reset}>
                    <RefreshCw className="mr-3 h-4 w-4" />
                    {t.resetBtn}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isAskingSeverity && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-bg-dark/95 border border-white/10 p-8 rounded-[3rem] shadow-2xl glass-dark relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px]" />
              <div className="relative z-10 text-center space-y-6">
                <div className="w-16 h-16 mx-auto glass rounded-full flex items-center justify-center border-accent/20 mb-6">
                  <ActivitySquare className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-medium text-text-main">{t.askSeverityTitle}</h3>
                <p className="text-text-dim font-light">{t.askSeverityDesc}</p>
                <div className="space-y-3 pt-6">
                  <button 
                    onClick={() => setSeverityStage('normal')}
                    className={`w-full p-4 rounded-2xl border transition-all ${severityStage === 'normal' ? 'bg-accent/10 border-accent/50 text-accent' : 'border-white/5 text-text-dim hover:bg-white/5'}`}
                  >
                    {t.severityNormal}
                  </button>
                  <button 
                    onClick={() => setSeverityStage('medium')}
                    className={`w-full p-4 rounded-2xl border transition-all ${severityStage === 'medium' ? 'bg-accent/10 border-accent/50 text-accent' : 'border-white/5 text-text-dim hover:bg-white/5'}`}
                  >
                    {t.severityMedium}
                  </button>
                  <button 
                    onClick={() => setSeverityStage('critical')}
                    className={`w-full p-4 rounded-2xl border transition-all ${severityStage === 'critical' ? 'bg-error/10 border-error/50 text-error' : 'border-white/5 text-text-dim hover:bg-white/5'}`}
                  >
                    {t.severityCritical}
                  </button>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button variant="ghost" onClick={() => setIsAskingSeverity(false)} className="w-full h-14 rounded-2xl text-text-dim hover:text-white hover:bg-white/5">
                    {t.cancelBtn}
                  </Button>
                  <Button onClick={handleActualAnalyze} className="w-full bg-accent text-bg-dark hover:bg-accent/90 font-bold h-14 rounded-2xl">
                    {t.confirmAnalyzeBtn}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
