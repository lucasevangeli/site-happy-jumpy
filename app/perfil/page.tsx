"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  Save, 
  Edit3,
  X,
  Loader2,
  CheckCircle2,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  cpfCnpj: string;
  address: string;
  addressNumber: string;
  complement?: string;
  province: string;
  postalCode: string;
}

export default function ProfilePage() {
  const { user, profile: authProfile, loading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData(data);
      } else {
        toast.error('Erro ao carregar perfil');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Validação básica de CPF/CNPJ
    const cleanCpfCnpj = formData.cpfCnpj.replace(/\D/g, "");
    if (cleanCpfCnpj.length !== 11 && cleanCpfCnpj.length !== 14) {
      toast.error('O CPF ou CNPJ está incompleto. Por favor, verifique os números.');
      return;
    }

    setIsSaving(true);
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setProfile(formData);
        await refreshProfile(); // Atualiza o contexto global (inc. Header)
        setIsEditing(false);
        toast.success('Perfil atualizado com sucesso!', {
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
        });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao salvar alterações');
      }
    } catch (error) {
      toast.error('Erro ao salvar alterações');
    } finally {
      setIsSaving(false);
    }
  };

  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const maskCNPJ = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;

    if (name === 'cpfCnpj') {
      // Tenta formatar como CPF se tiver até 11 dígitos, senão como CNPJ
      const clean = value.replace(/\D/g, "");
      maskedValue = clean.length <= 11 ? maskCPF(value) : maskCNPJ(value);
    } else if (name === 'phone') {
      maskedValue = maskPhone(value);
    } else if (name === 'postalCode') {
      maskedValue = value.replace(/\D/g, "").substring(0, 8);
    }

    setFormData(prev => prev ? ({ ...prev, [name]: maskedValue }) : null);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <main className="bg-black min-h-screen pt-32 pb-20 overflow-x-hidden">
      <Header />
      
      <div className="container mx-auto px-6 max-w-[1400px]">
        {/* Breadcrumb e Ações */}
        <div className="flex items-center justify-between mb-8">
           <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Voltar
            </button>

            <Button
              onClick={() => {
                if (isEditing) setFormData(profile);
                setIsEditing(!isEditing);
              }}
              variant={isEditing ? "ghost" : "outlineNeon"}
              className={isEditing ? "text-red-400 hover:text-red-300" : "h-11 px-6 uppercase font-fredoka font-bold text-xs tracking-wider"}
            >
              {isEditing ? (
                <><X className="w-4 h-4 mr-2" /> Cancelar</>
              ) : (
                <><Edit3 className="w-4 h-4 mr-2" /> Editar Perfil</>
              )}
            </Button>
        </div>

        <motion.div 
          className="lg:grid lg:grid-cols-[350px_1fr] items-start gap-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Coluna 1: Sidebar de Perfil */}
          <motion.div variants={itemVariants} className="space-y-6 mb-10 lg:mb-0">
             <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-xl relative overflow-hidden group">
                <div className="flex flex-col items-center text-center">
                   <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                      <User className="w-10 h-10 text-purple-500" />
                   </div>
                   <h1 className="text-xl font-fredoka font-bold text-white uppercase tracking-tight leading-tight mb-2">
                     {profile?.fullName?.split(" ")[0]} <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">{profile?.fullName?.split(" ").slice(1).join(" ")}</span>
                   </h1>
                   <p className="text-gray-500 font-fredoka text-sm">{profile?.email}</p>
                </div>
             </div>

             <div className="bg-white/5 border border-white/10 rounded-[30px] p-6 backdrop-blur-xl">
                <h3 className="text-gray-400 text-[10px] uppercase tracking-widest font-black mb-4 flex items-center gap-2">
                   <Settings className="w-3 h-3" /> Configurações Rápidas
                </h3>
                <div className="space-y-2">
                   <button className="w-full text-left p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all text-xs font-bold font-fredoka border border-transparent hover:border-white/5">
                      Alterar Senha
                   </button>
                   <button className="w-full text-left p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all text-xs font-bold font-fredoka border border-transparent hover:border-white/5">
                      Privacidade e Termos
                   </button>
                </div>
             </div>
          </motion.div>

          {/* Coluna 2: Formulários */}
          <motion.form variants={itemVariants} onSubmit={handleSave} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Card 1: Informações Pessoais */}
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-xl relative overflow-hidden group h-full">
                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                  <div className="p-2.5 bg-green-400/10 rounded-xl">
                    <User className="w-5 h-5 text-green-400" />
                  </div>
                  <h2 className="text-lg font-fredoka font-bold text-white uppercase tracking-wide">Identificação</h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">Nome Completo</Label>
                    {isEditing ? (
                      <Input 
                        name="fullName"
                        value={formData?.fullName}
                        onChange={handleChange}
                        className="h-11 bg-white/5 border-white/10 rounded-xl focus:border-green-400 transition-all font-fredoka text-sm"
                        required
                      />
                    ) : (
                      <p className="text-md text-white font-fredoka font-bold">{profile?.fullName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">CPF / CNPJ</Label>
                      {isEditing ? (
                        <Input 
                          name="cpfCnpj"
                          value={formData?.cpfCnpj}
                          onChange={handleChange}
                          className="h-11 bg-white/5 border-white/10 rounded-xl focus:border-green-400 transition-all font-fredoka text-sm"
                          required
                        />
                      ) : (
                        <p className="text-md text-white font-fredoka font-bold">{profile?.cpfCnpj}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">Nascimento</Label>
                      {isEditing ? (
                        <Input 
                          name="birthDate"
                          type="date"
                          value={formData?.birthDate}
                          onChange={handleChange}
                          className="h-11 bg-white/5 border-white/10 rounded-xl focus:border-green-400 transition-all font-fredoka text-sm"
                          required
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-md text-white font-fredoka font-bold">
                            {profile?.birthDate ? new Date(profile.birthDate).toLocaleDateString('pt-BR') : 'Não informada'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Contato */}
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-xl relative overflow-hidden group h-full">
                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                  <div className="p-2.5 bg-blue-400/10 rounded-xl">
                    <Phone className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className="text-lg font-fredoka font-bold text-white uppercase tracking-wide">Meios de Contato</h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">E-mail de Cadastro</Label>
                    <div className="flex items-center gap-2 h-11">
                      <Mail className="w-4 h-4 text-blue-400/50" />
                      <p className="text-md text-gray-400 font-fredoka font-medium">{profile?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">Telefone / WhatsApp</Label>
                    {isEditing ? (
                      <Input 
                        name="phone"
                        value={formData?.phone}
                        onChange={handleChange}
                        className="h-11 bg-white/5 border-white/10 rounded-xl focus:border-green-400 transition-all font-fredoka text-sm"
                        required
                      />
                    ) : (
                      <div className="flex items-center gap-2 h-11">
                        <Phone className="w-4 h-4 text-blue-400" />
                        <p className="text-md text-white font-fredoka font-bold">{profile?.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Endereço Completo */}
            <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-10 backdrop-blur-xl relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-6">
                <div className="p-2.5 bg-purple-400/10 rounded-xl">
                  <MapPin className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-lg font-fredoka font-bold text-white uppercase tracking-wide">Endereço de Entrega/Faturamento</h2>
              </div>

              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-8">
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <Label className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">Rua / Avenida</Label>
                  {isEditing ? (
                    <Input 
                      name="address"
                      value={formData?.address}
                      onChange={handleChange}
                      className="h-11 bg-white/5 border-white/10 rounded-xl focus:border-green-400 transition-all font-fredoka text-sm"
                      required
                    />
                  ) : (
                    <p className="text-md text-white font-fredoka font-bold">{profile?.address}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">Número</Label>
                  {isEditing ? (
                    <Input 
                      name="addressNumber"
                      value={formData?.addressNumber}
                      onChange={handleChange}
                      className="h-11 bg-white/5 border-white/10 rounded-xl focus:border-green-400 transition-all font-fredoka text-sm"
                      required
                    />
                  ) : (
                    <p className="text-md text-white font-fredoka font-bold">{profile?.addressNumber}</p>
                  )}
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <Label className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">Bairro</Label>
                  {isEditing ? (
                    <Input 
                      name="province"
                      value={formData?.province}
                      onChange={handleChange}
                      className="h-11 bg-white/5 border-white/10 rounded-xl focus:border-green-400 transition-all font-fredoka text-sm"
                      required
                    />
                  ) : (
                    <p className="text-md text-white font-fredoka font-bold">{profile?.province}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">Complemento</Label>
                  {isEditing ? (
                    <Input 
                      name="complement"
                      value={formData?.complement}
                      onChange={handleChange}
                      className="h-11 bg-white/5 border-white/10 rounded-xl focus:border-green-400 transition-all font-fredoka text-sm"
                    />
                  ) : (
                    <p className="text-md text-white font-fredoka font-bold">{profile?.complement || '-'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">CEP</Label>
                  {isEditing ? (
                    <Input 
                      name="postalCode"
                      value={formData?.postalCode}
                      onChange={handleChange}
                      className="h-11 bg-white/5 border-white/10 rounded-xl focus:border-green-400 transition-all font-fredoka text-sm"
                      required
                    />
                  ) : (
                    <p className="text-md text-white font-fredoka font-bold">{profile?.postalCode}</p>
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex justify-end pt-4"
                >
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="h-14 px-10 bg-green-400 text-black font-fredoka font-bold uppercase tracking-wider rounded-2xl hover:scale-[1.05] shadow-[0_0_30px_rgba(74,222,128,0.2)] transition-all flex items-center gap-3"
                  >
                    {isSaving ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</>
                    ) : (
                      <><Save className="w-5 h-5" /> Salvar Alterações</>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
        </motion.div>
      </div>
    </main>
  );
}
