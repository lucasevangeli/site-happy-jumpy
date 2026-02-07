"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase"; // Cliente Firebase
import { signInWithCustomToken, User, signInWithEmailAndPassword } from "firebase/auth";
import { CheckCircle } from 'lucide-react'; // Importar CheckCircle

interface AuthDrawerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLoginSuccess?: () => void; // Callback para notificar o sucesso do login
}

type AuthStep = "choice" | "login" | "register" | "profile" | "success";

export function AuthDrawer({ isOpen, onOpenChange, onLoginSuccess }: AuthDrawerProps) {
  const [step, setStep] = useState<AuthStep>("choice");

  // Estados dos formulários
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [address, setAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const resetState = () => {
    setStep("choice");
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setBirthDate("");
    setCpfCnpj("");
    setAddress("");
    setAddressNumber("");
    setComplement("");
    setProvince("");
    setPostalCode("");
    setError(null);
    setIsLoading(false);
    setCurrentUser(null);
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login bem-sucedido!",
        description: "Você está pronto para continuar sua compra.",
      });
      if (onLoginSuccess) onLoginSuccess();
      setStep("success"); // Muda para o step de sucesso
    } catch (error: any) {
      let friendlyError = "Ocorreu um erro ao fazer login.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        friendlyError = "Email ou senha inválidos.";
      }
      setError(friendlyError);
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      try {
        const userCredential = await signInWithCustomToken(auth, data.token);
        setCurrentUser(userCredential.user);
        toast({
          title: "Conta criada!",
          description: "Agora, por favor, complete seu perfil.",
        });
        setStep("profile");
      } catch (authError) {
        setError("Não foi possível iniciar sua sessão. Tente novamente.");
      }
    } else {
      setError(data.error || "Ocorreu um erro desconhecido no registro.");
    }
    setIsLoading(false);
  };
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Sessão de usuário não encontrada. Por favor, reinicie o processo.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({
          fullName,
          phone,
          birthDate,
          cpfCnpj,
          address,
          addressNumber,
          complement,
          province,
          postalCode,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Perfil completo!", description: "Seu cadastro foi finalizado com sucesso." });
        setStep("success");
      } else {
        setError(data.error || "Não foi possível salvar seu perfil.");
      }
    } catch (tokenError) {
      setError("Ocorreu um erro de autenticação. Tente novamente.");
    }
    setIsLoading(false);
  }
  
  const renderStepContent = () => {
    const buttonNeonClass = "w-full bg-neon-green text-black hover:bg-neon-green/90 font-bold";

    switch (step) {
      case "choice":
        return (
          <div className="flex flex-col h-full">
            <SheetHeader className="text-left">
              <SheetTitle><span className="bg-gradient-to-r from-green-400 to-purple-600 bg-clip-text text-transparent">Quase lá!</span></SheetTitle>
              <SheetDescription>Para finalizar sua compra, faça login ou crie uma conta.</SheetDescription>
            </SheetHeader>
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Button className={buttonNeonClass} onClick={() => setStep('login')}>Fazer Login</Button>
              <Button className="w-full" variant="outlineNeon" onClick={() => setStep('register')}>Criar Conta</Button>
            </div>
            <SheetFooter>
                <SheetClose asChild><Button variant="ghost" onClick={resetState}>Cancelar</Button></SheetClose>
            </SheetFooter>
          </div>
        );
      case "login":
        return (
          <form onSubmit={handleLogin} className="flex flex-col h-full">
            <SheetHeader className="text-left">
              <SheetTitle><span className="bg-gradient-to-r from-green-400 to-purple-600 bg-clip-text text-transparent">Login</span></SheetTitle>
              <SheetDescription>Acesse sua conta para continuar.</SheetDescription>
            </SheetHeader>
            <div className="py-4 flex-1">
              <div className="grid gap-4">
                <div className="grid gap-2"><Label htmlFor="login-email" className="text-neutral-200">Email</Label><Input id="login-email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required/></div>
                <div className="grid gap-2"><Label htmlFor="login-password" className="text-neutral-200">Senha</Label><Input id="login-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required/></div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            </div>
            <SheetFooter className="mt-auto flex-col space-y-2">
              <Button type="submit" disabled={isLoading} className={buttonNeonClass}>{isLoading ? "Entrando..." : "Entrar"}</Button>
              <Button variant="link" type="button" className="text-green-400" onClick={() => { setStep('register'); setError(null); }}>Não tem uma conta? Crie uma</Button>
              <Button variant="link" type="button" className="text-green-400" onClick={() => setStep('choice')}>Voltar</Button>
            </SheetFooter>
          </form>
        );
      case "register":
        return (
          <form onSubmit={handleRegister} className="flex flex-col h-full">
            <SheetHeader className="text-left">
              <SheetTitle><span className="bg-gradient-to-r from-green-400 to-purple-600 bg-clip-text text-transparent">Criar Conta</span></SheetTitle>
              <SheetDescription>Use seu e-mail e senha para começar.</SheetDescription>
            </SheetHeader>
            <div className="py-4 flex-1">
              <div className="grid gap-4">
                <div className="grid gap-2"><Label htmlFor="reg-email" className="text-neutral-200">Email</Label><Input id="reg-email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required/></div>
                <div className="grid gap-2"><Label htmlFor="reg-password" className="text-neutral-200">Senha</Label><Input id="reg-password" type="password" placeholder="•••••••• (mín. 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} required/></div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            </div>
            <SheetFooter className="mt-auto flex-col space-y-2">
              <Button type="submit" disabled={isLoading} className={buttonNeonClass}>{isLoading ? "Criando..." : "Criar e continuar"}</Button>
              <Button variant="link" type="button" className="text-green-400" onClick={() => { setStep('login'); setError(null); }}>Já tem uma conta? Faça login</Button>
              <Button variant="link" type="button" className="text-green-400" onClick={() => setStep('choice')}>Voltar</Button>
            </SheetFooter>
          </form>
        );
      case "profile":
        return (
          <form onSubmit={handleProfileSubmit} className="flex flex-col h-full">
            <SheetHeader className="text-left">
              <SheetTitle><span className="bg-gradient-to-r from-green-400 to-purple-600 bg-clip-text text-transparent">Complete seu Perfil</span></SheetTitle>
              <SheetDescription>Precisamos de mais algumas informações.</SheetDescription>
            </SheetHeader>
            <div className="py-4 flex-1 overflow-y-auto pr-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-neutral-200">Nome Completo</Label>
                  <Input id="fullName" placeholder="Seu nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpfCnpj" className="text-neutral-200">CPF ou CNPJ</Label>
                    <Input id="cpfCnpj" placeholder="000.000.000-00" value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)} required/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-neutral-200">Data de Nascimento</Label>
                    <Input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required/>
                  </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-neutral-200">Telefone / Celular</Label>
                    <Input id="phone" placeholder="(00) 00000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-neutral-200">CEP</Label>
                    <Input id="postalCode" placeholder="00000-000" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required/>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="address" className="text-neutral-200">Endereço</Label>
                        <Input id="address" placeholder="Rua, Avenida, etc." value={address} onChange={(e) => setAddress(e.target.value)} required/>
                    </div>
                    <div className="space-y-2 col-span-1">
                        <Label htmlFor="addressNumber" className="text-neutral-200">Número</Label>
                        <Input id="addressNumber" placeholder="Nº" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} required/>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="province" className="text-neutral-200">Bairro</Label>
                        <Input id="province" placeholder="Seu Bairro" value={province} onChange={(e) => setProvince(e.target.value)} required/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="complement" className="text-neutral-200">Complemento</Label>
                        <Input id="complement" placeholder="Apto, Bloco, Casa" value={complement} onChange={(e) => setComplement(e.target.value)} />
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            </div>
            <SheetFooter className="mt-auto">
              <Button type="submit" disabled={isLoading} className={buttonNeonClass}>{isLoading ? "Salvando..." : "Finalizar Cadastro"}</Button>
            </SheetFooter>
          </form>
        );
      case "success":
        return (
          <div className="flex flex-col h-full">
            <SheetHeader className="text-left">
              <SheetTitle><span className="bg-gradient-to-r from-green-400 to-purple-600 bg-clip-text text-transparent">Boas-vindas!</span></SheetTitle>
              <SheetDescription>Você está logado(a) e pronto(a) para continuar. Boas compras!</SheetDescription>
            </SheetHeader>
            <SheetFooter className="mt-auto">
              <SheetClose asChild><Button onClick={() => handleOpenChange(false)} className={buttonNeonClass}>Fechar</Button></SheetClose>
            </SheetFooter>
          </div>
        )
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl bg-black border-l border-purple-500/30 p-8 flex flex-col">
        {renderStepContent()}
      </SheetContent>
    </Sheet>
  );
}
