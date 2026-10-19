import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <main className="px-4 md:px-8 lg:px-16 py-24 max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Política de Privacidade</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introdução</h2>
            <p>A sua privacidade é importante para nós. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos as suas informações pessoais.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Dados que Coletamos</h2>
            <p>Podemos coletar os seguintes tipos de informações:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Informações de conta (e-mail, senha criptografada)</li>
              <li>Dados de perfil (nome do perfil, preferências de uso)</li>
              <li>Histórico de visualização (anônimo ou associado à conta)</li>
              <li>Dados técnicos (navegador, sistema operacional, endereço IP)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Como Usamos os Dados</h2>
            <p>Usamos as suas informações para:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Criar e gerenciar a sua conta</li>
              <li>Personalizar a sua experiência no site</li>
              <li>Melhorar os nossos serviços</li>
              <li>Enviar comunicações importantes (com o seu consentimento)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Proteção dos Dados</h2>
            <p>Tomamos medidas de segurança adequadas para proteger as suas informações pessoais:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Senhas são criptografadas usando algoritmos seguros</li>
              <li>Usamos conexões HTTPS para proteger a transferência de dados</li>
              <li>Não compartilhamos suas informações com terceiros sem consentimento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. LGPD</h2>
            <p>Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Acessar os seus dados pessoais</li>
              <li>Corrigir ou atualizar as suas informações</li>
              <li>Solicitar a exclusão dos seus dados</li>
              <li>Revogar o seu consentimento a qualquer momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Cookies</h2>
            <p>Usamos cookies para melhorar a sua experiência no site. Você pode gerenciar as suas preferências de cookies nas configurações do navegador.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Links para Sites de Terceiros</h2>
            <p>O nosso site pode conter links para sites de terceiros. Não nos responsabilizamos pelas políticas de privacidade desses sites.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Contato</h2>
            <p>Se você tiver dúvidas sobre esta Política de Privacidade ou quiser exercer os seus direitos, entre em contato conosco.</p>
          </section>

          <p className="text-sm text-gray-500 mt-8 pt-4 border-t border-gray-700">
            Última atualização: Junho de 2026
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
