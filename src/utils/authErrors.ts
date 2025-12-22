export const translateAuthError = (errorMessage: string): string => {
    // Normalizing error message to lowercase for easier matching
    const msg = errorMessage.toLowerCase()

    // Common Supabase/GoTrue error mappings
    if (msg.includes('invalid login credentials')) {
        return 'E-mail ou senha incorretos.'
    }
    if (msg.includes('user not found')) {
        return 'Usuário não encontrado.'
    }
    if (msg.includes('email not confirmed')) {
        return 'E-mail não confirmado. Verifique sua caixa de entrada.'
    }
    if (msg.includes('password should be at least')) {
        return 'A senha deve ter pelo menos 6 caracteres.'
    }
    if (msg.includes('new password should be different from the old password')) {
        return 'A nova senha deve ser diferente da anterior.'
    }
    if (msg.includes('password not strong enough')) {
        return 'A senha é muito fraca. Tente uma combinação mais segura.'
    }
    if (msg.includes('user already registered')) {
        return 'Este e-mail já está cadastrado.'
    }
    if (msg.includes('rate limit exceeded')) {
        return 'Muitas tentativas. Aguarde um momento e tente novamente.'
    }
    if (msg.includes('captcha')) {
        return 'Erro de verificação de segurança. Tente novamente.'
    }
    // Default fallback
    return errorMessage
}
