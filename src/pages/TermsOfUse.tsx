import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <main className="px-4 md:px-8 lg:px-16 py-24 max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Termos de Uso</h1>
        
        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Informações Geral</h2>
            <p>Bem-vindo ao RG2 FLIX. Estes Termos de Uso regulamentam o uso do nosso site e serviços. Ao acessar e usar o RG2 FLIX, você concorda com estes termos.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Conteúdo e Hospedagem</h2>
            <p>IMPORTANTE: O RG2 FLIX NÃO hospeda nenhum arquivo ou conteúdo audiovisual em nossos servidores. Todo o conteúdo exibido é obtido de APIs públicas de terceiros (como o The Movie Database - TMDB) e de serviços de streaming externos.</p>
            <p className="mt-2">Nosso site funciona apenas como um agregador de conteúdo, facilitando a visualização e organização de mídias já disponíveis publicamente na internet.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Propriedade Intelectual</h2>
            <p>Todos os direitos de propriedade intelectual dos filmes, séries e outros conteúdos exibidos pertencem aos seus respectivos proprietários (estúdios, produtoras, distributoras, etc.).</p>
            <p className="mt-2">O RG2 FLIX não reivindica nenhum direito sobre o conteúdo exibido. O uso dos dados do TMDB está sujeito aos seus <a href="https://www.themoviedb.org/terms-of-use" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">Termos de Uso</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Cumprimento Legal</h2>
            <p>Nosso site opera em conformidade com todas as leis e regulamentações aplicáveis, incluindo a Lei de Direitos Autorais e a Lei Geral de Proteção de Dados (LGPD).</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Respeitamos os direitos autorais de todos os criadores</li>
              <li>Colaboramos com solicitações de remoção de conteúdo legítimas</li>
              <li>Protegemos os dados dos nossos usuários de acordo com a LGPD</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Uso dos Dados</h2>
            <p>Para saber mais sobre como coletamos e usamos seus dados, consulte nossa <Link to="/privacy" className="text-red-600 hover:underline">Política de Privacidade</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Responsabilidades</h2>
            <p>O RG2 FLIX não se responsabiliza por:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>O conteúdo exibido em serviços de terceiros</li>
              <li>Danos ou prejuízos decorrentes do uso do site</li>
              <li>Interrupções ou indisponibilidade do serviço</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Modificações</h2>
            <p>Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. Quaisquer alterações serão publicadas nesta página.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Contato</h2>
            <p>Se você tiver dúvidas sobre estes Termos de Uso ou quiser fazer uma solicitação de remoção de conteúdo, entre em contato conosco.</p>
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

export default TermsOfUse;
