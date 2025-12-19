import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Loader2, User, Building2, Phone, Mail, Lock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    whatsapp: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Phone formatting logic
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return numbers.length > 0 ? `(${numbers}` : '';
    }
    
    if (numbers.length <= 7) {
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2)}`;
    }
    
    return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    if (id === 'whatsapp') {
      // Allow only numbers and formatting characters
      // But we re-format entirely based on numbers
      const formatted = formatPhoneNumber(value);
      // Limit to max chars for (xx) xxxxx-xxxx -> 15 chars
      if (formatted.length <= 15) {
         setFormData(prev => ({ ...prev, [id]: formatted }));
      }
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  // Password Strength Logic
  const isPasswordLongEnough = formData.password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(formData.password);
  const hasLowerCase = /[a-z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const hasSpecialChar = /[!@#$%^&*()_+[\]{};':"\\|,.<>/?]/.test(formData.password);

  const calculateStrength = (password: string) => {
    if (password.length === 0) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 20;
    if (/[!@#$%^&*()_+[\]{};':"\\|,.<>/?]/.test(password)) strength += 20;
    return Math.min(strength, 100);
  };

  const passwordStrength = calculateStrength(formData.password);

  const getProgressBarColor = (strength: number) => {
    if (strength === 0) return "bg-gray-700"; // Empty state
    if (strength < 40) return "bg-destructive";
    if (strength < 70) return "bg-yellow-500"; 
    return "bg-green-500"; 
  };

  const PasswordRequirement = ({ condition, text }: { condition: boolean, text: string }) => (
    <div className={`flex items-center text-sm ${condition ? 'text-green-500' : 'text-red-500'}`}>
      {condition ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
      {text}
    </div>
  );

  const renderPasswordRequirementsTooltipContent = () => (
    <TooltipContent side="top" className="bg-white text-black border border-gray-200 p-3 rounded-lg shadow-xl z-50">
      <p className="text-sm font-bold mb-2">Requisitos de Senha Forte:</p>
      <PasswordRequirement 
        condition={isPasswordLongEnough} 
        text="Mínimo de 8 caracteres" 
      />
      <PasswordRequirement 
        condition={hasUpperCase} 
        text="Pelo menos uma letra maiúscula" 
      />
      <PasswordRequirement 
        condition={hasLowerCase} 
        text="Pelo menos uma letra minúscula" 
      />
      <PasswordRequirement 
        condition={hasNumber} 
        text="Pelo menos um número" 
      />
      <PasswordRequirement 
        condition={hasSpecialChar} 
        text="Pelo menos um caractere especial" 
      />
    </TooltipContent>
  );

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "As senhas digitadas precisam ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Termos de uso",
        description: "Você precisa concordar com os termos para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            company_name: formData.companyName,
            whatsapp: formData.whatsapp, 
            phone_number: formData.whatsapp, 
          }
        }
      });

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
      } else {
        if (data.session) {
            toast({
              title: "Conta criada com sucesso!",
              description: "Bem-vindo ao Precifix.",
            });
            navigate('/');
        } else if (data.user && !data.session) {
             toast({
              title: "Verifique seu e-mail",
              description: "Um link de confirmação foi enviado para o seu e-mail.",
            });
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center p-4 bg-cover bg-center relative overflow-y-auto"
      style={{ backgroundImage: `url('/login-background.jpg')` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm fixed"></div> 
      
      <Card className="w-full max-w-lg bg-black/80 text-white border-gray-800 z-10 relative my-8">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-2">
            <img 
              src="/precifix-logo.png" 
              alt="Precifix Logo" 
              className="h-20 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Criar Nova Conta</CardTitle>
          <CardDescription className="text-gray-300">
            Preencha seus dados para começar a usar a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Seção 1: Dados Pessoais/Empresariais */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-300">Qual seu nome completo?</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Ex: João da Silva"
                    className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-gray-300">Qual nome da sua empresa?</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Ex: Lava Jato do João"
                    className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-gray-300">Qual seu whatsapp?</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="py-2">
              <p className="text-sm text-center text-gray-400">
                Preencha abaixo seu e-mail e crie uma senha,<br/>
                essa será sua conta de acesso à plataforma
              </p>
            </div>

            {/* Seção 2: Credenciais */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Qual seu email?</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@email.com"
                    className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Crie sua senha</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Senha#123"
                          className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {renderPasswordRequirementsTooltipContent()}
                  </Tooltip>
                </TooltipProvider>
                
                {/* Strength Meter - Always Visible */}
                <Progress 
                  value={passwordStrength} 
                  className="h-1.5 mt-2 bg-gray-700" 
                  indicatorClassName={getProgressBarColor(passwordStrength)} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirme a senha criada</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Senha#123"
                    className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="terms" 
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="border-gray-500 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <div className="text-sm text-gray-300 font-normal">
                Concordo com os{' '}
                <Sheet>
                  <SheetTrigger asChild>
                    <span className="font-bold text-white cursor-pointer hover:underline hover:text-primary transition-colors">
                      Termos, Políticas e Adesão
                    </span>
                  </SheetTrigger>
                  <SheetContent className="bg-black text-white border-l-gray-800 w-full sm:max-w-xl">
                    <SheetHeader>
                      <SheetTitle className="text-primary text-xl font-bold uppercase tracking-wide border-b border-gray-800 pb-4">
                        Termos de uso, política e adesão – PRECIFIX
                      </SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-100px)] pr-4 pt-4 text-sm leading-relaxed text-gray-300">
                      <div className="space-y-6">
                        <p>
                          Bem-vindo ao Precifix. Ao criar sua conta e clicar em "Concordo", você firma um contrato vinculante com a <strong className="text-white">PRECIFIX SISTEMA DE PRECIFICAÇÃO E GESTÃO PARA ESTÉTICA AUTOMOTIVA LTDA</strong>, com escritório sediado na cidade do Rio de Janeiro/RJ.
                        </p>

                        <div className="space-y-2">
                          <h3 className="text-primary font-bold text-base uppercase">1. O PERÍODO DE TESTE (7 DIAS GRÁTIS)</h3>
                          <p>
                            1.1. Ao se cadastrar, você ganha automaticamente <strong className="text-white">07 (sete) dias de acesso gratuito</strong> e irrestrito à plataforma para testar as funcionalidades.
                          </p>
                          <p>
                            1.2. <strong className="text-white">Cobrança:</strong> Caso você opte por assinar um plano pago, a cobrança da primeira mensalidade ocorrerá somente após o fim do 7º dia.
                          </p>
                          <p>
                            1.3. <strong className="text-white">Fim do Teste:</strong> Se ao final dos 7 dias você não tiver efetivado uma assinatura, seu acesso será suspenso automaticamente. Não geraremos cobranças surpresa se você não cadastrou um cartão de crédito.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-primary font-bold text-base uppercase">2. ASSINATURA, PAGAMENTO E RENOVAÇÃO</h3>
                          <p>
                            2.1. <strong className="text-white">Modelo de Assinatura:</strong> O Precifix opera no modelo pré-pago (SaaS). Você paga para ter acesso pelo período contratado (mensal ou anual).
                          </p>
                          <p>
                            2.2. <strong className="text-white">Renovação Automática:</strong> Para garantir que você não perca acesso aos seus dados de precificação, a assinatura é renovada automaticamente ao final de cada período, utilizando o mesmo método de pagamento cadastrado.
                          </p>
                          <p>
                            2.3. <strong className="text-white">Reajustes:</strong> Os preços podem sofrer reajustes, que serão informados mediante aviso prévio de 30 dias por e-mail.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-primary font-bold text-base uppercase">3. CANCELAMENTO E REEMBOLSO</h3>
                          <p>
                            3.1. <strong className="text-white">Como Cancelar:</strong> Você pode cancelar sua assinatura a qualquer momento diretamente no painel de configurações da conta.
                          </p>
                          <p>
                            3.2. <strong className="text-white">Efeito do Cancelamento:</strong> Ao cancelar, você continuará com acesso até o fim do ciclo já pago. <strong className="text-white">Não realizamos reembolso proporcional (pro-rata)</strong> de dias não utilizados em meses já iniciados.
                          </p>
                          <p>
                            3.3. <strong className="text-white">Dados:</strong> Após o cancelamento, manteremos seus dados armazenados por 30 dias para caso decida reativar. Após esse prazo, os dados poderão ser excluídos permanentemente.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-primary font-bold text-base uppercase">4. USO DA CONTA (PROIBIÇÕES)</h3>
                          <p>
                            4.1. <strong className="text-white">Conta Pessoal e Intransferível:</strong> Sua licença de uso é individual (ou por empresa, conforme o plano). <strong className="text-white">É estritamente proibido</strong> vender, alugar, emprestar ou compartilhar sua senha com terceiros.
                          </p>
                          <p>
                            4.2. <strong className="text-white">Monitoramento:</strong> O sistema possui mecanismos de segurança que detectam acessos simultâneos ou suspeitos. O compartilhamento de credenciais resultará no <strong className="text-white">bloqueio imediato</strong> da conta sem direito a reembolso.
                          </p>
                          <p>
                            4.3. <strong className="text-white">Engenharia Reversa:</strong> É vedada a cópia, modificação ou tentativa de engenharia reversa do código-fonte do Precifix.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-primary font-bold text-base uppercase">5. PRIVACIDADE E DADOS (RESUMO LGPD)</h3>
                          <p>
                            5.1. <strong className="text-white">Seus Dados:</strong> Coletamos seus dados cadastrais (nome, e-mail, CPF/CNPJ) e dados de uso (custos e despesas inseridos) para fazer o sistema funcionar.
                          </p>
                          <p>
                            5.2. <strong className="text-white">Sigilo:</strong> Seus dados de precificação e margem de lucro são confidenciais. O Precifix não vende suas informações para terceiros.
                          </p>
                          <p>
                            5.3. <strong className="text-white">Segurança:</strong> Utilizamos servidores em nuvem com criptografia de ponta. Contudo, você é responsável por manter sua senha segura.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-primary font-bold text-base uppercase">6. LIMITAÇÃO DE RESPONSABILIDADE</h3>
                          <p>
                            6.1. O Precifix é uma ferramenta de auxílio à gestão. A responsabilidade final pela precificação, lucros ou prejuízos do seu negócio é exclusivamente sua. Não garantimos resultados financeiros específicos, pois eles dependem da sua gestão operacional.
                          </p>
                        </div>

                        <div className="space-y-2 pb-8">
                          <h3 className="text-primary font-bold text-base uppercase">7. FORO</h3>
                          <p>
                            7.1. Fica eleito o foro da Comarca do <strong className="text-white">Rio de Janeiro/RJ</strong> para dirimir quaisquer dúvidas oriundas deste termo, excluindo-se qualquer outro.
                          </p>
                        </div>
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
                {' '}da PRECIFIX
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-glow text-primary-foreground font-bold py-6 text-base rounded-lg transition-all shadow-lg hover:shadow-primary/20 mt-4 uppercase"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'CRIAR CONTA E GANHAR 7 DIAS GRÁTIS'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-gray-800 pt-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="text-gray-300 hover:text-white hover:bg-white/10"
          >
            <User className="h-4 w-4 mr-2" />
            Já tem conta? Entrar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;